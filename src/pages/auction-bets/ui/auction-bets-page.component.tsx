import { BackLink, PageContainer } from '@shared/ui'
import { useParams } from '@tanstack/react-router'

import { AuctionBets } from './auction-bets.component'

export function AuctionBetsPage() {
  const { auctionRef } = useParams({ from: '/auctions/$auctionRef/bets' })

  return (
    <PageContainer className="gap-4">
      <BackLink to="/auctions/$auctionRef" params={{ auctionRef }}>
        К аукциону
      </BackLink>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">История ставок</h1>
      <AuctionBets auctionRef={auctionRef} />
    </PageContainer>
  )
}
