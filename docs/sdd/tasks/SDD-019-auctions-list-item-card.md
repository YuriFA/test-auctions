# SDD-019 Auctions List Item Card

## Purpose

Create the auction card presentation used by the list.

## Scope

- Render the required list card fields.
- Surface the primary action state.
- Support mobile and desktop layouts.

## Dependencies

- `SDD-017`
- `SDD-018`

## Acceptance Criteria

- Card shows request number, route, cargo, pricing, statuses, and user bet state.
- Primary action reflects available business state.
- Layout remains readable on mobile and desktop.

## Notes And Risks

- Avoid coupling the card directly to raw DTO structure if a mapper is needed.
