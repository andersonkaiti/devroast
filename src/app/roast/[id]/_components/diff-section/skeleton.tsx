export function DiffSectionSkeleton() {
  return (
    <section className="flex flex-col gap-6">
      <div className="h-4 w-40 animate-pulse rounded bg-zinc-900" />
      <div className="h-40 w-full animate-pulse rounded bg-zinc-900" />
    </section>
  )
}
