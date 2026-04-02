'use client'

import { cn } from '@lib/utils'
import type { TokensResult } from 'shiki'

interface HighlightedCodeDisplayProps {
  tokens: TokensResult['tokens'] | null
  backgroundColor: string
  className?: string
}

export function HighlightedCodeDisplay({
  tokens,
  backgroundColor,
  className,
}: HighlightedCodeDisplayProps) {
  if (!tokens || tokens.length === 0) {
    return (
      <pre
        className={cn('overflow-hidden text-[13px] leading-5', className)}
        style={{
          background: backgroundColor,
          fontFamily: 'JetBrains Mono, monospace',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        <code className="block px-4 py-4">
          <span className="text-gray-600">{/* placeholder */}</span>
        </code>
      </pre>
    )
  }

  return (
    <pre
      className={cn('overflow-hidden text-[13px] leading-5', className)}
      style={{
        background: backgroundColor,
        fontFamily: 'JetBrains Mono, monospace',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
      }}
    >
      <code className="block px-4 py-4">
        {tokens.map((line, i) => {
          const lineContent = line.map((t) => t.content).join('')
          const lineKey = `${i}--${lineContent}`
          return (
            <div key={lineKey}>
              {line.length === 0
                ? '\u00a0'
                : line.map((token, j) => {
                    const tokenKey = `${i}-${j}-${token.content}`
                    return (
                      <span key={tokenKey} style={{ color: token.color }}>
                        {token.content}
                      </span>
                    )
                  })}
            </div>
          )
        })}
      </code>
    </pre>
  )
}
