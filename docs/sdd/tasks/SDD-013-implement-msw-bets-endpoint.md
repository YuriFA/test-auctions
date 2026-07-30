# SDD-013 Implement MSW Bets Endpoint

## Purpose

Implement the bets history endpoint according to the schema.

## Scope

- Implement `GET /auctions/{auctionUuid}/bets`.
- Support normal, empty, and hidden-history flows at the app level.

## Dependencies

- `SDD-006`
- `SDD-010`

## Acceptance Criteria

- Response shape matches `BetListResponse`.
- Empty bets scenarios are possible.
- Returned data can support UI rendering for rank, winner, and cancel states.

## Notes And Risks

- Hidden-history gating belongs to the broader detail-driven flow, not to this endpoint alone.
