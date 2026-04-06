'use client'

import NumberFlow from '@number-flow/react'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'

export function LeaderboardStats() {
  const trpc = useTRPC()
  const { data } = useQuery({
    ...trpc.leaderboard.stats.queryOptions(),
    placeholderData: { total: 0, avgScore: 0 },
  })

  return (
    <p className="font-mono text-sm text-zinc-600">
      <NumberFlow value={data?.total ?? 0} /> submissions · avg score:{' '}
      <NumberFlow
        value={data?.avgScore ?? 0}
        format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
      />
      /10
    </p>
  )
}
