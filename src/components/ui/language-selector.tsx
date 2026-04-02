'use client'

import { Select } from '@base-ui-components/react/select'
import { getLanguageList } from '@lib/language-utils'
import { useEffect, useState } from 'react'
import type { BundledLanguage } from 'shiki'

interface LanguageSelectorProps {
  value: BundledLanguage
  onChange: (lang: BundledLanguage) => void
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const [languages, setLanguages] = useState<
    Array<{ id: BundledLanguage; name: string }>
  >([])

  useEffect(() => {
    setLanguages(getLanguageList())
  }, [])

  return (
    <Select.Root
      value={value}
      onValueChange={(v) => onChange(v as BundledLanguage)}
    >
      <Select.Trigger className="flex h-9 min-w-max items-center gap-2 rounded px-3 py-1.5 text-sm text-zinc-50 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500">
        <Select.Value />
        <span className="text-gray-500 text-xs">▼</span>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-50">
          <Select.Popup className="overflow-hidden rounded border border-zinc-700 bg-zinc-900 shadow-lg">
            <Select.Group>
              {languages.map((lang) => (
                <Select.Item
                  key={lang.id}
                  value={lang.id}
                  className="cursor-pointer px-3 py-2 text-sm text-zinc-50 hover:bg-zinc-800 data-highlighted:bg-zinc-800"
                >
                  <Select.ItemText>{lang.name}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
