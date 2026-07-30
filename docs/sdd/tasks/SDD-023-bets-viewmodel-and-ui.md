# SDD-023 Bets ViewModel And UI

## Purpose

Render auction bets history in a review-friendly way.

## Scope

- Load bets data.
- Build derived presentation values.
- Show participants count, ranking, price fields, and empty states.

## Dependencies

- `SDD-013`
- `SDD-022`

## Acceptance Criteria

- Bets list is rendered with the required fields.
- Participants count is derived consistently from available data.
- Empty states and canceled-bet information are visible.

## Notes And Risks

- Derived values should be documented when the API does not expose them directly.
