import type { AuctionRef } from '@shared/api'
import { placeBetByRef } from '@shared/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { betMutationInvalidationTargets } from './query-keys'

export function usePlaceBet(auctionRef: AuctionRef) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['auctions', 'detail', auctionRef, 'bet'],
    mutationFn: (price: number) => placeBetByRef({ auctionRef, body: { price } }),
    onSuccess: () =>
      Promise.all(
        betMutationInvalidationTargets(auctionRef).map((key) =>
          queryClient.refetchQueries({ queryKey: key }),
        ),
      ),
  })
}
