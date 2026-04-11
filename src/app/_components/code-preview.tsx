'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'

export function CodePreview({ codeBlock }: { codeBlock: ReactNode }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="relative">
      <div className={expanded ? undefined : 'max-h-[125px] overflow-hidden'}>
        {codeBlock}
      </div>
      {expanded ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setExpanded(false)
          }}
          className="w-full cursor-pointer py-2 font-mono text-[12px] text-zinc-500 transition-colors hover:text-zinc-300"
        >
          $ show_less {'<<'}
        </button>
      ) : (
        <div className="absolute inset-x-0 bottom-0 flex h-16 flex-col justify-end bg-linear-to-t from-[#101010] to-transparent">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setExpanded(true)
            }}
            className="w-full cursor-pointer py-2 font-mono text-[12px] text-zinc-500 transition-colors hover:text-zinc-300"
          >
            $ show_more {'>>'}
          </button>
        </div>
      )}
    </div>
  )
}
