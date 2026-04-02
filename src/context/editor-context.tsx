'use client'

import { createContext, type ReactNode, useContext } from 'react'
import type { BundledLanguage } from 'shiki'

interface EditorContextType {
  code: string
  language: BundledLanguage
  detectedLanguage: BundledLanguage
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({
  children,
  value,
}: {
  children: ReactNode
  value: EditorContextType
}) {
  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  )
}

export function useEditorContext() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditorContext must be used within EditorProvider')
  }
  return context
}
