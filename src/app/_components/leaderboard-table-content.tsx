'use client'

import type { ReactNode } from 'react'
import { CodePreview } from './code-preview'

type Props = {
  codeBlocks: { id: string; node: ReactNode }[]
  totalSubmissions: number
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
