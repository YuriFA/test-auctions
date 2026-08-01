import { useAuctionDetail } from '@entities/auction'
import { Alert, AlertDescription, AlertTitle, ErrorAlert } from '@shared/ui'
import { useParams } from '@tanstack/react-router'

import { AuctionDetailContent } from './auction-detail-content.component'
import { AuctionDetailSkeleton } from './auction-detail-skeleton.component'

export function AuctionDetail() {
  const { auctionRef } = useParams({ from: '/auctions/$auctionRef' })
  const query = useAuctionDetail(auctionRef)

  if (query.isPending) {
    return <AuctionDetailSkeleton />
  }

  if (query.isError) {
    return (
      <ErrorAlert
        title="Не удалось загрузить аукцион"
        description={query.error?.message || 'Произошла непредвиденная ошибка. Попробуйте ещё раз.'}
        onRetry={() => query.refetch()}
      />
    )
  }

  const vm = query.data
  if (!vm) {
    return (
      <Alert>
        <AlertTitle>Аукцион недоступен</AlertTitle>
        <AlertDescription>Возможно, ссылка устарела или аукцион был удалён.</AlertDescription>
      </Alert>
    )
  }

  return <AuctionDetailContent vm={vm} auctionRef={auctionRef} />
}
