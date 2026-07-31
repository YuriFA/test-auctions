/**
 * Public API of the `auction-filters` feature slice.
 *
 * Owns the two-sided URL search-params contract for the auctions list:
 * `parseAuctionsListSearchParams` (URL → typed object, via the
 * `auctionsListFiltersSchema` Zod schema),
 * `serializeAuctionsListSearchParams` (typed object → URL), plus
 * `isDefaultFilters` / `countActiveFilters` UI helpers, and the
 * `buildAuctionListRequest` translator from typed filters to the
 * `AuctionListRequest` body used by `shared/api`.
 *
 * The filter UI itself lands later and consumes these helpers without
 * duplicating the URL contract.
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
