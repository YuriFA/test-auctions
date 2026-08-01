import { cn } from '@shared/lib/cn'
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'
import * as React from 'react'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="Навигация по страницам"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex items-center gap-0.5', className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  render?: React.ReactElement
  size?: 'default' | 'icon'
} & Omit<React.ComponentProps<'a'>, 'ref'>

function PaginationLink({
  className,
  isActive,
  size = 'icon',
  render,
  'aria-label': ariaLabel,
  'aria-current': ariaCurrentProp,
  children,
  ...rest
}: PaginationLinkProps) {
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-xs/relaxed font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    isActive
      ? 'border-border hover:bg-input/50 hover:text-foreground'
      : 'hover:bg-muted hover:text-foreground',
    size === 'default' ? 'h-7 gap-1 px-2' : "size-7 [&_svg:not([class*='size-'])]:size-3.5",
    className,
  )

  const anchorProps = {
    className: classes,
    'aria-label': ariaLabel,
    'aria-current': ariaCurrentProp ?? (isActive ? 'page' : undefined),
    'data-slot': 'pagination-link',
    'data-active': isActive ? '' : undefined,
    ...rest,
  }

  if (render) {
    return React.cloneElement(render, anchorProps, children)
  }

  return <a {...anchorProps}>{children}</a>
}

function PaginationPrevious({
  className,
  text = 'Назад',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Предыдущая страница"
      size="default"
      className={cn('pl-2!', className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = 'Вперёд',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Следующая страница"
      size="default"
      className={cn('pr-2!', className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-7 items-center justify-center [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">Ещё страницы</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
