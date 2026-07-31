import { createRoute } from '@tanstack/react-router'

import { AuctionDetail } from '@pages/auction-detail'
import { auctionDetailRoute } from './auction-detail.route'

export const auctionDetailIndexRoute = createRoute({
  getParentRoute: () => auctionDetailRoute,
  path: '/',
  component: AuctionDetail,
})
