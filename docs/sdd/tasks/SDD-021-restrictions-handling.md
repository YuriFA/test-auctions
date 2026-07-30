# SDD-021 Restrictions Handling

## Purpose

Enforce DTO-driven restrictions in the UI.

## Scope

- Handle `can_set_bet`.
- Handle `hide_bets_history`.
- Handle `hide_points_address_and_contacts`.
- Handle `no_view_cargo_price`.

## Dependencies

- `SDD-020`

## Acceptance Criteria

- Restricted data is hidden when the DTO requires it.
- Restricted actions are disabled or replaced with clear UI states.
- The UI behavior is deterministic for each restriction combination.

## Notes And Risks

- This logic is easy to spread across components accidentally; keep it deliberate.
