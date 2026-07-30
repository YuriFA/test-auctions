/**
 * Aggregate MSW handler list (SDD-011+).
 *
 * Both the browser worker (`../browser.ts`) and the Node test server (used by
 * smoke scripts and logic tests) consume this single array, so handlers are
 * declared in exactly one place. The set-bet handler (SDD-014) will be
 * appended here when it lands.
 */
import { auctionsBetsHandler } from './auctions-bets'
import { auctionsDetailHandler } from './auctions-detail'
import { auctionsListHandler } from './auctions-list'

export const mockHandlers = [
  auctionsListHandler,
  auctionsDetailHandler,
  auctionsBetsHandler,
] as const
