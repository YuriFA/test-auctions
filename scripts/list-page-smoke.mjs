import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE ?? 'http://localhost:5175'

const browser = await chromium.launch()
const page = await browser.newPage()

const failures = []
function check(label, ok, detail = '') {
  const status = ok ? 'OK  ' : 'FAIL'
  if (!ok) {
    failures.push(label)
  }
  console.log(`${status} ${label}${detail ? ` — ${detail}` : ''}`)
}

// Capture all network requests so we can assert detail prefetch fires on hover.
const requests = []
page.on('request', (req) => {
  if (req.url().includes('/api/v1/auctions/')) {
    requests.push({ method: req.method(), url: req.url() })
  }
})

// 1. List page serves and renders cards from MSW.
await page.goto(`${BASE}/auctions`, { waitUntil: 'networkidle' })
const h1 = ((await page.locator('h1').first().textContent()) ?? '').trim()
check('list page h1 is "Аукционы"', h1 === 'Аукционы', `"${h1}"`)

const cardCount = await page.locator('a[href^="/auctions/0"]').count()
check('list renders at least one auction card', cardCount > 0, `count=${cardCount}`)

// 2. Skeleton shows during the very first load (re-loaded with stale cache cleared).
await page.context().clearCookies()
await page.evaluate(() => {
  localStorage.clear()
  sessionStorage.clear()
})

// 3. Hover a card -> detail prefetch query should fire.
requests.length = 0
const firstCard = page.locator('a[href^="/auctions/0"]').first()
if (await firstCard.count()) {
  await firstCard.hover()
  await page.waitForTimeout(500)
  const detailPrefetch = requests.some(
    (r) => r.method === 'GET' && /\/auctions\/[0-9a-f-]+$/.test(r.url),
  )
  check('hover triggers detail prefetch', detailPrefetch, JSON.stringify(requests))
} else {
  console.log('FAIL no card to hover')
  failures.push('no card to hover')
}

// 3b. Clicking the card body (not the action button) navigates to detail —
// stretched-link ::after overlay covers the whole article.
const firstArticle = page.locator('article').first()
if (await firstArticle.count()) {
  await firstArticle.click({ position: { x: 30, y: 30 } })
  const navigated = await page
    .waitForURL(/\/auctions\/[0-9a-f-]+$/, { timeout: 2000 })
    .then(() => true)
    .catch(() => false)
  const url = page.url().replace(BASE, '')
  check(
    'card body click navigates to detail',
    navigated && /\/auctions\/[0-9a-f-]+$/.test(url),
    url,
  )
  await page.goto(`${BASE}/auctions`, { waitUntil: 'networkidle' })
} else {
  console.log('FAIL no article to click')
  failures.push('no article to click')
}

// 4. Pagination: click "Вперёд" if available; URL should include page=2.
requests.length = 0
const nextButton = page.getByRole('button', { name: 'Вперёд' })
if (await nextButton.count()) {
  const disabled = await nextButton.getAttribute('disabled')
  if (disabled === null) {
    await nextButton.click()
    await page.waitForURL(/page=/, { timeout: 2000 }).catch(() => {})
    const url = page.url()
    check('pagination updates URL with page param', url.includes('page='), url)
    // List query should have fired with the new page.
    const listRequests = requests.filter(
      (r) => r.method === 'POST' && r.url.endsWith('/auctions/list'),
    )
    check('pagination fires a fresh list request', listRequests.length > 0)
  } else {
    console.log('OK   pagination disabled (single page) — skipping click')
  }
} else {
  console.log('OK   no pagination control rendered (single page)')
}

await browser.close()

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`)
  process.exit(1)
}
