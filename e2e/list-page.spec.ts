import { expect, test } from '@playwright/test'

test.describe('auctions list page', () => {
  test('renders the header and at least one auction card', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveText('Аукционы')
    await expect(page.locator('a[href^="/auctions/0"]').first()).toBeVisible()
  })

  test('hovering a card triggers a detail prefetch GET', async ({ page }) => {
    await page.goto('/')

    // Set up the request waiter before the hover so the listener is in place
    // before the hover event fires the prefetch.
    const detailRequest = page.waitForRequest(
      (req) => req.method() === 'GET' && /\/api\/v1\/auctions\/[0-9a-f-]+$/.test(req.url()),
      { timeout: 5000 },
    )
    await page.locator('a[href^="/auctions/0"]').first().hover()
    await detailRequest
  })

  test('clicking a card body navigates to the detail route', async ({ page }) => {
    await page.goto('/')

    // Stretched-link ::after overlay covers the whole <article>; click the
    // top-left so the action button is not the target.
    await page.locator('article').first().click({ position: { x: 30, y: 30 } })
    await expect(page).toHaveURL(/\/auctions\/[0-9a-f-]+$/)
  })

  test('pagination writes the page param to the URL and re-requests the list', async ({ page }) => {
    await page.goto('/')

    // base-ui Button forces role="button" onto the underlying element even
    // when `nativeButton={false}` renders an `<a>`. The Previous/Next controls
    // carry aria-labels identifying direction.
    const nextButton = page.getByRole('button', { name: 'Go to next page' })
    await expect(nextButton).toBeVisible()

    const listRequest = page.waitForRequest(
      (req) => req.method() === 'POST' && req.url().endsWith('/auctions/list'),
    )
    await nextButton.click()
    await listRequest
    await expect(page).toHaveURL(/page=/)
  })
})
