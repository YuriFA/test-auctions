import { auctionDetailQueryOptions } from '@entities/auction'
import { createRoute } from '@tanstack/react-router'

import { AuctionLayout } from '../layouts/auction-layout.component'
import { rootRoute } from './root.route'

export const auctionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auctions/$auctionRef',
  component: AuctionLayout,
  loader: ({ context: { queryClient }, params: { auctionRef } }) =>
    queryClient.ensureQueryData(auctionDetailQueryOptions(auctionRef)),
})
