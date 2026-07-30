import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE ?? 'http://localhost:5175'
const browser = await chromium.launch()
const page = await browser.newPage()

const cases = [
  { path: '/', expect: { url: '/auctions', h1: 'Auctions list' } },
  { path: '/auctions', expect: { url: '/auctions', h1: 'Auctions list' } },
  {
    path: '/auctions/abc-123',
    expect: { url: '/auctions/abc-123', h1: 'Auction detail', code: 'abc-123' },
  },
  {
    path: '/auctions/abc-123/bets',
    expect: {
      url: '/auctions/abc-123/bets',
      h1: 'Bets history',
      code: 'abc-123',
    },
  },
  {
    path: '/auctions/abc-123/bet',
    expect: {
      url: '/auctions/abc-123/bet',
      h1: 'Place or update a bet',
      code: 'abc-123',
    },
  },
  { path: '/totally/unknown', expect: { h1: 'Page not found' } },
]

let failed = 0
for (const c of cases) {
  await page.goto(BASE + c.path, { waitUntil: 'networkidle' })
  const url = page.url().replace(BASE, '')
  const h1 = ((await page.locator('h1').first().textContent()) ?? '').trim()
  let code = ''
  if (c.expect.code) {
    const codeLocator = page.locator('code').first()
    if (await codeLocator.count().catch(() => 0)) {
      code = ((await codeLocator.textContent()) ?? '').trim()
    }
  }
  const okUrl = !c.expect.url || url === c.expect.url
  const okH1 = h1.includes(c.expect.h1)
  const okCode = !c.expect.code || code === c.expect.code
  const status = okUrl && okH1 && okCode ? 'OK  ' : 'FAIL'
  if (status === 'FAIL') failed++
  console.log(`${status} ${c.path.padEnd(28)} -> url=${url} h1="${h1}" code="${code}"`)
}

await browser.close()
process.exit(failed === 0 ? 0 : 1)
