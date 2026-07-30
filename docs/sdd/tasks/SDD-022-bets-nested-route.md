# SDD-022 Bets Nested Route

## Purpose

Implement the nested route for auction bets history.

## Scope

- Add `/auctions/$auctionUuid/bets`.
- Connect route access to detail-driven restrictions.

## Dependencies

- `SDD-005`
- `SDD-020`
- `SDD-021`

## Acceptance Criteria

- Bets route resolves as a nested auction route.
- When history is hidden, the route shows a restricted state instead of normal content.
- When allowed, the route can load bets data.

## Notes And Risks

- Route behavior should be consistent whether reached by link or direct URL entry.
