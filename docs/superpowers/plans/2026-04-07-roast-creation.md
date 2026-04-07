# Roast Creation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up end-to-end roast submission — from `CodeInput` mutation → DB insert → SSE Gemini stream → progressive result page render.

**Architecture:** `CodeInput` calls `roast.create` tRPC mutation which inserts a placeholder submission and returns `{ id }`. The browser navigates to `/roast/[id]`, where the server component fetches the submission and renders `RoastStreamContent`. That client component opens an EventSource to `/api/roast/[id]/stream`, which streams Gemini output as SSE events that progressively hydrate the page. On `done`, the route handler saves the final score, quote, and findings to the DB.

**Tech Stack:** Next.js 16 App Router, tRPC v11, Drizzle ORM, Zod v4, Vercel AI SDK (`ai` + `@ai-sdk/google`), Server-Sent Events, TanStack Query v5.

---

## File Map

| Action | Path | Responsibility |
| -------- | ------ | ---------------- |
| Install | — | `ai`, `@ai-sdk/google` packages |
| Modify | `src/lib/env.ts` | Add `GEMINI_API_KEY` env var |
| Create | `src/trpc/routers/roast.ts` | `roast.create` mutation — inserts placeholder submission |
| Modify | `src/trpc/routers/_app.ts` | Register `roastRouter` |
| Create | `src/app/api/roast/[id]/stream/route.ts` | SSE handler — calls Gemini, parses XML, emits events, saves to DB on done |
| Create | `src/app/roast/[id]/_components/roast-stream-content.tsx` | Client component — consumes SSE, renders page progressively |
| Modify | `src/app/roast/[id]/page.tsx` | Fetch submission server-side, render `RoastStreamContent` |
| Modify | `src/app/_components/code-input.tsx` | Call `roast.create`, show loading state, navigate on success |

---

### Task 1: Install AI packages and add env var

**Files:**

- Modify: `src/lib/env.ts`

- [ ] **Step 1: Install packages**

```bash
pnpm add ai @ai-sdk/google
```

Expected: packages added, `pnpm-lock.yaml` updated.

- [ ] **Step 2: Add `GEMINI_API_KEY` to env schema**

Replace `src/lib/env.ts` entirely:

```typescript
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.url('DATABASE_URL must be a valid database connection URL'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
})

export const env = envSchema.parse(process.env)
```

- [ ] **Step 3: Add `GEMINI_API_KEY` to `.env`**

Open `.env` (or `.env.local`) and add your Gemini API key:

```txt
GEMINI_API_KEY=your_key_here
```

- [ ] **Step 4: Verify build still passes**

```bash
pnpm build
```

Expected: build succeeds (will fail if `GEMINI_API_KEY` is missing from `.env`).

- [ ] **Step 5: Commit**

```bash
git add src/lib/env.ts
git commit -m "📦 build(deps): add ai sdk and gemini provider, add GEMINI_API_KEY env var"
```

---

### Task 2: tRPC roast router

**Files:**

- Create: `src/trpc/routers/roast.ts`
- Modify: `src/trpc/routers/_app.ts`

- [ ] **Step 1: Create `src/trpc/routers/roast.ts`**

```typescript
import { submissions } from '@db/schemas'
import { z } from 'zod'
import { baseProcedure, createTRPCRouter } from '../init'

export const roastRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        code: z.string().min(10).max(2000),
        lang: z.string().min(1),
        roastMode: z.enum(['honest', 'roast']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [submission] = await ctx.db
        .insert(submissions)
        .values({
          code: input.code,
          codePreview: input.code.trim().slice(0, 160),
          lang: input.lang,
          roastMode: input.roastMode,
          score: '0',
          roastText: '',
          isPublic: true,
        })
        .returning({ id: submissions.id })

      return { id: submission.id }
    }),
})
```

- [ ] **Step 2: Register router in `src/trpc/routers/_app.ts`**

