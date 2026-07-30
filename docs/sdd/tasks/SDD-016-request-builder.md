# SDD-016 Request Builder

## Purpose

Translate validated search params into the API list request shape.

## Scope

- Map search params to `AuctionListRequest`.
- Handle date, number, boolean, enum, and array fields cleanly.

## Dependencies

- `SDD-006`
- `SDD-015`

## Acceptance Criteria

- Built requests conform to the expected DTO shape.
- Only relevant fields are sent.
- Conversion logic is covered by tests.

## Notes And Risks

- Avoid leaking UI-specific naming into raw API request construction.
