// Verifies cross-screen consistency after a real bet mutation.
//
// Places a bet via the /bet form, then walks bets → detail → list and
// asserts each screen reflects the new leading price. This complements
// msw-set-bet-smoke (which checks the API responses) by exercising the
// TanStack Query invalidation path end-to-end through the UI.
import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE ?? 'http://localhost:5175'

// downLeading seed: can_set_bet=true, initial current=45000, step=500, min=40000.
// Placing 44000 makes the user Leading at the new lower price.
const DOWN_LEADING_UUID = '00000000-0000-4000-8000-000000000001'
const PLACED_PRICE = 44000

const browser = await chromium.launch()
const page = await browser.newPage()

let failed = 0
function check(label, ok, detail = '') {
  const status = ok ? 'OK  ' : 'FAIL'
  if (!ok) {
    failed++
  }
  console.log(`${status} ${label}${detail ? ` — ${detail}` : ''}`)
}

// formatPrice uses NBSP ( ) as the thousands separator; build a regex
// that tolerates either NBSP or a plain space so the assertion is robust.
function priceRegex(value) {
  const digits = String(value)
  return new RegExp(digits.split('').join('[\\s\\u00A0]?'))
}

try {
  // 1. Open the bet form for an auction where the user can place a bet.
  await page.goto(`${BASE}/auctions/${DOWN_LEADING_UUID}/bet`, { waitUntil: 'networkidle' })
  const formH1 = ((await page.locator('h1').first().textContent()) ?? '').trim()
  check('bet form renders', formH1 === 'Ставка по аукциону', `"${formH1}"`)

  // 2. Fill the price and submit.
  const input = page.locator('#bet-price')
  await input.fill(String(PLACED_PRICE))
  await page.getByRole('button', { name: 'Поставить ставку' }).click()

  // 3. Successful submit navigates to the bets history page. Wait for the
  // h1 to appear rather than waitForURL — MSW keeps the load event pending
  // and waitForURL never resolves against the chosen waitUntil.
  await page.locator('h1', { hasText: 'История ставок' }).waitFor({ timeout: 5000 })
  const betsH1 = ((await page.locator('h1').first().textContent()) ?? '').trim()
  check('post-submit navigates to bets history', betsH1 === 'История ставок', `"${betsH1}"`)

  // 4. The freshly-placed bet shows up somewhere in the bets list with the
  // placed price. The list renders bets in chronological order (not by
  // place), so we look for the price anywhere on the page.
  const betsText = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ').trim()
  check(
    'bets list shows placed price',
    priceRegex(PLACED_PRICE).test(betsText),
    '44 000 visible somewhere on the bets page',
  )

  // 5. SPA-navigate to detail via the in-page BackLink. MSW 2.x runs handlers
  // in the page's JS context, so a full page.goto would reset runtime state
  // and lose the placed bet — staying inside the SPA preserves it. The
  // BackLink renders as `<a>` with visible text "К аукциону".
  await page.locator('a', { hasText: 'К аукциону' }).first().click()
  await page.locator('text=Текущая').first().waitFor({ timeout: 5000 })
  const detailText = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ').trim()
  const tradingSlice = (detailText.match(/Текущая.*?(?=Организатор|Контакты|Маршрут|$)/) ?? [''])[0]
  check(
    'detail page reflects new current price',
    priceRegex(PLACED_PRICE).test(detailText),
    tradingSlice.slice(0, 120),
  )

  // 6. SPA-navigate to the list via the detail BackLink.
  await page.locator('a', { hasText: 'К списку аукционов' }).first().click()
  await page.locator('article').first().waitFor({ timeout: 5000 })
  const cardLink = page.getByRole('link', { name: /MSK-001/ }).first()
  const card = cardLink.locator('xpath=ancestor::article').first()
  await card.waitFor({ timeout: 5000 })
  const cardText = ((await card.textContent()) ?? '').replace(/\s+/g, ' ').trim()
  check(
    'list card reflects new current price',
    priceRegex(PLACED_PRICE).test(cardText),
    cardText.slice(0, 80),
  )
} finally {
  await browser.close()
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`)
  process.exit(1)
}
console.log('\nmutation-flow-smoke: ALL OK')
