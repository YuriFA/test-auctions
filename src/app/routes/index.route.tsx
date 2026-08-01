import { auctionListQueryOptions } from '@entities/auction'
import {
  DEFAULT_AUCTIONS_LIST_FILTERS,
  buildAuctionListRequest,
  parseAuctionsListSearch,
} from '@features/auction-filters'
import { AuctionsPage } from '@pages/auctions-list'
import { createRoute } from '@tanstack/react-router'

import { rootRoute } from './root.route'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: AuctionsPage,
  validateSearch: parseAuctionsListSearch,
  loaderDeps: ({ search }) => ({ ...DEFAULT_AUCTIONS_LIST_FILTERS, ...search }),
  loader: ({ context: { queryClient }, deps }) => {
    const request = buildAuctionListRequest(deps)
    return queryClient.ensureQueryData({
      ...auctionListQueryOptions(request),
      revalidateIfStale: true,
    })
  },
})
