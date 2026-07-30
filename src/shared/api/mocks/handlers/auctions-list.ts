import { HttpResponse, http } from 'msw'

import type { AuctionListRequest, ValidationProblem } from '../../generated'
import { readAuctionList } from '../runtime/store'

// `*` prefix matches any origin so the same handler works under the browser
// worker (SDK posts against current host) and Node setupServer (native fetch
// carries a synthetic http://localhost origin). Relative path matched in
// browser but not Node.
const AUCTIONS_LIST_PATH = '*/api/v1/auctions/list'

export const auctionsListHandler = http.post(
  AUCTIONS_LIST_PATH,
  async ({ request }): Promise<Response> => {
    let filters: AuctionListRequest = {}

    const text = await request.text()
    if (text.length > 0) {
      try {
        filters = JSON.parse(text) as AuctionListRequest
      } catch {
        return HttpResponse.json(malformedBodyProblem(), {
          status: 422,
          headers: { 'content-type': 'application/problem+json' },
        })
      }
    }

    return HttpResponse.json(readAuctionList(filters))
  },
)

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
