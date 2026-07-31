import { cn } from '@shared/lib/cn'
import type * as React from 'react'

export function PageContainer({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-container"
      className={cn(
        'mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12',
        className,
      )}
      {...props}
    />
  )
}
