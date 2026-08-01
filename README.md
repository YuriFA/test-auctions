# Freight Auctions SPA

Frontend test project for freight auctions. Single-page React application driven by an
OpenAPI contract (`docs/openapi.auctions.v0.json`), mocked end-to-end with MSW.

## Stack

| Concern            | Choice                                                     |
| ------------------ | ---------------------------------------------------------- |
| UI library         | React + TypeScript                                         |
| Build tool         | Vite                                                       |
| Routing            | TanStack Router (code-based, typed `validateSearch`)       |
| Server state       | TanStack Query (handwritten hooks, generated SDK isolated) |
| Forms              | React Hook Form                                            |
| Validation         | Zod                                                        |
| Mock API           | MSW (single in-memory runtime store)                       |
| Client UI state    | URL search params + local `useState` (see note below)      |
| Notifications      | Sonner (toasts for bet mutation feedback)                  |
| Styling            | Tailwind CSS v4 + `shadcn/ui`                              |
| Architecture       | Feature-Sliced Design                                      |
| Codegen            | Hey API → `src/shared/api/generated/`                      |
| Formatter / linter | oxfmt + oxlint, plus Steiger for FSD boundaries            |

## Run

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

MSW intercepts every API call in development — no backend is required. The worker boots before
`createRoot`, so no app fetch leaks to the network.

## Available Scripts

```bash
pnpm dev            # vite dev server
pnpm build          # tsc -b && vite build
pnpm preview        # preview the production build
pnpm typecheck      # tsc -b / --noEmit
pnpm lint           # oxlint
pnpm lint:fsd       # steiger FSD boundary checks
pnpm fmt            # oxfmt (writes)
pnpm fmt:check      # oxfmt (check only)
pnpm check          # typecheck + lint
pnpm codegen        # regenerate OpenAPI SDK + types from docs/openapi.auctions.v0.json
pnpm test           # vitest watch
pnpm test:run       # vitest run (CI mode) — logic + MSW-handler integration tests
pnpm test:e2e       # playwright — browser smokes (auto-starts vite on :5175)
```

`SMOKE_PORT` / `SMOKE_BASE` override the dev port and base URL for `pnpm test:e2e`. Filter by file
or test name with `pnpm test:e2e e2e/route.spec.ts` or `--grep "pagination"`.

## Project Layout

```
docs/
  openapi.auctions.v0.json         # contract source of truth
  sdd/                             # task decomposition (SDD-001..031) and decisions
src/
  app/                             # router, providers, route definitions
  pages/                           # shell + content page slices
  features/auction-filters/        # URL filter contract + form
  entities/auction/                # VM mappers, query hooks, badges, describe/labels
  shared/api/                      # generated SDK (isolated) + adapters + MSW
  shared/ui/                       # shadcn primitives
  shared/lib/                      # generic helpers
e2e/                               # playwright browser smokes (run via `pnpm test:e2e`)
AGENTS.md                          # rules for any AI/agent working in this repo
AI_USAGE.md                        # what was done with AI, decisions, risks, limitations
```

## Verification

Three layers of automated checks; each layer owns a distinct concern.

### `pnpm check` (format + logic + types + boundaries)

Fast loop, runs locally on every save and mirrors the CI matrix in `.github/workflows/ci.yml`. Adding a gate here should also land in the workflow and vice versa.

| Layer          | Command          | What it asserts                                                                                  |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| Format         | `pnpm fmt:check` | oxfmt — verifies formatting without writing; the only formatting gate (no `fmt` in `check`)      |
| Types          | `pnpm typecheck` | `tsc -b` across app + tests; catches contract drift between OpenAPI codegen, DTOs, and consumers |
| Lint           | `pnpm lint`      | oxlint — React hooks, accessibility, import order                                                |
| FSD boundaries | `pnpm lint:fsd`  | steiger — `shared/api/generated` isolation, public/private slices, import direction              |

### CI (`.github/workflows/ci.yml`)

Every push to `main` and every PR runs the full gate matrix in parallel: `fmt:check`, `typecheck`, `lint`, `lint:fsd`, `test:run`, `test:e2e`. `pnpm check` covers the first four locally; the two `test:*` gates run only in CI (and via `pnpm test:run` / `pnpm test:e2e` manually) because they need a vitest/playwright runtime.

### Optional: `pnpm lint:knip`

Knip scans for unused files, dependencies, and exports. Not in `pnpm check` or CI yet — it currently flags FSD barrel re-exports (`entities/auction/index.ts`, `shared/api/index.ts`, etc.) as "unused". These are intentional public-API surface for downstream slices, so promoting knip to a hard gate requires either tuning `knip.json` to exempt barrel `index.ts` files or trimming the exports. Run manually to spot genuine dead code.

### `pnpm test:run` (logic + MSW integration)

Vitest, ~310 tests across 17 files. Co-located with source as `*.test.ts`.

