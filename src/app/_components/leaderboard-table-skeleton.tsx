import { SkeletonCard } from './skeleton-card'

const SKELETON_KEYS = Array.from({ length: 20 }, (_, i) => `sk-${i}`)

export function LeaderboardTableSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {SKELETON_KEYS.map((id) => (
        <SkeletonCard key={id} />
      ))}
    </div>
  )
}
