import { normalizeApiError } from './errors'
import type {
  AuctionListItem,
  AuctionListRequest,
  AuctionListResponseBase,
  AuctionShowResponse,
} from './generated'
import { getAuction, listAuctions } from './generated'
import { resolveAuctionUuidFromRef } from './mocks'

export type AuctionListFilters = AuctionListRequest
export type AuctionListResponse = AuctionListResponseBase
export type AuctionDetail = AuctionShowResponse
export type AuctionRef = string

export async function fetchAuctionList(filters: AuctionListFilters): Promise<AuctionListResponse> {
  const result = await listAuctions({ body: filters })
  if (result.error) {
    throw normalizeApiError(result.response, result.error)
  }
  return result.data
}

export async function fetchAuctionDetail(auctionUuid: string): Promise<AuctionDetail> {
  const result = await getAuction({ path: { auctionUuid } })
  if (result.error) {
    throw normalizeApiError(result.response, result.error)
  }
  return result.data
}

export function extractAuctionRef(item: AuctionListItem): AuctionRef | undefined {
  return item.main?.order_uid
}

export function resolveAuctionUuid(auctionRef: AuctionRef): string | undefined {
  return resolveAuctionUuidFromRef(auctionRef)
}

export async function fetchAuctionDetailByRef(auctionRef: AuctionRef): Promise<AuctionDetail> {
  const auctionUuid = resolveAuctionUuid(auctionRef)
  if (!auctionUuid) {
    throw new Error(`Auction reference ${auctionRef} cannot be resolved to auctionUuid`)
  }
  return fetchAuctionDetail(auctionUuid)
}
