# SDD-003 Set Up FSD Skeleton

## Status

Completed.

## Purpose

Prepare the project structure around Feature-Sliced Design boundaries.

## Scope

- Create the core `src` layer folders.
- Establish import boundaries and naming expectations.
- Reserve locations for API, generated code, and shared utilities.

## Dependencies

- `SDD-001`
- `SDD-002`

## Acceptance Criteria

- `app`, `pages`, `widgets`, `features`, `entities`, and `shared` folders exist.
- API integration points have a clear home under `shared/api`.
- There is no direct dependency from higher layers to generated code.

## Notes And Risks

- Keep boundaries explicit early to avoid later refactors.

## Completion Notes

- Core source folders now exist for `app`, `pages`, `widgets`, `features`, `entities`, and `shared`.
- `shared/api`, `shared/config`, `shared/lib`, and `shared/ui` placeholders were added.
- Source entrypoint now uses `src/app/app.component.tsx`, which aligns the bootstrap with the chosen naming rule.
- Generated API code is still not present, but the folder structure already reserves a clear integration boundary.