| Area                                      | Suite                                                                              | Notable cases                                                                                               |
| ----------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Search params contract (parse/serialize)  | `features/auction-filters/lib/search-params.test.ts`                               | round-trip parse ∘ serialize, defaults are not serialized, falsy `is_available: false` preserved            |
| Filter chips                              | `features/auction-filters/lib/filter-chips.test.ts`                                | one chip per array value, `page`/`cargo_num` excluded, immutable removal                                    |
| Request builder                           | `features/auction-filters/lib/request-builder.test.ts`                             | defaults skipped, `auc_type: 'Unknown'` filtered, admin-only fields never leak                              |
| Bet form schema                           | `features/bet-form/lib/bet-form-schema.test.ts`                                    | required + `> 0`, `min`/`max`/`step` from constraints, step-alignment from `base`, NaN/Infinity rejection   |
| ViewModel mappers                         | `entities/auction/lib/{list-item,detail,bets,restrictions,primary-action}.test.ts` | nullable collapse, enum→label, restriction derivation, primary-action priority over `can_set_bet`           |
| Formatters + badge variants               | `entities/auction/lib/{format,badge-variants}.test.ts`                             | ru-RU `Intl`, NBSP thousands separator, fallback `—`, every enum covered                                    |
| **MSW handler integration** (SDD-028 API) | `shared/api/mocks/handlers/auctions-set-bet.test.ts`                               | after `writeBet`: list + detail + bets return updated DTO (current price, `Leading`, rejected previous bet) |

### `pnpm test:e2e` (browser smokes)

Playwright, 21 tests across 6 specs. Auto-starts vite on `:5175` via `playwright.config.ts` `webServer`.

| Spec                            | Covers                                                                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `e2e/route.spec.ts` (9)         | 4 routes + 3 error states + restricted bets + unknown UUID on `/bet`                                                         |
| `e2e/list-page.spec.ts` (4)     | header render, hover-prefetch GET, card click → detail, pagination writes `page` param                                       |
| `e2e/filters-ui.spec.ts` (5)    | search commits on blur w/o bumping counter, sheet open/apply/close, backdrop close, X close                                  |
| `e2e/bet-form.spec.ts` (1)      | +/- stepper moves by one step, button disabled at boundaries, submit enabled                                                 |
| `e2e/msw-browser.spec.ts` (1)   | MSW intercepts SDK-shaped fetches in the real browser worker                                                                 |
| `e2e/mutation-flow.spec.ts` (1) | **SDD-028 UI**: place bet 44000 → `/bets` shows it → SPA nav to detail shows "44 000 ₽" → SPA nav to list reflects new price |

The mutation-flow spec is the SDD-028 acceptance gate: it walks the same `writeBet` mutation through bets → detail → list using SPA clicks (not `page.goto`) so MSW's in-memory state survives between screens. This is what proves query invalidation (`betMutationInvalidationTargets`) keeps the three views consistent without a manual refetch.

### Manual scenarios worth eyeballing

- Dark mode toggle (if the layout exposes one) — semantic Badge variants must hold against the oklch tokens.
- Long city / cargo names — the card truncates, but tooltips are explicitly out of scope (see `AI_USAGE.md`).
- Direct URL with `is_available=false` — the form never produces it, but the URL parser accepts; chips surface it with a `: нет` suffix.
- `pnpm codegen` after touching `docs/openapi.auctions.v0.json` — confirm `src/shared/api/generated/` regenerates without manual edits.

### Known limitations

- No real backend; MSW is the only API. The adapter boundary (`shared/api`) is structured so a real backend can drop in by replacing the mock handlers, but no integration test exists against a non-mock service.
- Browser smokes are not in `pnpm check` — they need a running vite dev server and Playwright browsers. Run them via `pnpm test:e2e` separately.
- Visual regression and mobile-specific rendering are not covered by automation; the design is responsive but only smoke-checked at 375 px in `filters-ui.spec.ts`.
- Current route param is `auctionRef` (backed by `main.order_uid` in list DTO), while adapter-layer resolves it to the real `auctionUuid` required by the OpenAPI paths. This keeps list DTO contract-clean but remains a mock-era workaround until backend exposes a contract-level list->detail identity.

### Client UI state — why no Zustand store

The assignment mandates "MobX or Zustand for targeted UI state." The current solution has **no global client store**: URL search params are the source of truth for filters, and the remaining UI state (form fields, stepper, modal open/close flags) lives in local `useState` / React Hook Form. This is a **deliberate tradeoff, not an oversight**: every piece of UI state we have is either already server-derived (URL params, TanStack Query cache) or strictly component-local, so a Zustand store would be a formal checkbox with no real responsibility. Introducing a global store purely to satisfy the requirement would add indirection without a single concrete consumer.

The seam is preserved: if cross-component client state appears (e.g. persisted drafts, multi-step wizards, optimistic UI overlays that several screens must agree on), Zustand slots in at `shared/lib`/`features/*` without touching existing hooks. Until that need is real, the codebase stays leaner without it.
