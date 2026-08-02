import type { AuctionUuid } from '@shared/api'
import { placeBetByUuid } from '@shared/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { betMutationInvalidationTargets } from './query-keys'

export function usePlaceBet(auctionUuid: AuctionUuid) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['auctions', 'detail', auctionUuid, 'bet'],
    mutationFn: (price: number) => placeBetByUuid({ auctionUuid, body: { price } }),
    onSuccess: () =>
      Promise.all(
        betMutationInvalidationTargets(auctionUuid).map((key) =>
          queryClient.refetchQueries({ queryKey: key }),
        ),
      ),
  })
}
