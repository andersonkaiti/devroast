import { SectionTitle } from '../section-title'

const skeletonKeys = ['a', 'b', 'c', 'd'] as const

export function AnalysisSectionSkeleton() {
  return (
    <section className="flex flex-col gap-6">
      <SectionTitle>detailed_analysis</SectionTitle>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {skeletonKeys.map((key) => (
          <div
            key={key}
            className="h-32 w-full animate-pulse rounded bg-zinc-900"
          />
        ))}
      </div>
    </section>
  )
}
