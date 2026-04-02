'use client'

import { Select } from '@base-ui-components/react/select'
import { getLanguageList } from '@lib/language-utils'
import { ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { BundledLanguage } from 'shiki'

interface LanguageSelectorProps {
  value: BundledLanguage
  onChange: (lang: BundledLanguage) => void
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const [languages, setLanguages] = useState<
    Array<{ id: BundledLanguage; name: string }>
  >([])
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLanguages(getLanguageList())
  }, [])

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return languages
    const query = searchQuery.toLowerCase()
    return languages.filter(
      (lang) =>
        lang.name.toLowerCase().includes(query) ||
        lang.id.toLowerCase().includes(query),
    )
  }, [languages, searchQuery])

  return (
    <Select.Root
      value={value}
      onValueChange={(value) => {
        onChange(value as BundledLanguage)
        setSearchQuery('')
      }}
    >
      <Select.Trigger className="flex items-center gap-2 text-zinc-50 transition-opacity hover:opacity-70">
        <Select.Value className="font-medium text-sm" />
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-50">
          <Select.Popup className="overflow-hidden rounded-lg border border-zinc-800 bg-neutral-950 shadow-2xl">
            <div className="border-zinc-800 border-b px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  inputRef.current?.focus()
                }}
                className="w-full rounded bg-zinc-900 px-2 py-1.5 text-sm text-zinc-50 placeholder-zinc-600 outline-none transition-colors focus:bg-zinc-800 focus:ring-1 focus:ring-emerald-500/30"
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              />
            </div>
            <Select.Group className="max-h-64 overflow-y-auto">
              {filtered.length > 0 ? (
                filtered.map((lang) => (
                  <Select.Item
                    key={lang.id}
                    value={lang.id}
                    className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-zinc-50 transition-colors hover:bg-zinc-800 data-highlighted:bg-emerald-600/20 data-highlighted:text-emerald-200"
                  >
                    <Select.ItemText className="flex-1 font-medium">
                      {lang.name}
                    </Select.ItemText>
                    <span className="text-gray-600 text-xs">{lang.id}</span>
                  </Select.Item>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-sm text-zinc-600">
                  Nenhuma linguagem encontrada
                </div>
              )}
            </Select.Group>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
