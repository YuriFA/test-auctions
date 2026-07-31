// NOTE: keep msw/browser isolated here. Eager-import would drag the worker
// runtime into every mocks Public API consumer (including Node test bundles);
// only `src/main.tsx` reaches this module via dynamic import in DEV, so the
// worker runtime never ships in production builds.
import { setupWorker } from 'msw/browser'

import { mockHandlers } from './handlers'

export const worker = setupWorker(...mockHandlers)
