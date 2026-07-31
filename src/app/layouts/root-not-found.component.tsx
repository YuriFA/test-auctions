import { Link } from '@tanstack/react-router'

export function RootNotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-start gap-3 px-4 py-12 sm:px-6">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">404</p>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/auctions"
        search={{}}
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Go to auctions →
      </Link>
    </div>
  )
}
