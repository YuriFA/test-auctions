import { BackLink, PageContainer } from '@shared/ui'
import { useNavigate, useParams } from '@tanstack/react-router'

import { AuctionBetForm } from './auction-bet-form.component'

export function AuctionBetFormPage() {
  const { auctionRef } = useParams({ from: '/auctions/$auctionRef/bet' })
  const navigate = useNavigate()

  return (
    <PageContainer className="gap-4">
      <BackLink to="/auctions/$auctionRef" params={{ auctionRef }}>
        К аукциону
      </BackLink>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ставка по аукциону</h1>
      <AuctionBetForm
        auctionRef={auctionRef}
        onSuccess={() => navigate({ to: '/auctions/$auctionRef/bets', params: { auctionRef } })}
      />
    </PageContainer>
  )
}
