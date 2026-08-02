import { setupWorker } from 'msw/browser'

import { configureAuctionUuidResolver } from '../auctions'
import { mockHandlers } from './handlers'
import { resolveMockAuctionUuid } from './runtime/store'

export const worker = setupWorker(...mockHandlers)

export function installMockResolver(): void {
  configureAuctionUuidResolver(resolveMockAuctionUuid)
}
