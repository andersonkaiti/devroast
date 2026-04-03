export function StatsHintSkeleton() {
  return (
    <div className="flex items-center justify-center gap-4 font-sans text-[12px] sm:gap-6">
      <span className="h-3 w-32 animate-pulse rounded bg-zinc-800" />
      <span className="text-gray-600">·</span>
      <span className="h-3 w-28 animate-pulse rounded bg-zinc-800" />
    </div>
  )
}
