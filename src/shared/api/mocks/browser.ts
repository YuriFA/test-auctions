/**
 * Browser-side MSW worker.
 *
 * Eager-importing `msw/browser` would pull the worker runtime into every
 * consumer of the mocks Public API, including Node test bundles. The browser
 * worker is therefore isolated here and only `import.meta.env.DEV` paths in
 * `src/main.tsx` reach it via a dynamic import — production builds never load
 * this module.
 *
 * Handlers come from the shared `mockHandlers` array so the browser worker and
 * Node test server stay in lockstep.
 */
import { setupWorker } from 'msw/browser'

import { mockHandlers } from './handlers'

export const worker = setupWorker(...mockHandlers)
