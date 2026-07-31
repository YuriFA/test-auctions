import { createRoute } from '@tanstack/react-router'

import { AuctionBets } from '@pages/auction-bets'
import { auctionDetailRoute } from './auction-detail.route'

export const auctionBetsRoute = createRoute({
  getParentRoute: () => auctionDetailRoute,
  path: 'bets',
  component: AuctionBets,
})
