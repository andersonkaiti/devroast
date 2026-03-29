'use client'

import { Switch } from '@base-ui-components/react/switch'
import { cn } from '@lib/utils'
import * as React from 'react'

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
}

const Toggle = React.forwardRef<HTMLDivElement, ToggleProps>(
  ({ checked, onChange, label, className }, ref) => (
    <div ref={ref} className={cn('inline-flex items-center gap-3', className)}>
      <Switch.Root
        checked={checked}
        onCheckedChange={onChange}
        aria-label={label ?? 'toggle'}
        className={cn(
          'flex h-[22px] w-10 cursor-pointer rounded-full p-[3px] transition-colors duration-200',
          checked ? 'bg-emerald-500' : 'bg-zinc-800',
        )}
      >
        <Switch.Thumb
          className={cn(
            'block size-4 rounded-full transition-[transform,background-color] duration-200',
            checked
              ? 'translate-x-[18px] bg-zinc-950'
              : 'translate-x-0 bg-gray-500',
          )}
        />
      </Switch.Root>
      {label && (
        <span
          className={cn(
            'font-mono text-xs transition-colors duration-200',
            checked ? 'text-emerald-500' : 'text-gray-500',
          )}
        >
          {label}
        </span>
      )}
    </div>
  ),
)
Toggle.displayName = 'Toggle'

export { Toggle }
