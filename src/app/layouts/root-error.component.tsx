import type { ErrorComponentProps } from '@tanstack/react-router'

export function RootError({ error }: ErrorComponentProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-start gap-3 px-4 py-12 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-wide text-destructive">
        Something went wrong
      </p>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Unexpected application error
      </h1>
      <p className="text-sm text-muted-foreground">{error.message || 'Unknown error'}</p>
    </div>
  )
}
