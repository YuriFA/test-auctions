# SDD-006 Introduce OpenAPI Codegen

## Purpose

Introduce generated API artifacts based on the provided OpenAPI schema.

## Scope

- Configure Hey API.
- Generate SDK and types from `docs/openapi.auctions.v0.json`.
- Add a regeneration command.

## Dependencies

- `SDD-001`
- `SDD-003`

## Acceptance Criteria

- Generated artifacts are created from the provided schema.
- SDK and types are generated without query hooks.
- Regeneration is scriptable and documented.

## Notes And Risks

- Treat generated files as read-only.
