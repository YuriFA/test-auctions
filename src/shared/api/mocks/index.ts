// NOTE: dev/test infrastructure only. This module MUST NOT be re-exported from
// `src/shared/api/index.ts` — higher FSD layers must not reach mock data.
// Only MSW handlers, the MSW bootstrap, and unit tests import from here.

export type { MockCity } from './cities'
export { findMockCityByGcId, findMockCityByName, mockCities } from './cities'

export type { MockCompetitor, MockCurrentUser } from './user'
export { mockCompetitors, mockCurrentUser } from './user'

export type { MockAuctionListItem, MockAuctionListItemMain, SeedAuction } from './auctions'
export { seedAuctionUuids, seedAuctions } from './auctions'

import { seedAuctions, type SeedAuction } from './auctions'

export function findSeedAuctionByUuid(uuid: string): SeedAuction | undefined {
  return seedAuctions.find((auction) => auction.uuid === uuid)
}

export {
  readAuctionBets,
  readAuctionDetail,
  readAuctionList,
  resetMockRuntime,
  resolveAuctionUuidFromRef,
  writeBet,
} from './runtime/store'
export type { PlaceBetResult } from './runtime/store'

// NOTE: the worker itself (`./browser.ts`) is intentionally not re-exported
// here — `msw/browser` is a side-effectful import that only `src/main.tsx`
// reaches via dynamic `import('@shared/api/mocks/browser')`.
export { mockHandlers } from './handlers'
