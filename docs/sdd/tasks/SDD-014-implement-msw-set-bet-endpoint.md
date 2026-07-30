# SDD-014 Implement MSW Set Bet Endpoint

## Purpose

Implement the bet mutation endpoint with realistic validation behavior.

## Scope

- Implement `POST /auctions/{auctionUuid}/bets`.
- Support success, not found, and validation failure cases.
- Return `application/problem+json` validation errors for `422`.

## Dependencies

- `SDD-006`
- `SDD-010`

## Acceptance Criteria

- Request validation follows the schema and business constraints.
- Validation failures match the documented error shape.
- Success updates shared runtime state.

## Notes And Risks

- This endpoint should not only accept data, it must change the app-visible runtime state.
