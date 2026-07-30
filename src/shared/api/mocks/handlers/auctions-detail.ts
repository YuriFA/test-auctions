/**
 * MSW handler for `GET /auctions/{auctionUuid}` (SDD-012 / D-009).
 *
 * Thin HTTP envelope over `readAuctionDetail` from the single runtime store
 * (SDD-010). All DTO shape, restriction flags, and trading side-effects live
 * in the store; this module only:
 *   - resolves the `auctionUuid` path parameter,
 *   - returns the detail DTO as JSON on a hit,
 *   - returns a 404 `ProblemDetail` (`application/problem+json`) on a miss.
 *
 * The path matches the full SDK URL — `@hey-api/client-fetch` joins
 * `baseUrl: '/api/v1'` from `client.gen.ts` with the SDK's relative
 * `/auctions/{auctionUuid}`, producing `/api/v1/auctions/{auctionUuid}`.
 * The `:auctionUuid` placeholder consumes a single path segment, so the
 * sibling `/auctions/{auctionUuid}/bets` route (SDD-013) does not match here.
 */
import { HttpResponse, http } from 'msw'

import type { ProblemDetail } from '../../generated'
import { readAuctionDetail } from '../runtime/store'

// `*` prefix matches any origin so the same handler works under the browser
// worker (where the SDK fetches against the current host) and the Node test
// server (where `fetch` runs against a synthetic `http://localhost` URL).
const AUCTIONS_DETAIL_PATH = '*/api/v1/auctions/:auctionUuid'

export const auctionsDetailHandler = http.get(
  AUCTIONS_DETAIL_PATH,
  ({ params }): Response => {
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
  },
)

function notFoundProblem(uuid: string): ProblemDetail {
  return {
    code: 'auction_not_found',
    title: 'Не найдено',
    message: `Аукцион с UUID ${uuid || '<empty>'} не существует`,
  }
}
