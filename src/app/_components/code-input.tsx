'use client'

import { Button } from '@components/ui/button'
import { HighlightedCodeDisplay } from '@components/ui/highlighted-code-display'
import { LanguageSelector } from '@components/ui/language-selector'
import { Toggle } from '@components/ui/toggle'
import { EditorProvider } from '@context/editor-context'
import { useEditorHighlighter } from '@hooks/useEditorHighlighter'
import { useCallback, useRef, useState } from 'react'

const DOTS = [
  { key: 'close', className: 'bg-red-500' },
  { key: 'minimize', className: 'bg-amber-500' },
  { key: 'maximize', className: 'bg-emerald-500' },
]

const CHAR_LIMIT = 2000

interface CodeInputV2Props {
  onRoast?: (code: string, language: string) => void
}

export function CodeInput({ onRoast }: CodeInputV2Props) {
  const [roastMode, setRoastMode] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  const {
    code,
    language,
    detectedLanguage,
    tokens,
    backgroundColor,
    setCode,
    setLanguage,
  } = useEditorHighlighter()

  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCode(event.currentTarget.value)
    },
    [setCode],
  )

  const handleScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  const handleRoast = useCallback(() => {
    if (onRoast) {
      onRoast(code, language)
    }
  }, [code, language, onRoast])

  const charCount = code.length
  const isOverLimit = charCount > CHAR_LIMIT

  // Calculate number of lines for the line numbers column
  const lineCount = code.split('\n').length || 1

  return (
    <EditorProvider
      value={{
        code,
        language,
        detectedLanguage,
      }}
    >
      <div className="flex w-full flex-col gap-4">
        <div className="border border-zinc-800 bg-zinc-950">
          <div className="flex h-10 items-center justify-between border-zinc-800 border-b px-4">
            <div className="flex items-center gap-2">
              {DOTS.map((dot) => (
                <span
                  key={dot.key}
                  className={`block size-3 rounded-full ${dot.className}`}
                />
              ))}
            </div>
            <div className="relative z-20">
              <LanguageSelector
                value={
                  (language as string) === 'js' ? detectedLanguage : language
                }
                onChange={setLanguage}
              />
            </div>
          </div>

          <div className="relative flex h-[240px] overflow-y-auto sm:h-[360px]">
            {/* Line numbers */}
            <div
              ref={lineNumbersRef}
              className="flex w-12 shrink-0 flex-col items-end overflow-hidden border-zinc-800 border-r bg-neutral-950 px-3 py-4"
            >
              {Array.from({ length: Math.max(lineCount, 20) }, (_, i) =>
                String(i + 1),
              ).map((n) => (
                <span key={n} className="text-[12px] text-gray-600 leading-5">
                  {n}
                </span>
              ))}
            </div>

            {/* Editor with overlay pattern */}
            <div className="relative flex-1 overflow-y-auto">
              {/* Textarea (transparent, on top for input) */}
              <textarea
                ref={textareaRef}
                className="relative z-10 block h-full w-full resize-none bg-transparent p-4 text-transparent caret-zinc-50 placeholder:text-gray-600 focus:outline-none"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '13px',
                  lineHeight: '1.25rem',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                }}
                placeholder={
                  "// paste your code here\n// we'll roast it — no mercy"
                }
                spellCheck={false}
                value={code}
                onChange={handleInput}
                onScroll={handleScroll}
              />

              {/* Highlight display (behind textarea) */}
              <div
                ref={overlayRef}
                className="pointer-events-none absolute inset-0 overflow-y-auto"
              >
                <HighlightedCodeDisplay
                  tokens={tokens}
                  backgroundColor={backgroundColor}
                />
              </div>
            </div>
            <span
              className={`pointer-events-none absolute right-2 bottom-2 z-20 font-mono text-[11px] tabular-nums ${
                isOverLimit ? 'text-red-500' : 'text-gray-600'
              }`}
            >
              {charCount}/{CHAR_LIMIT}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
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
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={handleRoast}
            disabled={isOverLimit}
          >
            $ roast_my_code
          </Button>
        </div>
      </div>
    </EditorProvider>
  )
}
