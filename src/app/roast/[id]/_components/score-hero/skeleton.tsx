export function ScoreHeroSkeleton() {
  return (
    <section className="flex flex-col items-start gap-10 sm:flex-row sm:items-center">
      <div className="size-[180px] shrink-0 animate-pulse rounded-full bg-zinc-900" />
      <div className="flex w-full flex-col gap-4">
        <div className="h-4 w-48 animate-pulse rounded bg-zinc-900" />
        <div className="h-6 w-full animate-pulse rounded bg-zinc-900" />
        <div className="h-3 w-32 animate-pulse rounded bg-zinc-900" />
      </div>
    </section>
  )
}
