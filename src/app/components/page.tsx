import {
  AnalysisCard,
  Badge,
  Button,
  CodeBlock,
  DiffLine,
  LeaderboardRow,
  PageTitle,
  ScoreRing,
} from '@components/ui'
import { ToggleDemo } from '../_components/toggle-demo'

function SectionLabel({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold font-mono text-emerald-500 text-sm">
        {'//'}
      </span>
      <span className="font-bold font-mono text-sm text-zinc-50">{name}</span>
    </div>
  )
}

const SAMPLE_CODE = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
}`

export default async function ComponentsPage() {
  return (
    <main className="mx-auto flex w-full max-w-[960px] flex-col gap-16 px-4 pt-16 pb-20 sm:px-10 sm:pt-20">
      {/* Title */}
      <PageTitle prefix={'//'}>component_library</PageTitle>

      {/* Typography */}
      <section className="flex flex-col gap-6">
        <SectionLabel name="typography" />
        <div className="flex flex-col gap-5">
          <p className="font-bold font-mono text-4xl text-zinc-50 leading-tight">
            paste your code. get roasted.
          </p>
          <div className="flex items-center gap-2">
            <span className="font-bold font-mono text-emerald-500 text-sm">
              {'//'}
            </span>
            <span className="font-bold font-mono text-sm text-zinc-50">
              detailed_analysis
            </span>
          </div>
          <p className="font-sans text-gray-500 text-sm">
            description text sample
          </p>
          <p className="font-mono text-gray-600 text-xs">
            lang: javascript · 7 lines
          </p>
          <p className="font-mono text-[13px]" style={{ color: '#FFC799' }}>
            function calculateTotal()
          </p>
        </div>
      </section>

      {/* Buttons */}
      <section className="flex flex-col gap-6">
        <SectionLabel name="buttons" />
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" size="md">
            $ roast_my_code
          </Button>
          <Button variant="outline" size="md">
            $ share_roast
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-500 hover:text-gray-400"
          >
            $ view_all &gt;&gt;
          </Button>
        </div>
      </section>

      {/* Toggle */}
      <section className="flex flex-col gap-6">
        <SectionLabel name="toggle" />
        <ToggleDemo />
      </section>

      {/* Badge Status */}
      <section className="flex flex-col gap-6">
        <SectionLabel name="badge_status" />
        <div className="flex flex-wrap items-center gap-6">
          <Badge severity="critical">critical</Badge>
          <Badge severity="warning">warning</Badge>
          <Badge severity="good">good</Badge>
          <Badge severity="critical">needs_serious_help</Badge>
        </div>
      </section>

      {/* Cards */}
      <section className="flex flex-col gap-6">
        <SectionLabel name="cards" />
        <AnalysisCard className="max-w-[480px]">
          <Badge severity="critical">critical</Badge>
          <AnalysisCard.Title>
            using var instead of const/let
          </AnalysisCard.Title>
          <AnalysisCard.Description>
            the var keyword is function-scoped rather than block-scoped, which
            can lead to unexpected behavior and bugs. modern javascript uses
            const for immutable bindings and let for mutable ones.
          </AnalysisCard.Description>
        </AnalysisCard>
      </section>

      {/* Code Block */}
      <section className="flex flex-col gap-6">
        <SectionLabel name="code_block" />
        <div className="max-w-[560px]">
          <CodeBlock code={SAMPLE_CODE} lang="javascript">
            <CodeBlock.Filename>calculate.js</CodeBlock.Filename>
          </CodeBlock>
        </div>
      </section>

      {/* Diff Line */}
      <section className="flex flex-col gap-6">
        <SectionLabel name="diff_line" />
        <div className="max-w-[560px] border border-zinc-800">
          <DiffLine variant="removed">{'var total = 0;'}</DiffLine>
          <DiffLine variant="added">{'const total = 0;'}</DiffLine>
          <DiffLine variant="context">
            {'for (let i = 0; i < items.length; i++) {'}
          </DiffLine>
        </div>
      </section>

      {/* Table Row */}
      <section className="flex flex-col gap-6">
        <SectionLabel name="table_row" />
        <div className="border border-zinc-800">
          <LeaderboardRow>
            <LeaderboardRow.Rank>1</LeaderboardRow.Rank>
            <LeaderboardRow.Score score={2.1} />
            <LeaderboardRow.Code>
              {'function calculateTotal(items) { var total = 0; ...'}
            </LeaderboardRow.Code>
            <LeaderboardRow.Lang>javascript</LeaderboardRow.Lang>
          </LeaderboardRow>
        </div>
      </section>

      {/* Navbar */}
      <section className="flex flex-col gap-6">
        <SectionLabel name="navbar" />
        <header className="flex h-14 w-full items-center justify-between border border-zinc-800 bg-neutral-950 px-6">
          <div className="flex items-center gap-2">
            <span className="font-bold font-mono text-emerald-500 text-xl">
              {'>'}
            </span>
            <span className="font-medium font-mono text-[18px] text-zinc-50">
              devroast
            </span>
          </div>
          <span className="font-mono text-[13px] text-gray-500">
            leaderboard
          </span>
        </header>
      </section>

      {/* Score Ring */}
      <section className="flex flex-col gap-6">
        <SectionLabel name="score_ring" />
        <ScoreRing score={3.5} />
      </section>
    </main>
  )
}
