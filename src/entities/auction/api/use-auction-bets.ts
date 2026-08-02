import type { AuctionUuid, BetsListResponse } from '@shared/api'
import { useQuery } from '@tanstack/react-query'

import type { AuctionBetsVM } from '../lib/bets'
import { toAuctionBetsVM } from '../lib/bets'
import { auctionBetsQueryOptions } from './query-options'

export function useAuctionBets(
  auctionUuid: AuctionUuid,
  options: { enabled?: boolean; includeCanceled?: boolean } = {},
) {
  return useQuery({
    ...auctionBetsQueryOptions(auctionUuid, { includeCanceled: options.includeCanceled }),
    select: (data: BetsListResponse): AuctionBetsVM => toAuctionBetsVM(data),
    enabled: auctionUuid.length > 0 && (options.enabled ?? true),
  })
}
