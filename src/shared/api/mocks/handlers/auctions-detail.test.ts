import { setupServer } from 'msw/node'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { seedAuctionUuids } from '../auctions'
import { mockHandlers } from './index'

const server = setupServer(...mockHandlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

const BASE = 'http://localhost'

interface DetailBody {
  main?: { cargo_num?: string; order_uid?: string; auc_type?: string }
  organizer?: unknown
  contacts?: unknown[]
  cargo?: unknown
  trading?: {
    hide_bets_history?: boolean
    no_view_cargo_price?: boolean
    hide_points_address_and_contacts?: boolean
  }
  payment?: unknown
  assembly?: unknown
  routes?: unknown[]
  admitted_organizations?: unknown[]
}

interface ProblemBody {
  code?: string
  title?: string
  message?: string
}

async function getDetail(uuid: string) {
  const res = await fetch(`${BASE}/api/v1/auctions/${uuid}`)
  const text = await res.text()
  const json = text ? (JSON.parse(text) as DetailBody | ProblemBody) : null
  return {
    status: res.status,
    contentType: res.headers.get('content-type'),
    json,
  }
}

describe('GET /auctions/:uuid — MSW handler', () => {
  it('returns the full AuctionShowResponse shape on a known seed UUID', async () => {
    const { status, json } = await getDetail(seedAuctionUuids.downLeading)
    const body = json as DetailBody
    expect(status).toBe(200)
    expect(body.main).toBeTypeOf('object')
    expect(body.organizer).toBeTypeOf('object')
    expect(Array.isArray(body.contacts)).toBe(true)
    expect(body.cargo).toBeTypeOf('object')
    expect(body.trading).toBeTypeOf('object')
    expect(body.payment).toBeTypeOf('object')
    expect(body.assembly).toBeTypeOf('object')
    expect(Array.isArray(body.routes)).toBe(true)
    expect(Array.isArray(body.admitted_organizations)).toBe(true)
    expect(body.main?.cargo_num).toMatch(/.+/)
    expect(body.main?.order_uid).not.toBe(seedAuctionUuids.downLeading)
    expect(body.main?.auc_type).toBe('Down')
  })

  it('surfaces hide_bets_history=true on finishedConfirmed', async () => {
    const { status, json } = await getDetail(seedAuctionUuids.finishedConfirmed)
    expect(status).toBe(200)
    expect((json as DetailBody)?.trading?.hide_bets_history).toBe(true)
  })

  it('surfaces no_view_cargo_price + hide_points_address_and_contacts on fixPriceHidden', async () => {
    const { status, json } = await getDetail(seedAuctionUuids.fixPriceHidden)
    expect(status).toBe(200)
    const trading = (json as DetailBody)?.trading
    expect(trading?.no_view_cargo_price).toBe(true)
    expect(trading?.hide_points_address_and_contacts).toBe(true)
  })

  it('surfaces hide_points_address_and_contacts on downHiddenContacts', async () => {
    const { status, json } = await getDetail(seedAuctionUuids.downHiddenContacts)
    expect(status).toBe(200)
    expect((json as DetailBody)?.trading?.hide_points_address_and_contacts).toBe(true)
  })

  it('returns 404 + ProblemDetail on an unknown UUID', async () => {
    const { status, contentType, json } = await getDetail('ffffffff-ffff-4000-8000-ffffffffffff')
    const body = json as ProblemBody
    expect(status).toBe(404)
    expect(contentType).toBe('application/problem+json')
    expect(body.code).toMatch(/.+/)
    expect(body.title).toBeTypeOf('string')
    expect(body.message).toBeTypeOf('string')
  })
})
