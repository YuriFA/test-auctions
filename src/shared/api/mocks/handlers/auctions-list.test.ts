import { setupServer } from 'msw/node'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { resetMockRuntime } from '../runtime/store'
import { mockHandlers } from './index'

const TOTAL_AUCTIONS = 34 // 10 seeds + 24 fillers
const DEFAULT_PER_PAGE = 12

const server = setupServer(...mockHandlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
beforeEach(() => resetMockRuntime())

const BASE = 'http://localhost'

interface ListItem {
  main?: { order_uid?: string; auc_type?: string; created_at?: string }
  route?: {
    load?: { date?: string; city?: string }
    unload?: { date?: string; city?: string }
  }
}

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
      data?: ListItem[]
      meta?: {
        total?: number
        per_page?: number
        current_page?: number
        from?: number
        to?: number
        last_page?: number
      }
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

  // NOTE: routing identity is `order_uid` only; the auctionUuid→OpenAPI path
  // translation lives in the adapter resolver, not in the list contract. Fires
  // if someone reintroduces a made-up `main.auction_uuid` on list items.
  it('does not surface an invented main.auction_uuid on list items', async () => {
    const { json } = await postList()
    expect(json?.data?.length).toBeGreaterThan(0)
    for (const item of json?.data ?? []) {
      expect(item?.main).not.toHaveProperty('auction_uuid')
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
    expect(json?.meta?.total ?? 0).toBeGreaterThan(0)
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

  it('load_date_from excludes auctions whose load date is before the threshold', async () => {
    // downLeading load date: 2026-08-12T09:00:00+03:00
    // finishedConfirmed load date: 2026-07-05T06:00:00+04:00 (earlier)
    // Setting from = 2026-08-01T00:00:00+00:00 should exclude finishedConfirmed
    const { status, json } = await postList({ load_date_from: '2026-08-01T00:00:00+00:00' })
    expect(status).toBe(200)
    const orderUids = (json?.data ?? []).map((item) => item.main?.order_uid)
    expect(orderUids).not.toContain('3a05d04a-0e67-4f85-b20a-de81d18bba7a') // finishedConfirmed
    expect(orderUids).toContain('3a05d045-0e67-4f85-b20a-de81d18bba7a') // downLeading (Aug 12)
  })

  it('load_date_to excludes auctions whose load date is after the threshold', async () => {
    // finishedConfirmed load date: 2026-07-05T06:00:00+04:00 (earlier)
    // downLeading load date: 2026-08-12T09:00:00+03:00 (later, should be excluded)
    const { status, json } = await postList({ load_date_to: '2026-07-31T23:59:59+00:00' })
    expect(status).toBe(200)
    const orderUids = (json?.data ?? []).map((item) => item.main?.order_uid)
    expect(orderUids).not.toContain('3a05d045-0e67-4f85-b20a-de81d18bba7a') // downLeading (Aug 12)
    expect(orderUids).toContain('3a05d04a-0e67-4f85-b20a-de81d18bba7a') // finishedConfirmed (Jul 5)
  })

  it('load_date_from + load_date_to together narrow correctly', async () => {
    // Only auctions loading between Aug 10 and Aug 14 UTC
    const { status, json } = await postList({
      load_date_from: '2026-08-10T00:00:00+00:00',
      load_date_to: '2026-08-14T23:59:59+00:00',
    })
    expect(status).toBe(200)
    const orderUids = (json?.data ?? []).map((item) => item.main?.order_uid)
    expect(orderUids).toContain('3a05d045-0e67-4f85-b20a-de81d18bba7a') // downLeading Aug 12
    expect(orderUids).not.toContain('3a05d046-0e67-4f85-b20a-de81d18bba7a') // upLosing Aug 15
    expect(orderUids).not.toContain('3a05d04a-0e67-4f85-b20a-de81d18bba7a') // finishedConfirmed Jul 5
  })

  it('returned load dates satisfy the requested load_date_from constraint', async () => {
    const threshold = '2026-08-01T00:00:00+00:00'
    const thresholdMs = new Date(threshold).getTime()
    const { status, json } = await postList({ load_date_from: threshold })
    expect(status).toBe(200)
    for (const item of json?.data ?? []) {
      const loadDate = item.route?.load?.date
      if (loadDate) {
        expect(new Date(loadDate).getTime()).toBeGreaterThanOrEqual(thresholdMs)
      }
    }
  })
})
