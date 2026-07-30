export {
  ApiError,
  ApiValidationError,
  isApiError,
  isApiValidationError,
  normalizeApiError,
} from "./errors";
export type { ProblemDetail, ValidationError, ValidationProblem } from "./generated";
export { fetchAuctionDetail, fetchAuctionList } from "./auctions";
export type {
  AuctionDetail,
  AuctionListFilters,
  AuctionListResponse,
} from "./auctions";
export { fetchBets, placeBet } from "./bets";
export type {
  BetsListResponse,
  FetchBetsOptions,
  PlaceBetInput,
  PlaceBetOptions,
} from "./bets";
