import { LeaderboardTableHeader } from './leaderboard-table-header'

function SkeletonRow() {
  return (
    <div className="flex items-center gap-6 border-zinc-800 border-b px-5 py-4">
      <span className="w-10 shrink-0">
        <span className="block h-3 w-4 animate-pulse rounded bg-zinc-800" />
      </span>
      <span className="w-[60px] shrink-0">
        <span className="block h-3 w-8 animate-pulse rounded bg-zinc-800" />
      </span>
      <span className="flex-1">
        <span className="block h-3 w-3/4 animate-pulse rounded bg-zinc-800" />
      </span>
      <span className="w-[100px] shrink-0">
        <span className="block h-3 w-16 animate-pulse rounded bg-zinc-800" />
      </span>
    </div>
  )
}

export function LeaderboardTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <div className="min-w-[420px] overflow-hidden border border-zinc-800">
          <LeaderboardTableHeader />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
      <span className="block h-3 w-48 animate-pulse self-center rounded bg-zinc-800" />
    </div>
  )
}
