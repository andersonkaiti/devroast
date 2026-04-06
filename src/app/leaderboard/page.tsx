export const dynamic = 'force-dynamic'

import { CodeBlock } from '@components/ui'
import { cn } from '@lib/utils'
import { Trophy } from 'lucide-react'
import { Suspense } from 'react'
import type { BundledLanguage } from 'shiki'
import { LeaderboardTableSkeleton } from '@/app/_components/leaderboard-table-skeleton'
import { getQueryClient, HydrateClient, prefetch, trpc } from '@/trpc/server'
import { LeaderboardPageContent } from './_components/leaderboard-page-content'

export const metadata = {
  title: 'Leaderboard - DevRoast',
  description: 'The most roasted code on the internet',
}

function scoreColor(score: number) {
  if (score <= 4) return 'text-red-500'
  if (score <= 6) return 'text-amber-500'
  return 'text-emerald-500'
}

async function LeaderboardPageServer() {
  const queryClient = getQueryClient()

  const [entries, stats] = await Promise.all([
    queryClient.fetchQuery(trpc.leaderboard.top20.queryOptions()),
    queryClient.fetchQuery(trpc.leaderboard.stats.queryOptions()),
  ])

  const codeBlocks = entries.map((entry, i) => ({
    id: entry.id,
    node: (
      <CodeBlock
        code={entry.code}
        lang={entry.lang as BundledLanguage}
        className="border-0 border-zinc-800 border-t"
      >
        <div className="flex h-10 items-center gap-4 border-zinc-800 border-b px-4 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-500" />
            <span className="size-2.5 rounded-full bg-amber-500" />
            <span className="size-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="shrink-0 text-[12px] text-gray-600">#{i + 1}</span>
          <span
            className={cn(
              'shrink-0 font-bold text-[12px]',
              scoreColor(Number(entry.score)),
            )}
          >
            {Number(entry.score).toFixed(1)}
          </span>
          <span className="shrink-0 text-[12px] text-gray-600">
            {entry.lang}
          </span>
        </div>
      </CodeBlock>
    ),
  }))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-zinc-600">
            total submissions
          </span>
          <span className="font-bold font-mono text-lg text-zinc-50">
            {stats.total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-zinc-600">avg score</span>
          <span className="font-bold font-mono text-emerald-500 text-lg">
            {stats.avgScore.toFixed(1)}
          </span>
        </div>
      </div>

      <LeaderboardPageContent codeBlocks={codeBlocks} />
    </div>
  )
}

export default async function LeaderboardPage() {
  void prefetch(trpc.leaderboard.stats.queryOptions())
  void prefetch(trpc.leaderboard.top20.queryOptions())

  return (
    <HydrateClient>
      <main className="mx-auto flex w-full max-w-[960px] flex-col gap-8 px-4 pt-12 pb-10 sm:px-10 sm:pt-20 sm:pb-16">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h1 className="font-bold font-mono text-3xl">shame leaderboard</h1>
        </div>

        <Suspense fallback={<LeaderboardTableSkeleton />}>
          <LeaderboardPageServer />
        </Suspense>
      </main>
    </HydrateClient>
  )
}
