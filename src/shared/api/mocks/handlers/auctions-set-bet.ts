/**
 * MSW handler for `POST /auctions/{auctionUuid}/bets` (SDD-014 / D-009).
 *
 * Thin HTTP envelope over `writeBet` from the single runtime store
 * (SDD-010). The store owns every state side-effect (rejecting the previous
 * active bet, recomputing places, refreshing the trading block in list and
 * detail DTOs); this module only:
 *   - resolves the `auctionUuid` path parameter,
 *   - parses the JSON body into a `SetBetRequest`-compatible shape,
 *   - calls `writeBet` and maps the resulting `PlaceBetResult` onto the
 *     matching HTTP response.
 *
 * The spec marks the 200 response body as `unknown`
 * (`docs/openapi.auctions.v0.json:172-174` — "Ставка принята — ответ
 * проксируется от upstream"), so the production adapter returns `void` and
 * the client never reads the body. The mock still returns the freshly-placed
 * `BetItem` because `writeBet` already produces it, it is useful for tests
 * and debugging, and it is forward-compatible if the spec later defines a
 * 200 schema.
 *
 * Path matches the full SDK URL — `@hey-api/client-fetch` joins
 * `baseUrl: '/api/v1'` from `client.gen.ts` with the SDK's relative
 * `/auctions/{auctionUuid}/bets`. MSW dispatches by method, so the GET bets
 * handler (SDD-013) and this POST handler coexist on the same path without
 * conflict.
 */
import { HttpResponse, http } from 'msw'

import type { BetItem, ProblemDetail, ValidationProblem } from '../../generated'
import { writeBet } from '../runtime/store'

// `*` prefix matches any origin so the same handler works under the browser
// worker (where the SDK posts against the current host) and the Node test
// server (where `fetch` runs against a synthetic `http://localhost` URL).
const AUCTIONS_SET_BET_PATH = '*/api/v1/auctions/:auctionUuid/bets'

export const auctionsSetBetHandler = http.post(
  AUCTIONS_SET_BET_PATH,
  async ({ params, request }): Promise<Response> => {
    const uuid = params.auctionUuid
    if (typeof uuid !== 'string' || uuid.length === 0) {
      return problemResponse(notFoundProblem(''), 404)
    }

    const text = await request.text()
    if (text.length === 0) {
      return problemResponse(missingBodyProblem(), 422)
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      return problemResponse(malformedBodyProblem(), 422)
    }

    const price = extractPrice(parsed)
    if (price === null) {
      return problemResponse(invalidPriceProblem(), 422)
    }

    const result = writeBet(uuid, price)
    if (result.ok) {
      return HttpResponse.json(result.bet as BetItem)
    }
    return problemResponse(result.problem, result.status)
  },
)

/**
 * Pull `price` off the parsed body. Returns `null` for missing or non-number
 * values so the handler can emit a 422 with a field-level error before
 * delegating to the store; the store still owns the `> 0` check.
 */
function extractPrice(body: unknown): number | null {
  if (typeof body !== 'object' || body === null) return null
  const value = (body as { price?: unknown }).price
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function problemResponse(problem: ProblemDetail | ValidationProblem, status: number): Response {
  return HttpResponse.json(problem, {
    status,
    headers: { 'content-type': 'application/problem+json' },
  })
}

function notFoundProblem(uuid: string): ProblemDetail {
  return {
    code: 'auction_not_found',
    title: 'Не найдено',
    message: `Аукцион с UUID ${uuid || '<empty>'} не существует`,
  }
}

function malformedBodyProblem(): ValidationProblem {
  return {
    code: 'validation_failed',
    title: 'Ошибка валидации',
    message: 'Тело запроса должно быть корректным JSON',
    errors: [
      {
        field: 'body',
        message: 'Тело запроса должно быть корректным JSON',
        code: 'invalid_json',
      },
    ],
  }
}

function missingBodyProblem(): ValidationProblem {
  return {
    code: 'validation_failed',
    title: 'Ошибка валидации',
    message: 'Тело запроса обязательно',
    errors: [
      {
        field: 'body',
        message: 'Тело запроса обязательно',
        code: 'required',
      },
    ],
  }
}

function invalidPriceProblem(): ValidationProblem {
  return {
    code: 'validation_failed',
    title: 'Ошибка валидации',
    message: 'Поле price обязательно и должно быть числом',
    errors: [
      {
        field: 'price',
        message: 'Поле price обязательно и должно быть числом',
        code: 'invalid_type',
      },
    ],
  }
}
