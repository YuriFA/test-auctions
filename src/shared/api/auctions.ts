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
export type AuctionUuid = string

type AuctionUuidResolver = (auctionUuid: AuctionUuid) => string | undefined

let resolveAuctionUuidImpl: AuctionUuidResolver = (uuid) => uuid

export function configureAuctionUuidResolver(resolver: AuctionUuidResolver): void {
  resolveAuctionUuidImpl = resolver
}

export async function fetchAuctionList(filters: AuctionListFilters): Promise<AuctionListResponse> {
  const result = await listAuctions({ body: filters })
  if (result.error) {
    throw normalizeApiError(result.response, result.error)
  }
  return result.data
}

async function fetchAuctionDetail(auctionUuid: string): Promise<AuctionDetail> {
  const result = await getAuction({ path: { auctionUuid } })
  if (result.error) {
    throw normalizeApiError(result.response, result.error)
  }
  return result.data
}

// NOTE: OpenAPI list DTO не содержит отдельного поля auction_uuid.
// main.order_uid — единственный стабильный идентификатор в list response,
// поэтому используется как route identity и резолвится в API uuid
// на границе адаптера.
export function extractAuctionUuid(item: AuctionListItem): AuctionUuid | undefined {
  return item.main?.order_uid
}

export function resolveAuctionUuid(auctionUuid: AuctionUuid): string | undefined {
  return resolveAuctionUuidImpl(auctionUuid)
}

export async function fetchAuctionDetailByUuid(auctionUuid: AuctionUuid): Promise<AuctionDetail> {
  const resolved = resolveAuctionUuid(auctionUuid)
  if (!resolved) {
    throw new Error(`Не удалось определить аукцион по ссылке «${auctionUuid}»`)
  }
  return fetchAuctionDetail(resolved)
}
