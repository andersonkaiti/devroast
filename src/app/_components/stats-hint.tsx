'use client'
import NumberFlow from '@number-flow/react'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'

export function StatsHint() {
  const trpc = useTRPC()
  const { data } = useQuery(trpc.leaderboard.stats.queryOptions())

  return (
    <div className="flex items-center justify-center gap-4 font-sans text-[12px] text-gray-600 sm:gap-6">
      <span>
        <NumberFlow value={data?.total ?? 0} /> codes roasted
      </span>
      <span>·</span>
      <span>
        avg score:{' '}
        <NumberFlow
          value={data?.avgScore ?? 0}
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        />
        /10
      </span>
    </div>
  )
}
