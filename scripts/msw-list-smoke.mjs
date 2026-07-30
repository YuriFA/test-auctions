/**
 * One-off Node smoke for the MSW `POST /auctions/list` handler (SDD-011).
 *
 * Mirrors the route-smoke philosophy: no test runner, no committed dependency —
 * just `node --experimental-strip-types` against the live handler module. The
 * script is intentionally not part of `pnpm check`; it runs on demand, the
 * same way the SDD-010 store smoke did.
 *
 * Coverage:
 *   - default body returns all 10 seed auctions with coherent meta,
 *   - `per_page` + `page` paginates and updates `from`/`to`/`last_page`,
 *   - a typed filter (`auc_type: ['Down']`) narrows the set,
 *   - a free-text filter (`cargo_num`) returns the expected single record,
 *   - each list item carries the injected `main.auction_uuid` (D-011),
 *   - malformed JSON body collapses to 422 with a `ValidationProblem`.
 */
import { setupServer } from 'msw/node'
import { mockHandlers } from '../src/shared/api/mocks/handlers/index.ts'
import { seedAuctionUuids } from '../src/shared/api/mocks/auctions.ts'

const server = setupServer(...mockHandlers)
server.listen({ onUnhandledRequest: 'error' })

const BASE = 'http://localhost' // any host; MSW matches the path
let failures = 0

function assert(name, condition, detail = '') {
  const status = condition ? 'OK  ' : 'FAIL'
  if (!condition) failures++
  console.log(`${status} ${name}${detail ? ` — ${detail}` : ''}`)
}

async function postList(body) {
  const init =
    body === undefined
      ? { method: 'POST' }
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: typeof body === 'string' ? body : JSON.stringify(body),
        }
  const res = await fetch(`${BASE}/api/v1/auctions/list`, init)
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

// --- case 1: default body, all seed auctions ---------------------------------

{
  const { status, json } = await postList()
  assert('default status 200', status === 200, `got ${status}`)
  assert('default meta.total === 10', json?.meta?.total === 10, `got ${json?.meta?.total}`)
  assert(
    'default data length === 10',
    Array.isArray(json?.data) && json.data.length === 10,
    `got ${json?.data?.length}`,
  )
  assert('default meta.current_page === 1', json?.meta?.current_page === 1)
  assert('default meta.from === 1', json?.meta?.from === 1)
  assert('default meta.to === 10', json?.meta?.to === 10)
  assert('default meta.last_page === 1', json?.meta?.last_page === 1)
  const hasAuctionUuid = json?.data?.every((item) => typeof item?.main?.auction_uuid === 'string')
  assert('every list item has main.auction_uuid', hasAuctionUuid === true)
  const seedUuids = Object.values(seedAuctionUuids)
  const returnedUuids = (json?.data ?? []).map((item) => item?.main?.auction_uuid).sort()
  assert(
    'returned UUIDs match seed set',
    JSON.stringify(returnedUuids) === JSON.stringify([...seedUuids].sort()),
  )
}

// --- case 2: pagination ------------------------------------------------------

{
  const { status, json } = await postList({ per_page: 3, page: 2 })
  assert('paginate status 200', status === 200)
  assert('paginate data length === 3', json?.data?.length === 3, `got ${json?.data?.length}`)
  assert('paginate meta.total === 10', json?.meta?.total === 10)
  assert('paginate meta.current_page === 2', json?.meta?.current_page === 2)
  assert('paginate meta.from === 4', json?.meta?.from === 4)
  assert('paginate meta.to === 6', json?.meta?.to === 6)
  assert(
    'paginate meta.last_page === 4',
    json?.meta?.last_page === 4,
    `got ${json?.meta?.last_page}`,
  )
  assert('paginate meta.per_page === 3', json?.meta?.per_page === 3)
}

// --- case 3: empty page beyond range -----------------------------------------

{
  const { status, json } = await postList({ per_page: 3, page: 5 })
  assert('empty page status 200', status === 200)
  assert('empty page data length === 0', json?.data?.length === 0)
  assert('empty page meta.from === 0', json?.meta?.from === 0, `got ${json?.meta?.from}`)
  assert('empty page meta.to === 0', json?.meta?.to === 0)
  assert('empty page meta.total still === 10', json?.meta?.total === 10)
}

// --- case 4: auc_type filter -------------------------------------------------

{
  const { status, json } = await postList({ auc_type: ['Down'] })
  assert('auc_type filter status 200', status === 200)
  const allDown = (json?.data ?? []).every((item) => item?.main?.auc_type === 'Down')
  assert('auc_type=Down returns only Down', allDown === true, `count=${json?.data?.length}`)
  const includesLeading = (json?.data ?? []).some(
    (item) => item?.main?.auction_uuid === seedAuctionUuids.downLeading,
  )
  assert('auc_type=Down includes downLeading', includesLeading === true)
  assert('auc_type=Down total > 0', (json?.meta?.total ?? 0) > 0)
}

// --- case 5: cargo_num filter ------------------------------------------------

{
  const { status, json } = await postList({ cargo_num: 'MSK-001' })
  assert('cargo_num filter status 200', status === 200)
  assert('cargo_num=MSK-001 total === 1', json?.meta?.total === 1, `got ${json?.meta?.total}`)
  assert(
    'cargo_num=MSK-001 returns downLeading',
    json?.data?.[0]?.main?.auction_uuid === seedAuctionUuids.downLeading,
  )
}

// --- case 6: malformed JSON body collapses to 422 ----------------------------

{
  const { status, contentType, json } = await postList('{not-json')
  assert('malformed body status 422', status === 422, `got ${status}`)
  assert(
    'malformed body content-type application/problem+json',
    contentType === 'application/problem+json',
    `got ${contentType}`,
  )
  assert('malformed body code validation_failed', json?.code === 'validation_failed')
  assert('malformed body has errors[]', Array.isArray(json?.errors) && json.errors.length > 0)
}

// --- case 7: is_oldest sort actually flips order -----------------------------

{
  const { status: _, json: newest } = await postList({ is_oldest: false })
  const { json: oldest } = await postList({ is_oldest: true })
  const newestFirst = newest?.data?.[0]?.main?.auction_uuid
  const oldestFirst = oldest?.data?.[0]?.main?.auction_uuid
  assert(
    'sort flips between is_oldest true/false',
    newestFirst !== oldestFirst,
    `newest=${newestFirst} oldest=${oldestFirst}`,
  )
}

server.close()
console.log('')
console.log(failures === 0 ? 'msw-list-smoke: ALL OK' : `msw-list-smoke: ${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)
