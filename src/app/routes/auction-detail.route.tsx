import { auctionDetailQueryOptions } from '@entities/auction'
import { Outlet, createRoute } from '@tanstack/react-router'

import { rootRoute } from './root.route'

export const auctionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auctions/$auctionUuid',
  component: Outlet,
  loader: ({ context: { queryClient }, params: { auctionUuid } }) =>
    queryClient.ensureQueryData({
      ...auctionDetailQueryOptions(auctionUuid),
      revalidateIfStale: true,
    }),
})
