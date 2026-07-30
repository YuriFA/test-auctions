import { Link } from "@tanstack/react-router";

export function AuctionsListComponent() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Freight Auctions
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Auctions list
        </h1>
        <p className="max-w-prose text-sm text-muted-foreground sm:text-base">
          Placeholder page for the auctions list. Filters, query wiring, and
          item cards will arrive in later SDD tasks.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
        <h2 className="mb-3 text-base font-semibold">Planned route map</h2>
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              to="/auctions/$auctionUuid"
              params={{ auctionUuid: "preview" }}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              /auctions/$auctionUuid
            </Link>{" "}
            — auction detail
          </li>
          <li>
            <Link
              to="/auctions/$auctionUuid/bets"
              params={{ auctionUuid: "preview" }}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              /auctions/$auctionUuid/bets
            </Link>{" "}
            — bets history (nested)
          </li>
          <li>
            <Link
              to="/auctions/$auctionUuid/bet"
              params={{ auctionUuid: "preview" }}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              /auctions/$auctionUuid/bet
            </Link>{" "}
            — place or update a bet
          </li>
        </ul>
      </section>
    </div>
  );
}
