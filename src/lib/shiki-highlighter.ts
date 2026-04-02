import {
  type BundledLanguage,
  createHighlighter,
  type Highlighter,
} from 'shiki'

let highlighter: Highlighter | null = null

export async function getHighlighter() {
  if (highlighter) return highlighter

  highlighter = await createHighlighter({
    themes: ['vesper'],
    langs: [
      'js',
      'ts',
      'jsx',
      'tsx',
      'python',
      'py',
      'html',
      'css',
      'json',
      'yaml',
      'markdown',
      'bash',
      'sh',
      'ruby',
      'php',
      'java',
      'csharp',
      'cpp',
      'c',
      'rust',
      'go',
      'kotlin',
      'swift',
      'xml',
      'sql',
      'graphql',
      'vue',
      'diff',
    ] as BundledLanguage[],
  })

  return highlighter
}

export function getHighlighterSync() {
  return highlighter
}