```typescript
import { createTRPCRouter } from '../init'
import { leaderboardRouter } from './leaderboard'
import { roastRouter } from './roast'

export const appRouter = createTRPCRouter({
  leaderboard: leaderboardRouter,
  roast: roastRouter,
})

export type AppRouter = typeof appRouter
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm build
```

Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/trpc/routers/roast.ts src/trpc/routers/_app.ts
git commit -m "✨ feat(roast): add roast.create tRPC mutation to insert placeholder submission"
```

---

### Task 3: SSE route handler

**Files:**

- Create: `src/app/api/roast/[id]/stream/route.ts`

This handler fetches the submission, calls Gemini with `streamText`, accumulates streamed XML in a buffer, emits SSE events as tags close, and saves final data on `done`.

- [ ] **Step 1: Create directory and route file**

Create `src/app/api/roast/[id]/stream/route.ts` with the full implementation:

```typescript
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
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: no TypeScript errors. The route will be accessible at `/api/roast/[id]/stream`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/roast/
git commit -m "✨ feat(roast): add SSE route handler that streams Gemini analysis and saves to DB"
```

---

### Task 4: RoastStreamContent client component

**Files:**

- Create: `src/app/roast/[id]/_components/roast-stream-content.tsx`

This component opens an EventSource on mount, dispatches SSE events into a reducer, and renders sections progressively as data arrives.

**Important:** `CodeBlock` is an `async` server component (it calls `await codeToTokens()` at the top level). It cannot be imported or rendered inside a `'use client'` component. Instead, the page (Task 5) renders `<CodeBlock>` server-side and passes it to `RoastStreamContent` as `children`. The client component slots it in without needing the raw code.

- [ ] **Step 1: Create `src/app/roast/[id]/_components/roast-stream-content.tsx`**

```typescript
'use client'

