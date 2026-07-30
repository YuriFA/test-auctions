/**
 * One-off Node smoke for the MSW `GET /auctions/{auctionUuid}` handler.
 *
 * Mirrors the route-smoke philosophy: no test runner, no committed dependency —
 * just `node --experimental-strip-types` against the live handler module. The
 * script is intentionally not part of `pnpm check`; it runs on demand.
 *
 * Coverage:
 *   - success on a known seed UUID returns the `AuctionShowResponse` shape
 *     (required top-level fields: main, organizer, contacts, cargo, trading,
 *     payment, assembly, routes, admitted_organizations),
 *   - `main.order_uid` is present and distinct from the path UUID,
 *   - restriction flags surface as expected per seed:
 *       • finishedConfirmed → trading.hide_bets_history === true
 *       • fixPriceHidden → trading.no_view_cargo_price === true AND
 *         trading.hide_points_address_and_contacts === true
 *       • downHiddenContacts → trading.hide_points_address_and_contacts === true
 *   - 404 on an unknown UUID returns `ProblemDetail` (`application/problem+json`)
 *     with code/title/message,
 *   - the detail route does NOT match `/auctions/{uuid}/bets` (single-segment
 *     placeholder); the bets path falls through. We only verify the detail
 *     placeholder is scoped tight.
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

async function getDetail(uuid) {
  const res = await fetch(`${BASE}/api/v1/auctions/${uuid}`)
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

// --- case 1: success on downLeading — full AuctionShowResponse shape --------

{
  const { status, json } = await getDetail(seedAuctionUuids.downLeading)
  assert('success status 200', status === 200, `got ${status}`)
  assert('success has main', typeof json?.main === 'object' && json.main !== null)
  assert('success has organizer', typeof json?.organizer === 'object' && json.organizer !== null)
  assert('success contacts is array', Array.isArray(json?.contacts))
  assert('success has cargo', typeof json?.cargo === 'object' && json.cargo !== null)
  assert('success has trading', typeof json?.trading === 'object' && json.trading !== null)
  assert('success has payment', typeof json?.payment === 'object' && json.payment !== null)
  assert('success has assembly', typeof json?.assembly === 'object' && json.assembly !== null)
  assert('success routes is array', Array.isArray(json?.routes))
  assert(
    'success admitted_organizations is array',
    Array.isArray(json?.admitted_organizations),
  )
  assert(
    'success main.cargo_num is non-empty string',
    typeof json?.main?.cargo_num === 'string' && json.main.cargo_num.length > 0,
  )
  assert(
    'success main.order_uid differs from path UUID',
    typeof json?.main?.order_uid === 'string' &&
      json.main.order_uid !== seedAuctionUuids.downLeading,
    `order_uid=${json?.main?.order_uid}`,
  )
  assert(
    'success main.auc_type === Down',
    json?.main?.auc_type === 'Down',
    `got ${json?.main?.auc_type}`,
  )
}

// --- case 2: restriction flags — finishedConfirmed → hide_bets_history -------

{
  const { status, json } = await getDetail(seedAuctionUuids.finishedConfirmed)
  assert('hide_bets_history status 200', status === 200)
  assert(
    'finishedConfirmed hide_bets_history === true',
    json?.trading?.hide_bets_history === true,
    `got ${json?.trading?.hide_bets_history}`,
  )
}

// --- case 3: restriction flags — fixPriceHidden (no_view_cargo_price + contacts) ---

{
  const { status, json } = await getDetail(seedAuctionUuids.fixPriceHidden)
  assert('fixPriceHidden status 200', status === 200)
  assert(
    'fixPriceHidden no_view_cargo_price === true',
    json?.trading?.no_view_cargo_price === true,
    `got ${json?.trading?.no_view_cargo_price}`,
  )
  assert(
    'fixPriceHidden hide_points_address_and_contacts === true',
    json?.trading?.hide_points_address_and_contacts === true,
    `got ${json?.trading?.hide_points_address_and_contacts}`,
  )
}

// --- case 4: restriction flags — downHiddenContacts --------------------------

{
  const { status, json } = await getDetail(seedAuctionUuids.downHiddenContacts)
  assert('downHiddenContacts status 200', status === 200)
  assert(
    'downHiddenContacts hide_points_address_and_contacts === true',
    json?.trading?.hide_points_address_and_contacts === true,
    `got ${json?.trading?.hide_points_address_and_contacts}`,
  )
}

// --- case 5: 404 on unknown UUID with ProblemDetail body ---------------------

{
  const unknown = 'ffffffff-ffff-4000-8000-ffffffffffff'
  const { status, contentType, json } = await getDetail(unknown)
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

// --- case 6: detail route does not over-match /auctions/{uuid}/bets ----------
//
// The detail handler's `:auctionUuid` consumes exactly one path segment. A
// `/bets` suffix must fall through. We relax MSW's unhandled policy to `warn`
// and observe that the detail body does not surface at the nested path.

server.close()
server.listen({ onUnhandledRequest: 'warn' })

{
  let overmatched = false
  try {
    const res = await fetch(`${BASE}/api/v1/auctions/${seedAuctionUuids.downLeading}/bets`)
    if (res.ok) {
      const text = await res.text()
      try {
        const json = JSON.parse(text)
        // Detail DTO shape leaked into /bets would mean the placeholder
        // over-matched across segments.
        overmatched =
          (json?.main !== undefined && typeof json.main === 'object') ||
          json?.trading !== undefined
      } catch {
        overmatched = false
      }
    }
  } catch {
    // Under `msw/node`, an unhandled request rejects because there is no real
    // HTTP server to receive the pass-through — that is the expected signal
    // that the detail handler did not claim this URL.
    overmatched = false
  }
  assert(
    'detail does not over-match /bets suffix',
    overmatched === false,
    'detail handler matched /auctions/{uuid}/bets',
  )
}

server.close()
console.log('')
console.log(failures === 0 ? 'msw-detail-smoke: ALL OK' : `msw-detail-smoke: ${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)
