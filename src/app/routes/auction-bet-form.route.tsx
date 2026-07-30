import { createRoute } from '@tanstack/react-router'

import { AuctionBetFormComponent } from '@pages/auction-bet-form'
import { auctionDetailRoute } from './auction-detail.route'

export const auctionBetFormRoute = createRoute({
  getParentRoute: () => auctionDetailRoute,
  path: 'bet',
  component: AuctionBetFormComponent,
})
