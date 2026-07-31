import { createRouter as createTanStackRouter } from '@tanstack/react-router'

import { queryClient } from './lib/query-client'
import { routeTree } from './routes/route-tree'

export interface RouterAppContext {
  queryClient: typeof queryClient
}

// URL search format: repeated keys for arrays (e.g. `auc_type=Down&auc_type=Up`),
// no JSON-encoded values, undefined/null/empty arrays skipped. Matches the
// SDD-015 contract used by `features/auction-filters`.
function parseSearch(searchStr: string): Record<string, unknown> {
  const params = new URLSearchParams(searchStr)
  const out: Record<string, unknown> = {}
  for (const key of params.keys()) {
    const all = params.getAll(key)
    out[key] = all.length === 1 ? all[0] : all
  }
  return out
}

function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null) {
      continue
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        continue
      }
      for (const v of value) {
        params.append(key, String(v))
      }
    } else {
      params.set(key, String(value))
    }
  }
  const str = params.toString()
  return str ? `?${str}` : ''
}

export const router = createTanStackRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  parseSearch,
  stringifySearch,
  context: {
    queryClient,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
