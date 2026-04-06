'use client'
import type { ReactNode } from 'react'
import { useState } from 'react'

type Props = {
  codeBlocks: { id: string; node: ReactNode }[]
  totalSubmissions: number
}

function CodePreview({ codeBlock }: { codeBlock: ReactNode }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="relative">
      <div className={expanded ? undefined : 'max-h-[125px] overflow-hidden'}>
        {codeBlock}
      </div>
      {!expanded && (
        <div className="absolute inset-x-0 bottom-0 flex h-16 flex-col justify-end bg-gradient-to-t from-[#101010] to-transparent">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="w-full cursor-pointer py-2 font-mono text-[12px] text-zinc-500 transition-colors hover:text-zinc-300"
          >
            $ show_more {'>>'}
          </button>
        </div>
      )}
    </div>
  )
}

export function LeaderboardTableContent({
  codeBlocks,
  totalSubmissions,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <div className="min-w-[420px] overflow-hidden border border-zinc-800">
          {codeBlocks.map(({ id, node }) => (
            <div key={id} className="border-zinc-800 border-b last:border-b-0">
              <CodePreview codeBlock={node} />
            </div>
          ))}
        </div>
      </div>
      <p className="text-center font-sans text-[12px] text-gray-600">
        showing top {codeBlocks.length} of {totalSubmissions.toLocaleString()} ·
        view full leaderboard {'>>'}
      </p>
    </div>
  )
}
