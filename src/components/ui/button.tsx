import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const button = tv({
  base: [
    'inline-flex items-center justify-center gap-2',
    'font-mono text-[13px] font-medium',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer',
  ],
  variants: {
    variant: {
      primary:
        'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 focus-visible:ring-emerald-500',
      secondary:
        'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 focus-visible:ring-zinc-500',
      outline:
        'border border-zinc-700 text-zinc-100 hover:bg-zinc-800 focus-visible:ring-zinc-500',
      ghost:
        'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:ring-zinc-500',
      destructive:
        'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500',
    },
    size: {
      sm: 'h-8 px-3 text-xs',
      md: 'px-6 py-2.5',
      lg: 'px-8 py-3 text-sm',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, ...props }, ref) => (
    <button
      ref={ref}
      className={button({ variant, size, className })}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export { Button }
