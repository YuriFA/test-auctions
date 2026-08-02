import { resolveAuctionUuid } from './auctions'
import { normalizeApiError } from './errors'
import type { BetListResponse, SetBetRequest } from './generated'
import { listBets, setBet } from './generated'

export type BetsListResponse = BetListResponse
export type PlaceBetInput = SetBetRequest
type PlaceBetOptions = {
  auctionUuid: string
  body: PlaceBetInput
}

export type FetchBetsOptions = {
  includeCanceled?: boolean
}

async function fetchBets(
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

export async function fetchBetsByUuid(
  auctionUuid: string,
  options: FetchBetsOptions = {},
): Promise<BetsListResponse> {
  const resolved = resolveAuctionUuid(auctionUuid)
  if (!resolved) {
    throw new Error(`Не удалось определить аукцион по ссылке «${auctionUuid}»`)
  }
  return fetchBets(resolved, options)
}

async function placeBet(options: PlaceBetOptions): Promise<void> {
  const result = await setBet({
    path: { auctionUuid: options.auctionUuid },
    body: options.body,
  })
  if (result.error) {
    throw normalizeApiError(result.response, result.error)
  }
}

export async function placeBetByUuid(options: {
  auctionUuid: string
  body: PlaceBetInput
}): Promise<void> {
  const resolved = resolveAuctionUuid(options.auctionUuid)
  if (!resolved) {
    throw new Error(`Не удалось определить аукцион по ссылке «${options.auctionUuid}»`)
  }
  return placeBet({ auctionUuid: resolved, body: options.body })
}
