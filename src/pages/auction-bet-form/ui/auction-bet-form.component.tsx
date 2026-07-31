import { Button, PageContainer } from '@shared/ui'
import { Link, useParams } from '@tanstack/react-router'

export function AuctionBetForm() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bet' })

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
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Place or update a bet</h1>
        <p className="text-sm text-muted-foreground">
          Auction UUID: <code className="font-mono">{auctionUuid}</code>
        </p>
        <p className="max-w-prose text-sm text-muted-foreground sm:text-base">
          Placeholder page for the bet form. The can_set_bet restriction, validation schema, and
          mutation wiring arrive in later SDD tasks.
        </p>
      </header>
    </PageContainer>
  )
}
