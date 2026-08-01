import { AuctionDetailPage } from '@pages/auction-detail'
import { createRoute } from '@tanstack/react-router'

import { auctionDetailRoute } from './auction-detail.route'

export const auctionDetailIndexRoute = createRoute({
  getParentRoute: () => auctionDetailRoute,
  path: '/',
  component: AuctionDetailPage,
})
