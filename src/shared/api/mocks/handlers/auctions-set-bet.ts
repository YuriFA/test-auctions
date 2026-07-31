import { HttpResponse, http } from 'msw'

import type { BetItem, ProblemDetail, ValidationProblem } from '../../generated'
import { writeBet } from '../runtime/store'

// NOTE: same path as the GET bets handler — MSW dispatches by method.
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

// NOTE: handler owns shape (JSON parse, price type); store owns business
// validation (price > 0) and side-effects. Don't move either across the line.
function extractPrice(body: unknown): number | null {
  if (typeof body !== 'object' || body === null) {
    return null
  }
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
  return validationProblem('body', 'Тело запроса должно быть корректным JSON', 'invalid_json')
}

function missingBodyProblem(): ValidationProblem {
  return validationProblem('body', 'Тело запроса обязательно', 'required')
}

function invalidPriceProblem(): ValidationProblem {
  return validationProblem('price', 'Поле price обязательно и должно быть числом', 'invalid_type')
}

function validationProblem(field: string, message: string, code: string): ValidationProblem {
  return {
    code: 'validation_failed',
    title: 'Ошибка валидации',
    message,
    errors: [{ field, message, code }],
  }
}
