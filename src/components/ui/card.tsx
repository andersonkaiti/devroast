import { cn } from '@lib/utils'
import * as React from 'react'
import type { BadgeSeverity } from './badge'
import { Badge } from './badge'

type AnalysisCardProps = React.HTMLAttributes<HTMLDivElement> & {
  severity: BadgeSeverity
  title: string
  description: string
}

const AnalysisCard = React.forwardRef<HTMLDivElement, AnalysisCardProps>(
  ({ severity, title, description, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-3 border border-zinc-800 p-5',
        className,
      )}
      {...props}
    >
      <Badge severity={severity} label={severity} />
      <p className="font-mono text-[13px] text-zinc-50">{title}</p>
      <p className="font-sans text-gray-500 text-xs leading-relaxed">
        {description}
      </p>
    </div>
  ),
)
AnalysisCard.displayName = 'AnalysisCard'

export { AnalysisCard }
