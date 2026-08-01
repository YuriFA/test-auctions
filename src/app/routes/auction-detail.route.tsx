import { auctionKeys } from '@entities/auction'
import { fetchAuctionDetailByRef } from '@shared/api'
import { createRoute } from '@tanstack/react-router'

import { AuctionLayout } from '../layouts/auction-layout.component'
import { rootRoute } from './root.route'

export const auctionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auctions/$auctionRef',
  component: AuctionLayout,
  loader: ({ context: { queryClient }, params: { auctionRef } }) =>
    queryClient.ensureQueryData({
      queryKey: auctionKeys.detail(auctionRef),
      queryFn: () => fetchAuctionDetailByRef(auctionRef),
    }),
})
