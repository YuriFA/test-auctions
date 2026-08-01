import { cn } from '@shared/lib/cn'
import { Link } from '@tanstack/react-router'

import { ThemeToggle } from './theme-toggle.component'

const APP_NAME = 'ГрузоТорг'

export interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn('sticky top-0 z-40 border-b border-border bg-background', className)}>
      <div className="mx-auto flex h-14 w-full max-w-(--page-max-width) items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <img src="/favicon.svg" alt="" className="size-7" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">{APP_NAME}</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
