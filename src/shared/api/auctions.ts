import { normalizeApiError } from './errors'
import type {
  AuctionListItem,
  AuctionListRequest,
  AuctionListResponseBase,
  AuctionShowResponse,
} from './generated'
import { getAuction, listAuctions } from './generated'

export type AuctionListFilters = AuctionListRequest
export type AuctionListResponse = AuctionListResponseBase
export type AuctionDetail = AuctionShowResponse

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

// FIXME: production DTO has no `auction_uuid` field; the mock layer injects it.
// Read defensively so routing works today, drop the cast once the spec exposes it.
export function extractAuctionUuid(item: AuctionListItem): string | undefined {
  const main = item.main as { auction_uuid?: string } | undefined
  return main?.auction_uuid
}
