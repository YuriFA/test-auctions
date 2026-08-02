import { BackLink, PageContainer } from '@shared/ui'
import { useParams } from '@tanstack/react-router'

import { AuctionBets } from './auction-bets.component'

export function AuctionBetsPage() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bets' })

  return (
    <PageContainer className="gap-4">
      <BackLink to="/auctions/$auctionUuid" params={{ auctionUuid }}>
        К аукциону
      </BackLink>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">История ставок</h1>
      <AuctionBets auctionUuid={auctionUuid} />
    </PageContainer>
  )
}
