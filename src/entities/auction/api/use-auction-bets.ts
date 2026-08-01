import type { AuctionRef, BetsListResponse } from '@shared/api'
import { fetchBetsByRef } from '@shared/api'
import { useQuery } from '@tanstack/react-query'

import type { AuctionBetsVM } from '../lib/bets'
import { toAuctionBetsVM } from '../lib/bets'
import { auctionKeys } from './query-keys'

export function useAuctionBets(
  auctionRef: AuctionRef,
  options: { enabled?: boolean; includeCanceled?: boolean } = {},
) {
  return useQuery({
    queryKey: auctionKeys.bets(auctionRef, { includeCanceled: options.includeCanceled }),
    queryFn: () => fetchBetsByRef(auctionRef, { includeCanceled: options.includeCanceled }),
    select: (data: BetsListResponse): AuctionBetsVM => toAuctionBetsVM(data),
    enabled: auctionRef.length > 0 && (options.enabled ?? true),
  })
}
