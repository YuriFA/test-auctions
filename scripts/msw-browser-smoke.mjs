/**
 * One-off browser verification that the MSW worker registers and intercepts
 * SDK-shaped requests. Runs against a live dev server (assumed on SMOKE_BASE).
 * Not part of `pnpm check`; invoke manually like `scripts/route-smoke.mjs`.
 */
import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE ?? 'http://localhost:5179'
const browser = await chromium.launch()
const page = await browser.newPage()

const mswReady = new Promise((resolve) => {
  page.on('console', (msg) => {
    const text = msg.text()
    if (text.includes('Mocking enabled') || text.includes('[MSW] Mocking')) {
      resolve(true)
    }
  })
})

await page.goto(BASE, { waitUntil: 'networkidle' })
await Promise.race([mswReady, new Promise((resolve) => setTimeout(() => resolve('timeout'), 3000))])

const result = await page.evaluate(async () => {
  const res = await fetch('/api/v1/auctions/list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ per_page: 2 }),
  })
  return { status: res.status, json: await res.json() }
})

let failed = 0
function assert(name, cond, detail = '') {
  const status = cond ? 'OK  ' : 'FAIL'
  if (!cond) {failed++}
  console.log(`${status} ${name}${detail ? ` — ${detail}` : ''}`)
}

assert('browser fetch status 200', result.status === 200, `got ${result.status}`)
assert(
  'browser fetch returns 2 items (per_page=2)',
  result.json?.data?.length === 2,
  `got ${result.json?.data?.length}`,
)
assert(
  'browser fetch meta.total === 10',
  result.json?.meta?.total === 10,
  `got ${result.json?.meta?.total}`,
)
assert('browser fetch meta.per_page === 2', result.json?.meta?.per_page === 2)
assert(
  'browser fetch has auction_uuid',
  typeof result.json?.data?.[0]?.main?.auction_uuid === 'string',
)

await browser.close()
console.log('')
console.log(failed === 0 ? 'msw-browser-smoke: ALL OK' : `msw-browser-smoke: ${failed} FAILURE(S)`)
process.exit(failed === 0 ? 0 : 1)
