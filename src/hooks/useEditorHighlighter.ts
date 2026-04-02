'use client'

import { mapLanguage } from '@lib/language-utils'
import { getHighlighter } from '@lib/shiki-highlighter'
import hljs from 'highlight.js'
import { useCallback, useEffect, useReducer, useRef } from 'react'
import type { BundledLanguage, TokensResult } from 'shiki'

interface EditorState {
  code: string
  language: BundledLanguage
  detectedLanguage: BundledLanguage
  isHighlighting: boolean
  tokens: TokensResult['tokens'] | null
  backgroundColor: string
  error: string | null
}

type EditorAction =
  | { type: 'SET_CODE'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: BundledLanguage }
  | { type: 'SET_DETECTED'; payload: BundledLanguage }
  | { type: 'SET_TOKENS'; payload: TokensResult }
  | { type: 'SET_HIGHLIGHTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_CODE':
      return { ...state, code: action.payload }
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload }
    case 'SET_DETECTED':
      return { ...state, detectedLanguage: action.payload }
    case 'SET_TOKENS':
      return {
        ...state,
        tokens: action.payload.tokens,
        backgroundColor: action.payload.bg || '#000000',
      }
    case 'SET_HIGHLIGHTING':
      return { ...state, isHighlighting: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

const initialState: EditorState = {
  code: '',
  language: 'js' as BundledLanguage,
  detectedLanguage: 'js' as BundledLanguage,
  isHighlighting: false,
  tokens: null,
  backgroundColor: '#000000',
  error: null,
}

export function useEditorHighlighter() {
  const [state, dispatch] = useReducer(editorReducer, initialState)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Shiki on mount
  useEffect(() => {
    getHighlighter().catch((err) => {
      dispatch({
        type: 'SET_ERROR',
        payload: `Failed to initialize highlighter: ${err.message}`,
      })
    })
  }, [])

  const highlightCode = useCallback(
    async (code: string, lang: BundledLanguage) => {
      try {
        dispatch({ type: 'SET_HIGHLIGHTING', payload: true })
        dispatch({ type: 'SET_ERROR', payload: null })

        const highlighter = await getHighlighter()
        const result = await highlighter.codeToTokens(code, {
          lang,
          theme: 'vesper',
        })

        dispatch({ type: 'SET_TOKENS', payload: result })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        dispatch({ type: 'SET_ERROR', payload: errorMsg })
        // Fallback: set empty tokens
        dispatch({
          type: 'SET_TOKENS',
          payload: {
            tokens: [],
            bg: '#000000',
          },
        })
      } finally {
        dispatch({ type: 'SET_HIGHLIGHTING', payload: false })
      }
    },
    [],
  )

  const detectLanguage = useCallback((code: string): BundledLanguage => {
    try {
      // List of common languages to improve detection accuracy
      const commonLangs = [
        'javascript',
        'typescript',
        'python',
        'java',
        'csharp',
        'cpp',
        'c',
        'php',
        'ruby',
        'go',
        'rust',
        'kotlin',
        'swift',
        'html',
        'css',
        'json',
        'yaml',
        'sql',
        'bash',
        'dockerfile',
        'markdown',
      ]

      const results = commonLangs
        .map((lang) => {
          try {
            return hljs.highlight(code, {
              language: lang,
              ignoreIllegals: true,
            })
          } catch (_err) {
            return { relevance: 0, language: lang }
          }
        })
        .filter((r) => r.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance)

      const best = results[0]
      const detected = best ? mapLanguage(best.language) : 'js'

      dispatch({ type: 'SET_DETECTED', payload: detected })
      return detected
    } catch (_err) {
      dispatch({ type: 'SET_DETECTED', payload: 'js' })
      return 'js'
    }
  }, [])

  const setCode = useCallback(
    (newCode: string) => {
      dispatch({ type: 'SET_CODE', payload: newCode })

      // Clear previous debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Debounce highlighting (300ms)
      debounceTimerRef.current = setTimeout(() => {
        // Detect language first
        const detected = detectLanguage(newCode)

        // Use user-selected language if set, otherwise use detected
        const langToUse = state.language !== 'js' ? state.language : detected

        // Highlight with the determined language
        highlightCode(newCode, langToUse)
      }, 100)
    },
    [detectLanguage, highlightCode, state.language],
  )

  const setLanguage = useCallback(
    (lang: BundledLanguage) => {
      dispatch({ type: 'SET_LANGUAGE', payload: lang })

      // Re-highlight with new language
      highlightCode(state.code, lang)
    },
    [highlightCode, state.code],
  )

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    ...state,
    setCode,
    setLanguage,
  }
}
