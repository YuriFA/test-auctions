# SDD-018 Auctions List Filters UI

## Purpose

Implement the filters UI and synchronize it with URL state.

## Scope

- Add the required minimum filters.
- Bind filter values to search params.
- Integrate the cities dictionary.

## Dependencies

- `SDD-009`
- `SDD-015`
- `SDD-017`

## Acceptance Criteria

- Filter interactions update the URL.
- Refreshing or sharing the URL preserves filter state.
- City-based filters use the mock dictionary.

## Notes And Risks

- Avoid hidden local state becoming the real source of truth.
