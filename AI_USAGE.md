# AI_USAGE.md

## What Was Done With AI

- Reviewed `docs/project_requirements.md`.
- Reviewed `docs/openapi.auctions.v0.json`.
- Extracted project constraints, AI-related rules, and contract risks.
- Proposed architecture options for code generation, router setup, styling, and mock state handling.
- Produced SDD-oriented decomposition into small implementation tasks.
- Drafted project-level AI rules in `AGENTS.md`.
- Helped bootstrap the frontend workspace with a React + TypeScript + Vite baseline.
- Helped add baseline project configuration such as package scripts, TypeScript configs, Vite config, and linting setup.
- Helped introduce FSD-oriented static analysis groundwork via `steiger` configuration.
- Reviewed which SDD tasks are actually covered by the currently staged implementation.
- Set up Tailwind v4 with shadcn/ui tokens and the base-mira style.
- Migrated shadcn artifacts onto FSD aliases (`@shared/ui`, `@shared/lib`) and verified the runtime chain via build.
- Split shadcn Button into `*.component.tsx` and `*.styles.ts` to satisfy oxlint `react(only-export-components)` and Fast Refresh.
- Configured code-based TanStack Router with a typed router context and TanStack Query provider.
- Added base routes (`/`, `/auctions`, `/auctions/$auctionUuid`, `/auctions/$auctionUuid/bets`, `/auctions/$auctionUuid/bet`) with root layout, error and not-found boundaries.
- Verified all routes (including redirect and 404) with a Playwright smoke test under `scripts/route-smoke.mjs`.
- Wired Hey API codegen against `docs/openapi.auctions.v0.json` with the bundled fetch client and SDK + schemas plugins, output isolated to `src/shared/api/generated/`.
- Built the `shared/api` adapter: domain entry points (`fetchAuctionList`, `fetchAuctionDetail`, `fetchBets`, `placeBet`) over the generated SDK, plus `ApiError`/`ApiValidationError` normalization for `application/problem+json` and `422` responses.
- Defined the TanStack Query key strategy in `src/entities/auction/api/query-keys.ts` (hierarchical `auctionKeys` factory covering list, detail, and bets) and a `betMutationInvalidationTargets` helper listing every query that must refetch after a successful bet.

## Current SDD Coverage

- Completed:
  - `SDD-001 Bootstrap Workspace`
  - `SDD-002 Establish Project Policies`
  - `SDD-003 Set Up FSD Skeleton`
  - `SDD-004 Configure Styling Foundation`
  - `SDD-005 Configure Router And App Providers`
  - `SDD-006 Introduce OpenAPI Codegen`
  - `SDD-007 Build Shared API Layer`
  - `SDD-008 Define Query Key Strategy`
- Not covered yet in code:
  - `SDD-009` and all later implementation tasks

## Notes On Current Coverage

- The staged files provide a working starter app and baseline tooling.
- `SDD-001` is completed: the project now has baseline scripts, TypeScript configs, path aliases, and verified local `typecheck` and `build`.
- `SDD-002` is completed: `AGENTS.md`, `AI_USAGE.md`, and a project-specific `README.md` are present.
- `SDD-003` is completed: the FSD-oriented folder structure exists and the entry component already follows the `*.component.tsx` naming rule.
- `SDD-004` is completed: Tailwind v4 and `shadcn/ui` are wired in through FSD aliases. Vite resolve aliases mirror the TypeScript path aliases. The shadcn Button lives at `src/shared/ui/button.component.tsx` plus `button.styles.ts`, with `cn` at `src/shared/lib/cn.ts`. `components.json` aliases point at `@shared/ui`, `@shared/lib`, and `@shared/lib/cn` so future `shadcn add` commands land inside FSD.
- `SDD-005` is completed: TanStack Router runs in code-based mode with `RouterProvider` + `QueryClientProvider` wired in `src/app/app.component.tsx`. The QueryClient singleton lives at `src/app/lib/query-client.ts` (steiger flags `providers` and `store` as content-named, so `lib` is the purpose-named segment). Route definitions are split from page components: routes live under `src/app/routes/*.route.tsx`, page components live under `src/pages/<slice>/ui/*.component.tsx` and are reached through slice Public API `index.ts`. A Playwright smoke test under `scripts/route-smoke.mjs` verifies that `/` redirects to `/auctions`, all four planned routes render with the correct `$auctionUuid` param, and unknown URLs surface the root not-found boundary.
- `SDD-006` is completed: Hey API generates the SDK and types into `src/shared/api/generated/` via `pnpm codegen`. The config lives in `openapi-ts.config.ts` and uses the bundled fetch client (no separate `@hey-api/client-fetch` runtime dep — it ships inside `@hey-api/openapi-ts` since v0.73). The local OpenAPI path must start with `./` so v0.99 treats it as a relative path rather than the Hey API cloud shorthand. The generated folder is excluded from oxlint via `.oxlintrc.json` `ignorePatterns` and treated as read-only; downstream layers must reach it through the `shared/api` Public API adapter that SDD-007 will introduce.
- `SDD-007` is completed: the `shared/api` segment exposes four adapter functions (`fetchAuctionList`, `fetchAuctionDetail`, `fetchBets`, `placeBet`) and the DTO types app code needs, all routed through `src/shared/api/index.ts`. Adapters translate Hey API's `RequestResult` into thrown `ApiError` / `ApiValidationError` so callers can use `try/catch` and type-narrow with `isApiValidationError`. The error normalizer handles `application/problem+json`, the `422` validation payload with field-level `errors`, and network failures where `response` is undefined. The generated folder remains reachable only via relative imports inside `shared/api`; oxlint has no `no-restricted-paths` equivalent yet, so the boundary is enforced by folder layout and Public API rather than lint.
- `SDD-008` is completed: the `entities/auction` slice owns the query key factory `auctionKeys` (`all`, `lists`, `list(filters)`, `details`, `detail(uuid)`, `bets(uuid, options)`) and the `betMutationInvalidationTargets(uuid)` helper, exposed via the slice Public API. The keys are hierarchical so invalidating a parent automatically refreshes nested queries; bets is a child of detail so the bet mutation's invalidation plan reads as documentation. Steiger's `fsd/insignificant-slice` rule is turned off in `steiger.config.ts` because the slice is intentionally forward-looking — features in SDD-017+ will be its first consumers.
- The current UI is still only a styled bootstrap shell with placeholder pages, not the auctions application.

