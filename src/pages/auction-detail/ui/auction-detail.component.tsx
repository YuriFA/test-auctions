import { Link, useParams } from '@tanstack/react-router'

export function AuctionDetail() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid' })

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-2">
        <Link
          to="/auctions"
          search={{}}
          className="text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground"
        >
          ← Back to auctions
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Auction detail</h1>
        <p className="text-sm text-muted-foreground">
          Auction UUID: <code className="font-mono">{auctionUuid}</code>
        </p>
        <p className="max-w-prose text-sm text-muted-foreground sm:text-base">
          Placeholder page for the auction detail. ViewModel mapping and DTO-driven restrictions
          arrive in later SDD tasks.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
        <h2 className="mb-3 text-base font-semibold">Related routes</h2>
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              to="/auctions/$auctionUuid/bets"
              params={{ auctionUuid }}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              View bets history
            </Link>
          </li>
          <li>
            <Link
              to="/auctions/$auctionUuid/bet"
              params={{ auctionUuid }}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Place or update a bet
            </Link>
          </li>
        </ul>
      </section>
    </div>
  )
}
