import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE ?? 'http://localhost:5175'
const browser = await chromium.launch()
const page = await browser.newPage()

// Seed UUIDs from src/shared/api/mocks/auctions.ts. The detail page renders
// the cargo_num in the h1, so we assert against that rather than the raw UUID.
const DOWN_LEADING_UUID = '00000000-0000-4000-8000-000000000001'
// finishedConfirmed seed pins trading.hide_bets_history = true.
const FINISHED_HIDDEN_BETS_UUID = '00000000-0000-4000-8000-000000000006'
// requestWinner seed pins trading.can_set_bet = false (auction is finished).
const REQUEST_WINNER_UUID = '00000000-0000-4000-8000-000000000004'

const cases = [
  { path: '/', expect: { url: '/auctions', h1: 'Аукционы' } },
  { path: '/auctions', expect: { url: '/auctions', h1: 'Аукционы' } },
  {
    path: `/auctions/${DOWN_LEADING_UUID}`,
    expect: { url: `/auctions/${DOWN_LEADING_UUID}`, h1: 'Аукцион № MSK-001', section: 'Маршрут' },
  },
  // Unknown UUID surfaces the in-page error card with an h1 and an alert.
  {
    path: '/auctions/abc-123',
    expect: {
      url: '/auctions/abc-123',
      h1: 'Аукцион недоступен',
      alert: 'Не удалось загрузить аукцион',
    },
  },
  // Bets page renders the list when hide_bets_history=false.
  {
    path: `/auctions/${DOWN_LEADING_UUID}/bets`,
    expect: { url: `/auctions/${DOWN_LEADING_UUID}/bets`, h1: 'История ставок' },
  },
  // Bets page shows the restricted card when hide_bets_history=true; bets endpoint not requested.
  {
    path: `/auctions/${FINISHED_HIDDEN_BETS_UUID}/bets`,
    expect: {
      url: `/auctions/${FINISHED_HIDDEN_BETS_UUID}/bets`,
      h1: 'История ставок',
      alert: 'История скрыта',
    },
  },
  // Bet form opens with an h1 and a price input when can_set_bet=true.
  {
    path: `/auctions/${DOWN_LEADING_UUID}/bet`,
    expect: {
      url: `/auctions/${DOWN_LEADING_UUID}/bet`,
      h1: 'Ставка по аукциону',
      section: 'Цена',
    },
  },
  // Bet form is gated when can_set_bet=false — restricted card replaces the form.
  {
    path: `/auctions/${REQUEST_WINNER_UUID}/bet`,
    expect: {
      url: `/auctions/${REQUEST_WINNER_UUID}/bet`,
      h1: 'Ставка недоступна',
      alert: 'Нельзя поставить ставку',
    },
  },
  // Unknown UUID on the bet route surfaces the detail-driven error card.
  {
    path: '/auctions/abc-123/bet',
    expect: {
      url: '/auctions/abc-123/bet',
      h1: 'Аукцион недоступен',
      alert: 'Не удалось загрузить',
    },
  },
  { path: '/totally/unknown', expect: { h1: 'Page not found' } },
]

let failed = 0
for (const c of cases) {
  await page.goto(BASE + c.path, { waitUntil: 'networkidle' })
  const url = page.url().replace(BASE, '')
  const h1 = ((await page.locator('h1').first().textContent()) ?? '').trim()
  let section = ''
  if (c.expect.section) {
    // Card titles render as <div data-slot="card-title">; look anywhere in body.
    const matches = await page
      .getByText(c.expect.section, { exact: false })
      .first()
      .textContent()
      .catch(() => '')
    section = (matches ?? '').trim()
  }
  let alert = ''
  if (c.expect.alert) {
    const alertLocator = page.locator('[role="alert"]').first()
    if (await alertLocator.count().catch(() => 0)) {
      alert = ((await alertLocator.textContent()) ?? '').trim()
    }
  }
  const okUrl = !c.expect.url || url === c.expect.url
  const okH1 = !c.expect.h1 || h1.includes(c.expect.h1)
  const okSection = !c.expect.section || section.includes(c.expect.section)
  const okAlert = !c.expect.alert || alert.includes(c.expect.alert)
  const status = okUrl && okH1 && okSection && okAlert ? 'OK  ' : 'FAIL'
  if (status === 'FAIL') {
    failed++
  }
  const extras = [
    c.expect.section ? `section="${section}"` : '',
    c.expect.alert ? `alert="${alert.slice(0, 40)}…"` : '',
  ]
    .filter(Boolean)
    .join(' ')
  console.log(`${status} ${c.path.padEnd(48)} -> url=${url} h1="${h1}" ${extras}`.trimEnd())
}

await browser.close()
process.exit(failed === 0 ? 0 : 1)
