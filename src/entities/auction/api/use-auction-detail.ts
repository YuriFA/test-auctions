import type { AuctionDetail } from '@shared/api'
import { fetchAuctionDetail } from '@shared/api'
import { useQuery } from '@tanstack/react-query'

import type { AuctionDetailVM } from '../lib/detail'
import { toAuctionDetailVM } from '../lib/detail'
import { auctionKeys } from './query-keys'

export function useAuctionDetail(auctionUuid: string) {
  return useQuery({
    queryKey: auctionKeys.detail(auctionUuid),
    queryFn: () => fetchAuctionDetail(auctionUuid),
    select: toAuctionDetailViewData,
    enabled: auctionUuid.length > 0,
  })
}

function toAuctionDetailViewData(detail: AuctionDetail): AuctionDetailVM {
  return toAuctionDetailVM(detail)
}
