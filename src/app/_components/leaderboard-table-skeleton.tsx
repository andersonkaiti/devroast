function SkeletonCard() {
  return (
    <div className="overflow-hidden border border-zinc-800">
      <div className="flex h-12 items-center justify-between border-zinc-800 border-b px-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="block h-3 w-3 animate-pulse rounded bg-zinc-800" />
            <span className="block h-3 w-4 animate-pulse rounded bg-zinc-700" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="block h-3 w-8 animate-pulse rounded bg-zinc-800" />
            <span className="block h-3 w-6 animate-pulse rounded bg-zinc-700" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="block h-3 w-10 animate-pulse rounded bg-zinc-800" />
          <span className="block h-3 w-12 animate-pulse rounded bg-zinc-800" />
        </div>
      </div>
      <div className="h-[125px] animate-pulse bg-zinc-900" />
    </div>
  )
}

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
