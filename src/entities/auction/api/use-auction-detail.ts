import type { AuctionDetail, AuctionUuid } from '@shared/api'
import { useQuery } from '@tanstack/react-query'

import type { AuctionDetailVM } from '../lib/detail'
import { toAuctionDetailVM } from '../lib/detail'
import { auctionDetailQueryOptions } from './query-options'

export function useAuctionDetail(auctionUuid: AuctionUuid) {
  return useQuery({
    ...auctionDetailQueryOptions(auctionUuid),
    select: toAuctionDetailViewData,
    enabled: auctionUuid.length > 0,
  })
}

function toAuctionDetailViewData(detail: AuctionDetail): AuctionDetailVM {
  return toAuctionDetailVM(detail)
}
