# SDD-017 Auctions List Query

## Purpose

Load and render the auctions list data flow.

## Scope

- Implement the list query.
- Connect pagination state.
- Add loading, empty, and error states.

## Dependencies

- `SDD-007`
- `SDD-008`
- `SDD-011`
- `SDD-016`

## Acceptance Criteria

- The list loads through TanStack Query.
- Pagination controls affect the active query.
- Required UI states are visible and meaningful.

## Notes And Risks

- Keep the data-loading layer separate from card presentation logic.
