import { parseAuctionsListSearch } from '@features/auction-filters'
import { createRoute } from '@tanstack/react-router'

import { AuctionsPage } from '@/pages/auctions-list'

import { rootRoute } from './root.route'

export const auctionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auctions',
  component: AuctionsPage,
  validateSearch: parseAuctionsListSearch,
})
