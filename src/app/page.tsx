export const dynamic = 'force-dynamic'

import { HydrateClient, prefetch, trpc } from '@/trpc/server'
import { CodeInput } from './_components/code-input'
import { HeroTitle } from './_components/hero'
import { LeaderboardPreview } from './_components/leaderboard-preview'
import { StatsHint } from './_components/stats-hint'

export default async function Page() {
  void prefetch(trpc.leaderboard.stats.queryOptions())
  void prefetch(trpc.leaderboard.top3.queryOptions())

  return (
    <HydrateClient>
      <main className="mx-auto flex w-full max-w-[960px] flex-col gap-8 px-4 pt-12 pb-10 sm:px-10 sm:pt-20 sm:pb-16">
        <div className="mx-auto flex w-full max-w-[780px] flex-col gap-8">
          <HeroTitle />

          <CodeInput />

          <StatsHint />
        </div>

        <div className="h-4 sm:h-8" />

        <LeaderboardPreview />
      </main>
    </HydrateClient>
  )
}
