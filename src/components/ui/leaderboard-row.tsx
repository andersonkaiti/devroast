import { cn } from '@lib/utils'
import * as React from 'react'

function scoreColor(score: number) {
  if (score <= 4) return 'text-red-500'
  if (score <= 6) return 'text-amber-500'
  return 'text-emerald-500'
}

type LeaderboardRowProps = React.HTMLAttributes<HTMLDivElement> & {
  rank: number
  score: number
  codePreview: string
  lang: string
}

const LeaderboardRow = React.forwardRef<HTMLDivElement, LeaderboardRowProps>(
  ({ rank, score, codePreview, lang, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-6 border-zinc-800 border-b px-5 py-4 font-mono',
        className,
      )}
      {...props}
    >
      <span className="w-10 shrink-0 text-[13px] text-gray-600">#{rank}</span>
      <span
        className={cn(
          'w-[60px] shrink-0 font-bold text-[13px]',
          scoreColor(score),
        )}
      >
        {score.toFixed(1)}
      </span>
      <span className="min-w-0 flex-1 truncate text-gray-500 text-xs">
        {codePreview}
      </span>
      <span className="w-[100px] shrink-0 text-gray-600 text-xs">{lang}</span>
    </div>
  ),
)
LeaderboardRow.displayName = 'LeaderboardRow'

export { LeaderboardRow }
