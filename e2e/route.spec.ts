import { test, expect } from '@playwright/test'

// Seed UUIDs from src/shared/api/mocks/auctions.ts.
const DOWN_LEADING_UUID = '00000000-0000-4000-8000-000000000001'
// finishedConfirmed seed pins trading.hide_bets_history = true.
const FINISHED_HIDDEN_BETS_UUID = '00000000-0000-4000-8000-000000000006'
// requestWinner seed pins trading.can_set_bet = false (auction is finished).
const REQUEST_WINNER_UUID = '00000000-0000-4000-8000-000000000004'

// NOTE: the auction-detail and bet-form pages render a STATIC page-title h1
// ("Аукцион" / "Ставка по аукциону") regardless of state — error and
// restriction messaging lives in an Alert (role="alert"), not the h1.
// `expect(locator).toContainText()` auto-waits, so no manual networkidle
// dance is needed.

test.describe('routes', () => {
  test('home page renders the list header', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toHaveText('Аукционы')
  })

  test('auction detail happy path renders content for the right auction', async ({ page }) => {
    await page.goto(`/auctions/${DOWN_LEADING_UUID}`)
    await expect(page).toHaveURL(`/auctions/${DOWN_LEADING_UUID}`)
    await expect(page.locator('h1')).toHaveText('Аукцион')
    // cargo_num lives in a <span>, not the h1 — verify it via body text.
    await expect(page.getByText('MSK-001', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('Маршрут', { exact: false }).first()).toBeVisible()
  })

  test('unknown auction UUID shows the error alert', async ({ page }) => {
    await page.goto('/auctions/abc-123')
    await expect(page).toHaveURL('/auctions/abc-123')
    await expect(page.locator('h1')).toHaveText('Аукцион')
    await expect(page.locator('[role="alert"]')).toContainText('Не удалось загрузить аукцион')
  })

  test('bets history renders the list when not hidden', async ({ page }) => {
    await page.goto(`/auctions/${DOWN_LEADING_UUID}/bets`)
    await expect(page).toHaveURL(`/auctions/${DOWN_LEADING_UUID}/bets`)
    await expect(page.locator('h1')).toHaveText('История ставок')
  })

  test('bets history shows the restricted alert when hidden', async ({ page }) => {
    await page.goto(`/auctions/${FINISHED_HIDDEN_BETS_UUID}/bets`)
    await expect(page).toHaveURL(`/auctions/${FINISHED_HIDDEN_BETS_UUID}/bets`)
    await expect(page.locator('h1')).toHaveText('История ставок')
    await expect(page.locator('[role="alert"]')).toContainText('История скрыта')
  })

  test('bet form opens with the price card when betting is allowed', async ({ page }) => {
    await page.goto(`/auctions/${DOWN_LEADING_UUID}/bet`)
    await expect(page).toHaveURL(`/auctions/${DOWN_LEADING_UUID}/bet`)
    await expect(page.locator('h1')).toHaveText('Ставка по аукциону')
    await expect(page.getByText('Цена', { exact: false }).first()).toBeVisible()
  })

  test('bet form is gated when can_set_bet=false', async ({ page }) => {
    await page.goto(`/auctions/${REQUEST_WINNER_UUID}/bet`)
    await expect(page).toHaveURL(`/auctions/${REQUEST_WINNER_UUID}/bet`)
    await expect(page.locator('h1')).toHaveText('Ставка по аукциону')
    await expect(page.locator('[role="alert"]')).toContainText('Нельзя сделать ставку')
  })

  test('unknown UUID on the bet route shows the error alert', async ({ page }) => {
    await page.goto('/auctions/abc-123/bet')
    await expect(page).toHaveURL('/auctions/abc-123/bet')
    await expect(page.locator('h1')).toHaveText('Ставка по аукциону')
    await expect(page.locator('[role="alert"]')).toContainText('Аукцион недоступен')
  })

  test('unknown route shows the global not-found page', async ({ page }) => {
    await page.goto('/totally/unknown')
    await expect(page.locator('h1')).toHaveText('Page not found')
  })
})
