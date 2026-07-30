import { Link, useParams } from "@tanstack/react-router";

export function AuctionBetsComponent() {
  const { auctionUuid } = useParams({ from: "/auctions/$auctionUuid/bets" });

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
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Bets history
        </h1>
        <p className="text-sm text-muted-foreground">
          Auction UUID: <code className="font-mono">{auctionUuid}</code>
        </p>
        <p className="max-w-prose text-sm text-muted-foreground sm:text-base">
          Placeholder page for the bets history tab. The hide_bets_history
          restriction will be honoured here in later SDD tasks.
        </p>
      </header>
    </div>
  );
}
