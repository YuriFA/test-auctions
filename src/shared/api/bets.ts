import { resolveAuctionUuid } from './auctions'
import { normalizeApiError } from './errors'
import type { BetListResponse, SetBetRequest } from './generated'
import { listBets, setBet } from './generated'

export type BetsListResponse = BetListResponse
export type PlaceBetInput = SetBetRequest
export type PlaceBetOptions = {
  auctionUuid: string
  body: PlaceBetInput
}

export type FetchBetsOptions = {
  includeCanceled?: boolean
}

export async function fetchBets(
  auctionUuid: string,
  options: FetchBetsOptions = {},
): Promise<BetsListResponse> {
  const result = await listBets({
    path: { auctionUuid },
    query: options.includeCanceled ? { all: true } : undefined,
  })
  if (result.error) {
    throw normalizeApiError(result.response, result.error)
  }
  return result.data
}

export async function fetchBetsByRef(
  auctionRef: string,
  options: FetchBetsOptions = {},
): Promise<BetsListResponse> {
  const auctionUuid = resolveAuctionUuid(auctionRef)
  if (!auctionUuid) {
    throw new Error(`Auction reference ${auctionRef} cannot be resolved to auctionUuid`)
  }
  return fetchBets(auctionUuid, options)
}

export async function placeBet(options: PlaceBetOptions): Promise<void> {
  const result = await setBet({
    path: { auctionUuid: options.auctionUuid },
    body: options.body,
  })
  if (result.error) {
    throw normalizeApiError(result.response, result.error)
  }
}

export async function placeBetByRef(options: { auctionRef: string; body: PlaceBetInput }): Promise<void> {
  const auctionUuid = resolveAuctionUuid(options.auctionRef)
  if (!auctionUuid) {
    throw new Error(`Auction reference ${options.auctionRef} cannot be resolved to auctionUuid`)
  }
  return placeBet({ auctionUuid, body: options.body })
}
