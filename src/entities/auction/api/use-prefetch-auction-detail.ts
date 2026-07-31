import { fetchAuctionDetail } from '@shared/api'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { auctionKeys } from './query-keys'

// Hover/focus prefetch must not cause an immediate refetch on click — otherwise
// the freshly cached entry becomes stale the moment the user opens the detail
// page. The 60 s window keeps the prefetched entry fresh long enough for the
// click-through without holding stale data indefinitely.
const PREFETCH_STALE_TIME_MS = 60_000

export function usePrefetchAuctionDetail() {
  const queryClient = useQueryClient()
  return useCallback(
    (auctionUuid: string) => {
      void queryClient.prefetchQuery({
        queryKey: auctionKeys.detail(auctionUuid),
        queryFn: () => fetchAuctionDetail(auctionUuid),
        staleTime: PREFETCH_STALE_TIME_MS,
      })
    },
    [queryClient],
  )
}
