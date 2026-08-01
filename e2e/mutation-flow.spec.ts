import { expect, test } from '@playwright/test'

// downLeading seed: can_set_bet=true, initial current=45000, step=500, min=40000.
// Placing 44000 makes the user Leading at the new lower price.
const DOWN_LEADING_UUID = '00000000-0000-4000-8000-000000000001'
const PLACED_PRICE = 44000

// formatPrice uses NBSP (U+00A0) as the thousands separator; build a regex
// that tolerates either NBSP or a plain space so the assertion is robust.
function priceRegex(value: number): RegExp {
  return new RegExp(String(value).split('').join('[\\s\\u00A0]?'))
}

test.describe('bet mutation flow — cross-screen consistency', () => {
  test('places a bet and reflects the new leading price on bets / detail / list', async ({
    page,
  }) => {
    await page.goto(`/auctions/${DOWN_LEADING_UUID}/bet`)
    await expect(page.locator('h1')).toHaveText('Ставка по аукциону')

    await page.locator('#bet-price').fill(String(PLACED_PRICE))
    await page.getByRole('button', { name: 'Сделать ставку' }).click()

    // Successful submit navigates to the bets history page.
    await expect(page.locator('h1')).toHaveText('История ставок')
    await expect(page.locator('body')).toContainText(priceRegex(PLACED_PRICE))

    // SPA-navigate to detail via the in-page BackLink. A full page.goto would
    // reset MSW runtime state and lose the placed bet; staying inside the SPA
    // preserves it.
    await page.locator('a', { hasText: 'К аукциону' }).first().click()
    await expect(page.getByText('Текущая').first()).toBeVisible()
    await expect(page.locator('body')).toContainText(priceRegex(PLACED_PRICE))

    // SPA-navigate to the list via the detail BackLink.
    await page.locator('a', { hasText: 'К списку аукционов' }).first().click()
    await expect(page.locator('article').first()).toBeVisible()

    const card = page.locator('article').filter({ hasText: 'MSK-001' }).first()
    await expect(card).toContainText(priceRegex(PLACED_PRICE))
  })
})
