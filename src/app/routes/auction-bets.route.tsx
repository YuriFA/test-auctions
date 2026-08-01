import { auctionKeys } from '@entities/auction/api/query-keys'
import { AuctionBetsPage } from '@pages/auction-bets'
import { fetchBetsByRef } from '@shared/api'
import { createRoute } from '@tanstack/react-router'

import { auctionDetailRoute } from './auction-detail.route'

export const auctionBetsRoute = createRoute({
  getParentRoute: () => auctionDetailRoute,
  path: 'bets',
  component: AuctionBetsPage,
  loader: ({ context: { queryClient }, params: { auctionRef } }) =>
    queryClient.ensureQueryData({
      queryKey: auctionKeys.bets(auctionRef),
      queryFn: () => fetchBetsByRef(auctionRef),
    }),
})
