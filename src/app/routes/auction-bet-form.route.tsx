import { AuctionBetFormPage } from '@pages/auction-bet-form'
import { createRoute } from '@tanstack/react-router'

import { auctionDetailRoute } from './auction-detail.route'

export const auctionBetFormRoute = createRoute({
  getParentRoute: () => auctionDetailRoute,
  path: 'bet',
  component: AuctionBetFormPage,
})
