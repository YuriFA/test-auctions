import type { AuctionListRequest, AuctionRef } from '@shared/api'
import { fetchAuctionDetailByRef, fetchAuctionList, fetchBetsByRef } from '@shared/api'
import { queryOptions } from '@tanstack/react-query'

import { auctionKeys } from './query-keys'

export function auctionDetailQueryOptions(auctionRef: AuctionRef) {
  return queryOptions({
    queryKey: auctionKeys.detail(auctionRef),
    queryFn: () => fetchAuctionDetailByRef(auctionRef),
  })
}

export function auctionBetsQueryOptions(
  auctionRef: AuctionRef,
  options: { includeCanceled?: boolean } = {},
) {
  return queryOptions({
    queryKey: auctionKeys.bets(auctionRef, { includeCanceled: options.includeCanceled }),
    queryFn: () => fetchBetsByRef(auctionRef, { includeCanceled: options.includeCanceled }),
  })
}

export function auctionListQueryOptions(request: AuctionListRequest) {
  return queryOptions({
    queryKey: auctionKeys.list(request),
    queryFn: () => fetchAuctionList(request),
  })
}
