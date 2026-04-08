'use client'

import type { ReactNode } from 'react'
import { AnalysisSection } from './analysis-section'
import { AnalysisSectionSkeleton } from './analysis-section/skeleton'
import { DiffSection } from './diff-section'
import { DiffSectionSkeleton } from './diff-section/skeleton'
import { Divider } from './divider'
import { ErrorView } from './error-view'
import { ScoreHero } from './score-hero'
import { ScoreHeroSkeleton } from './score-hero/skeleton'
import { SectionTitle } from './section-title'
import { useRoast } from './use-roast'

interface RoastStreamContentProps {
  id: string
  lang: string
  lineCount: number
  children: ReactNode
}

export function RoastStreamContent({
  id,
  lang,
  lineCount,
  children,
}: RoastStreamContentProps) {
  const { result, error } = useRoast(id)

  if (error) return <ErrorView message={error} />

  const isLoading = result === null

  return (
    <main className="mx-auto flex w-full max-w-[960px] flex-col gap-10 px-4 pt-12 pb-10 sm:px-10 sm:pt-20 sm:pb-16">
      {result ? (
        <ScoreHero result={result} lang={lang} lineCount={lineCount} />
      ) : (
        <ScoreHeroSkeleton />
      )}

      <Divider />

      <section className="flex flex-col gap-4">
        <SectionTitle>your_submission</SectionTitle>
        {children}
      </section>

      <Divider />

      {result ? (
        <AnalysisSection findings={result.findings} />
      ) : (
        <AnalysisSectionSkeleton />
      )}

      {result?.diffLines.length || isLoading ? <Divider /> : null}

      {result?.diffLines.length ? (
        <DiffSection diffLines={result.diffLines} />
      ) : isLoading ? (
        <DiffSectionSkeleton />
      ) : null}
    </main>
  )
}
