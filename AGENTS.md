# AGENTS.md

## Purpose

This file defines the project-level rules for any AI/LLM agent working in this repository.

## Project Scope

- Build a SPA for freight auctions.
- Core flows:
  - auctions list
  - auction detail
  - bets history
  - place or update a bet
- The API source of truth is `docs/openapi.auctions.v0.json`.

## Human Responsibility

- AI use is allowed and encouraged.
- The human owner of the task remains responsible for:
  - architecture decisions
  - code quality
  - result verification
  - explaining the final decisions

## Mandatory Stack

- React
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- React Hook Form
- Zod
- MSW
- Feature-Sliced Design
- Zustand for targeted client UI state
- Tailwind CSS with `shadcn/ui`

## Architecture Rules

- Follow Feature-Sliced Design boundaries.
- Use TanStack Router in code-based mode.
- Use OpenAPI code generation via Hey API for generated SDK and types.
- Keep generated code isolated under a dedicated generated API folder.
- Do not import generated OpenAPI artifacts directly from `pages`, `widgets`, `features`, or `entities`.
- Route all API access through `shared/api` adapters.
- Keep TanStack Query logic handwritten in application code.
- Keep query keys and invalidation strategy close to business logic.

## API Contract Rules

- Treat `docs/openapi.auctions.v0.json` as the highest-priority contract source.
- Do not invent fields, enum values, request shapes, response shapes, or error formats.
- Respect nullable fields exactly as defined in the schema.
- Respect OpenAPI enum sets exactly as defined, even if similar fields differ between list and detail DTOs.
- Handle `application/problem+json` error responses correctly.
- Handle `422` validation errors according to the schema.
- Prefer deriving UI view models from DTOs instead of coupling UI directly to raw response shapes.

## Backend And Mocking Rules

- Do not build a backend for this project.
- Use MSW only.
- Implement these endpoints:
  - `POST /auctions/list`
  - `GET /auctions/{auctionUuid}`
  - `GET /auctions/{auctionUuid}/bets`
  - `POST /auctions/{auctionUuid}/bets`
- MSW mocks must conform to the OpenAPI schema.
- MSW runtime state must really change after mutations.
- After a successful bet mutation, mocked state must update consistently for:
  - auctions list
  - auction detail
  - bets list
  - current price
  - user's betting state
  - user's trading status

## Route And UX Requirements

- Required route structure:
  - `/auctions`
  - `/auctions/$auctionUuid`
  - `/auctions/$auctionUuid/bets`
  - `/auctions/$auctionUuid/bet`
- Bets history is implemented as a nested route/tab under the auction route.
- Filters for the auctions list must use URL search params.
- Search params must be validated with Zod and have safe fallback values.
- Detail data should be prefetched from the list on intent or hover.
- Type URL search via `validateSearch` on the route definition (TanStack Router infers the type for `useSearch({ from: ... })`). Never `as`-cast the result of `useSearch`.
- Configure router-level `parseSearch`/`stringifySearch` when the URL format matters (repeated keys for arrays, default values stripped). TanStack Router's default serializer JSON-encodes arrays and keeps defaults — that breaks clean URLs.
- The `validateSearch` function returns only non-default fields (a `Partial<T>`). Pages merge with defaults via `{ ...DEFAULTS, ...search }` to get the full typed shape for downstream consumers.
- Collapse parent + child index routes into a single route when there's no shared layout content (`<Outlet />`-only parents are boilerplate). Keep the parent + children structure when multiple sibling routes share a path parameter or layout.

## UI And Component Rules

- All React component files must use the `*.component.tsx` suffix.
- Apply this rule to all React component files, including page, route, layout, and reusable component files.
- Component export identifiers drop the `Component` suffix — file names are `*.component.tsx`, exports stay short (`AuctionsList`, `Button`, `RootLayout`), never `AuctionsListComponent`.
- Page structure follows the **shell + content** pattern:
  - Shell component (`*Page`, e.g., `AuctionsPage`) owns frame, header, layout chrome. Zero hooks, zero props.
  - Content component (e.g., `AuctionsList`) owns all hooks (`useSearch`, `useQuery`, `useNavigate`, `useQueryClient`), derives state, and renders branches via early returns. Rendered content lives inside the shell's frame.
  - The Public API of a page slice (`index.ts`) exports the shell (`AuctionsPage`). The content component is internal to the slice.
- Do not split a component if it forces prop drilling. A child that needs 4+ coupled props (query state, filters, handlers) is not a real separation — keep it inline or make the child self-contained (own its hooks).
- State branches (`isPending` / `isError` / empty) belong to the content component as early returns. The shell always renders the frame; the content decides what goes inside.
- Map DTOs to view models in the query hook (`select` option of `useQuery`), not at render time. Render-time mapping runs every render and couples the view to raw DTO shapes.
- Presentational components take generic intent callbacks (`onIntent`, `onSelect`), not business-specific names (`onPrefetch`, `onFilterActivate`). The parent decides what the signal means; the child just emits it.
- The interface should be neat, adaptive, and convenient to review on desktop and mobile.
- When the same JSX structure (element + className + children pattern) repeats, extract it into a local component. Do not replace repetition with class-string constants (`const SECTION_CLASS = '...'`) — class strings belong inline on the element that uses them. A component carries semantics and props; a class constant only hides the obvious.
- Prefer local helper components inside the same `*.component.tsx` file when the helper is used only there. Promote to its own file only when consumed by more than one component.
- Respect DTO-driven restrictions in the UI, including:
  - `can_set_bet`
  - `hide_bets_history`
  - `hide_points_address_and_contacts`
  - `no_view_cargo_price`

