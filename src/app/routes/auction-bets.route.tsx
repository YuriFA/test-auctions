import { createRoute } from '@tanstack/react-router'

import { AuctionBetsComponent } from '@pages/auction-bets'
import { auctionDetailRoute } from './auction-detail.route'

export const auctionBetsRoute = createRoute({
  getParentRoute: () => auctionDetailRoute,
  path: 'bets',
  component: AuctionBetsComponent,
})
