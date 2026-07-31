/**
 * Public API of the `auction-filters` feature slice.
 *
 * URL search params contract (SDD-015) and request builder (SDD-016) live in
 * `lib/`. Filter UI (SDD-018) lives in `ui/`.
 */
export type { AuctionsListFilters, AuctionsListSearch } from './lib/search-params'
export {
  DEFAULT_AUCTIONS_LIST_FILTERS,
  DEFAULT_IS_OLDEST,
  DEFAULT_PAGE,
  auctionsListFiltersSchema,
  countActiveFilters,
  isDefaultFilters,
  parseAuctionsListSearch,
  parseAuctionsListSearchParams,
  serializeAuctionsListSearchParams,
  toAuctionsListSearch,
} from './lib/search-params'
export { buildAuctionListRequest } from './lib/request-builder'
export { AuctionFilters } from './ui/auction-filters.component'
export { AuctionFiltersForm } from './ui/auction-filters-form.component'
export { AuctionSearchInput } from './ui/auction-search-input.component'
