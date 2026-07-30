# AI_USAGE.md

## What Was Done With AI

- Reviewed `docs/project_requirements.md`.
- Reviewed `docs/openapi.auctions.v0.json`.
- Extracted project constraints, AI-related rules, and contract risks.
- Proposed architecture options for code generation, router setup, styling, and mock state handling.
- Produced SDD-oriented decomposition into small implementation tasks.
- Drafted project-level AI rules in `AGENTS.md`.

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

## Which AI Suggestions Were Rejected

- Avoid generating React Query hooks from OpenAPI tooling.
- Avoid exposing generated OpenAPI artifacts directly to feature and entity layers.
- Avoid localStorage as the primary source of truth for filters.
- Avoid route design that hides bets flow outside the auction route hierarchy.

## Which Areas Were Checked Especially Carefully

- Contract-sensitive DTO fields, especially `nullable` fields.
- Enum differences between list and detail responses.
- Validation and error handling expectations for `422` responses.
- DTO-driven UI restrictions such as hidden contacts, hidden price data, and hidden bet history.
- Mock-state consistency requirements after bet mutation.

## What Risks Remain

- Some product expectations are broader than the exact response shapes in OpenAPI, so a few UI values may need to be derived from available data.
- The schema is detailed and contains many nullable fields, which increases the chance of accidental UI assumptions during implementation.
- MSW consistency across list, detail, and bets views can regress if state updates are implemented in multiple places instead of one runtime store.

## What Would Be Improved With One More Day

- Add broader automated tests beyond pure logic checks.
- Tighten visual states for mobile and error scenarios.
- Expand mock scenarios for more edge cases and hidden-data combinations.
- Add richer README verification notes with scenario matrix and screenshots.
