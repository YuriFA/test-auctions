import type { AuctionDetail, AuctionRef } from '@shared/api'
import { fetchAuctionDetailByRef } from '@shared/api'
import { useQuery } from '@tanstack/react-query'

import type { AuctionDetailVM } from '../lib/detail'
import { toAuctionDetailVM } from '../lib/detail'
import { auctionKeys } from './query-keys'

export function useAuctionDetail(auctionRef: AuctionRef) {
  return useQuery({
    queryKey: auctionKeys.detail(auctionRef),
    queryFn: () => fetchAuctionDetailByRef(auctionRef),
    select: toAuctionDetailViewData,
    enabled: auctionRef.length > 0,
  })
}

function toAuctionDetailViewData(detail: AuctionDetail): AuctionDetailVM {
  return toAuctionDetailVM(detail)
}
