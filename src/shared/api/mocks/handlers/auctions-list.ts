/**
 * MSW handler for `POST /auctions/list` (SDD-011 / D-009).
 *
 * The handler is a thin HTTP envelope over `readAuctionList` from the single
 * runtime store (SDD-010). All filter semantics, sort, and pagination live in
 * the store; this module only:
 *   - parses the JSON body into an `AuctionListRequest`,
 *   - hands it to the store,
 *   - returns the resulting `AuctionListResponseBase` as JSON.
 *
 * Malformed JSON collapses to a 422 `ValidationProblem` (the spec's
 * `ValidationFailed` response). Unknown extra fields are tolerated because
 * every field of `AuctionListRequest` is optional per the OpenAPI schema.
 *
 * The path matches the full SDK URL — `@hey-api/client-fetch` joins
 * `baseUrl: '/api/v1'` from `client.gen.ts` with the SDK's relative
 * `/auctions/list`, producing `/api/v1/auctions/list`.
 */
import { HttpResponse, http } from "msw";

import type { AuctionListRequest, ValidationProblem } from "../../generated";
import { readAuctionList } from "../runtime/store";

// `*` prefix matches any origin so the same handler works under the browser
// worker (where the SDK posts against the current host) and the Node test
// server (where `fetch` runs against a synthetic `http://localhost` URL).
const AUCTIONS_LIST_PATH = "*/api/v1/auctions/list";

export const auctionsListHandler = http.post(
  AUCTIONS_LIST_PATH,
  async ({ request }): Promise<Response> => {
    let filters: AuctionListRequest = {};

    const text = await request.text();
    if (text.length > 0) {
      try {
        filters = JSON.parse(text) as AuctionListRequest;
      } catch {
        return HttpResponse.json(malformedBodyProblem(), { status: 422 });
      }
    }

    const response = readAuctionList(filters);
    return HttpResponse.json(response);
  },
);

function malformedBodyProblem(): ValidationProblem {
  return {
    code: "validation_failed",
    title: "Ошибка валидации",
    message: "Тело запроса должно быть корректным JSON",
    errors: [
      {
        field: "body",
        message: "Тело запроса должно быть корректным JSON",
        code: "invalid_json",
      },
    ],
  };
}
