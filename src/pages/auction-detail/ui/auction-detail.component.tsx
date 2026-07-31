import { Button, Card, CardContent, CardHeader, CardTitle, PageContainer } from '@shared/ui'
import { Link, useParams } from '@tanstack/react-router'

export function AuctionDetail() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid' })

  return (
    <PageContainer>
      <header className="flex flex-col gap-2">
        <Button
          variant="link"
          size="sm"
          nativeButton={false}
          className="w-fit px-0"
          render={<Link to="/auctions" search={{}} />}
        >
          ← Back to auctions
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Auction detail</h1>
        <p className="text-sm text-muted-foreground">
          Auction UUID: <code className="font-mono">{auctionUuid}</code>
        </p>
        <p className="max-w-prose text-sm text-muted-foreground sm:text-base">
          Placeholder page for the auction detail. ViewModel mapping and DTO-driven restrictions
          arrive in later SDD tasks.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Related routes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li>
              <Button
                variant="link"
                size="sm"
                nativeButton={false}
                className="px-0"
                render={<Link to="/auctions/$auctionUuid/bets" params={{ auctionUuid }} />}
              >
                View bets history
              </Button>
            </li>
            <li>
              <Button
                variant="link"
                size="sm"
                nativeButton={false}
                className="px-0"
                render={<Link to="/auctions/$auctionUuid/bet" params={{ auctionUuid }} />}
              >
                Place or update a bet
              </Button>
            </li>
          </ul>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
