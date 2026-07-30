# SDD Decisions

## Accepted Decisions

### D-001 OpenAPI Codegen

- Use Hey API.
- Generate SDK and types only.
- Keep TanStack Query handwritten.

### D-002 API Boundaries

- Keep generated artifacts isolated in a dedicated generated folder.
- Do not import generated artifacts directly from `pages`, `widgets`, `features`, or `entities`.
- Route all API access through `shared/api`.

### D-003 Router Strategy

- Use TanStack Router in code-based mode.
- Keep route-aware page components compliant with the `*.component.tsx` naming rule.

### D-004 UI State Strategy

- Use Zustand only for targeted client UI state.
- Keep server state in TanStack Query.

### D-005 Styling Strategy

- Use Tailwind CSS.
- Use `shadcn/ui` as the UI component foundation.

### D-006 Filter Persistence

- Use URL search params as the source of truth for list filters.
- Validate search params with Zod and apply safe fallback values.

### D-007 Bets UX Structure

- Implement bets history as a nested route/tab under the auction route.

### D-008 Testing Minimum

- At minimum, add logic tests for:
  - search params parsing
  - request builder logic
  - view model mappers
  - bet validation schema

### D-009 Mock Runtime Strategy

- Use a single in-memory MSW runtime store.
- Make list, detail, and bets handlers read from the same runtime state.
- Make bet mutation update that same state.

### D-010 Participants Count

- Since the bets endpoint does not expose a dedicated participants count field, derive participants count from available bet records.
- Document this explicitly in implementation notes and README verification notes if needed.

### D-011 Auction UUID Identity

- The OpenAPI spec routes auctions by `auctionUuid: format: uuid` in path parameters (`/auctions/{auctionUuid}`, bets, set-bet) but does not expose an `auction_uuid` field in any response DTO. The mock layer closes this contract gap the way a real backend would: MSW injects `main.auction_uuid` into `AuctionListItem` responses so the client can navigate from list to detail without guessing.
- Rationale: an explicit extension field beats an implicit interpretation. Earlier we considered treating `auctionUuid` as semantically equivalent to `main.order_uid` (the only UUID in DTOs), but that hides routing logic behind a `decisions.md` entry a reviewer has to find. The extension field is visible in network responses and self-documenting. It is also forward-compatible: if a future schema revision adds `auction_uuid` to DTOs, only the mock layer changes — client code already reads the field by name.
- `auction_uuid` is intentionally distinct from `order_uid`. The freight-auction domain treats an auction as a trading procedure layered on top of an order; conflating their identifiers would lose the separation that a real system maintains.
- Implementation: `MockAuctionListItemMain` (in `src/shared/api/mocks/auctions.ts`) extends the generated `AuctionListItemMain` with the required `auction_uuid` field. `SeedAuction.uuid === list.main.auction_uuid`, and `SeedAuction.list.main.order_uid` stays independent under `seedOrderUids`. MSW handlers (SDD-011+) resolve path parameters by matching against `main.auction_uuid`; client links are built with `params={{ auctionUuid: item.main.auction_uuid }}`.
- Scope of deviation: this is a mock-only extension to the generated DTO. It MUST NOT leak into the production `shared/api` types or into `entities` / `features` / `widgets` / `pages`. When the client needs to read `auction_uuid`, it must do so via a typed view model mapper that consumes `MockAuctionListItem` only inside MSW setup and tests.

## Guardrails

- OpenAPI contract accuracy overrides convenience.
- DTO restrictions must drive the UI.
- If requirements wording and schema diverge, prefer the schema and document the decision.
