export {
  ApiError,
  ApiValidationError,
  isApiError,
  isApiValidationError,
  normalizeApiError,
} from './errors'
export type {
  AuctionListItem,
  AuctionListRequest,
  AuctionStatus,
  AuctionType,
  BetItem,
  BetListResponse,
  BidMeasurementType,
  Contact,
  OperationType,
  PaymentDelayType,
  ProblemDetail,
  TradingStatus,
  ValidationError,
  ValidationProblem,
} from './generated'
export {
  extractAuctionRef,
  fetchAuctionDetail,
  fetchAuctionDetailByRef,
  fetchAuctionList,
  resolveAuctionUuid,
} from './auctions'
export type { AuctionDetail, AuctionListFilters, AuctionListResponse, AuctionRef } from './auctions'
export { fetchBets, fetchBetsByRef, placeBet, placeBetByRef } from './bets'
export type { BetsListResponse, FetchBetsOptions, PlaceBetInput, PlaceBetOptions } from './bets'
