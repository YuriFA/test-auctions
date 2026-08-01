import { setupServer } from 'msw/node'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { seedAuctionUuids } from '../auctions'
import { resetMockRuntime } from '../runtime/store'
import { mockHandlers } from './index'

const server = setupServer(...mockHandlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
beforeEach(() => resetMockRuntime())

const BASE = 'http://localhost'

interface BetResponse {
  id?: number
  price_with_vat?: number
  price_no_vat?: number
  is_rejected?: boolean
  place?: number | null
  cancel_reason?: string
}

interface ValidationProblem {
  code?: string
  errors?: Array<{ field?: string; message?: string; code?: string }>
}

interface DetailBody {
  trading?: {
    status_mobile?: string
    is_bidder?: boolean
    price?: { current?: number }
    your?: { bet?: boolean }
  }
}

interface ListBody {
  data?: Array<{ main?: { order_uid?: string }; trading?: { status_mobile?: string; price?: { current?: number } } }>
}

interface BetsListBody {
  bets?: Array<{
    id?: number
    is_rejected?: boolean
    place?: number | null
    cancel_reason?: string
  }>
}

async function postBet(uuid: string, body?: unknown) {
  const init =
    body === undefined
      ? { method: 'POST' }
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: typeof body === 'string' ? body : JSON.stringify(body),
        }
  const res = await fetch(`${BASE}/api/v1/auctions/${uuid}/bets`, init)
  const text = await res.text()
  const json = text ? (JSON.parse(text) as BetResponse | ValidationProblem) : null
  return {
    status: res.status,
    contentType: res.headers.get('content-type'),
    json,
  }
}

async function getDetail(uuid: string): Promise<DetailBody | null> {
  const res = await fetch(`${BASE}/api/v1/auctions/${uuid}`)
  return res.ok ? ((await res.json()) as DetailBody) : null
}

async function getList(): Promise<ListBody | null> {
  const res = await fetch(`${BASE}/api/v1/auctions/list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  return res.ok ? ((await res.json()) as ListBody) : null
}

async function getBets(uuid: string, all = false): Promise<BetsListBody | null> {
  const url = `${BASE}/api/v1/auctions/${uuid}/bets${all ? '?all=true' : ''}`
  const res = await fetch(url)
  return res.ok ? ((await res.json()) as BetsListBody) : null
}

function expectValidationProblem(res: {
  status: number
  contentType: string | null
  json: BetResponse | ValidationProblem | null
}): void {
  expect(res.status).toBe(422)
  expect(res.contentType).toBe('application/problem+json')
  expect((res.json as ValidationProblem)?.code).toBe('validation_failed')
  expect((res.json as ValidationProblem)?.errors?.length ?? 0).toBeGreaterThan(0)
}

describe('POST /auctions/:uuid/bets — MSW handler', () => {
  it('places a valid bet and returns a BetItem-shaped body', async () => {
    const { status, contentType, json } = await postBet(seedAuctionUuids.downLeading, {
      price: 44000,
    })
    const body = json as BetResponse
    expect(status).toBe(200)
    expect(contentType).toBe('application/json')
    expect(body.id).toBeTypeOf('number')
    expect(body.price_with_vat).toBe(44000)
    expect(body.price_no_vat).toBeLessThan(44000)
    expect(body.is_rejected).toBe(false)
    expect(body.place).toBeTypeOf('number')
    expect(body.cancel_reason).toBe('')
  })

  it('propagates the new state to list, detail, and bets endpoints', async () => {
    const beforeDetail = await getDetail(seedAuctionUuids.downLeading)
    expect(beforeDetail?.trading?.price?.current).toBe(45000)

    const placed = await postBet(seedAuctionUuids.downLeading, { price: 44000 })
    expect(placed.status).toBe(200)

    const afterDetail = await getDetail(seedAuctionUuids.downLeading)
    expect(afterDetail?.trading?.price?.current).toBe(44000)
    expect(afterDetail?.trading?.status_mobile).toBe('Leading')
    expect(afterDetail?.trading?.is_bidder).toBe(true)
    expect(afterDetail?.trading?.your?.bet).toBe(true)

    const list = await getList()
    const listItem = list?.data?.find(
      (item) => item?.main?.order_uid === '3a05d045-0e67-4f85-b20a-de81d18bba7a',
    )
    expect(listItem?.trading?.price?.current).toBe(44000)
    expect(listItem?.trading?.status_mobile).toBe('Leading')

    const bets = await getBets(seedAuctionUuids.downLeading)
    const userBet = bets?.bets?.find((b) => b?.id === (placed.json as BetResponse)?.id)
    expect(userBet).toBeDefined()
    expect(userBet?.place).toBe(1)
  })

  it('rejects the previous active user bet when placing a new one', async () => {
    const first = await postBet(seedAuctionUuids.downLeading, { price: 44500 })
    const second = await postBet(seedAuctionUuids.downLeading, { price: 44000 })
    expect(first.status).toBe(200)
    expect(second.status).toBe(200)

    const betsAll = await getBets(seedAuctionUuids.downLeading, true)
    const firstBet = betsAll?.bets?.find((b) => b?.id === (first.json as BetResponse)?.id)
    const secondBet = betsAll?.bets?.find((b) => b?.id === (second.json as BetResponse)?.id)
    expect(firstBet?.is_rejected).toBe(true)
    expect(firstBet?.cancel_reason).toMatch(/.+/)
    expect(firstBet?.place).toBeNull()
    expect(secondBet?.is_rejected).toBe(false)
    expect(secondBet?.place).toBe(1)

    const betsActive = await getBets(seedAuctionUuids.downLeading, false)
    const hasFirst = betsActive?.bets?.some((b) => b?.id === (first.json as BetResponse)?.id)
    expect(hasFirst).toBe(false)
  })

  it('rejects price <= 0 with a ValidationProblem', async () => {
    expectValidationProblem(await postBet(seedAuctionUuids.downLeading, { price: 0 }))
    expectValidationProblem(await postBet(seedAuctionUuids.downLeading, { price: -100 }))
  })

  it('rejects a missing price field with a ValidationProblem pointing at price', async () => {
    const res = await postBet(seedAuctionUuids.downLeading, {})
    expectValidationProblem(res)
    expect((res.json as ValidationProblem)?.errors?.[0]?.field).toBe('price')
  })

  it('rejects non-number price values', async () => {
    expectValidationProblem(await postBet(seedAuctionUuids.downLeading, { price: 'abc' }))
    expectValidationProblem(await postBet(seedAuctionUuids.downLeading, { price: null }))
  })

  it('rejects an empty body with a ValidationProblem', async () => {
    expectValidationProblem(await postBet(seedAuctionUuids.downLeading, undefined))
  })

  it('rejects malformed JSON body with a body-pointing ValidationProblem', async () => {
    const res = await postBet(seedAuctionUuids.downLeading, '{not-json')
    expectValidationProblem(res)
    expect((res.json as ValidationProblem)?.errors?.[0]?.field).toBe('body')
  })

  it('returns 404 with ProblemDetail on an unknown UUID', async () => {
    const res = await postBet('ffffffff-ffff-4000-8000-ffffffffffff', { price: 1000 })
    expect(res.status).toBe(404)
    expect(res.contentType).toBe('application/problem+json')
    expect((res.json as ValidationProblem)?.code).toBe('auction_not_found')
  })
})
