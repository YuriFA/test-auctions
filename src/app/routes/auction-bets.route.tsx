import { auctionDetailQueryOptions } from '@entities/auction'
import { AuctionBetsPage } from '@pages/auction-bets'
import { createRoute } from '@tanstack/react-router'

import { auctionDetailRoute } from './auction-detail.route'

export const auctionBetsRoute = createRoute({
  getParentRoute: () => auctionDetailRoute,
  path: 'bets',
  component: AuctionBetsPage,
  loader: ({ context: { queryClient }, params: { auctionUuid } }) =>
    queryClient.ensureQueryData({
      ...auctionDetailQueryOptions(auctionUuid),
      revalidateIfStale: true,
    }),
})