## What Decisions Were Made By The Candidate

- Use Hey API for generated SDK and types.
- Keep TanStack Query handwritten instead of generated.
- Use code-based TanStack Router.
- Use Zustand for targeted client UI state.
- Use URL search params for filters.
- Use Tailwind CSS with `shadcn/ui`.
- Build bets history as a nested route/tab.
- Keep `AGENTS.md` as policy/rules only.
- Require `*.component.tsx` naming for all React component files.
- Keep the generated OpenAPI layer isolated behind `shared/api`.
- Use `steiger` to help enforce Feature-Sliced Design boundaries.
- Map shadcn `components.json` aliases onto FSD layers (`@shared/ui`, `@shared/lib`) instead of the default `@/components` and `@/lib`.
- Split each shadcn UI primitive into `*.component.tsx` plus `*.styles.ts` to satisfy `react(only-export-components)`.
- Treat TanStack Router code-based routes as `.route.tsx` files and page components as `*.component.tsx` files in `src/pages/<slice>/ui/`, exposed via a slice `index.ts` Public API.
- Put the QueryClient singleton in `src/app/lib/` rather than `app/providers` or `app/store` because steiger's `fsd/segments-by-purpose` flags both as content-named.
- Pin Hey API inputs to relative paths starting with `./` so v0.99 does not parse them as the cloud "organization/project" shorthand.
- Keep generated OpenAPI artifacts read-only and excluded from lint; reach them only through the handwritten `shared/api` adapter.
- Wrap generated SDK calls in `shared/api` adapter functions that throw unified `ApiError` / `ApiValidationError` instead of leaking Hey API's `RequestResult` shape to callers.
- Keep query keys in a single hierarchical factory (`auctionKeys`) under `entities/auction`, so list, detail, and bets share prefixes and a bet mutation can invalidate every dependent query at once.

## Which AI Suggestions Were Rejected

- Avoid generating React Query hooks from OpenAPI tooling.
- Avoid exposing generated OpenAPI artifacts directly to feature and entity layers.
- Avoid localStorage as the primary source of truth for filters.
- Avoid route design that hides bets flow outside the auction route hierarchy.
- Avoid jumping directly into feature implementation before documenting decomposition and architectural guardrails.

## Which Areas Were Checked Especially Carefully

- Contract-sensitive DTO fields, especially `nullable` fields.
- Enum differences between list and detail responses.
- Validation and error handling expectations for `422` responses.
- DTO-driven UI restrictions such as hidden contacts, hidden price data, and hidden bet history.
- Mock-state consistency requirements after bet mutation.
- Whether the currently staged files really match the claimed SDD progress instead of only matching the intended plan.

## What Risks Remain

- The currently staged code is still close to a template bootstrap and does not yet reflect the required application architecture or screens.
- The bootstrap already replaces the Vite demo and establishes the initial application structure, but the business flows are still missing.
- Some product expectations are broader than the exact response shapes in OpenAPI, so a few UI values may need to be derived from available data.
- The schema is detailed and contains many nullable fields, which increases the chance of accidental UI assumptions during implementation.
- MSW consistency across list, detail, and bets views can regress if state updates are implemented in multiple places instead of one runtime store.
- The current bootstrap does not yet include React Hook Form, Zod, or MSW integration. TanStack Router and TanStack Query are wired in as of `SDD-005`; Tailwind CSS and `shadcn/ui` as of `SDD-004`; Hey API SDK as of `SDD-006`; `shared/api` adapter as of `SDD-007`; query key strategy as of `SDD-008`.
- shadcn-generated components ship with two exports by default; they must be split into `*.component.tsx` plus `*.styles.ts` on each `shadcn add` to satisfy the project lint rule.
- The Playwright smoke test in `scripts/route-smoke.mjs` assumes a running dev server; it is not wired into a CI script yet.
- The `shared/api` adapter is exercised by typecheck and build but not yet by a runtime test; MSW handlers (SDD-010+) and logic tests (SDD-028) will cover behaviour.
- Query keys and the bet mutation invalidation plan are defined but not yet consumed; the `entities/auction` slice has no incoming references until SDD-017 wires the first list query.
- Generated SDK exports ~50 raw OpenAPI types and 4 SDK functions that downstream code must not import directly; the `shared/api` adapter is the boundary that exposes only the DTOs and operations app code needs.

## What Would Be Improved With One More Day

- Replace the generic starter screen and README with project-specific application scaffolding.
- Introduce the missing mandatory stack pieces and the real FSD folder structure.
- Add broader automated tests beyond pure logic checks.
- Tighten visual states for mobile and error scenarios.
- Expand mock scenarios for more edge cases and hidden-data combinations.
- Add richer README verification notes with scenario matrix and screenshots.
