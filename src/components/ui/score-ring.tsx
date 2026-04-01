import { cn } from '@lib/utils'
import * as React from 'react'

const SIZE = 180
const STROKE = 4
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function arcColor(score: number) {
  if (score <= 4) return { stroke: 'stroke-red-500', text: 'text-red-500' }
  if (score <= 6) return { stroke: 'stroke-amber-500', text: 'text-amber-500' }
  return { stroke: 'stroke-emerald-500', text: 'text-emerald-500' }
}

type ScoreRingProps = React.HTMLAttributes<HTMLDivElement> & {
  score: number
}

const ScoreRing = React.forwardRef<HTMLDivElement, ScoreRingProps>(
  ({ score, className, ...props }, ref) => {
    const clampedScore = Math.min(10, Math.max(0, score))
    const dashOffset = CIRCUMFERENCE * (1 - clampedScore / 10)
    const color = arcColor(clampedScore)

    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        style={{ width: SIZE, height: SIZE }}
        {...props}
      >
        <svg
          width={SIZE}
          height={SIZE}
          className="-rotate-90"
          aria-label={`score ${clampedScore}/10`}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            className="stroke-zinc-800"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className={cn(
              'transition-[stroke-dashoffset] duration-500',
              color.stroke,
            )}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-end gap-0.5 leading-none">
            <span
              className={cn(
                'font-black font-mono text-[56px] leading-none',
                color.text,
              )}
            >
              {clampedScore.toFixed(1)}
            </span>
            <span className="mb-1.5 font-mono text-gray-600 text-xl">/10</span>
          </div>
        </div>
      </div>
    )
  },
)
ScoreRing.displayName = 'ScoreRing'

export { ScoreRing }
