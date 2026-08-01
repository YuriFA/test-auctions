import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 1280, height: 900 } })

test.describe('filters UI — desktop', () => {
  test('header search commits to URL on blur and does not bump the filter counter', async ({
    page,
  }) => {
    await page.goto('/')

    const headerSearch = page.locator('input[placeholder*="номеру заявки"]').first()
    await expect(headerSearch).toBeVisible()

    await headerSearch.fill('12345')
    await headerSearch.blur()
    await expect(page).toHaveURL(/cargo_num=12345/)

    const trigger = page.getByRole('button', { name: /Фильтры/ }).first()
    await expect(trigger).toHaveText(/^Фильтры$/)
  })

  test('filter sheet opens, drafts checkboxes, applies, and closes', async ({ page }) => {
    await page.goto('/')

    // No filter panel rendered before opening.
    await expect(page.locator('fieldset > legend')).toHaveCount(0)

    const trigger = page.getByRole('button', { name: /Фильтры/ }).first()
    await trigger.click()

    // Sections render in the sheet.
    const legends = page.locator('fieldset > legend')
    expect(await legends.count()).toBeGreaterThanOrEqual(6)

    // Toggle a checkbox — it stays as a draft until Apply.
    const downField = page
      .locator('[data-slot="field"]')
      .filter({ has: page.locator('label', { hasText: 'На понижение' }) })
      .first()
    await downField.locator('[data-slot="checkbox"]').click()
    await expect(page).not.toHaveURL(/auc_type/)

    // Apply commits to URL, bumps the counter, and closes the sheet.
    await page.getByRole('button', { name: 'Применить' }).first().click()
    await expect(page).toHaveURL(/auc_type=Down/)
    await expect(trigger).toContainText('1')
    await expect(page.locator('fieldset > legend')).toHaveCount(0)
  })

  test('sheet closes on backdrop click', async ({ page }) => {
    await page.goto('/')

    const trigger = page.getByRole('button', { name: /Фильтры/ }).first()
    await trigger.click()
    await expect(page.locator('fieldset > legend')).not.toHaveCount(0)

    await page.locator('[data-slot="sheet-overlay"]').first().click()
    await expect(page.locator('fieldset > legend')).toHaveCount(0)
  })

  test('sheet closes on the X button', async ({ page }) => {
    await page.goto('/')

    const trigger = page.getByRole('button', { name: /Фильтры/ }).first()
    await trigger.click()
    await expect(page.locator('fieldset > legend')).not.toHaveCount(0)

    await page.locator('[data-slot="sheet-close"]').first().click()
    await expect(page.locator('fieldset > legend')).toHaveCount(0)
  })
})

test.describe('filters UI — mobile', () => {
  test.use({ viewport: { width: 375, height: 800 } })

  test('filter trigger is visible and opens the sheet', async ({ page }) => {
    await page.goto('/')

    const trigger = page.getByRole('button', { name: /Фильтры/ }).first()
    await expect(trigger).toBeVisible()
    await trigger.click()
    expect(await page.locator('fieldset > legend').count()).toBeGreaterThanOrEqual(6)
  })
})
