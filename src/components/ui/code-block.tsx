import { cn } from '@lib/utils'
import type * as React from 'react'
import { type BundledLanguage, codeToTokens } from 'shiki'

type CodeBlockRootProps = {
  code: string
  lang: BundledLanguage
  className?: string
  children?: React.ReactNode
}

async function CodeBlockRoot({
  code,
  lang,
  className,
  children,
}: CodeBlockRootProps) {
  const { tokens, bg } = await codeToTokens(code, {
    lang,
    theme: 'vesper',
  })

  return (
    <div
      className={cn(
        'overflow-hidden border border-zinc-800 font-mono text-[13px] leading-6',
        className,
      )}
      style={{ background: bg }}
    >
      {children}
      <div className="flex overflow-x-auto">
        <div className="select-none border-zinc-800 border-r bg-zinc-950 px-3 py-3 text-right text-gray-600">
          {tokens.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <code className="px-4 py-3">
          {tokens.map((line, i) => (
            <div key={i}>
              {line.length === 0
                ? '\u00a0'
                : line.map((token, j) => (
                    <span key={j} style={{ color: token.color }}>
                      {token.content}
                    </span>
                  ))}
            </div>
          ))}
        </code>
      </div>
    </div>
  )
}

function Filename({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex h-10 items-center gap-3 border-zinc-800 border-b px-4',
        className,
      )}
    >
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-red-500" />
        <span className="size-2.5 rounded-full bg-amber-500" />
        <span className="size-2.5 rounded-full bg-emerald-500" />
      </span>
      <span className="text-gray-600 text-xs">{children}</span>
    </div>
  )
}

const CodeBlock = Object.assign(CodeBlockRoot, { Filename })

export { CodeBlock }
