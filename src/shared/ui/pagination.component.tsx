import { cn } from '@shared/lib/cn'
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from './button.component'

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
  // NOTE: `render` lets callers swap the underlying `<a>` for a router-aware
  // element (e.g. TanStack Router `<Link>`) so the href is real, cmd+click
  // works, and no-JS fallback navigates. Defaults to a plain `<a>`. `ref` is
  // omitted from anchor props to avoid clashing with Button's button-typed ref.
  render?: React.ReactElement
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  Omit<React.ComponentProps<'a'>, 'ref'>

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
  // NOTE: aria-* and data-slot land on Button itself; base-ui's render prop
  // merges them onto whatever element is rendered (default `<a>` or a
  // caller-provided `<Link>`), so they survive in both cases. The remaining
  // anchor props (href, onClick, etc.) only apply to the default `<a>`.
  // `children` must be passed explicitly — otherwise they end up in `...rest`
  // and are dropped when `render` is provided.
  return (
    <Button
      variant={isActive ? 'outline' : 'ghost'}
      size={size}
      className={cn(className)}
      nativeButton={false}
      aria-label={ariaLabel}
      aria-current={ariaCurrentProp ?? (isActive ? 'page' : undefined)}
      data-slot="pagination-link"
      data-active={isActive}
      render={render ?? <a {...rest} />}
    >
      {children}
    </Button>
  )
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
