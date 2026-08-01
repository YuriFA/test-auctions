import { Alert, AlertDescription, AlertTitle } from './alert.component'
import { Button } from './button.component'

interface ErrorAlertProps {
  title: string
  description: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorAlert({
  title,
  description,
  onRetry,
  retryLabel = 'Повторить',
}: ErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </Alert>
  )
}
