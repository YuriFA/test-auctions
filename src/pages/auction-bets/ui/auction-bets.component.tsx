import { Button, PageContainer } from '@shared/ui'
import { Link, useParams } from '@tanstack/react-router'

export function AuctionBets() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bets' })

  return (
    <PageContainer>
      <header className="flex flex-col gap-2">
        <Button
          variant="link"
          size="sm"
          nativeButton={false}
          className="w-fit px-0"
          render={<Link to="/auctions/$auctionUuid" params={{ auctionUuid }} />}
        >
          ← Back to auction
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Bets history</h1>
        <p className="text-sm text-muted-foreground">
          Auction UUID: <code className="font-mono">{auctionUuid}</code>
        </p>
        <p className="max-w-prose text-sm text-muted-foreground sm:text-base">
          Placeholder page for the bets history tab. The hide_bets_history restriction will be
          honoured here in later SDD tasks.
        </p>
      </header>
    </PageContainer>
  )
}
