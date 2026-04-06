export const dynamic = 'force-dynamic'

import { CodeBlock } from '@components/ui'
import { cn } from '@lib/utils'
import { Suspense } from 'react'
import type { BundledLanguage } from 'shiki'
import { LeaderboardTableSkeleton } from '@/app/_components/leaderboard-table-skeleton'
import { getQueryClient, HydrateClient, prefetch, trpc } from '@/trpc/server'
import { LeaderboardPageContent } from './_components/leaderboard-page-content'
import { LeaderboardStats } from './_components/leaderboard-stats'

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

  const entries = await queryClient.fetchQuery(
    trpc.leaderboard.top20.queryOptions(),
  )

  const codeBlocks = entries.map((entry, i) => {
    const lineCount = entry.code.split('\n').length

    return {
      id: entry.id,
      node: (
        <CodeBlock
          code={entry.code}
          lang={entry.lang as BundledLanguage}
          className="border-0 border-zinc-800 border-t"
        >
          <div className="flex h-12 items-center justify-between border-zinc-800 border-b px-5 font-mono">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] text-zinc-600">#</span>
                <span className="font-bold text-[13px] text-amber-500">
                  {i + 1}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-zinc-600">score:</span>
                <span
                  className={cn(
                    'font-bold text-[13px]',
                    scoreColor(Number(entry.score)),
                  )}
                >
                  {Number(entry.score).toFixed(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-zinc-400">{entry.lang}</span>
              <span className="text-[12px] text-zinc-600">
                {lineCount} lines
              </span>
            </div>
          </div>
        </CodeBlock>
      ),
    }
  })

  return <LeaderboardPageContent codeBlocks={codeBlocks} />
}

export default async function LeaderboardPage() {
  void prefetch(trpc.leaderboard.stats.queryOptions())
  void prefetch(trpc.leaderboard.top20.queryOptions())

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

        <Suspense fallback={<LeaderboardTableSkeleton />}>
          <LeaderboardPageServer />
        </Suspense>
      </main>
    </HydrateClient>
  )
}
