import { setupServer } from 'msw/node'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { mockHandlers } from './index'

// Keep in sync with src/shared/api/mocks/runtime/store.ts.
const TOTAL_AUCTIONS = 34 // 10 seeds + 24 fillers
const DEFAULT_PER_PAGE = 12

const server = setupServer(...mockHandlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

const BASE = 'http://localhost'

async function postList(body?: unknown) {
  const init =
    body === undefined
      ? { method: 'POST' }
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: typeof body === 'string' ? body : JSON.stringify(body),
        }
  const res = await fetch(`${BASE}/api/v1/auctions/list`, init)
  const text = await res.text()
  const json = text ? (JSON.parse(text) as unknown) : null
  return {
    status: res.status,
    contentType: res.headers.get('content-type'),
    json: json as {
      data?: Array<{ main?: { order_uid?: string; auc_type?: string } }>
      meta?: { total?: number; per_page?: number; current_page?: number; from?: number; to?: number; last_page?: number }
    } | null,
  }
}

describe('POST /auctions/list — MSW handler', () => {
  it('returns the first page of the combined dataset with coherent meta', async () => {
    const { status, json } = await postList()
    expect(status).toBe(200)
    expect(json?.meta?.total).toBe(TOTAL_AUCTIONS)
    expect(json?.data).toHaveLength(DEFAULT_PER_PAGE)
    expect(json?.meta?.current_page).toBe(1)
    expect(json?.meta?.from).toBe(1)
    expect(json?.meta?.to).toBe(DEFAULT_PER_PAGE)
    expect(json?.meta?.last_page).toBe(Math.ceil(TOTAL_AUCTIONS / DEFAULT_PER_PAGE))
  })

  it('paginates by per_page + page with correct from/to/last_page', async () => {
    const { status, json } = await postList({ per_page: 3, page: 2 })
    expect(status).toBe(200)
    expect(json?.data).toHaveLength(3)
    expect(json?.meta?.total).toBe(TOTAL_AUCTIONS)
    expect(json?.meta?.current_page).toBe(2)
    expect(json?.meta?.from).toBe(4)
    expect(json?.meta?.to).toBe(6)
    expect(json?.meta?.last_page).toBe(Math.ceil(TOTAL_AUCTIONS / 3))
    expect(json?.meta?.per_page).toBe(3)
  })

  it('returns an empty page with from=0, to=0 when page is beyond last_page', async () => {
    const { status, json } = await postList({ per_page: 3, page: 50 })
    expect(status).toBe(200)
    expect(json?.data).toHaveLength(0)
    expect(json?.meta?.from).toBe(0)
    expect(json?.meta?.to).toBe(0)
    expect(json?.meta?.total).toBe(TOTAL_AUCTIONS)
  })

  it('returns order_uid on every list item', async () => {
    const { json } = await postList()
    for (const item of json?.data ?? []) {
      expect(typeof item?.main?.order_uid).toBe('string')
    }
  })

  it('narrows by auc_type filter and includes the expected seed', async () => {
    const { status, json } = await postList({ auc_type: ['Down'] })
    expect(status).toBe(200)
    for (const item of json?.data ?? []) {
      expect(item?.main?.auc_type).toBe('Down')
    }
    const refs = (json?.data ?? []).map((item) => item?.main?.order_uid)
    expect(refs).toContain('3a05d045-0e67-4f85-b20a-de81d18bba7a')
    expect((json?.meta?.total ?? 0)).toBeGreaterThan(0)
  })

  it('returns the single expected record for a cargo_num filter', async () => {
    const { status, json } = await postList({ cargo_num: 'MSK-001' })
    expect(status).toBe(200)
    expect(json?.meta?.total).toBe(1)
    expect(json?.data?.[0]?.main?.order_uid).toBe('3a05d045-0e67-4f85-b20a-de81d18bba7a')
  })

  it('rejects malformed JSON body with a 422 ValidationProblem', async () => {
    const { status, contentType, json } = await postList('{not-json')
    expect(status).toBe(422)
    expect(contentType).toBe('application/problem+json')
    expect((json as { code?: string })?.code).toBe('validation_failed')
    expect(Array.isArray((json as { errors?: unknown[] })?.errors)).toBe(true)
  })

  it('flips sort order between is_oldest true and false', async () => {
    const newest = await postList({ is_oldest: false })
    const oldest = await postList({ is_oldest: true })
    const newestFirst = newest.json?.data?.[0]?.main?.order_uid
    const oldestFirst = oldest.json?.data?.[0]?.main?.order_uid
    expect(newestFirst).not.toBe(oldestFirst)
  })
})
