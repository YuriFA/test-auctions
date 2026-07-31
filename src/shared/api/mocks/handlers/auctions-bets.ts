import { HttpResponse, http } from 'msw'

import type { BetItem, BetListResponse, ProblemDetail } from '../../generated'
import { readAuctionBets } from '../runtime/store'

// NOTE: `hide_bets_history` is NOT enforced here — it is a UI gate driven by
// the detail DTO. The bets endpoint always returns the real history.
const AUCTIONS_BETS_PATH = '*/api/v1/auctions/:auctionUuid/bets'

export const auctionsBetsHandler = http.get(AUCTIONS_BETS_PATH, ({ params, request }): Response => {
  const uuid = params.auctionUuid
  if (typeof uuid !== 'string' || uuid.length === 0) {
    return HttpResponse.json(notFoundProblem(''), {
      status: 404,
      headers: { 'content-type': 'application/problem+json' },
    })
  }

  const includeCanceled = readAllFlag(request.url)
  const bets = readAuctionBets(uuid, { includeCanceled })
  if (!bets) {
    return HttpResponse.json(notFoundProblem(uuid), {
      status: 404,
      headers: { 'content-type': 'application/problem+json' },
    })
  }

  return HttpResponse.json({ bets: bets as BetItem[] } satisfies BetListResponse)
})

// NOTE: only the literal string "true" opts in; missing/garbage collapses to
// false to match a permissive backend.
function readAllFlag(url: string): boolean {
  return new URL(url).searchParams.get('all') === 'true'
}

function notFoundProblem(uuid: string): ProblemDetail {
  return {
    code: 'auction_not_found',
    title: 'Не найдено',
    message: `Аукцион с UUID ${uuid || '<empty>'} не существует`,
  }
}
