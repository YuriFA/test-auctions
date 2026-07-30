/**
 * Public API of the mock domain dataset.
 *
 * IMPORTANT: this module is dev/test infrastructure only. It is intentionally
 * NOT re-exported from `src/shared/api/index.ts`, so higher FSD layers
 * (`pages`, `widgets`, `features`, `entities`) cannot accidentally import mock
 * data. Only the MSW worker bootstrap (SDD-010+), MSW handlers, and unit tests
 * should reach for these symbols via `@shared/api/mocks`.
 *
 * Reach-through contract: every shape exposed here is typed against the
 * generated OpenAPI DTOs from `../generated`, so the dataset stays accurate
 * against the contract while remaining decoupled from the production
 * `shared/api` adapter helpers.
 */

export type { MockCity } from "./cities";
export {
  findMockCityByGcId,
  findMockCityByName,
  mockCities,
} from "./cities";

export type { MockCompetitor, MockCurrentUser } from "./user";
export { mockCompetitors, mockCurrentUser } from "./user";

export type {
  MockAuctionListItem,
  MockAuctionListItemMain,
  SeedAuction,
} from "./auctions";
export { seedAuctionUuids, seedAuctions } from "./auctions";

import { seedAuctions, type SeedAuction } from "./auctions";

/**
 * Convenience lookup: seed auction by its UUID. The runtime store and MSW
 * detail/bets handlers will call this to resolve a path parameter to a record.
 */
export function findSeedAuctionByUuid(uuid: string): SeedAuction | undefined {
  return seedAuctions.find((auction) => auction.uuid === uuid);
}

// SDD-010 — single in-memory MSW runtime store. Handlers (SDD-011+) and tests
// reach the runtime through this Public API; production code must not.
export {
  readAuctionBets,
  readAuctionDetail,
  readAuctionList,
  resetMockRuntime,
  writeBet,
} from "./runtime/store";
export type { PlaceBetResult } from "./runtime/store";

