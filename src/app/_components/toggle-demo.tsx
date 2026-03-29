'use client'

import { Toggle } from '@components/ui'
import { useState } from 'react'

export function ToggleDemo() {
  const [a, setA] = useState(true)
  const [b, setB] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-8">
      <Toggle checked={a} onChange={setA} label="roast mode" />
      <Toggle checked={b} onChange={setB} label="roast mode" />
      <Toggle checked={a} onChange={setA} />
    </div>
  )
}
