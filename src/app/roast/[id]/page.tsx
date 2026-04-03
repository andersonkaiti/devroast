import {
  AnalysisCard,
  Badge,
  Button,
  CodeBlock,
  DiffLine,
  ScoreRing,
} from '@components/ui'

const STATIC_ROAST = {
  score: 3.5,
  language: 'javascript' as const,
  lines: 16,
  quote:
    '"this code looks like it was written during a power outage... in 2005."',
  code: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  if (total > 100) {
    console.log("discount applied");
    total = total * 0.9;
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`,
}

const ISSUES = [
  {
    severity: 'critical' as const,
    title: 'using var instead of const/let',
    description:
      'var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.',
  },
  {
    severity: 'warning' as const,
    title: 'imperative loop pattern',
    description:
      'for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.',
  },
  {
    severity: 'good' as const,
    title: 'clear naming conventions',
    description:
      'calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.',
  },
  {
    severity: 'good' as const,
    title: 'single responsibility',
    description:
      'the function does one thing well — calculates a total. no side effects, no mixed concerns, no hidden complexity.',
  },
]

const DIFF_LINES: {
  variant: 'context' | 'removed' | 'added'
  content: string
}[] = [
  { variant: 'context', content: 'function calculateTotal(items) {' },
  { variant: 'removed', content: '  var total = 0;' },
  { variant: 'removed', content: '  for (var i = 0; i < items.length; i++) {' },
  { variant: 'removed', content: '    total = total + items[i].price;' },
  { variant: 'removed', content: '  }' },
  { variant: 'removed', content: '  return total;' },
  {
    variant: 'added',
    content: '  return items.reduce((sum, item) => sum + item.price, 0);',
  },
  { variant: 'context', content: '}' },
]

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold font-mono text-emerald-500 text-sm">
        {'//'}
      </span>
      <span className="font-bold font-mono text-sm text-zinc-50">
        {children}
      </span>
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-zinc-800" />
}

export default async function RoastResultPage() {
  return (
    <main className="mx-auto flex w-full max-w-[960px] flex-col gap-10 px-4 pt-12 pb-10 sm:px-10 sm:pt-20 sm:pb-16">
      {/* Score Hero */}
      <section className="flex flex-col items-start gap-10 sm:flex-row sm:items-center">
        <ScoreRing score={STATIC_ROAST.score} />
        <div className="flex flex-col gap-4">
          <Badge severity="critical">verdict: needs_serious_help</Badge>
          <p className="font-sans text-xl text-zinc-50 leading-relaxed">
            {STATIC_ROAST.quote}
          </p>
          <p className="font-mono text-xs text-zinc-500">
            lang: {STATIC_ROAST.language} · {STATIC_ROAST.lines} lines
          </p>
          <div>
            <Button variant="outline" size="sm">
              $ share_roast
            </Button>
          </div>
        </div>
      </section>

      <Divider />

      {/* Submitted Code */}
      <section className="flex flex-col gap-4">
        <SectionTitle>your_submission</SectionTitle>
        <CodeBlock code={STATIC_ROAST.code} lang={STATIC_ROAST.language} />
      </section>

      <Divider />

      {/* Analysis */}
      <section className="flex flex-col gap-6">
        <SectionTitle>detailed_analysis</SectionTitle>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {ISSUES.map((issue) => (
            <AnalysisCard key={issue.title}>
              <Badge severity={issue.severity}>{issue.severity}</Badge>
              <AnalysisCard.Title>{issue.title}</AnalysisCard.Title>
              <AnalysisCard.Description>
                {issue.description}
              </AnalysisCard.Description>
            </AnalysisCard>
          ))}
        </div>
      </section>

      <Divider />

      {/* Suggested Fix */}
      <section className="flex flex-col gap-6">
        <SectionTitle>suggested_fix</SectionTitle>
        <div className="border border-zinc-800">
          <div className="flex h-10 items-center border-zinc-800 border-b px-4">
            <span className="font-mono text-xs text-zinc-500">
              your_code.ts → improved_code.ts
            </span>
          </div>
          <div className="py-1">
            {DIFF_LINES.map((line) => (
              <DiffLine key={line.content} variant={line.variant}>
                {line.content}
              </DiffLine>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
