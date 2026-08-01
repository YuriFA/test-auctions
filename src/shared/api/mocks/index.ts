// NOTE: dev/test infrastructure only. This module MUST NOT be re-exported from
// `src/shared/api/index.ts` — higher FSD layers must not reach mock data.
// Only `src/shared/api/auctions.ts` reaches this barrel, to resolve an
// `order_uid` ref back to a mock uuid. Handlers and the worker import the
// store/seed modules directly.

export { resolveAuctionUuidFromRef } from './runtime/store'
