import { placeBet } from '@shared/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { betMutationInvalidationTargets } from './query-keys'

export function usePlaceBet(auctionUuid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['auctions', 'detail', auctionUuid, 'bet'],
    mutationFn: (price: number) => placeBet({ auctionUuid, body: { price } }),
    onSuccess: () =>
      Promise.all(
        betMutationInvalidationTargets(auctionUuid).map((key) =>
          queryClient.invalidateQueries({ queryKey: key }),
        ),
      ),
  })
}
