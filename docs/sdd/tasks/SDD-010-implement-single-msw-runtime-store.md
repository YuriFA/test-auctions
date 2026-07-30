# SDD-010 Implement Single MSW Runtime Store

## Purpose

Create one shared runtime state for all mock handlers.

## Scope

- Implement the in-memory data store.
- Expose read and mutation operations for handlers.
- Ensure list, detail, and bets views derive from the same source.

## Dependencies

- `SDD-009`

## Acceptance Criteria

- All handlers use the same in-memory state.
- Runtime updates are visible across all related endpoints.
- State changes do not require duplicated patching in multiple handlers.

## Notes And Risks

- This is the main protection against inconsistent mock behavior.
