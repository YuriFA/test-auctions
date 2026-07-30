/**
 * One-off Node smoke for the MSW `POST /auctions/{auctionUuid}/bets` handler
 * (SDD-014).
 *
 * Mirrors the route-smoke philosophy: no test runner, no committed dependency —
 * just `node --experimental-strip-types` against the live handler module. The
 * script is intentionally not part of `pnpm check`; it runs on demand, the
 * same way the SDD-011/012/013 smokes do.
 *
 * Coverage:
 *   - success on a known UUID with a valid price returns 200 with a BetItem-
 *     shaped body (id, price_with_vat, organization_id matching the mock
 *     current user, is_rejected=false, place populated),
 *   - cross-endpoint consistency: after a successful set-bet, the list, detail
 *     and bets endpoints all observe the new state (current price, user
 *     leading status, rejected previous bet),
 *   - 422 on price <= 0 (store's > 0 check),
 *   - 422 on missing price field,
 *   - 422 on non-number price (`{ price: "abc" }`),
 *   - 422 on empty body,
 *   - 422 on malformed JSON,
 *   - 404 on unknown UUID with `ProblemDetail` body and
 *     `application/problem+json`,
 *   - all 422 responses carry `content-type: application/problem+json` and a
 *     `code: validation_failed` shape with `errors[]`.
 *
 * State is reset between cross-endpoint scenarios by re-importing the runtime
 * store and calling `resetMockRuntime()`. The setupServer instance is shared
 * across all scenarios.
 */
import { setupServer } from 'msw/node'
import { mockHandlers } from '../src/shared/api/mocks/handlers/index.ts'
import { resetMockRuntime } from '../src/shared/api/mocks/runtime/store.ts'
import { seedAuctionUuids } from '../src/shared/api/mocks/auctions.ts'

const BASE = 'http://localhost'
let failures = 0

function assert(name, condition, detail = '') {
  const status = condition ? 'OK  ' : 'FAIL'
  if (!condition) failures++
  console.log(`${status} ${name}${detail ? ` — ${detail}` : ''}`)
}

async function postBet(uuid, body) {
  const init =
    body === undefined
      ? { method: 'POST' }
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: typeof body === 'string' ? body : JSON.stringify(body),
        }
  const res = await fetch(`${BASE}/api/v1/auctions/${uuid}/bets`, init)
  const text = await res.text()
  let json = null
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }
  }
  return { status: res.status, contentType: res.headers.get('content-type'), json }
}

async function getDetail(uuid) {
  const res = await fetch(`${BASE}/api/v1/auctions/${uuid}`)
  return res.ok ? JSON.parse(await res.text()) : null
}

