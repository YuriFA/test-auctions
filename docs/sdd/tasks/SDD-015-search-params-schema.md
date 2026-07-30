# SDD-015 Search Params Schema

## Purpose

Define safe parsing rules for list page search params.

## Scope

- Build the Zod schema for search params.
- Define fallback values.
- Support the selected filter set.

## Dependencies

- `SDD-005`

## Acceptance Criteria

- Invalid search params do not break the page.
- Fallback values are explicit and predictable.
- URL parsing can support the request builder.

## Notes And Risks

- Search-param correctness is important for routing, testing, and reproducibility.
