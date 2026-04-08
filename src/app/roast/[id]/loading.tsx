import { AnalysisSectionSkeleton } from './_components/analysis-section/skeleton'
import { DiffSectionSkeleton } from './_components/diff-section/skeleton'
import { Divider } from './_components/divider'
import { ScoreHeroSkeleton } from './_components/score-hero/skeleton'
import { SectionTitle } from './_components/section-title'

export default function RoastResultLoading() {
  return (
    <main className="mx-auto flex w-full max-w-[960px] flex-col gap-10 px-4 pt-12 pb-10 sm:px-10 sm:pt-20 sm:pb-16">
      <ScoreHeroSkeleton />

      <Divider />

      <section className="flex flex-col gap-4">
        <SectionTitle>your_submission</SectionTitle>
        <div className="h-48 w-full animate-pulse rounded bg-zinc-900" />
      </section>

      <Divider />

      <AnalysisSectionSkeleton />

      <Divider />

      <DiffSectionSkeleton />
    </main>
  )
}
