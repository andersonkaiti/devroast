'use client'

import { useCallback, useRef } from 'react'

export function useScrollSync() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  return { textareaRef, overlayRef, lineNumbersRef, handleScroll }
}
