import {
  AnalysisCard,
  Badge,
  Button,
  CodeBlock,
  DiffLine,
  LeaderboardRow,
  ScoreRing,
} from '@components/ui'
import { ToggleDemo } from './_components/toggle-demo'

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <span className="font-bold font-mono text-emerald-500 text-sm">
          {'//'}
        </span>
        <h2 className="font-bold font-mono text-sm text-zinc-50">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-4">{children}</div>
}

function Item({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <span className="font-mono text-[11px] text-gray-600">{label}</span>
      {children}
    </div>
  )
}

const SAMPLE_CODE = `function calculateTotal(items) {
  var total = 0
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price
  }
  return total
}`

export default async function Page() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-16 px-10 py-16">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold font-mono text-2xl text-emerald-500">
            {'//'}
          </span>
          <h1 className="font-bold font-mono text-2xl text-zinc-50">
            component_library
          </h1>
        </div>
        <p className="font-sans text-gray-500 text-sm">
          visual reference for all ui components and variants
        </p>
      </div>

      <Section title="button">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] text-gray-600">variant</span>
            <Row>
              <Item label="primary">
                <Button variant="primary">$ roast_my_code</Button>
              </Item>
              <Item label="secondary">
                <Button variant="secondary">$ share_roast</Button>
              </Item>
              <Item label="outline">
                <Button variant="outline">$ view_all</Button>
              </Item>
              <Item label="ghost">
                <Button variant="ghost">$ cancel</Button>
              </Item>
              <Item label="destructive">
                <Button variant="destructive">$ delete</Button>
              </Item>
            </Row>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] text-gray-600">size</span>
            <Row>
              <Item label="sm">
                <Button size="sm">$ small</Button>
              </Item>
              <Item label="md">
                <Button size="md">$ medium</Button>
              </Item>
              <Item label="lg">
                <Button size="lg">$ large</Button>
              </Item>
              <Item label="disabled">
                <Button disabled>$ disabled</Button>
              </Item>
            </Row>
          </div>
        </div>
      </Section>

      <Section title="badge">
        <Row>
          <Item label="critical">
            <Badge severity="critical" label="critical" />
          </Item>
          <Item label="warning">
            <Badge severity="warning" label="warning" />
          </Item>
          <Item label="good">
            <Badge severity="good" label="good" />
          </Item>
          <Item label="custom label">
            <Badge severity="critical" label="needs_serious_help" />
          </Item>
        </Row>
      </Section>

      <Section title="toggle">
        <ToggleDemo />
      </Section>

      <Section title="diff_line">
        <div className="w-full max-w-xl overflow-hidden border border-zinc-800">
          <DiffLine variant="context">
            {'function calculateTotal(items) {'}
          </DiffLine>
          <DiffLine variant="removed">{'  var total = 0;'}</DiffLine>
          <DiffLine variant="added">{'  const total = 0;'}</DiffLine>
          <DiffLine variant="removed">
            {'  for (var i = 0; i < items.length; i++) {'}
          </DiffLine>
          <DiffLine variant="added">{'  for (const item of items) {'}</DiffLine>
          <DiffLine variant="context">{'    total += item.price'}</DiffLine>
          <DiffLine variant="context">{'}'}</DiffLine>
        </div>
      </Section>

      <Section title="score_ring">
        <Row>
          <Item label="bad (2.4)">
            <ScoreRing score={2.4} />
          </Item>
          <Item label="average (5.8)">
            <ScoreRing score={5.8} />
          </Item>
          <Item label="good (8.1)">
            <ScoreRing score={8.1} />
          </Item>
        </Row>
      </Section>

      <Section title="analysis_card">
        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          <AnalysisCard
            severity="critical"
            title="var_usage_detected"
            description="Using var instead of const/let causes function-scoped hoisting issues and makes code harder to reason about."
          />
          <AnalysisCard
            severity="warning"
            title="missing_error_handling"
            description="Async operations should be wrapped in try/catch to handle failures gracefully."
          />
          <AnalysisCard
            severity="good"
            title="clean_function_signature"
            description="Function parameters are well-named and the return type is clear."
          />
        </div>
      </Section>

      <Section title="leaderboard_row">
        <div className="w-full max-w-2xl overflow-hidden border border-zinc-800">
          <LeaderboardRow
            rank={1}
            score={9.2}
            codePreview="const sum = (a, b) => a + b"
            lang="TypeScript"
          />
          <LeaderboardRow
            rank={2}
            score={6.5}
            codePreview="function getData() { return fetch('/api/data') }"
            lang="JavaScript"
          />
          <LeaderboardRow
            rank={3}
            score={3.8}
            codePreview="var x = 0; for(var i=0;i<10;i++){x=x+i}"
            lang="JavaScript"
          />
        </div>
      </Section>

      <Section title="code_block">
        <div className="flex flex-col gap-6">
          <Item label="with filename">
            <CodeBlock
              code={SAMPLE_CODE}
              lang="javascript"
              filename="calculate.js"
              className="w-full max-w-xl"
            />
          </Item>
          <Item label="without filename">
            <CodeBlock
              code={SAMPLE_CODE}
              lang="javascript"
              className="w-full max-w-xl"
            />
          </Item>
        </div>
      </Section>
    </main>
  )
}
