import { BackLink, PageContainer } from '@shared/ui'
import { useParams } from '@tanstack/react-router'

import { AuctionBetForm } from './auction-bet-form.component'

export function AuctionBetFormPage() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bet' })

  return (
    <PageContainer className="max-w-2xl gap-4">
      <BackLink to="/auctions/$auctionUuid" params={{ auctionUuid }}>
        К аукциону
      </BackLink>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ставка по аукциону</h1>
      <AuctionBetForm auctionUuid={auctionUuid} />
    </PageContainer>
  )
}
