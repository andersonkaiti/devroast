import { CodeBlock } from '@components/ui'
import { cn } from '@lib/utils'
import { cacheLife } from 'next/cache'
import type { BundledLanguage } from 'shiki'
import { getQueryClient, trpc } from '@/trpc/server'
import { LeaderboardPageContent } from './leaderboard-page-content'

function scoreColor(score: number) {
  if (score <= 4) return 'text-red-500'
  if (score <= 6) return 'text-amber-500'
  return 'text-emerald-500'
}

export async function LeaderboardPageServer({ limit }: { limit: number }) {
  'use cache'
  cacheLife({ revalidate: 3600 })

  const queryClient = getQueryClient()

  const entries = await queryClient.fetchQuery(
    trpc.leaderboard.top20.queryOptions({ limit }),
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
