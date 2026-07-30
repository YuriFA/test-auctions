import type { BetListResponse, SetBetRequest } from "./generated";
import { listBets, setBet } from "./generated";
import { normalizeApiError } from "./errors";

export type BetsListResponse = BetListResponse;
export type PlaceBetInput = SetBetRequest;
export type PlaceBetOptions = {
  auctionUuid: string;
  body: PlaceBetInput;
};

export type FetchBetsOptions = {
  includeCanceled?: boolean;
};

export async function fetchBets(
  auctionUuid: string,
  options: FetchBetsOptions = {},
): Promise<BetsListResponse> {
  const result = await listBets({
    path: { auctionUuid },
    query: options.includeCanceled ? { all: true } : undefined,
  });
  if (result.error) {
    throw normalizeApiError(result.response, result.error);
  }
  return result.data;
}

export async function placeBet(options: PlaceBetOptions): Promise<void> {
  const result = await setBet({
    path: { auctionUuid: options.auctionUuid },
    body: options.body,
  });
  if (result.error) {
    throw normalizeApiError(result.response, result.error);
  }
}
