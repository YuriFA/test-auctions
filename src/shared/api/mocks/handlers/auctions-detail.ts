import { HttpResponse, http } from 'msw'

import type { ProblemDetail } from '../../generated'
import { readAuctionDetail } from '../runtime/store'

// NOTE: single-segment `:auctionUuid` placeholder keeps `/auctions/:uuid/bets`
// from matching here — the bets handler owns the two-segment path.
const AUCTIONS_DETAIL_PATH = '*/api/v1/auctions/:auctionUuid'

export const auctionsDetailHandler = http.get(AUCTIONS_DETAIL_PATH, ({ params }): Response => {
  const uuid = params.auctionUuid
  if (typeof uuid !== 'string' || uuid.length === 0) {
    return HttpResponse.json(notFoundProblem(''), {
      status: 404,
      headers: { 'content-type': 'application/problem+json' },
    })
  }

  const detail = readAuctionDetail(uuid)
  if (!detail) {
    return HttpResponse.json(notFoundProblem(uuid), {
      status: 404,
      headers: { 'content-type': 'application/problem+json' },
    })
  }

  return HttpResponse.json(detail)
})

function notFoundProblem(uuid: string): ProblemDetail {
  return {
    code: 'auction_not_found',
    title: 'Не найдено',
    message: `Аукцион с UUID ${uuid || '<empty>'} не существует`,
  }
}
