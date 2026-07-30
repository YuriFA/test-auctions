/**
 * Public API of the `auction-filters` feature slice.
 *
 * Owns the two-sided URL search-params contract for the auctions list:
 * `parseAuctionsListSearchParams` (URL → typed object, via the
 * `auctionsListFiltersSchema` Zod schema),
 * `serializeAuctionsListSearchParams` (typed object → URL), plus
 * `isDefaultFilters` / `countActiveFilters` UI helpers.
 *
 * The filter UI itself lands later and consumes these helpers without
 * duplicating the URL contract.
 */
export type { AuctionsListFilters } from './lib/search-params'
export {
  DEFAULT_AUCTIONS_LIST_FILTERS,
  DEFAULT_IS_OLDEST,
  DEFAULT_PAGE,
  auctionsListFiltersSchema,
  countActiveFilters,
  isDefaultFilters,
  parseAuctionsListSearchParams,
  serializeAuctionsListSearchParams,
} from './lib/search-params'
