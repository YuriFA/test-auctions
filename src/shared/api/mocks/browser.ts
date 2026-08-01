// NOTE: keep msw/browser isolated here. Eager-import would drag the worker
// runtime into every mocks Public API consumer (including Node test bundles);
// only `src/main.tsx` reaches this module via dynamic import. The worker now
// ships in PROD too (no real backend) — `main.tsx` starts it on every env.
import { setupWorker } from 'msw/browser'

import { configureAuctionRefResolver } from '../auctions'
import { mockHandlers } from './handlers'
import { resolveAuctionUuidFromRef } from './runtime/store'

export const worker = setupWorker(...mockHandlers)

// Wire the mock-only ref→uuid resolver into the production adapter. Caller
// (`main.tsx` -> `enableMockWorker`) invokes this once after `worker.start()`,
// so the lifecycle is explicit instead of an import-time side effect.
export function installMockResolver(): void {
  configureAuctionRefResolver(resolveAuctionUuidFromRef)
}
