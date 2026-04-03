'use client'
import NumberFlow from '@number-flow/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTRPC } from '@/trpc/client'

export function StatsHint() {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.leaderboard.stats.queryOptions())

  const [total, setTotal] = useState(0)
  const [avgScore, setAvgScore] = useState(0)

  useEffect(() => {
    setTotal(data.total)
    setAvgScore(data.avgScore)
  }, [data.total, data.avgScore])

  return (
    <div className="flex items-center justify-center gap-4 font-sans text-[12px] text-gray-600 sm:gap-6">
      <span>
        <NumberFlow value={total} /> codes roasted
      </span>
      <span>·</span>
      <span>
        avg score:{' '}
        <NumberFlow
          value={avgScore}
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        />
        /10
      </span>
    </div>
  )
}