import { AnalysisCard, Badge, Button, DiffLine, ScoreRing } from '@components/ui'
import { useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import { Divider } from './divider'
import { SectionTitle } from './section-title'

// ── Types ─────────────────────────────────────────────────────────────────────

type Severity = 'critical' | 'warning' | 'good'
type DiffVariant = 'context' | 'removed' | 'added'

interface Finding {
  severity: Severity
  title: string
  description: string
}

interface DiffLineItem {
  variant: DiffVariant
  content: string
}

interface RoastState {
  status: 'connecting' | 'streaming' | 'done' | 'error'
  score: number | null
  quote: string | null
  findings: Finding[]
  diffLines: DiffLineItem[]
  errorMessage: string | null
}

type RoastAction =
  | { type: 'score'; value: number }
  | { type: 'quote'; value: string }
  | { type: 'finding'; severity: Severity; title: string; description: string }
  | { type: 'diff_line'; variant: DiffVariant; content: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

// ── Reducer ───────────────────────────────────────────────────────────────────

const initialState: RoastState = {
  status: 'connecting',
  score: null,
  quote: null,
  findings: [],
  diffLines: [],
  errorMessage: null,
}

function roastReducer(state: RoastState, action: RoastAction): RoastState {
  switch (action.type) {
    case 'score':
      return { ...state, status: 'streaming', score: action.value }
    case 'quote':
      return { ...state, quote: action.value }
    case 'finding':
      return {
        ...state,
        findings: [
          ...state.findings,
          { severity: action.severity, title: action.title, description: action.description },
        ],
      }
    case 'diff_line':
      return {
        ...state,
        diffLines: [...state.diffLines, { variant: action.variant, content: action.content }],
      }
    case 'done':
      return { ...state, status: 'done' }
    case 'error':
      return { ...state, status: 'error', errorMessage: action.message }
    default:
      return state
  }
}

// ── Verdict ───────────────────────────────────────────────────────────────────

function getVerdict(score: number): { label: string; severity: Severity } {
  if (score <= 4) return { label: 'verdict: needs_serious_help', severity: 'critical' }
  if (score <= 6) return { label: 'verdict: needs_improvement', severity: 'warning' }
  if (score <= 8) return { label: 'verdict: acceptable', severity: 'warning' }
  return { label: 'verdict: pretty_good', severity: 'good' }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface RoastStreamContentProps {
  id: string
  lang: string
  lineCount: number
  /** The server-rendered <CodeBlock> passed from the page server component. */
  children: ReactNode
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RoastStreamContent({ id, lang, lineCount, children }: RoastStreamContentProps) {
  const [state, dispatch] = useReducer(roastReducer, initialState)

  useEffect(() => {
    const es = new EventSource(`/api/roast/${id}/stream`)

    es.onmessage = (event) => {
      const data = JSON.parse(event.data) as RoastAction
      dispatch(data)
      if (data.type === 'done' || data.type === 'error') {
        es.close()
      }
    }

    es.onerror = () => {
      dispatch({ type: 'error', message: 'Connection lost. Please go back and try again.' })
      es.close()
    }

    return () => es.close()
  }, [id])

  if (state.status === 'connecting') {
    return (
      <main className="mx-auto flex w-full max-w-[960px] flex-col gap-10 px-4 pt-12 pb-10 sm:px-10 sm:pt-20 sm:pb-16">
        <section className="flex flex-col items-start gap-10 sm:flex-row sm:items-center">
          <div className="size-[180px] shrink-0 animate-pulse rounded-full bg-zinc-900" />
          <div className="flex w-full flex-col gap-4">
            <div className="h-4 w-48 animate-pulse rounded bg-zinc-900" />
            <div className="h-6 w-full animate-pulse rounded bg-zinc-900" />
            <div className="h-3 w-32 animate-pulse rounded bg-zinc-900" />
          </div>
        </section>
        <Divider />
        <section className="flex flex-col gap-4">
          <div className="h-4 w-40 animate-pulse rounded bg-zinc-900" />
          <div className="h-64 w-full animate-pulse rounded bg-zinc-900" />
        </section>
        <Divider />
        <section className="flex flex-col gap-6">
          <div className="h-4 w-40 animate-pulse rounded bg-zinc-900" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-32 w-full animate-pulse rounded bg-zinc-900" />
            ))}
          </div>
        </section>
      </main>
    )
  }

  if (state.status === 'error') {
    return (
      <main className="mx-auto flex w-full max-w-[960px] flex-col items-start gap-6 px-4 pt-12 pb-10 sm:px-10 sm:pt-20 sm:pb-16">
        <p className="font-mono text-sm text-red-500">
          {'// error: '}{state.errorMessage}
        </p>
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          $ go_back
        </Button>
      </main>
    )
  }

  const verdict = state.score !== null ? getVerdict(state.score) : null

  return (
    <main className="mx-auto flex w-full max-w-[960px] flex-col gap-10 px-4 pt-12 pb-10 sm:px-10 sm:pt-20 sm:pb-16">
      {/* Score Hero */}
      {state.score !== null && (
        <section className="flex flex-col items-start gap-10 sm:flex-row sm:items-center">
          <ScoreRing score={state.score} />
          <div className="flex flex-col gap-4">
            {verdict && (
              <Badge severity={verdict.severity}>{verdict.label}</Badge>
            )}
            {state.quote && (
              <p className="font-sans text-xl text-zinc-50 leading-relaxed">
                {state.quote}
              </p>
            )}
            <p className="font-mono text-xs text-zinc-500">
              lang: {lang} · {lineCount} lines
            </p>
            <div>
              <Button variant="outline" size="sm" disabled>
                $ share_roast
              </Button>
            </div>
          </div>
        </section>
      )}

      <Divider />

      {/* Submitted Code — server-rendered CodeBlock passed as children */}
      <section className="flex flex-col gap-4">
        <SectionTitle>your_submission</SectionTitle>
        {children}
      </section>

      <Divider />

      {/* Analysis */}
      {state.findings.length > 0 && (
        <section className="flex flex-col gap-6">
          <SectionTitle>detailed_analysis</SectionTitle>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {state.findings.map((finding) => (
              <AnalysisCard key={finding.title}>
                <Badge severity={finding.severity}>{finding.severity}</Badge>
                <AnalysisCard.Title>{finding.title}</AnalysisCard.Title>
                <AnalysisCard.Description>{finding.description}</AnalysisCard.Description>
              </AnalysisCard>
            ))}
          </div>
        </section>
      )}

      {state.findings.length > 0 && state.diffLines.length > 0 && <Divider />}

      {/* Suggested Fix */}
      {state.diffLines.length > 0 && (
        <section className="flex flex-col gap-6">
          <SectionTitle>suggested_fix</SectionTitle>
          <div className="border border-zinc-800">
            <div className="flex h-10 items-center border-zinc-800 border-b px-4">
              <span className="font-mono text-xs text-zinc-500">
                your_code.ts → improved_code.ts
              </span>
            </div>
            <div className="py-1">
              {state.diffLines.map((line, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: diff lines are positional
                <DiffLine key={i} variant={line.variant}>
                  {line.content}
                </DiffLine>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
pnpm build
```

Expected: compiles cleanly.

- [ ] **Step 3: Commit**

```bash
git add src/app/roast/[id]/_components/roast-stream-content.tsx
git commit -m "✨ feat(roast): add RoastStreamContent client component for progressive SSE rendering"
```

---

### Task 5: Update RoastResultPage

**Files:**

- Modify: `src/app/roast/[id]/page.tsx`

Replace the static page content with a server component that fetches the submission, renders `<CodeBlock>` server-side, and passes it as `children` to `RoastStreamContent`. `CodeBlock` must be rendered here (in the server component) because it is an `async` server component — it cannot be rendered inside a `'use client'` component.

- [ ] **Step 1: Rewrite `src/app/roast/[id]/page.tsx`**

```typescript
import { CodeBlock } from '@components/ui'
import { db } from '@db/index'
import { submissions } from '@db/schemas'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import type { BundledLanguage } from 'shiki'
import { RoastStreamContent } from './_components/roast-stream-content'

export default async function RoastResultPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [submission] = await db
    .select({
      id: submissions.id,
      code: submissions.code,
      lang: submissions.lang,
    })
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1)

  if (!submission) {
    notFound()
  }

  const lineCount = submission.code.split('\n').length

  return (
    <RoastStreamContent
      id={submission.id}
      lang={submission.lang}
      lineCount={lineCount}
    >
      <CodeBlock
        code={submission.code}
        lang={submission.lang as BundledLanguage}
      />
    </RoastStreamContent>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: no errors. Navigating to `/roast/<valid-id>` will show the streaming page.

- [ ] **Step 3: Commit**

```bash
git add src/app/roast/[id]/page.tsx
git commit -m "♻️ refactor(roast): replace static result page with server-fetched RoastStreamContent"
```

---

### Task 6: Wire up CodeInput mutation

**Files:**

- Modify: `src/app/_components/code-input.tsx`

Add `roast.create` mutation, loading state, and navigation. Remove the unused `onRoast` prop.

- [ ] **Step 1: Update `src/app/_components/code-input.tsx`**

Replace the full file:

```typescript
'use client'

import { Button } from '@components/ui/button'
import { HighlightedCodeDisplay } from '@components/ui/highlighted-code-display'
import { LanguageSelector } from '@components/ui/language-selector'
import { Toggle } from '@components/ui/toggle'
import { EditorProvider } from '@context/editor-context'
import { useEditorHighlighter } from '@hooks/useEditorHighlighter'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

const DOTS = [
  { key: 'close', className: 'bg-red-500' },
  { key: 'minimize', className: 'bg-amber-500' },
  { key: 'maximize', className: 'bg-emerald-500' },
]

const CHAR_LIMIT = 2000

export function CodeInput() {
  const [roastMode, setRoastMode] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  const {
    code,
    language,
    detectedLanguage,
    tokens,
    backgroundColor,
    setCode,
    setLanguage,
  } = useEditorHighlighter()

  const trpc = useTRPC()
  const router = useRouter()

  const { mutate: createRoast, isPending } = useMutation({
    ...trpc.roast.create.mutationOptions(),
    onSuccess: ({ id }) => {
      router.push(`/roast/${id}`)
    },
  })

  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCode(event.currentTarget.value)
    },
    [setCode],
  )

  const handleScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  const handleRoast = useCallback(() => {
    const resolvedLang = language === 'js' ? detectedLanguage : language
    createRoast({
      code,
      lang: resolvedLang,
      roastMode: roastMode ? 'roast' : 'honest',
    })
  }, [code, language, detectedLanguage, roastMode, createRoast])

  const charCount = code.length
  const isOverLimit = charCount > CHAR_LIMIT
  const lineCount = code.split('\n').length || 1

  return (
    <EditorProvider
      value={{
        code,
        language,
        detectedLanguage,
      }}
    >
      <div className="flex w-full flex-col gap-4">
        <div className="border border-zinc-800 bg-zinc-950">
          <div className="flex h-10 items-center justify-between border-zinc-800 border-b px-4">
            <div className="flex items-center gap-2">
              {DOTS.map((dot) => (
                <span
                  key={dot.key}
                  className={`block size-3 rounded-full ${dot.className}`}
                />
              ))}
            </div>
            <div className="relative z-20">
              <LanguageSelector
                value={
                  (language as string) === 'js' ? detectedLanguage : language
                }
                onChange={setLanguage}
              />
            </div>
          </div>

          <div className="relative flex h-[240px] overflow-y-auto sm:h-[360px]">
            {/* Line numbers */}
            <div
              ref={lineNumbersRef}
              className="flex w-12 shrink-0 flex-col items-end overflow-hidden border-zinc-800 border-r bg-neutral-950 px-3 py-4"
            >
              {Array.from({ length: Math.max(lineCount, 20) }, (_, i) =>
                String(i + 1),
              ).map((n) => (
                <span key={n} className="text-[12px] text-gray-600 leading-5">
                  {n}
                </span>
              ))}
            </div>

            {/* Editor with overlay pattern */}
            <div className="relative flex-1 overflow-y-auto">
              {/* Textarea (transparent, on top for input) */}
              <textarea
                ref={textareaRef}
                className="relative z-10 block h-full w-full resize-none bg-transparent p-4 text-transparent caret-zinc-50 placeholder:text-gray-600 focus:outline-none"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '13px',
                  lineHeight: '1.25rem',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                }}
                placeholder={
                  "// paste your code here\n// we'll roast it — no mercy"
                }
                spellCheck={false}
                value={code}
                onChange={handleInput}
                onScroll={handleScroll}
              />

              {/* Highlight display (behind textarea) */}
              <div
                ref={overlayRef}
                className="pointer-events-none absolute inset-0 overflow-y-auto"
              >
                <HighlightedCodeDisplay
                  tokens={tokens}
                  backgroundColor={backgroundColor}
                />
              </div>
            </div>
            <span
              className={`pointer-events-none absolute right-2 bottom-2 z-20 font-mono text-[11px] tabular-nums ${
                isOverLimit ? 'text-red-500' : 'text-gray-600'
              }`}
            >
              {charCount}/{CHAR_LIMIT}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Toggle
              checked={roastMode}
              onChange={setRoastMode}
              label="roast mode"
            />
            {roastMode && (
              <span className="font-sans text-[12px] text-gray-600">
                {'// maximum sarcasm enabled'}
              </span>
            )}
          </div>
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={handleRoast}
            disabled={isOverLimit || isPending || code.length < 10}
          >
            {isPending ? '$ roasting...' : '$ roast_my_code'}
          </Button>
        </div>
      </div>
    </EditorProvider>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: clean build. The `onRoast` prop is gone; the component is self-contained.

- [ ] **Step 3: Run dev and smoke test end-to-end**

```bash
pnpm dev
```

1. Open `http://localhost:3000`
2. Paste at least 10 characters of code
3. Click `$ roast_my_code` — button should show `$ roasting...` and disable
4. After redirect to `/roast/<id>`, skeleton should appear briefly, then score ring, quote, analysis cards, and diff should populate progressively
5. On completion, share button should be visible (disabled)

- [ ] **Step 4: Commit**

```bash
git add src/app/_components/code-input.tsx
git commit -m "✨ feat(roast): wire CodeInput to roast.create mutation with loading state and navigation"
```
