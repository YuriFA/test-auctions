import { auctionBetFormRoute } from './auction-bet-form.route'
import { auctionBetsRoute } from './auction-bets.route'
import { auctionDetailIndexRoute } from './auction-detail-index.route'
import { auctionDetailRoute } from './auction-detail.route'
import { indexRoute } from './index.route'
import { rootRoute } from './root.route'

export const routeTree = rootRoute.addChildren([
  indexRoute,
  auctionDetailRoute.addChildren([auctionDetailIndexRoute, auctionBetsRoute, auctionBetFormRoute]),
])
