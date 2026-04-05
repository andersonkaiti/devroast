'use client'
import { Collapsible } from '@base-ui-components/react/collapsible'
import { LeaderboardRow } from '@components/ui/leaderboard-row'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { LeaderboardTableHeader } from './leaderboard-table-header'

type Entry = {
  id: string
  codePreview: string
  lang: string
  score: string
}

type Props = {
  entries: Entry[]
  codeBlocks: ReactNode[]
  totalSubmissions: number
}

function CollapsibleRow({
  entry,
  rank,
  codeBlock,
}: {
  entry: Entry
  rank: number
  codeBlock: ReactNode
}) {
  return (
    <Collapsible.Root className="group border-zinc-800 border-b last:border-b-0">
      <Collapsible.Trigger className="flex w-full cursor-pointer items-center gap-6 px-5 py-4 font-mono hover:bg-zinc-900/40">
        <LeaderboardRow.Rank>{rank}</LeaderboardRow.Rank>
        <LeaderboardRow.Score score={Number(entry.score)} />
        <LeaderboardRow.Code>{entry.codePreview}</LeaderboardRow.Code>
        <LeaderboardRow.Lang>{entry.lang}</LeaderboardRow.Lang>
        <ChevronDown className="ml-auto size-3.5 shrink-0 text-gray-600 transition-transform group-data-[open]:rotate-180" />
      </Collapsible.Trigger>
      <Collapsible.Panel className="collapsible-panel">
        {codeBlock}
      </Collapsible.Panel>
    </Collapsible.Root>
  )
}

export function LeaderboardTableContent({
  entries,
  codeBlocks,
  totalSubmissions,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <div className="min-w-[420px] overflow-hidden border border-zinc-800">
          <LeaderboardTableHeader />
          {entries.map((entry, i) => (
            <CollapsibleRow
              key={entry.id}
              entry={entry}
              rank={i + 1}
              codeBlock={codeBlocks[i]}
            />
          ))}
        </div>
      </div>
      <p className="text-center font-sans text-[12px] text-gray-600">
        showing top 3 of {totalSubmissions.toLocaleString()} · view full
        leaderboard {'>>'}
      </p>
    </div>
  )
}