## Code Comment Rules

- **Comments are forbidden by default.** Code must be self-explanatory through naming, types, and structure.
- A comment is permitted only when it carries information a reader cannot recover from the code itself: a hidden contract constraint, a non-obvious invariant, a workaround for a specific bug, an edge case that would surprise a reader, or a critical warning about production behaviour.
- **Every permitted comment must start with a conventional marker** chosen by meaning:
  - `NOTE:` — non-obvious invariant, contract constraint, or behaviour the reader must know to avoid breaking something.
  - `FIXME:` — known defect, broken code path, or a workaround that masks a real bug; must be fixed.
  - `TODO:` — acknowledged incomplete work with a clear next step; not a defect, just unfinished.
  - `XXX:` — warning about dangerous or hazardous code that needs careful handling.
- No marker prefix → no comment. Section dividers (`// --- Reads ---`), section labels inside types (`// main`, `// organizer`), file-level prose, and WHAT-paraphrasing blocks are all forbidden — structure the code instead.
- **Never reference tasks, tickets, PRs, issues, SDD numbers, callers, or fixes** in code. Phrases like `// SDD-022`, `// used by X`, `// added for the Y flow`, `// fixes #123` belong in commit messages and PR descriptions, never in source.
- Comments that label a smell (`mock-only`, `defensive cast`, `temporary`) signal a missing type or abstraction. Solve with types; do not document the smell. If the smell is unavoidable, use the matching marker (`FIXME:` for workarounds, `XXX:` for hazards).
- Prefer tests over comments: an invariant expressed in a test is enforceable; in a comment it rots.
- Tooling directives (`// oxlint-disable ...`, `// @ts-expect-error`, `eslint-disable-*`, `biome-ignore`) are NOT comments — they are instructions to linters and compilers and are always allowed.
- Step-style scaffolding inside `*.test.ts` and `scripts/*-smoke.mjs` (`// 1. ...`, fixture labels) is test narration, not production code; the rules above target implementation files.

### Examples

Bad — paraphrases the code (forbidden):

```ts
// Keep the previous page visible while the next page loads so pagination
// feels continuous instead of flashing skeleton on every page turn.
placeholderData: keepPreviousData,
```

Bad — references the task (forbidden):

```ts
// SDD-022 owns this; replace direct reads with deriveAuctionRestrictions later.
const canPlaceBet = source.canSetBet
```

Good — `NOTE:` marker, non-obvious contract constraint:

```ts
// NOTE: API enum excludes `Unknown` (UI-only sentinel); filter before sending.
const API_AUC_TYPES = ['Request', 'Up', 'Down', 'FixPrice'] as const
```

Good — `FIXME:` marker, known workaround:

```ts
// FIXME: mock layer injects `auction_uuid`; production DTO has no such field yet.
const uuid = main.auction_uuid ?? orderUid
```

## Testing Conventions

- Co-locate tests next to the module they exercise (`*.test.ts`).
- Do not create `__tests__/` directories; they break FSD Public API boundaries.
- Name test files after the module they cover: `search-params.ts` ↔ `search-params.test.ts`.

## Testing And Verification Rules

- The project must run locally.
- Smoke scripts (`scripts/*-smoke.mjs`) live outside `pnpm check`.
  - `pnpm smoke` is the single entry point: it starts `vite dev` on `:5175`, waits until it is ready, runs every smoke (MSW-node first via `tsx`, then browser smokes via Playwright), and tears the dev server down on success or failure. Override the port with `SMOKE_PORT` / `SMOKE_BASE` if needed.
  - For a narrower run, invoke a script directly: `node scripts/list-page-smoke.mjs` (browser group — needs `pnpm dev` up) or `pnpm exec tsx scripts/msw-list-smoke.mjs` (MSW-node group — no dev server needed).
- At minimum, maintain logic tests for:
  - search params parsing
  - request builder logic
  - view model mappers
  - bet validation schema
- Before committing, run the full verification sequence in order:
  1. `pnpm fmt` — apply oxfmt formatting first, so subsequent lint/tests run against the same shape that will land in the commit.
  2. `pnpm lint` — oxlint must pass clean.
  3. `pnpm test:run` — all logic tests must pass.
  4. `pnpm build` — `tsc --noEmit` + Vite build must succeed.
  5. `pnpm smoke` (or specific smoke scripts) when the change touches routes, MSW handlers, or any user-visible page flow.
     Skipping any step is not allowed; if a step fails, fix the cause before committing.
- Before committing, re-read every comment added in this change. Delete any that paraphrase the code or reference the task; replace workaround flags with better types.
- README must document:
  - how to run the project
  - what was verified
  - which scenarios were checked
  - which limitations remain

## Documentation Rules

- Maintain `AI_USAGE.md` during the work.
- `AI_USAGE.md` must include:
  - what was done with AI
  - what decisions were made by the human
  - which AI suggestions were rejected
  - which areas were checked especially carefully
  - what risks remain
  - what would be improved with one more day

## Task Tracking Rules

- Keep SDD task files aligned with real implementation progress.
- When work finishes, review the statuses of the most recent relevant tasks, preferably only the last up to 3 touched tasks.
- If a task status is outdated, update it before concluding the work.
- Do not mark a task as completed unless its acceptance criteria are actually satisfied.

## Working Assumptions Already Chosen

- UI state library: Zustand
- UI approach: `shadcn/ui`
- Styling: Tailwind CSS
- Search/filter sync: URL params
- Router mode: code-based TanStack Router
- OpenAPI strategy: Hey API generated SDK and types, handwritten query layer
- MSW strategy: single in-memory runtime store
- Testing minimum: logic tests only
