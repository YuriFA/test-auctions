/**
 * One-off Node smoke for the MSW `GET /auctions/{auctionUuid}/bets` handler
 * (SDD-013).
 *
 * Mirrors the route-smoke philosophy: no test runner, no committed dependency —
 * just `node --experimental-strip-types` against the live handler module. The
 * script is intentionally not part of `pnpm check`; it runs on demand, the
 * same way the SDD-011 list and SDD-012 detail smokes do.
 *
 * Coverage:
 *   - success on a known UUID returns the `BetListResponse` shape
 *     (`{ bets: BetItem[] }`, required `bets` array),
 *   - each returned bet carries the ranking/winner/cancellation fields the
 *     UI needs (`place`, `is_win`, `is_rejected`, `cancel_reason`),
 *   - the default request (`all` missing) excludes rejected bets from
 *     `stoppedRejected`, while `?all=true` includes them,
 *   - empty bets list on `canceledEmpty` returns `{ bets: [] }` (not 404,
 *     not null) — empty-state contract,
 *   - `hide_bets_history` does NOT gate the bets endpoint itself (the gate is
 *     detail-driven per SDD-021); `finishedConfirmed` still returns its bets,
 *   - 404 on an unknown UUID returns `ProblemDetail`
 *     (`application/problem+json`) with code/title/message,
 *   - the bets path does NOT over-match `/auctions/{uuid}` (detail) — the
 *     two-segment suffix `/bets` keeps the handlers disjoint.
 */
import { setupServer } from 'msw/node'
import { mockHandlers } from '../src/shared/api/mocks/handlers/index.ts'
import { seedAuctionUuids } from '../src/shared/api/mocks/auctions.ts'

const BASE = 'http://localhost' // any host; MSW matches the path
let failures = 0

function assert(name, condition, detail = '') {
  const status = condition ? 'OK  ' : 'FAIL'
  if (!condition) failures++
  console.log(`${status} ${name}${detail ? ` — ${detail}` : ''}`)
}

async function getBets(uuid, query = '') {
  const url = `${BASE}/api/v1/auctions/${uuid}/bets${query ? `?${query}` : ''}`
  const res = await fetch(url)
  const text = await res.text()
  let json = null
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }
  }
  return {
    status: res.status,
    contentType: res.headers.get('content-type'),
    json,
  }
}

const server = setupServer(...mockHandlers)
server.listen({ onUnhandledRequest: 'error' })

// --- case 1: success on downLeading — BetListResponse shape ---------------

{
  const { status, contentType, json } = await getBets(seedAuctionUuids.downLeading)
  assert('success status 200', status === 200, `got ${status}`)
  assert(
    'success content-type application/json',
    contentType === 'application/json',
    `got ${contentType}`,
  )
  assert('success body has bets array', Array.isArray(json?.bets))
  assert('success bets non-empty', (json?.bets?.length ?? 0) > 0, `len=${json?.bets?.length}`)
  const first = json?.bets?.[0]
  assert('success bet has id', typeof first?.id === 'number')
  assert('success bet has price_with_vat', typeof first?.price_with_vat === 'number')
  assert('success bet has price_no_vat', typeof first?.price_no_vat === 'number')
  assert('success bet has organization_name', typeof first?.organization_name === 'string')
  assert('success bet has is_rejected boolean', typeof first?.is_rejected === 'boolean')
  assert('success bet has is_win boolean', typeof first?.is_win === 'boolean')
  assert(
    'success active bet has place number',
    first?.is_rejected === false && typeof first?.place === 'number',
  )
}

// --- case 2: default excludes rejected bets on stoppedRejected -------------
//
// stoppedRejected seed (auctions.ts:2624-2631) carries one active competitor
// bet (id=91) and one rejected user bet (id=92, is_rejected=true). Default
// request must surface only the active bet.

{
  const { status, json } = await getBets(seedAuctionUuids.stoppedRejected)
  assert('default status 200', status === 200)
  const activeCount = json?.bets?.length ?? -1
  assert('default excludes rejected (1 active)', activeCount === 1, `len=${activeCount}`)
  const allActive = (json?.bets ?? []).every((b) => b?.is_rejected === false)
  assert('default all returned bets are active', allActive === true)
  const hasRejected = (json?.bets ?? []).some((b) => b?.is_rejected === true)
  assert('default contains no rejected bet', hasRejected === false)
}

