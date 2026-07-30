import type {
  AuctionListRequest,
  AuctionListResponseBase,
  AuctionShowResponse,
} from "./generated";
import { getAuction, listAuctions } from "./generated";
import { normalizeApiError } from "./errors";

export type AuctionListFilters = AuctionListRequest;
export type AuctionListResponse = AuctionListResponseBase;
export type AuctionDetail = AuctionShowResponse;

export async function fetchAuctionList(
  filters: AuctionListFilters,
): Promise<AuctionListResponse> {
  const result = await listAuctions({ body: filters });
  if (result.error) {
    throw normalizeApiError(result.response, result.error);
  }
  return result.data;
}

export async function fetchAuctionDetail(
  auctionUuid: string,
): Promise<AuctionDetail> {
  const result = await getAuction({ path: { auctionUuid } });
  if (result.error) {
    throw normalizeApiError(result.response, result.error);
  }
  return result.data;
}
