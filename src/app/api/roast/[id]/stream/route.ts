import { db } from '@db/index'
import { analysisFindings, submissions } from '@db/schemas'
import { env } from '@lib/env'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText } from 'ai'
import { eq } from 'drizzle-orm'
import type { NextRequest } from 'next/server'

const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY })

// ── XML tag helpers ──────────────────────────────────────────────────────────

function extractTag(
  buffer: string,
  tag: string,
): { value: string; rest: string } | null {
  const closeTag = `</${tag}>`
  const closeIdx = buffer.indexOf(closeTag)
  if (closeIdx === -1) return null

  const openTag = `<${tag}`
  const openIdx = buffer.indexOf(openTag)
  if (openIdx === -1 || openIdx > closeIdx) return null

  const openEndIdx = buffer.indexOf('>', openIdx)
  if (openEndIdx === -1) return null

  const value = buffer.slice(openEndIdx + 1, closeIdx).trim()
  const rest = buffer.slice(closeIdx + closeTag.length)
  return { value, rest }
}

function extractFinding(buffer: string): {
  severity: 'critical' | 'warning' | 'good'
  title: string
  description: string
  rest: string
} | null {
  const openMatch = buffer.match(/<finding severity="([^"]+)">/)
  if (!openMatch) return null

  const closeTag = '</finding>'
  const openIdx = buffer.indexOf(openMatch[0])
  const closeIdx = buffer.indexOf(closeTag, openIdx)
  if (closeIdx === -1) return null

  const inner = buffer.slice(openIdx + openMatch[0].length, closeIdx)
  const titleResult = extractTag(inner, 'title')
  const descResult = extractTag(inner, 'description')
  if (!titleResult || !descResult) return null

  return {
    severity: openMatch[1] as 'critical' | 'warning' | 'good',
    title: titleResult.value,
    description: descResult.value,
    rest: buffer.slice(closeIdx + closeTag.length),
  }
}

// ── Diff ─────────────────────────────────────────────────────────────────────

function computeDiff(
  original: string,
  suggested: string,
): { variant: 'context' | 'removed' | 'added'; content: string }[] {
  const origLines = original.split('\n')
  const suggLines = suggested.split('\n')
  const m = origLines.length
  const n = suggLines.length

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (origLines[i - 1] === suggLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const result: { variant: 'context' | 'removed' | 'added'; content: string }[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === suggLines[j - 1]) {
      result.unshift({ variant: 'context', content: origLines[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ variant: 'added', content: suggLines[j - 1] })
      j--
    } else {
      result.unshift({ variant: 'removed', content: origLines[i - 1] })
      i--
    }
  }

  return result
}

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPrompt(code: string, lang: string): string {
  return `Review this ${lang} code:

\`\`\`
${code}
\`\`\`

Respond ONLY with XML in this exact format — no prose before or after:
<score>N.N</score>
<quote>"one sentence lowercase quote in double quotes"</quote>
<finding severity="critical">
  <title>short title</title>
  <description>explanation</description>
</finding>
<finding severity="warning">
  <title>short title</title>
  <description>explanation</description>
</finding>
<finding severity="good">
  <title>short title</title>
  <description>explanation</description>
</finding>
<finding severity="good">
  <title>short title</title>
  <description>explanation</description>
</finding>
<suggested_code>
corrected snippet only, same language, no markdown fences
</suggested_code>

Rules:
- Score: 1.0–10.0 with exactly one decimal place
- Exactly 4 findings (any mix of critical/warning/good)
- suggested_code: corrected snippet only, no markdown fences
- Quote: single sentence, in double quotes, all lowercase`
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const [submission] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1)

  if (!submission) {
    return new Response('Not found', { status: 404 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function emit(event: object) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        )
      }

      try {
        const systemPrompt =
          submission.roastMode === 'roast'
            ? 'You are a brutally sarcastic senior engineer. Roast this code with dark humor but still be technically accurate.'
            : 'You are a senior engineer giving direct, constructive code review.'

        const result = streamText({
          model: google('gemini-2.0-flash'),
          system: systemPrompt,
          prompt: buildPrompt(submission.code, submission.lang),
        })

        let buffer = ''
        const parsedData = {
          score: 0,
          quote: '',
          findings: [] as {
            severity: 'critical' | 'warning' | 'good'
            title: string
            description: string
          }[],
          suggestedCode: '',
        }

        for await (const chunk of result.textStream) {
          buffer += chunk

          // Extract score
          if (!parsedData.score) {
            const r = extractTag(buffer, 'score')
            if (r) {
              parsedData.score = parseFloat(r.value)
              buffer = r.rest
              emit({ type: 'score', value: parsedData.score })
            }
          }

          // Extract quote
          if (!parsedData.quote) {
            const r = extractTag(buffer, 'quote')
            if (r) {
              parsedData.quote = r.value
              buffer = r.rest
              emit({ type: 'quote', value: parsedData.quote })
            }
          }

          // Extract findings (up to 4)
          while (parsedData.findings.length < 4) {
            const r = extractFinding(buffer)
            if (!r) break
            parsedData.findings.push({
              severity: r.severity,
              title: r.title,
              description: r.description,
            })
            buffer = r.rest
            emit({
              type: 'finding',
              severity: r.severity,
              title: r.title,
              description: r.description,
            })
          }

          // Extract suggested_code
          if (!parsedData.suggestedCode) {
            const r = extractTag(buffer, 'suggested_code')
            if (r) {
              parsedData.suggestedCode = r.value
              buffer = r.rest
              const diffLines = computeDiff(
                submission.code,
                parsedData.suggestedCode,
              )
              for (const line of diffLines) {
                emit({ type: 'diff_line', variant: line.variant, content: line.content })
              }
            }
          }
        }

        // Save final data to DB
        await db
          .update(submissions)
          .set({
            score: parsedData.score.toFixed(1),
            roastText: parsedData.quote,
          })
          .where(eq(submissions.id, id))

        if (parsedData.findings.length > 0) {
          await db.insert(analysisFindings).values(
            parsedData.findings.map((f, idx) => ({
              submissionId: id,
              severity: f.severity,
              title: f.title,
              description: f.description,
              sortOrder: idx,
            })),
          )
        }

        emit({ type: 'done' })
        controller.close()
      } catch (err) {
        emit({
          type: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
