# SDD-024 Bet Form Schema

## Purpose

Define the validation model for placing a bet.

## Scope

- Build the React Hook Form and Zod validation schema.
- Use detail DTO constraints for `min`, `max`, `step`, and available price hints.

## Dependencies

- `SDD-012`

## Acceptance Criteria

- Price is required and greater than zero.
- Conditional constraints from detail DTO are applied when present.
- Validation behavior is covered by logic tests.

## Notes And Risks

- The form must not assume all trading constraint fields are present.
