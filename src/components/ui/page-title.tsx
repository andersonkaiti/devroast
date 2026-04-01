import { cn } from '@lib/utils'
import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const pageTitle = tv({
  slots: {
    root: 'flex items-center font-mono font-bold',
    prefix: 'text-emerald-500',
    title: 'text-zinc-50',
  },
  variants: {
    size: {
      md: {
        root: 'gap-2',
        prefix: 'text-2xl',
        title: 'text-2xl',
      },
      lg: {
        root: 'gap-3',
        prefix: 'text-[32px]',
        title: 'text-[28px]',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

type PageTitleProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof pageTitle> & {
    prefix: string
  }

const PageTitle = React.forwardRef<HTMLDivElement, PageTitleProps>(
  ({ prefix, size, className, children, ...props }, ref) => {
    const { root, prefix: prefixCls, title } = pageTitle({ size })
    return (
      <div ref={ref} className={cn(root(), className)} {...props}>
        <span className={prefixCls()}>{prefix}</span>
        <span className={title()}>{children}</span>
      </div>
    )
  },
)
PageTitle.displayName = 'PageTitle'

export { PageTitle }
