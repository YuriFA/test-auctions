# SDD-028 Logic Tests

## Purpose

Cover the most critical pure logic with focused automated tests.

## Scope

- Test search params parsing.
- Test request builder logic.
- Test view model mappers.
- Test bet validation schema.

## Dependencies

- `SDD-015`
- `SDD-016`
- `SDD-023`
- `SDD-024`

## Acceptance Criteria

- The selected logic tests are implemented and pass.
- Tests cover normal and edge-case inputs.
- Test failures would meaningfully catch regression in contract handling.

## Notes And Risks

- Keep tests focused on logic that is easiest to regress and hardest to inspect visually.
