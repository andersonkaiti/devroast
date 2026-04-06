import { SkeletonCard } from './skeleton-card'

export function LeaderboardTableSkeleton({ count = 20 }: { count?: number }) {
  const keys = Array.from({ length: count }, (_, i) => `sk-${i}`)

  return (
    <div className="flex flex-col gap-5">
      {keys.map((id) => (
        <SkeletonCard key={id} />
      ))}
    </div>
  )
}
