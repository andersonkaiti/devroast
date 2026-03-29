import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const badge = tv({
  base: 'inline-flex items-center gap-2 font-mono text-xs',
  variants: {
    severity: {
      critical: 'text-red-500',
      warning: 'text-amber-500',
      good: 'text-emerald-500',
    },
  },
  defaultVariants: {
    severity: 'good',
  },
})

const dot = tv({
  base: 'size-2 shrink-0 rounded-full',
  variants: {
    severity: {
      critical: 'bg-red-500',
      warning: 'bg-amber-500',
      good: 'bg-emerald-500',
    },
  },
  defaultVariants: {
    severity: 'good',
  },
})

export type BadgeSeverity = NonNullable<VariantProps<typeof badge>['severity']>

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badge> & {
    label: string
  }

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ severity, label, className, ...props }, ref) => (
    <span ref={ref} className={badge({ severity, className })} {...props}>
      <span className={dot({ severity })} />
      {label}
    </span>
  ),
)
Badge.displayName = 'Badge'

export { Badge }
