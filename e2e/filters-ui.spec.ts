import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 1280, height: 900 } })

// Selectors here are semantic (role + accessible name) rather than DOM-structural
// so they survive shadcn/base-ui internals changes — see SDD-040.
test.describe('filters UI — desktop', () => {
  test('header search commits to URL on blur and does not bump the filter counter', async ({
    page,
  }) => {
    await page.goto('/')

    const headerSearch = page.getByPlaceholder(/номеру заявки/i).first()
    await expect(headerSearch).toBeVisible()

    await headerSearch.fill('12345')
    await headerSearch.blur()
    await expect(page).toHaveURL(/cargo_num=12345/)

    const trigger = page.getByRole('button', { name: /^Фильтры$/ })
    await expect(trigger).toHaveText(/^Фильтры$/)
  })

  test('filter sheet opens, drafts checkboxes, applies, and closes', async ({ page }) => {
    await page.goto('/')

    const trigger = page.getByRole('button', { name: /^Фильтры$/ })
    const dialog = page.getByRole('dialog')

    // No dialog before opening.
    await expect(dialog).toBeHidden()

    await trigger.click()
    await expect(dialog).toBeVisible()

    // Toggle a checkbox — it stays as a draft until Apply.
    const downCheckbox = page.getByRole('checkbox', { name: /На понижение/ })
    await downCheckbox.check()
    await expect(page).not.toHaveURL(/auc_type/)

    // Apply commits to URL, bumps the counter, and closes the sheet.
    await page.getByRole('button', { name: 'Применить' }).click()
    await expect(page).toHaveURL(/auc_type=Down/)
    await expect(trigger).toContainText('1')
    await expect(dialog).toBeHidden()
  })

  test('sheet closes on backdrop click', async ({ page }) => {
    await page.goto('/')

    const trigger = page.getByRole('button', { name: /^Фильтры$/ })
    const dialog = page.getByRole('dialog')

    await trigger.click()
    await expect(dialog).toBeVisible()

    // Click outside the dialog — the only place not covered by it is the
    // backdrop layer between viewport edge and dialog bounds.
    await page.mouse.click(8, 8)
    await expect(dialog).toBeHidden()
  })

  test('sheet closes on the X button', async ({ page }) => {
    await page.goto('/')

    const trigger = page.getByRole('button', { name: /^Фильтры$/ })
    const dialog = page.getByRole('dialog')

    await trigger.click()
    await expect(dialog).toBeVisible()

    await page.getByRole('button', { name: 'Закрыть' }).click()
    await expect(dialog).toBeHidden()
  })
})

test.describe('filters UI — mobile', () => {
  test.use({ viewport: { width: 375, height: 800 } })

  test('filter trigger is visible and opens the sheet', async ({ page }) => {
    await page.goto('/')

    const trigger = page.getByRole('button', { name: /^Фильтры$/ })
    await expect(trigger).toBeVisible()
    await trigger.click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})
