'use client'

import { Button } from '@components/ui'

interface ErrorViewProps {
  message: string
}

export function ErrorView({ message }: ErrorViewProps) {
  return (
    <main className="mx-auto flex w-full max-w-[960px] flex-col items-start gap-6 px-4 pt-12 pb-10 sm:px-10 sm:pt-20 sm:pb-16">
      <p className="font-mono text-red-500 text-sm">
        {'// error: '}
        {message}
      </p>
      <Button variant="outline" size="sm" onClick={() => window.history.back()}>
        $ go_back
      </Button>
    </main>
  )
}
