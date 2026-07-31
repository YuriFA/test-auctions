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
