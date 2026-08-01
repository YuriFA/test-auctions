import { expect, test } from '@playwright/test'

// Keep in sync with src/shared/api/mocks/runtime/store.ts (10 seeds + 24 fillers).
const TOTAL_AUCTIONS = 34

test.describe('MSW worker (browser)', () => {
  test('intercepts SDK-shaped fetches and returns the mock list shape', async ({ page }) => {
    // Wait for the MSW worker to log "Mocking enabled" before issuing the
    // test request — otherwise the live fetch falls through to the dev server
    // and 404s.
    const mswReady = page.waitForEvent('console', {
      predicate: (msg) =>
        msg.text().includes('Mocking enabled') || msg.text().includes('[MSW] Mocking'),
      timeout: 5000,
    })

    await page.goto('/')
    await mswReady

    const result = await page.evaluate(async () => {
      const res = await fetch('/api/v1/auctions/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ per_page: 2 }),
      })
      const json = (await res.json()) as {
        data?: Array<{ main?: { auction_uuid?: string } }>
        meta?: { total?: number; per_page?: number }
      }
      return { status: res.status, json }
    })

    expect(result.status).toBe(200)
    expect(result.json?.data?.length).toBe(2)
    expect(result.json?.meta?.total).toBe(TOTAL_AUCTIONS)
    expect(result.json?.meta?.per_page).toBe(2)
    expect(typeof result.json?.data?.[0]?.main?.auction_uuid).toBe('string')
  })
})
