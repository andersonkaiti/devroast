'use client'

import { Button } from '@components/ui/button'
import { Toggle } from '@components/ui/toggle'
import { useState } from 'react'

const DOTS = [
  { key: 'close', className: 'bg-red-500' },
  { key: 'minimize', className: 'bg-amber-500' },
  { key: 'maximize', className: 'bg-emerald-500' },
]

export function CodeInput() {
  const [roastMode, setRoastMode] = useState(true)

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="overflow-hidden border border-zinc-800 bg-zinc-950">
        <div className="flex h-10 items-center border-zinc-800 border-b px-4">
          <div className="flex items-center gap-2">
            {DOTS.map((dot) => (
              <span
                key={dot.key}
                className={`block size-3 rounded-full ${dot.className}`}
              />
            ))}
          </div>
        </div>
        <div className="flex h-[240px] sm:h-[360px]">
          <div className="flex w-12 shrink-0 flex-col items-end border-zinc-800 border-r bg-neutral-950 px-3 py-4">
            {Array.from({ length: 20 }, (_, i) => String(i + 1)).map((n) => (
              <span key={n} className="text-[12px] text-gray-600 leading-5">
                {n}
              </span>
            ))}
          </div>
          <textarea
            className="flex-1 resize-none bg-transparent p-4 text-[13px] text-zinc-50 leading-5 placeholder:text-gray-600 focus:outline-none"
            placeholder={
              "// paste your code here\n// we'll roast it — no mercy"
            }
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Toggle
            checked={roastMode}
            onChange={setRoastMode}
            label="roast mode"
          />
          {roastMode && (
            <span className="font-sans text-[12px] text-gray-600">
              {'// maximum sarcasm enabled'}
            </span>
          )}
        </div>
        <Button variant="primary" className="w-full sm:w-auto">
          $ roast_my_code
        </Button>
      </div>
    </div>
  )
}
