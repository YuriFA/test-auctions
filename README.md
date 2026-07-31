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
| Client UI state    | Zustand                                                    |
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
pnpm test:run       # vitest run (CI mode)
pnpm smoke          # starts vite dev on :5175 and runs every smoke script
```

`SMOKE_PORT` / `SMOKE_BASE` override the dev port and base URL for `pnpm smoke`. Individual smoke
scripts under `scripts/*-smoke.mjs` can be invoked directly — `node scripts/list-page-smoke.mjs`
(browser group, needs `pnpm dev` up) or `pnpm exec tsx scripts/msw-list-smoke.mjs` (MSW-node group,
no dev server needed).

## Project Layout

```
docs/
  openapi.auctions.v0.json         # contract source of truth
  sdd/                             # task decomposition (SDD-001..030) and decisions
src/
  app/                             # router, providers, route definitions
  pages/                           # shell + content page slices
  features/auction-filters/        # URL filter contract + form
  entities/auction/                # VM mappers, query hooks, badges, describe/labels
  shared/api/                      # generated SDK (isolated) + adapters + MSW
  shared/ui/                       # shadcn primitives
  shared/lib/                      # generic helpers
scripts/                           # smoke scripts (outside `pnpm check`)
AGENTS.md                          # rules for any AI/agent working in this repo
AI_USAGE.md                        # what was done with AI, decisions, risks, limitations
```
