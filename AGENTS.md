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

## UI And Component Rules

- All React component files must use the `*.component.tsx` suffix.
- Apply this rule to all React component files, including page, route, layout, and reusable component files.
- The interface should be neat, adaptive, and convenient to review on desktop and mobile.
- Respect DTO-driven restrictions in the UI, including:
  - `can_set_bet`
  - `hide_bets_history`
  - `hide_points_address_and_contacts`
  - `no_view_cargo_price`

## Testing And Verification Rules

- The project must run locally.
- At minimum, maintain logic tests for:
  - search params parsing
  - request builder logic
  - view model mappers
  - bet validation schema
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
