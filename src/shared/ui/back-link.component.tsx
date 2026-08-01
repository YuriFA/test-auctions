import { cn } from '@shared/lib/cn'
import type { LinkProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from './button.component'

interface BackLinkProps extends Pick<LinkProps, 'to' | 'params' | 'search'> {
  children: ReactNode
  className?: string
}

export function BackLink({ to, params, search, children, className }: BackLinkProps) {
  return (
    <Button
      variant="link"
      size="sm"
      nativeButton={false}
      className={cn('w-fit px-0 text-muted-foreground', className)}
      render={<Link to={to} params={params} search={search} />}
    >
      <ArrowLeft className="size-4" aria-hidden />
      {children}
    </Button>
  )
}
