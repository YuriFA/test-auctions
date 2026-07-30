# SDD Overview

## Goal

This folder contains the implementation decomposition for the freight auctions SPA.

The plan follows a specification-driven development approach:

- start from `docs/openapi.auctions.v0.json`
- preserve clear architectural boundaries
- implement in small, verifiable increments
- capture decisions before they are encoded in multiple places

## Source Inputs

- Requirements: `docs/project_requirements.md`
- API contract: `docs/openapi.auctions.v0.json`
- AI/policy rules: `AGENTS.md`

## Chosen Direction

- React + TypeScript + Vite
- TanStack Router in code-based mode
- TanStack Query with handwritten query logic
- Hey API for generated SDK and types
- Zustand for targeted UI state
- MSW with a single in-memory runtime store
- Tailwind CSS + `shadcn/ui`
- Feature-Sliced Design

## Task Layout

- `decisions.md` contains the agreed architectural choices.
- `tasks/` contains decomposed implementation tasks.
- Each task file includes:
  - purpose
  - scope
  - dependencies
  - acceptance criteria
  - notes and risks

## Task Index

1. `SDD-001` Bootstrap Workspace
2. `SDD-002` Establish Project Policies
3. `SDD-003` Set Up FSD Skeleton
4. `SDD-004` Configure Styling Foundation
5. `SDD-005` Configure Router And App Providers
6. `SDD-006` Introduce OpenAPI Codegen
7. `SDD-007` Build Shared API Layer
8. `SDD-008` Define Query Key Strategy
9. `SDD-009` Prepare Mock Domain Dataset
10. `SDD-010` Implement Single MSW Runtime Store
11. `SDD-011` Implement MSW List Endpoint
12. `SDD-012` Implement MSW Detail Endpoint
13. `SDD-013` Implement MSW Bets Endpoint
14. `SDD-014` Implement MSW Set Bet Endpoint
15. `SDD-015` Search Params Schema
16. `SDD-016` Request Builder
17. `SDD-017` Auctions List Query
18. `SDD-018` Auctions List Filters UI
19. `SDD-019` Auctions List Item Card
20. `SDD-020` Detail Page Composition
21. `SDD-021` Restrictions Handling
22. `SDD-022` Bets Nested Route
23. `SDD-023` Bets ViewModel And UI
24. `SDD-024` Bet Form Schema
25. `SDD-025` Bet Form Route
26. `SDD-026` Bet Mutation Integration
27. `SDD-027` Runtime Consistency Verification
28. `SDD-028` Logic Tests
29. `SDD-029` Final Documentation

## Execution Order

1. Foundation and policies
2. OpenAPI integration and API boundaries
3. Mock runtime and handlers
4. Routing, search params, and list flow
5. Detail, bets, and bet form flows
6. Tests, verification, and final documentation

## Planned Routes

- `/auctions`
- `/auctions/$auctionUuid`
- `/auctions/$auctionUuid/bets`
- `/auctions/$auctionUuid/bet`

## Cross-Cutting Rules

- All React component files use `*.component.tsx`.
- Generated OpenAPI files are read-only and isolated.
- Query hooks are not generated.
- URL search params are the source of truth for filters.
- Contract accuracy has higher priority than convenience.
