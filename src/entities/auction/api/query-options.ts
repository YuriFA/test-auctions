import type { AuctionListRequest, AuctionUuid } from '@shared/api'
import { fetchAuctionDetailByUuid, fetchAuctionList, fetchBetsByUuid } from '@shared/api'
import { queryOptions } from '@tanstack/react-query'

import { auctionKeys } from './query-keys'

export function auctionDetailQueryOptions(auctionUuid: AuctionUuid) {
  return queryOptions({
    queryKey: auctionKeys.detail(auctionUuid),
    queryFn: () => fetchAuctionDetailByUuid(auctionUuid),
  })
}

export function auctionBetsQueryOptions(
  auctionUuid: AuctionUuid,
  options: { includeCanceled?: boolean } = {},
) {
  return queryOptions({
    queryKey: auctionKeys.bets(auctionUuid, { includeCanceled: options.includeCanceled }),
    queryFn: () => fetchBetsByUuid(auctionUuid, { includeCanceled: options.includeCanceled }),
  })
}

export function auctionListQueryOptions(request: AuctionListRequest) {
  return queryOptions({
    queryKey: auctionKeys.list(request),
    queryFn: () => fetchAuctionList(request),
  })
}
