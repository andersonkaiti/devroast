'use client'

import { DiffLine } from '@components/ui'
import { SectionTitle } from '../section-title'

export type DiffVariant = 'context' | 'removed' | 'added'

export interface DiffLineItem {
  variant: DiffVariant
  content: string
}

interface DiffSectionProps {
  diffLines: DiffLineItem[]
}

export function DiffSection({ diffLines }: DiffSectionProps) {
  const lines = diffLines.map((line, i) => ({
    ...line,
    key: `${line.variant}:${line.content}:${i}`,
  }))

  return (
    <section className="flex flex-col gap-6">
      <SectionTitle>suggested_fix</SectionTitle>
      <div className="border border-zinc-800">
        <div className="flex h-10 items-center border-zinc-800 border-b px-4">
          <span className="font-mono text-xs text-zinc-500">
            your_code.ts → improved_code.ts
          </span>
        </div>
        <div className="py-1">
          {lines.map((line) => (
            <DiffLine key={line.key} variant={line.variant}>
              {line.content}
            </DiffLine>
          ))}
        </div>
      </div>
    </section>
  )
}
