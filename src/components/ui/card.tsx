import { cn } from '@lib/utils'
import * as React from 'react'

const Root = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-3 border border-zinc-800 p-5', className)}
    {...props}
  />
))
Root.displayName = 'AnalysisCard.Root'

const Title = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('font-mono text-[13px] text-zinc-50', className)}
    {...props}
  />
))
Title.displayName = 'AnalysisCard.Title'

const Description = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('font-sans text-gray-500 text-xs leading-relaxed', className)}
    {...props}
  />
))
Description.displayName = 'AnalysisCard.Description'

const AnalysisCard = Object.assign(Root, { Title, Description })

export { AnalysisCard }
