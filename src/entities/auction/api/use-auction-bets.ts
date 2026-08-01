import type { AuctionRef, BetsListResponse } from '@shared/api'
import { useQuery } from '@tanstack/react-query'

import type { AuctionBetsVM } from '../lib/bets'
import { toAuctionBetsVM } from '../lib/bets'
import { auctionBetsQueryOptions } from './query-options'

export function useAuctionBets(
  auctionRef: AuctionRef,
  options: { enabled?: boolean; includeCanceled?: boolean } = {},
) {
  return useQuery({
    ...auctionBetsQueryOptions(auctionRef, { includeCanceled: options.includeCanceled }),
    select: (data: BetsListResponse): AuctionBetsVM => toAuctionBetsVM(data),
    enabled: auctionRef.length > 0 && (options.enabled ?? true),
  })
}
