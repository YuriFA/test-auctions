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
export type AuctionRef = string

type AuctionRefResolver = (auctionRef: AuctionRef) => string | undefined

// NOTE: identity resolver — production treats the route ref as the server
// uuid. Mock/dev environments override it via `configureAuctionRefResolver`
// because the seed store keys some auctions by an internal uuid that differs
// from the list DTO's `main.order_uid`.
let resolveAuctionUuidImpl: AuctionRefResolver = (ref) => ref

export function configureAuctionRefResolver(resolver: AuctionRefResolver): void {
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

export function extractAuctionRef(item: AuctionListItem): AuctionRef | undefined {
  return item.main?.order_uid
}

export function resolveAuctionUuid(auctionRef: AuctionRef): string | undefined {
  return resolveAuctionUuidImpl(auctionRef)
}

export async function fetchAuctionDetailByRef(auctionRef: AuctionRef): Promise<AuctionDetail> {
  const auctionUuid = resolveAuctionUuid(auctionRef)
  if (!auctionUuid) {
    throw new Error(`Не удалось определить аукцион по ссылке «${auctionRef}»`)
  }
  return fetchAuctionDetail(auctionUuid)
}
