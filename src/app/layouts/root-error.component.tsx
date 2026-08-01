import { Alert, AlertDescription, AlertTitle } from '@shared/ui'
import type { ErrorComponentProps } from '@tanstack/react-router'

export function RootError({ error }: ErrorComponentProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-3 px-4 py-12 sm:px-6">
      <Alert variant="destructive">
        <AlertTitle>Произошла ошибка</AlertTitle>
        <AlertDescription>{error.message || 'Неизвестная ошибка'}</AlertDescription>
      </Alert>
    </div>
  )
}
