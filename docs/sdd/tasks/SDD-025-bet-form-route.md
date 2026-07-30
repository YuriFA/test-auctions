# SDD-025 Bet Form Route

## Purpose

Implement the bet-entry route reachable by direct link.

## Scope

- Add `/auctions/$auctionUuid/bet`.
- Render the bet form route.
- Handle unavailable state when betting is not allowed.

## Dependencies

- `SDD-005`
- `SDD-020`
- `SDD-021`
- `SDD-024`

## Acceptance Criteria

- The bet form opens by route.
- Users cannot submit when betting is not allowed.
- The route explains unavailable state clearly.

## Notes And Risks

- The route should still be safe if the URL is opened directly.
