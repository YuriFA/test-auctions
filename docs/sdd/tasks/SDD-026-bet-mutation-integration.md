# SDD-026 Bet Mutation Integration

## Purpose

Connect the bet form to the mutation and cache lifecycle.

## Scope

- Submit `POST /auctions/{auctionUuid}/bets`.
- Map server validation errors into form UI.
- Show success and error toasts.
- Invalidate affected queries.

## Dependencies

- `SDD-008`
- `SDD-014`
- `SDD-024`
- `SDD-025`

## Acceptance Criteria

- Successful submission updates the user-visible state after refetch or invalidation.
- `422` validation errors are surfaced in the form.
- Success and failure feedback are visible.

## Notes And Risks

- Cache invalidation must cover list, detail, and bets.
