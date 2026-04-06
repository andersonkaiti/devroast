export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { LeaderboardTableSkeleton } from '@/app/_components/leaderboard-table-skeleton'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'
import { LeaderboardPageServer } from './_components/leaderboard-page-server'
import { LeaderboardStats } from './_components/leaderboard-stats'

export const metadata = {
  title: 'Leaderboard - DevRoast',
  description: 'The most roasted code on the internet',
}

const MAX_LIMIT = 20

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>
}) {
  const { limit: limitParam } = await searchParams
  const limit = Math.min(
    Math.max(Number.parseInt(limitParam ?? '20', 10) || 20, 1),
    MAX_LIMIT,
  )

  void prefetch(trpc.leaderboard.stats.queryOptions())
  void prefetch(trpc.leaderboard.top20.queryOptions({ limit }))

  return (
    <HydrateClient>
      <main className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-4 pt-12 pb-10 sm:px-10 sm:pt-20 sm:pb-16">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold font-mono text-3xl text-emerald-500">
              {'>'}
            </span>
            <h1 className="font-bold font-mono text-3xl text-zinc-50">
              shame_leaderboard
            </h1>
          </div>
          <p className="font-mono text-sm text-zinc-500">
            {'// the most roasted code on the internet'}
          </p>
        </div>

        <LeaderboardStats />

        <Suspense fallback={<LeaderboardTableSkeleton count={limit} />}>
          <LeaderboardPageServer limit={limit} />
        </Suspense>
      </main>
    </HydrateClient>
  )
}
