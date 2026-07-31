import type { BetsListResponse } from '@shared/api'
import { fetchBets } from '@shared/api'
import { useQuery } from '@tanstack/react-query'

import type { AuctionBetsVM } from '../lib/bets'
import { toAuctionBetsVM } from '../lib/bets'
import { auctionKeys } from './query-keys'

export function useAuctionBets(
  auctionUuid: string,
  options: { enabled?: boolean; includeCanceled?: boolean } = {},
) {
  return useQuery({
    queryKey: auctionKeys.bets(auctionUuid, { includeCanceled: options.includeCanceled }),
    queryFn: () => fetchBets(auctionUuid, { includeCanceled: options.includeCanceled }),
    select: (data: BetsListResponse): AuctionBetsVM => toAuctionBetsVM(data),
    enabled: auctionUuid.length > 0 && (options.enabled ?? true),
  })
}