// --- case 3: ?all=true includes rejected bets on stoppedRejected -----------

{
  const { status, json } = await getBets(seedAuctionUuids.stoppedRejected, 'all=true')
  assert('all=true status 200', status === 200)
  const totalCount = json?.bets?.length ?? -1
  assert('all=true includes rejected (2 total)', totalCount === 2, `len=${totalCount}`)
  const rejected = (json?.bets ?? []).filter((b) => b?.is_rejected === true)
  assert('all=true surfaces 1 rejected bet', rejected.length === 1, `len=${rejected.length}`)
  assert(
    'rejected bet has cancel_reason',
    typeof rejected[0]?.cancel_reason === 'string' && rejected[0].cancel_reason.length > 0,
  )
  assert(
    'rejected bet has null place',
    rejected[0]?.place === null,
    `place=${rejected[0]?.place}`,
  )
}

// --- case 4: ?all=false behaves like default (excludes rejected) -----------

{
  const { status, json } = await getBets(seedAuctionUuids.stoppedRejected, 'all=false')
  assert('all=false status 200', status === 200)
  assert(
    'all=false excludes rejected (1 active)',
    json?.bets?.length === 1,
    `len=${json?.bets?.length}`,
  )
}

// --- case 5: garbage all value collapses to default -----------------------

{
  const { status, json } = await getBets(seedAuctionUuids.stoppedRejected, 'all=yes')
  assert('all=yes status 200', status === 200)
  assert(
    'all=yes treated as false (1 active)',
    json?.bets?.length === 1,
    `len=${json?.bets?.length}`,
  )
}

// --- case 6: empty bets list on canceledEmpty -----------------------------
//
// canceledEmpty seed has zero bets. Empty state must be `{ bets: [] }`, not
// 404 and not null/undefined.

{
  const { status, json } = await getBets(seedAuctionUuids.canceledEmpty)
  assert('empty status 200', status === 200, `got ${status}`)
  assert('empty body has bets array', Array.isArray(json?.bets))
  assert('empty bets length === 0', json?.bets?.length === 0, `len=${json?.bets?.length}`)
}

// --- case 7: hide_bets_history does NOT gate the bets endpoint ------------
//
// finishedConfirmed detail DTO has trading.hide_bets_history === true. The
// restriction is a UI gate (SDD-021), not an endpoint gate — bets endpoint
// still returns the history so the UI layer can decide.

{
  const { status, json } = await getBets(seedAuctionUuids.finishedConfirmed)
  assert('hidden-history status 200', status === 200)
  assert(
    'hidden-history still returns bets array',
    Array.isArray(json?.bets),
  )
}

// --- case 8: 404 on unknown UUID with ProblemDetail body -------------------

{
  const unknown = 'ffffffff-ffff-4000-8000-ffffffffffff'
  const { status, contentType, json } = await getBets(unknown)
  assert('unknown status 404', status === 404, `got ${status}`)
  assert(
    'unknown content-type application/problem+json',
    contentType === 'application/problem+json',
    `got ${contentType}`,
  )
  assert(
    'unknown body code is string',
    typeof json?.code === 'string' && json.code.length > 0,
  )
  assert('unknown body title is string', typeof json?.title === 'string')
  assert('unknown body message is string', typeof json?.message === 'string')
}

// --- case 9: bets path does not over-match detail -------------------------
//
// The bets handler's two-segment suffix `/bets` plus single-segment
// `:auctionUuid` keep it disjoint from the detail handler. A request without
// the `/bets` suffix should hit the detail handler (SDD-012), not this one —
// so the detail DTO shape (not `{ bets: [] }`) is what comes back.

{
  const res = await fetch(`${BASE}/api/v1/auctions/${seedAuctionUuids.downLeading}`)
  const text = await res.text()
  let overmatched = false
  try {
    const json = JSON.parse(text)
    // Detail DTO shape, not bets list shape
    overmatched = Array.isArray(json?.bets) && json?.main === undefined
  } catch {
    overmatched = false
  }
  assert('bets handler does not over-match detail path', overmatched === false)
}

server.close()
console.log('')
console.log(failures === 0 ? 'msw-bets-smoke: ALL OK' : `msw-bets-smoke: ${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)
