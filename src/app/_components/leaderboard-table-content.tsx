'use client'
import { LeaderboardRow } from '@components/ui/leaderboard-row'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'
import { LeaderboardTableHeader } from './leaderboard-table-header'

export function LeaderboardTableContent() {
  const trpc = useTRPC()
  const { data: entries } = useSuspenseQuery(
    trpc.leaderboard.top3.queryOptions(),
  )
  const { data: stats } = useSuspenseQuery(
    trpc.leaderboard.stats.queryOptions(),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <div className="min-w-[420px] overflow-hidden border border-zinc-800">
          <LeaderboardTableHeader />
          {entries.map((entry, i) => (
            <LeaderboardRow key={entry.id}>
              <LeaderboardRow.Rank>{i + 1}</LeaderboardRow.Rank>
              <LeaderboardRow.Score score={Number(entry.score)} />
              <LeaderboardRow.Code>{entry.codePreview}</LeaderboardRow.Code>
              <LeaderboardRow.Lang>{entry.lang}</LeaderboardRow.Lang>
            </LeaderboardRow>
          ))}
        </div>
      </div>
      <p className="text-center font-sans text-[12px] text-gray-600">
        showing top 3 of {stats.total.toLocaleString()} · view full leaderboard{' '}
        {'>>'}
      </p>
    </div>
  )
}
