'use client'

import { Badge, Button, ScoreRing } from '@components/ui'
import { useState } from 'react'
import { getVerdict } from '../get-verdict'
import type { RoastResult } from '../use-roast'

const COPY_FEEDBACK_DURATION_MS = 2000

interface ScoreHeroProps {
  result: RoastResult
  lang: string
  lineCount: number
}

export function ScoreHero({ result, lang, lineCount }: ScoreHeroProps) {
  const verdict = getVerdict(result.score)
  const [copied, setCopied] = useState(false)

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS)
  }

  return (
    <section className="flex flex-col items-start gap-10 sm:flex-row sm:items-center">
      <ScoreRing score={result.score} />
      <div className="flex flex-col gap-4">
        <Badge severity={verdict.severity}>{verdict.label}</Badge>
        <p className="font-sans text-xl text-zinc-50 leading-relaxed">
          {result.quote}
        </p>
        <p className="font-mono text-xs text-zinc-500">
          lang: {lang} · {lineCount} lines
        </p>
        <div>
          <Button variant="outline" size="sm" onClick={handleShare}>
            {copied ? '$ link_copied!' : '$ share_roast'}
          </Button>
        </div>
      </div>
    </section>
  )
}
