import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { db } from '@db/index'
import { analysisFindings, submissions } from '@db/schemas'
import { env } from '@lib/env'
import { generateObject } from 'ai'
import { eq } from 'drizzle-orm'
import type { NextRequest } from 'next/server'
import { buildPrompt } from './build-prompt'
import { computeDiff } from './compute-diff'
import { saveRoast } from './save-roast'
import { roastSchema } from './schema'

const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY })

const systemPrompts = {
  roast:
    'You are a brutally sarcastic senior engineer. Roast this code with dark humor but still be technically accurate.',
  review: 'You are a senior engineer giving direct, constructive code review.',
} as const

async function fetchSubmission(id: string) {
  const [submission] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1)
  return submission ?? null
}

async function fetchFindings(submissionId: string) {
  return db
    .select({
      severity: analysisFindings.severity,
      title: analysisFindings.title,
      description: analysisFindings.description,
    })
    .from(analysisFindings)
    .where(eq(analysisFindings.submissionId, submissionId))
    .orderBy(analysisFindings.sortOrder)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const submission = await fetchSubmission(id)

  if (!submission) {
    return new Response('Not found', { status: 404 })
  }

  if (submission.roastText !== '') {
    const findings = await fetchFindings(id)
    return Response.json({
      score: Number(submission.score),
      quote: submission.roastText,
      findings,
      diffLines: submission.suggestedCode
        ? computeDiff(submission.code, submission.suggestedCode)
        : [],
    })
  }

  const systemPrompt =
    systemPrompts[submission.roastMode as keyof typeof systemPrompts] ??
    systemPrompts.review

  const { object } = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: roastSchema,
    system: systemPrompt,
    prompt: buildPrompt(submission.code, submission.lang),
  })

  await saveRoast(id, object)

  return Response.json({
    score: object.score,
    quote: object.quote,
    findings: object.findings,
    diffLines: computeDiff(submission.code, object.suggestedCode),
  })
}
