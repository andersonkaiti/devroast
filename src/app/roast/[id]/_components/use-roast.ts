'use client'

import { useEffect, useState } from 'react'
import type { Finding } from './analysis-section'
import type { DiffLineItem } from './diff-section'

export interface RoastResult {
  score: number
  quote: string
  findings: Finding[]
  diffLines: DiffLineItem[]
}

export function useRoast(id: string) {
  const [result, setResult] = useState<RoastResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch(`/api/roast/${id}/stream`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
        const data = (await res.json()) as RoastResult
        setResult(data)
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unknown error')
      })

    return () => controller.abort()
  }, [id])

  return { result, error }
}
