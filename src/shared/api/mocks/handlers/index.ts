/**
 * Aggregate MSW handler list (SDD-011+).
 *
 * Both the browser worker (`../browser.ts`) and the Node test server (used by
 * smoke scripts and logic tests) consume this single array, so handlers are
 * declared in exactly one place. Bets (SDD-013) and set-bet (SDD-014) handlers
 * will be appended here as they land.
 */
import { auctionsDetailHandler } from './auctions-detail'
import { auctionsListHandler } from './auctions-list'

export const mockHandlers = [auctionsListHandler, auctionsDetailHandler] as const
