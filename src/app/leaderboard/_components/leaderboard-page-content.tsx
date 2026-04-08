'use client'

import Link from 'next/link'
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
        <Link
          key={id}
          href={`/roast/${id}`}
          className="block overflow-hidden overflow-x-auto border border-zinc-800 transition-colors hover:border-zinc-600"
        >
          <CodePreview codeBlock={node} />
        </Link>
      ))}
    </div>
  )
}
