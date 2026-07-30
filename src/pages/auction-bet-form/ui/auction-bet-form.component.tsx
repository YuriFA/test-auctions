import { Link, useParams } from '@tanstack/react-router'

export function AuctionBetFormComponent() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bet' })

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-2">
        <Link
          to="/auctions/$auctionUuid"
          params={{ auctionUuid }}
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          ← Back to auction
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Place or update a bet</h1>
        <p className="text-sm text-muted-foreground">
          Auction UUID: <code className="font-mono">{auctionUuid}</code>
        </p>
        <p className="max-w-prose text-sm text-muted-foreground sm:text-base">
          Placeholder page for the bet form. The can_set_bet restriction, validation schema, and
          mutation wiring arrive in later SDD tasks.
        </p>
      </header>
    </div>
  )
}
