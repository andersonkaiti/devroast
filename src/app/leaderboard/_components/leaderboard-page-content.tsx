'use client'

import type { ReactNode } from 'react'
import { CodePreview } from '@/app/_components/code-preview'

export function LeaderboardPageContent({
  codeBlocks,
}: {
  codeBlocks: { id: string; node: ReactNode }[]
}) {
  return (
    <div className="flex flex-col gap-5">
      {codeBlocks.map(({ id, node }) => (
        <div
          key={id}
          className="overflow-hidden overflow-x-auto border border-zinc-800"
        >
          <CodePreview codeBlock={node} />
        </div>
      ))}
    </div>
  )
}
