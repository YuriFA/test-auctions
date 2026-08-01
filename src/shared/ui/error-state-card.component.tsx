import { cn } from '@shared/lib/cn'
import type { ReactNode } from 'react'

import { Alert, AlertDescription, AlertTitle } from './alert.component'
import { Button } from './button.component'
import { PageContainer } from './page-container.component'

interface ErrorStateCardProps {
  title: string
  message: string
  onRetry?: () => void
  backLink?: ReactNode
  alertTitle?: string
  className?: string
}

export function ErrorStateCard({
  title,
  message,
  onRetry,
  backLink,
  alertTitle = 'Не удалось загрузить',
  className,
}: ErrorStateCardProps) {
  return (
    <PageContainer className={cn('flex max-w-2xl flex-col gap-4', className)}>
      {backLink}
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      <Alert variant="destructive">
        <AlertTitle>{alertTitle}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Повторить
          </Button>
        )}
      </Alert>
    </PageContainer>
  )
}
