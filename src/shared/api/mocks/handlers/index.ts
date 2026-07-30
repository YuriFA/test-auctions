/**
 * Aggregate MSW handler list.
 *
 * Both the browser worker (`../browser.ts`) and the Node test server (used by
 * smoke scripts and logic tests) consume this single array, so handlers are
 * declared in exactly one place. All four OpenAPI endpoints are now covered:
 * POST /auctions/list, GET /auctions/{uuid}, GET /auctions/{uuid}/bets,
 * POST /auctions/{uuid}/bets.
 */
import { auctionsBetsHandler } from './auctions-bets'
import { auctionsDetailHandler } from './auctions-detail'
import { auctionsListHandler } from './auctions-list'
import { auctionsSetBetHandler } from './auctions-set-bet'

export const mockHandlers = [
  auctionsListHandler,
  auctionsDetailHandler,
  auctionsBetsHandler,
  auctionsSetBetHandler,
] as const
