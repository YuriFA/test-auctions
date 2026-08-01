import { cn } from '@shared/lib/cn'
import type * as React from 'react'

export function PageContainer({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-container"
      className={cn(
        'mx-auto flex w-full max-w-(--page-max-width) flex-col gap-8 p-4 sm:p-6',
        className,
      )}
      {...props}
    />
  )
}