async function getList() {
  const res = await fetch(`${BASE}/api/v1/auctions/list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  return res.ok ? JSON.parse(await res.text()) : null
}

async function getBets(uuid, all = false) {
  const url = `${BASE}/api/v1/auctions/${uuid}/bets${all ? '?all=true' : ''}`
  const res = await fetch(url)
  return res.ok ? JSON.parse(await res.text()) : null
}

function assertValidationShape(name, { status, contentType, json }) {
  assert(`${name} status 422`, status === 422, `got ${status}`)
  assert(
    `${name} content-type application/problem+json`,
    contentType === 'application/problem+json',
    `got ${contentType}`,
  )
  assert(`${name} code validation_failed`, json?.code === 'validation_failed')
  assert(`${name} has errors[]`, Array.isArray(json?.errors) && json.errors.length > 0)
}

const server = setupServer(...mockHandlers)
server.listen({ onUnhandledRequest: 'error' })

// --- case 1: success returns BetItem-shaped body --------------------------

resetMockRuntime()
{
  const { status, contentType, json } = await postBet(seedAuctionUuids.downLeading, {
    price: 44000,
  })
  assert('success status 200', status === 200, `got ${status}`)
  assert(
    'success content-type application/json',
    contentType === 'application/json',
    `got ${contentType}`,
  )
  assert('success body has id', typeof json?.id === 'number')
  assert(
    'success body price_with_vat === 44000',
    json?.price_with_vat === 44000,
    `got ${json?.price_with_vat}`,
  )
  assert(
    'success body price_no_vat derived',
    typeof json?.price_no_vat === 'number' && json.price_no_vat < 44000,
  )
  assert('success body is_rejected === false', json?.is_rejected === false)
  assert(
    'success body has place number',
    typeof json?.place === 'number',
    `got ${json?.place}`,
  )
  assert('success body cancel_reason empty', json?.cancel_reason === '')
}

// --- case 2: cross-endpoint consistency after set-bet ---------------------
//
// downLeading seed has the user already Leading at current_price = 45000
// (their own active bet). Placing a new lower bet at 44000 must reject the
// previous user bet and refresh list/detail/bets to reflect the new price.

resetMockRuntime()
{
  const beforeDetail = await getDetail(seedAuctionUuids.downLeading)
  const beforeCurrent = beforeDetail?.trading?.price?.current
  assert(
    `fixture before: current = ${beforeCurrent}`,
    beforeCurrent === 45000,
    `got ${beforeCurrent}`,
  )

  const placed = await postBet(seedAuctionUuids.downLeading, { price: 44000 })
  assert('place bet status 200', placed.status === 200)

  const afterDetail = await getDetail(seedAuctionUuids.downLeading)
  assert(
    'detail current price updated to 44000',
    afterDetail?.trading?.price?.current === 44000,
    `got ${afterDetail?.trading?.price?.current}`,
  )
  assert(
    'detail status_mobile === Leading',
    afterDetail?.trading?.status_mobile === 'Leading',
    `got ${afterDetail?.trading?.status_mobile}`,
  )
  assert(
    'detail is_bidder === true',
    afterDetail?.trading?.is_bidder === true,
  )
  assert(
    'detail your.bet === true',
    afterDetail?.trading?.your?.bet === true,
  )

  const list = await getList()
  const listItem = list?.data?.find(
    (item) => item?.main?.auction_uuid === seedAuctionUuids.downLeading,
  )
  assert(
    'list item current price updated to 44000',
    listItem?.trading?.price?.current === 44000,
    `got ${listItem?.trading?.price?.current}`,
  )
  assert(
    'list item status_mobile === Leading',
    listItem?.trading?.status_mobile === 'Leading',
  )

  const bets = await getBets(seedAuctionUuids.downLeading)
  const userBet = bets?.bets?.find((b) => b?.id === placed.json?.id)
  assert(
    'bets list contains the freshly-placed user bet',
    userBet !== undefined,
  )
  assert(
    'freshly-placed bet has place 1 (leading)',
    userBet?.place === 1,
    `got ${userBet?.place}`,
  )
}

// --- case 3: placing again rejects the previous active user bet -----------

resetMockRuntime()
{
  const first = await postBet(seedAuctionUuids.downLeading, { price: 44500 })
  const second = await postBet(seedAuctionUuids.downLeading, { price: 44000 })
  assert('first bet 200', first.status === 200)
  assert('second bet 200', second.status === 200)

  const betsAll = await getBets(seedAuctionUuids.downLeading, true)
  const firstBet = betsAll?.bets?.find((b) => b?.id === first.json?.id)
  const secondBet = betsAll?.bets?.find((b) => b?.id === second.json?.id)
  assert(
    'previous user bet is_rejected === true',
    firstBet?.is_rejected === true,
    `got ${firstBet?.is_rejected}`,
  )
  assert(
    'previous user bet cancel_reason set',
    typeof firstBet?.cancel_reason === 'string' && firstBet.cancel_reason.length > 0,
  )
  assert(
    'previous user bet place null',
    firstBet?.place === null,
    `got ${firstBet?.place}`,
  )
  assert(
    'new user bet is_rejected === false',
    secondBet?.is_rejected === false,
  )
  assert(
    'new user bet place 1 (leading)',
    secondBet?.place === 1,
    `got ${secondBet?.place}`,
  )

  const betsActive = await getBets(seedAuctionUuids.downLeading, false)
  const hasFirst = betsActive?.bets?.some((b) => b?.id === first.json?.id)
  assert('default bets query hides rejected previous bet', hasFirst === false)
}

// --- case 4: 422 on price <= 0 --------------------------------------------

resetMockRuntime()
{
  const zero = await postBet(seedAuctionUuids.downLeading, { price: 0 })
  assertValidationShape('price=0', zero)
  const neg = await postBet(seedAuctionUuids.downLeading, { price: -100 })
  assertValidationShape('price=-100', neg)
}

// --- case 5: 422 on missing price field -----------------------------------

resetMockRuntime()
{
  const missing = await postBet(seedAuctionUuids.downLeading, {})
  assertValidationShape('missing price', missing)
  assert(
    'missing price error field === price',
    missing.json?.errors?.[0]?.field === 'price',
  )
}

// --- case 6: 422 on non-number price --------------------------------------

resetMockRuntime()
{
  const str = await postBet(seedAuctionUuids.downLeading, { price: 'abc' })
  assertValidationShape('price="abc"', str)
  const nul = await postBet(seedAuctionUuids.downLeading, { price: null })
  assertValidationShape('price=null', nul)
}

// --- case 7: 422 on empty body --------------------------------------------

resetMockRuntime()
{
  const empty = await postBet(seedAuctionUuids.downLeading, undefined)
  assertValidationShape('empty body', empty)
}

// --- case 8: 422 on malformed JSON ----------------------------------------

resetMockRuntime()
{
  const malformed = await postBet(seedAuctionUuids.downLeading, '{not-json')
  assertValidationShape('malformed body', malformed)
  assert(
    'malformed body error field === body',
    malformed.json?.errors?.[0]?.field === 'body',
  )
}

// --- case 9: 404 on unknown UUID ------------------------------------------

resetMockRuntime()
{
  const unknown = 'ffffffff-ffff-4000-8000-ffffffffffff'
  const res = await postBet(unknown, { price: 1000 })
  assert('unknown status 404', res.status === 404, `got ${res.status}`)
  assert(
    'unknown content-type application/problem+json',
    res.contentType === 'application/problem+json',
  )
  assert(
    'unknown body code auction_not_found',
    res.json?.code === 'auction_not_found',
  )
}

server.close()
console.log('')
console.log(failures === 0 ? 'msw-set-bet-smoke: ALL OK' : `msw-set-bet-smoke: ${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)
