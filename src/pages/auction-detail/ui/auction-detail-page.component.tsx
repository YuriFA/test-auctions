import { BackLink, PageContainer } from '@shared/ui'

import { AuctionDetail } from './auction-detail.component'

export function AuctionDetailPage() {
  return (
    <PageContainer className="gap-4">
      <BackLink to="/" search={{}}>
        К списку аукционов
      </BackLink>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Аукцион</h1>
      <AuctionDetail />
    </PageContainer>
  )
}
