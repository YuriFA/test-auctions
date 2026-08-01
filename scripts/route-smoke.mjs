import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE ?? 'http://localhost:5175'
const browser = await chromium.launch()
const page = await browser.newPage()

// Seed UUIDs from src/shared/api/mocks/auctions.ts.
const DOWN_LEADING_UUID = '00000000-0000-4000-8000-000000000001'
// finishedConfirmed seed pins trading.hide_bets_history = true.
const FINISHED_HIDDEN_BETS_UUID = '00000000-0000-4000-8000-000000000006'
// requestWinner seed pins trading.can_set_bet = false (auction is finished).
const REQUEST_WINNER_UUID = '00000000-0000-4000-8000-000000000004'

// NOTE: the auction-detail and bet-form pages render a STATIC page-title h1
// ("Аукцион" / "Ставка по аукциону") regardless of state — error and
// restriction messaging lives in an Alert (role="alert"), not the h1. So we
// pin the static h1, verify state via alert text, and when we need to confirm
// a specific auction loaded we check `bodyIncl` (e.g. cargo_num) instead of
// the h1.
//
// `waitUntil: 'networkidle'` fires the instant the fetch response lands, but
// React Query still needs another render tick to swap the skeleton for the
// error/content UI — so each conditional check waits for its own element
// rather than trusting networkidle alone.
const cases = [
  { path: '/', expect: { url: '/', h1: 'Аукционы' } },
  {
    path: `/auctions/${DOWN_LEADING_UUID}`,
    expect: {
      url: `/auctions/${DOWN_LEADING_UUID}`,
      h1: 'Аукцион',
      bodyIncl: 'MSK-001',
      section: 'Маршрут',
    },
  },
  // Unknown UUID — the detail route renders the static h1 plus an ErrorAlert
  // with role="alert" whose title is "Не удалось загрузить аукцион".
  {
    path: '/auctions/abc-123',
    expect: {
      url: '/auctions/abc-123',
      h1: 'Аукцион',
      alert: 'Не удалось загрузить аукцион',
    },
  },
  // Bets page renders the list when hide_bets_history=false.
  {
    path: `/auctions/${DOWN_LEADING_UUID}/bets`,
    expect: { url: `/auctions/${DOWN_LEADING_UUID}/bets`, h1: 'История ставок' },
  },
  // Bets page shows the restricted alert when hide_bets_history=true.
  {
    path: `/auctions/${FINISHED_HIDDEN_BETS_UUID}/bets`,
    expect: {
      url: `/auctions/${FINISHED_HIDDEN_BETS_UUID}/bets`,
      h1: 'История ставок',
      alert: 'История скрыта',
    },
  },
  // Bet form opens with the price card when can_set_bet=true.
  {
    path: `/auctions/${DOWN_LEADING_UUID}/bet`,
    expect: {
      url: `/auctions/${DOWN_LEADING_UUID}/bet`,
      h1: 'Ставка по аукциону',
      section: 'Цена',
    },
  },
  // Bet form gated by can_set_bet=false — the Alert title is
  // "Нельзя поставить ставку" (h1 stays static).
  {
    path: `/auctions/${REQUEST_WINNER_UUID}/bet`,
    expect: {
      url: `/auctions/${REQUEST_WINNER_UUID}/bet`,
      h1: 'Ставка по аукциону',
      alert: 'Нельзя поставить ставку',
    },
  },
  // Unknown UUID on the bet route — ErrorAlert title is "Аукцион недоступен".
  {
    path: '/auctions/abc-123/bet',
    expect: {
      url: '/auctions/abc-123/bet',
      h1: 'Ставка по аукциону',
      alert: 'Аукцион недоступен',
    },
  },
  { path: '/totally/unknown', expect: { h1: 'Page not found' } },
]

const WAIT_TIMEOUT_MS = 5000

let failed = 0
for (const c of cases) {
  await page.goto(BASE + c.path, { waitUntil: 'networkidle' })

  // h1 is always present after first render; wait for it as a baseline.
  await page.locator('h1').first().waitFor({ timeout: WAIT_TIMEOUT_MS })

  // Conditional waits — these elements appear only after React Query resolves,
  // which can be a tick after networkidle.
  if (c.expect.alert) {
    await page.locator('[role="alert"]').first().waitFor({ timeout: WAIT_TIMEOUT_MS })
  }
  if (c.expect.section) {
    await page
      .getByText(c.expect.section, { exact: false })
      .first()
      .waitFor({ timeout: WAIT_TIMEOUT_MS })
  }

  const url = page.url().replace(BASE, '')
  const h1 = ((await page.locator('h1').first().textContent()) ?? '').trim()
  const bodyText = c.expect.bodyIncl ? await page.locator('body').innerText() : ''

  let section = ''
  if (c.expect.section) {
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
  const okBodyIncl = !c.expect.bodyIncl || bodyText.includes(c.expect.bodyIncl)
  const status = okUrl && okH1 && okSection && okAlert && okBodyIncl ? 'OK  ' : 'FAIL'
  if (status === 'FAIL') {
    failed++
  }
  const extras = [
    c.expect.section ? `section="${section.slice(0, 40)}"` : '',
    c.expect.alert ? `alert="${alert.slice(0, 40)}…"` : '',
    c.expect.bodyIncl ? `bodyIncl=${okBodyIncl ? 'ok' : 'MISS'}` : '',
  ]
    .filter(Boolean)
    .join(' ')
  console.log(`${status} ${c.path.padEnd(48)} -> url=${url} h1="${h1}" ${extras}`.trimEnd())
}

await browser.close()
process.exit(failed === 0 ? 0 : 1)
