import { expect, test } from '@playwright/test'

// downLeading seed pins trading.price.step = 500, available = 44500.
const DOWN_LEADING_UUID = '00000000-0000-4000-8000-000000000001'
const EXPECTED_STEP = 500
const EXPECTED_AVAILABLE = 44500

test.describe('bet form stepper', () => {
  test('+/- buttons move the input by one step', async ({ page }) => {
    await page.goto(`/auctions/${DOWN_LEADING_UUID}/bet`)

    const plusBtn = page.getByRole('button', { name: 'Увеличить на шаг' })
    const minusBtn = page.getByRole('button', { name: 'Уменьшить на шаг' })
    await expect(plusBtn).toBeVisible()
    await expect(minusBtn).toBeVisible()

    // Step hint is rendered as part of the card description.
    await expect(page.getByText(/шаг 500/, { exact: false }).first()).toBeVisible()

    const input = page.locator('#bet-price')
    await input.fill('')

    // First + seeds from `available` and snaps up to the next aligned step
    // (44500 + 500 = 45000).
    await plusBtn.click()
    await expect(input).toHaveValue(String(EXPECTED_AVAILABLE + EXPECTED_STEP))

    // Second + moves up one more step.
    const afterFirstPlus = await input.inputValue()
    await plusBtn.click()
    await expect(input).toHaveValue(String(Number(afterFirstPlus) + EXPECTED_STEP))

    // One - click walks back one step.
    await minusBtn.click()
    await expect(input).toHaveValue(afterFirstPlus)

    await expect(page.getByRole('button', { name: 'Поставить ставку' })).toBeEnabled()
  })
})
