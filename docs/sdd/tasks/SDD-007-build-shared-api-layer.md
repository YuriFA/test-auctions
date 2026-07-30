# SDD-007 Build Shared API Layer

## Purpose

Wrap generated API artifacts behind application-owned adapters.

## Scope

- Create `shared/api` client setup.
- Add auction-focused API modules over generated SDK calls.
- Keep generated code hidden from higher layers.

## Dependencies

- `SDD-006`

## Acceptance Criteria

- The app uses `shared/api` modules instead of importing generated SDK directly.
- API entry points are grouped coherently by domain.
- The boundary between generated code and app code is explicit.

## Notes And Risks

- This task is important for keeping FSD boundaries clean.
