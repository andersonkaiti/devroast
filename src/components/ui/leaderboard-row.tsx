import { cn } from '@lib/utils'
import * as React from 'react'

function scoreColor(score: number) {
  if (score <= 4) return 'text-red-500'
  if (score <= 6) return 'text-amber-500'
  return 'text-emerald-500'
}

const Root = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center gap-6 border-zinc-800 border-b px-5 py-4 font-mono',
      className,
    )}
    {...props}
  />
))
Root.displayName = 'LeaderboardRow.Root'

const Rank = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('w-10 shrink-0 text-[13px] text-gray-600', className)}
    {...props}
  >
    #{children}
  </span>
))
Rank.displayName = 'LeaderboardRow.Rank'

type ScoreProps = React.HTMLAttributes<HTMLSpanElement> & { score: number }

const Score = React.forwardRef<HTMLSpanElement, ScoreProps>(
  ({ score, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'w-[60px] shrink-0 font-bold text-[13px]',
        scoreColor(score),
        className,
      )}
      {...props}
    >
      {score.toFixed(1)}
    </span>
  ),
)
Score.displayName = 'LeaderboardRow.Score'

const Code = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('min-w-0 flex-1 truncate text-gray-500 text-xs', className)}
    {...props}
  />
))
Code.displayName = 'LeaderboardRow.Code'

const Lang = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('w-[100px] shrink-0 text-gray-600 text-xs', className)}
    {...props}
  />
))
Lang.displayName = 'LeaderboardRow.Lang'

const LeaderboardRow = Object.assign(Root, { Rank, Score, Code, Lang })

export { LeaderboardRow }
