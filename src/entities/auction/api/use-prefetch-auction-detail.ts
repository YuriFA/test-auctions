import type { AuctionRef } from '@shared/api'
import { useQueryClient } from '@tanstack/react-query'

import { auctionDetailQueryOptions } from './query-options'

// NOTE: staleTime must outlast a typical hover→click gap — otherwise the
// prefetched entry becomes stale the moment the user opens the detail page
// and TanStack refetches immediately, defeating the prefetch.
const PREFETCH_STALE_TIME_MS = 60_000

export function usePrefetchAuctionDetail() {
  const queryClient = useQueryClient()
  return (auctionRef: AuctionRef) => {
    void queryClient.prefetchQuery({
      ...auctionDetailQueryOptions(auctionRef),
      staleTime: PREFETCH_STALE_TIME_MS,
    })
  }
}
