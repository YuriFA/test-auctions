import { parseAuctionsListSearch } from '@features/auction-filters'
import { AuctionsPage } from '@pages/auctions-list'
import { createRoute } from '@tanstack/react-router'

import { rootRoute } from './root.route'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: AuctionsPage,
  validateSearch: parseAuctionsListSearch,
})
