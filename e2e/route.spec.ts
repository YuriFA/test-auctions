import { test, expect } from '@playwright/test'

// Seed order_uid values from src/shared/api/mocks/auctions.ts.
const DOWN_LEADING_REF = '3a05d045-0e67-4f85-b20a-de81d18bba7a'
// finishedConfirmed seed pins trading.hide_bets_history = true.
const FINISHED_HIDDEN_BETS_REF = '3a05d04a-0e67-4f85-b20a-de81d18bba7a'
// requestWinner seed pins trading.can_set_bet = false (auction is finished).
const REQUEST_WINNER_REF = '3a05d048-0e67-4f85-b20a-de81d18bba7a'

// NOTE: route loader throws on unknown auction ref → TanStack Router renders
// the root errorComponent (RootError), replacing the page shell, so the
// static h1 is absent and the error surfaces only in the Alert (role="alert").
// `expect(locator).toContainText()` auto-waits, so no manual networkidle
// dance is needed.

test.describe('routes', () => {
  test('home page renders the list header', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toHaveText('Аукционы')
  })

  test('auction detail happy path renders content for the right auction', async ({ page }) => {
    await page.goto(`/auctions/${DOWN_LEADING_REF}`)
    await expect(page).toHaveURL(`/auctions/${DOWN_LEADING_REF}`)
    await expect(page.locator('h1')).toHaveText('Аукцион')
    // cargo_num lives in a <span>, not the h1 — verify it via body text.
    await expect(page.getByText('MSK-001', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('Маршрут', { exact: false }).first()).toBeVisible()
  })

  test('unknown auction UUID shows the error alert', async ({ page }) => {
    await page.goto('/auctions/abc-123')
    await expect(page).toHaveURL('/auctions/abc-123')
    await expect(page.locator('[role="alert"]')).toContainText('Произошла ошибка')
  })

  test('bets history renders the list when not hidden', async ({ page }) => {
    await page.goto(`/auctions/${DOWN_LEADING_REF}/bets`)
    await expect(page).toHaveURL(`/auctions/${DOWN_LEADING_REF}/bets`)
    await expect(page.locator('h1')).toHaveText('История ставок')
  })

  test('bets history shows the restricted alert when hidden', async ({ page }) => {
    await page.goto(`/auctions/${FINISHED_HIDDEN_BETS_REF}/bets`)
    await expect(page).toHaveURL(`/auctions/${FINISHED_HIDDEN_BETS_REF}/bets`)
    await expect(page.locator('h1')).toHaveText('История ставок')
    await expect(page.locator('[role="alert"]')).toContainText('История скрыта')
  })

  test('bet form opens with the price card when betting is allowed', async ({ page }) => {
    await page.goto(`/auctions/${DOWN_LEADING_REF}/bet`)
    await expect(page).toHaveURL(`/auctions/${DOWN_LEADING_REF}/bet`)
    await expect(page.locator('h1')).toHaveText('Ставка по аукциону')
    await expect(page.getByText('Цена', { exact: false }).first()).toBeVisible()
  })

  test('bet form is gated when can_set_bet=false', async ({ page }) => {
    await page.goto(`/auctions/${REQUEST_WINNER_REF}/bet`)
    await expect(page).toHaveURL(`/auctions/${REQUEST_WINNER_REF}/bet`)
    await expect(page.locator('h1')).toHaveText('Ставка по аукциону')
    await expect(page.locator('[role="alert"]')).toContainText('Нельзя сделать ставку')
  })

  test('unknown UUID on the bet route shows the error alert', async ({ page }) => {
    await page.goto('/auctions/abc-123/bet')
    await expect(page).toHaveURL('/auctions/abc-123/bet')
    await expect(page.locator('[role="alert"]')).toContainText('Произошла ошибка')
  })

  test('unknown route shows the global not-found page', async ({ page }) => {
    await page.goto('/totally/unknown')
    await expect(page.locator('h1')).toHaveText('Страница не найдена')
  })
})
