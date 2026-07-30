/**
 * MSW handler for `GET /auctions/{auctionUuid}/bets` (SDD-013 / D-009).
 *
 * Thin HTTP envelope over `readAuctionBets` from the single runtime store
 * (SDD-010). All ranking, rejection, and cancellation state lives in the
 * store; this module only:
 *   - resolves the `auctionUuid` path parameter,
 *   - reads the optional `all` query flag (boolean, nullable per spec) and
 *     maps it to `includeCanceled`,
 *   - returns the `BetListResponse` (`{ bets: BetItem[] }`) as JSON on a hit,
 *   - returns a 404 `ProblemDetail` (`application/problem+json`) on a miss.
 *
 * The `all` query parameter follows the spec at
 * `docs/openapi.auctions.v0.json:111-120`: `true` returns every bet including
 * canceled/rejected ones, `false`/missing returns only active bets. The
 * hide_bets_history restriction from the detail DTO is intentionally NOT
 * applied here — it is a UI-level gate driven by the detail response
 * (SDD-021), not a bets-endpoint concern.
 *
 * Path matches the full SDK URL — `@hey-api/client-fetch` joins
 * `baseUrl: '/api/v1'` from `client.gen.ts` with the SDK's relative
 * `/auctions/{auctionUuid}/bets`. The two-segment suffix `/bets` plus the
 * single-segment `:auctionUuid` placeholder keep this handler disjoint from
 * the detail handler (SDD-012).
 */
import { HttpResponse, http } from 'msw'

import type { BetItem, BetListResponse, ProblemDetail } from '../../generated'
import { readAuctionBets } from '../runtime/store'

// `*` prefix matches any origin so the same handler works under the browser
// worker (where the SDK fetches against the current host) and the Node test
// server (where `fetch` runs against a synthetic `http://localhost` URL).
const AUCTIONS_BETS_PATH = '*/api/v1/auctions/:auctionUuid/bets'

export const auctionsBetsHandler = http.get(
  AUCTIONS_BETS_PATH,
  ({ params, request }): Response => {
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

    const body: BetListResponse = { bets: bets as BetItem[] }
    return HttpResponse.json(body)
  },
)

/**
 * Parse the spec's `all` query parameter. The schema marks it as
 * `boolean, nullable`; only the literal string `"true"` enables canceled-bet
 * inclusion. Every other value (missing, `"false"`, garbage) collapses to
 * `false`, mirroring how a permissive backend would treat an unknown flag.
 */
function readAllFlag(url: string): boolean {
  const parsed = new URL(url)
  return parsed.searchParams.get('all') === 'true'
}

function notFoundProblem(uuid: string): ProblemDetail {
  return {
    code: 'auction_not_found',
    title: 'Не найдено',
    message: `Аукцион с UUID ${uuid || '<empty>'} не существует`,
  }
}
