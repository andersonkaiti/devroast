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

  const isLoading = state.status === 'connecting' || state.status === 'streaming'
  const verdict = state.score !== null ? getVerdict(state.score) : null
  const skeletonFindingCount = Math.max(0, 4 - state.findings.length)

  return (
    <main className="mx-auto flex w-full max-w-[960px] flex-col gap-10 px-4 pt-12 pb-10 sm:px-10 sm:pt-20 sm:pb-16">
      {/* Score Hero */}
      {state.score !== null ? (
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
      ) : (
        <section className="flex flex-col items-start gap-10 sm:flex-row sm:items-center">
          <div className="size-[180px] shrink-0 animate-pulse rounded-full bg-zinc-900" />
          <div className="flex w-full flex-col gap-4">
            <div className="h-4 w-48 animate-pulse rounded bg-zinc-900" />
            <div className="h-6 w-full animate-pulse rounded bg-zinc-900" />
            <div className="h-3 w-32 animate-pulse rounded bg-zinc-900" />
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
          {isLoading &&
            Array.from({ length: skeletonFindingCount }, (_, i) => (
              <div key={`sk-${i}`} className="h-32 w-full animate-pulse rounded bg-zinc-900" />
            ))}
        </div>
      </section>

      {(state.diffLines.length > 0 || isLoading) && <Divider />}

      {/* Suggested Fix */}
      {state.diffLines.length > 0 ? (
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
      ) : isLoading ? (
        <section className="flex flex-col gap-6">
          <div className="h-4 w-40 animate-pulse rounded bg-zinc-900" />
          <div className="h-40 w-full animate-pulse rounded bg-zinc-900" />
        </section>
      ) : null}
    </main>
  )
}
