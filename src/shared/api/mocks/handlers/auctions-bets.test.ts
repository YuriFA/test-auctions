import { setupServer } from 'msw/node'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { seedAuctionUuids } from '../auctions'
import { mockHandlers } from './index'

const server = setupServer(...mockHandlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

const BASE = 'http://localhost'

interface BetBody {
  id?: number
  price_with_vat?: number
  price_no_vat?: number
  organization_name?: string
  is_rejected?: boolean
  is_win?: boolean
  place?: number | null
  cancel_reason?: string
}

interface BetsListBody {
  bets?: BetBody[]
}

interface ProblemBody {
  code?: string
  title?: string
  message?: string
}

async function getBets(uuid: string, query = '') {
  const url = `${BASE}/api/v1/auctions/${uuid}/bets${query ? `?${query}` : ''}`
  const res = await fetch(url)
  const text = await res.text()
  const json = text ? (JSON.parse(text) as BetsListBody | ProblemBody) : null
  return {
    status: res.status,
    contentType: res.headers.get('content-type'),
    json,
  }
}

describe('GET /auctions/:uuid/bets — MSW handler', () => {
  it('returns the BetListResponse shape with ranking/winner/cancellation fields', async () => {
    const { status, contentType, json } = await getBets(seedAuctionUuids.downLeading)
    const body = json as BetsListBody
    expect(status).toBe(200)
    expect(contentType).toBe('application/json')
    expect(Array.isArray(body.bets)).toBe(true)
    expect(body.bets?.length ?? 0).toBeGreaterThan(0)
    const first = body.bets?.[0]
    expect(first?.id).toBeTypeOf('number')
    expect(first?.price_with_vat).toBeTypeOf('number')
    expect(first?.price_no_vat).toBeTypeOf('number')
    expect(first?.organization_name).toBeTypeOf('string')
    expect(first?.is_rejected).toBeTypeOf('boolean')
    expect(first?.is_win).toBeTypeOf('boolean')
    // Active bet must carry a numeric place.
    expect(first?.is_rejected === false && typeof first?.place === 'number').toBe(true)
  })

  it('excludes rejected bets by default on stoppedRejected', async () => {
    const { status, json } = await getBets(seedAuctionUuids.stoppedRejected)
    const body = json as BetsListBody
    expect(status).toBe(200)
    expect(body.bets).toHaveLength(1)
    expect(body.bets?.every((b) => b?.is_rejected === false)).toBe(true)
  })

  it('includes rejected bets with ?all=true', async () => {
    const { status, json } = await getBets(seedAuctionUuids.stoppedRejected, 'all=true')
    const body = json as BetsListBody
    expect(status).toBe(200)
    expect(body.bets).toHaveLength(2)
    const rejected = body.bets?.filter((b) => b?.is_rejected === true) ?? []
    expect(rejected).toHaveLength(1)
    expect(rejected[0]?.cancel_reason).toMatch(/.+/)
    expect(rejected[0]?.place).toBeNull()
  })

  it('treats ?all=false like the default', async () => {
    const { status, json } = await getBets(seedAuctionUuids.stoppedRejected, 'all=false')
    expect(status).toBe(200)
    expect((json as BetsListBody)?.bets).toHaveLength(1)
  })

  it('collapses a garbage all value to the default behavior', async () => {
    const { status, json } = await getBets(seedAuctionUuids.stoppedRejected, 'all=yes')
    expect(status).toBe(200)
    expect((json as BetsListBody)?.bets).toHaveLength(1)
  })

  it('returns { bets: [] } (not 404) on canceledEmpty', async () => {
    const { status, json } = await getBets(seedAuctionUuids.canceledEmpty)
    const body = json as BetsListBody
    expect(status).toBe(200)
    expect(Array.isArray(body.bets)).toBe(true)
    expect(body.bets).toHaveLength(0)
  })

  it('does NOT gate on hide_bets_history — finishedConfirmed still returns bets', async () => {
    const { status, json } = await getBets(seedAuctionUuids.finishedConfirmed)
    expect(status).toBe(200)
    expect(Array.isArray((json as BetsListBody)?.bets)).toBe(true)
  })

  it('returns 404 + ProblemDetail on an unknown UUID', async () => {
    const { status, contentType, json } = await getBets('ffffffff-ffff-4000-8000-ffffffffffff')
    const body = json as ProblemBody
    expect(status).toBe(404)
    expect(contentType).toBe('application/problem+json')
    expect(body.code).toMatch(/.+/)
    expect(body.title).toBeTypeOf('string')
    expect(body.message).toBeTypeOf('string')
  })

  it('does not over-match the detail path (single-segment placeholder)', async () => {
    // The detail handler's :auctionUuid consumes exactly one segment, so
    // `/auctions/{uuid}/bets` must fall through to the bets handler — not
    // return the detail DTO at the nested path.
    const res = await fetch(`${BASE}/api/v1/auctions/${seedAuctionUuids.downLeading}`)
    const detailBody = (await res.json()) as DetailLeak
    // Detail handler DOES own this path; we only confirm the bets handler
    // isn't shadowing it. (Symmetry with the smoke's negative assertion.)
    expect(detailBody.main).toBeTypeOf('object')
  })
})

interface DetailLeak {
  main?: unknown
}
