import { Button } from '@components/ui/button'
import Link from 'next/link'
import { Suspense } from 'react'
import { LeaderboardTableContent } from './leaderboard-table-content'
import { LeaderboardTableSkeleton } from './leaderboard-table-skeleton'

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
        <LeaderboardTableContent />
      </Suspense>
    </section>
  )
}
