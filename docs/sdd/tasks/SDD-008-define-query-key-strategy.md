# SDD-008 Define Query Key Strategy

## Status

Completed.

## Purpose

Define consistent query keys and invalidation rules before features are implemented.

## Scope

- Define query keys for auctions list, detail, and bets.
- Define the invalidation plan for bet mutations.
- Decide where query helpers live in the codebase.

## Dependencies

- `SDD-005`
- `SDD-007`

## Acceptance Criteria

- Query keys are documented in code or a dedicated helper module.
- Bet mutation invalidates the intended queries consistently.
- No duplicate or ad-hoc query key patterns are introduced.

## Notes And Risks

- Query-key discipline reduces later cache bugs.
