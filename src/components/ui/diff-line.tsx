import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const line = tv({
  base: 'flex w-full gap-2 px-4 py-2 font-mono text-[13px]',
  variants: {
    variant: {
      removed: 'bg-red-500/10',
      added: 'bg-emerald-500/10',
      context: 'bg-transparent',
    },
  },
  defaultVariants: {
    variant: 'context',
  },
})

const prefix = tv({
  base: 'select-none',
  variants: {
    variant: {
      removed: 'text-red-500',
      added: 'text-emerald-500',
      context: 'text-gray-600',
    },
  },
  defaultVariants: {
    variant: 'context',
  },
})

const code = tv({
  base: '',
  variants: {
    variant: {
      removed: 'text-gray-500',
      added: 'text-zinc-50',
      context: 'text-gray-500',
    },
  },
  defaultVariants: {
    variant: 'context',
  },
})

const PREFIXES = { removed: '-', added: '+', context: ' ' } as const

type DiffLineProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof line> & {
    children: string
  }

const DiffLine = React.forwardRef<HTMLDivElement, DiffLineProps>(
  ({ variant = 'context', children, className, ...props }, ref) => (
    <div ref={ref} className={line({ variant, className })} {...props}>
      <span className={prefix({ variant })}>
        {PREFIXES[variant ?? 'context']}
      </span>
      <span className={code({ variant })}>{children}</span>
    </div>
  ),
)
DiffLine.displayName = 'DiffLine'

export { DiffLine }
