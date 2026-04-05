import { Button } from '@components/ui/button'
import { CodeBlock } from '@components/ui/code-block'
import Link from 'next/link'
import { Suspense } from 'react'
import type { BundledLanguage } from 'shiki'
import { getQueryClient, trpc } from '@/trpc/server'
import { LeaderboardTableContent } from './leaderboard-table-content'
import { LeaderboardTableSkeleton } from './leaderboard-table-skeleton'

async function LeaderboardTableServer() {
  const queryClient = getQueryClient()

  const [entries, stats] = await Promise.all([
    queryClient.fetchQuery(trpc.leaderboard.top3.queryOptions()),
    queryClient.fetchQuery(trpc.leaderboard.stats.queryOptions()),
  ])

  const codeBlocks = entries.map((entry) => (
    <CodeBlock
      key={entry.id}
      code={entry.code}
      lang={entry.lang as BundledLanguage}
      className="border-0 border-zinc-800 border-t"
    />
  ))

  return (
    <LeaderboardTableContent
      entries={entries}
      codeBlocks={codeBlocks}
      totalSubmissions={stats.total}
    />
  )
}

export function LeaderboardPreview() {
  return (
    <section className="flex w-full flex-col gap-4 sm:gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[14px] text-emerald-500">
            {'// '}
          </span>
          <span className="font-bold text-[14px] text-zinc-50">
            shame_leaderboard
          </span>
        </div>
        <Link href="/leaderboard">
          <Button variant="outline" size="sm">
            $ view_all {'>>'}
          </Button>
        </Link>
      </div>

      <p className="font-sans text-[12px] text-gray-600 sm:text-[13px]">
        {'// the worst code on the internet, ranked by shame'}
      </p>

      <Suspense fallback={<LeaderboardTableSkeleton />}>
        <LeaderboardTableServer />
      </Suspense>
    </section>
  )
}
