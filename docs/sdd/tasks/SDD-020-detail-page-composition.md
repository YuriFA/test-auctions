# SDD-020 Detail Page Composition

## Purpose

Implement the main auction detail route and screen structure.

## Scope

- Load detail data.
- Render main auction information.
- Render organizer, payment, routes, cargo, and trading sections.

## Dependencies

- `SDD-007`
- `SDD-008`
- `SDD-012`

## Acceptance Criteria

- Detail route loads correctly by `auctionUuid`.
- Core sections from the detail DTO are rendered.
- Nullable data is handled without UI breakage.

## Notes And Risks

- The detail page becomes the control center for restrictions and downstream route access.
