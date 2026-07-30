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

## Guardrails

- OpenAPI contract accuracy overrides convenience.
- DTO restrictions must drive the UI.
- If requirements wording and schema diverge, prefer the schema and document the decision.
