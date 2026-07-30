# SDD-012 Implement MSW Detail Endpoint

## Purpose

Implement the auction detail endpoint according to the schema.

## Scope

- Implement `GET /auctions/{auctionUuid}`.
- Return detail DTOs with realistic restriction and nullable combinations.

## Dependencies

- `SDD-006`
- `SDD-010`

## Acceptance Criteria

- Response shape matches `AuctionShowResponse`.
- Missing-resource and error scenarios can be returned.
- Restriction flags are represented explicitly in mock data.

## Notes And Risks

- This endpoint drives multiple screens and rules, so hidden-field behavior must be testable.
