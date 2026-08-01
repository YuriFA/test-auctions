import { auctionDetailQueryOptions } from '@entities/auction'
import { Outlet, createRoute } from '@tanstack/react-router'

import { rootRoute } from './root.route'

export const auctionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auctions/$auctionRef',
  component: Outlet,
  loader: ({ context: { queryClient }, params: { auctionRef } }) =>
    queryClient.ensureQueryData({
      ...auctionDetailQueryOptions(auctionRef),
      revalidateIfStale: true,
    }),
})
