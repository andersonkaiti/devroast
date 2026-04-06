import { Button } from '@components/ui/button'
import { CodeBlock } from '@components/ui/code-block'
import { cn } from '@lib/utils'
import Link from 'next/link'
import { Suspense } from 'react'
import type { BundledLanguage } from 'shiki'
import { getQueryClient, trpc } from '@/trpc/server'
import { LeaderboardTableContent } from './leaderboard-table-content'
import { LeaderboardTableSkeleton } from './leaderboard-table-skeleton'

function scoreColor(score: number) {
  if (score <= 4) return 'text-red-500'
  if (score <= 6) return 'text-amber-500'
  return 'text-emerald-500'
}

async function LeaderboardTableServer() {
  const queryClient = getQueryClient()

  const [entries, stats] = await Promise.all([
    queryClient.fetchQuery(trpc.leaderboard.top3.queryOptions()),
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
    <LeaderboardTableContent
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
