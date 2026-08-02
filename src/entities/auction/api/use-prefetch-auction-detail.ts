import type { AuctionUuid } from '@shared/api'
import { useQueryClient } from '@tanstack/react-query'

import { auctionDetailQueryOptions } from './query-options'

const PREFETCH_STALE_TIME_MS = 60_000

export function usePrefetchAuctionDetail() {
  const queryClient = useQueryClient()
  return (auctionUuid: AuctionUuid) => {
    void queryClient.prefetchQuery({
      ...auctionDetailQueryOptions(auctionUuid),
      staleTime: PREFETCH_STALE_TIME_MS,
    })
  }
}
