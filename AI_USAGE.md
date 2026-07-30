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

## Current SDD Coverage

- Completed:
  - `SDD-001 Bootstrap Workspace`
  - `SDD-002 Establish Project Policies`
  - `SDD-003 Set Up FSD Skeleton`
- Not covered yet in code:
  - `SDD-004` and all later implementation tasks

## Notes On Current Coverage

- The staged files provide a working starter app and baseline tooling.
- `SDD-001` is completed: the project now has baseline scripts, TypeScript configs, path aliases, and verified local `typecheck` and `build`.
- `SDD-002` is completed: `AGENTS.md`, `AI_USAGE.md`, and a project-specific `README.md` are present.
- `SDD-003` is completed: the FSD-oriented folder structure exists and the entry component already follows the `*.component.tsx` naming rule.
- The current UI is still only a bootstrap shell, not the auctions application.

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
- The current bootstrap does not yet include TanStack Router, TanStack Query, React Hook Form, Zod, MSW, Tailwind CSS, or `shadcn/ui` integration.
- The current bootstrap does not yet follow the `*.component.tsx` naming rule because the starter app still uses default Vite file naming.

## What Would Be Improved With One More Day

- Replace the generic starter screen and README with project-specific application scaffolding.
- Introduce the missing mandatory stack pieces and the real FSD folder structure.
- Add broader automated tests beyond pure logic checks.
- Tighten visual states for mobile and error scenarios.
- Expand mock scenarios for more edge cases and hidden-data combinations.
- Add richer README verification notes with scenario matrix and screenshots.
