# SDD-005 Configure Router And App Providers

## Purpose

Create the application shell and runtime providers.

## Scope

- Configure TanStack Router in code-based mode.
- Configure TanStack Query.
- Add app-level providers, layout shell, and error handling entry points.

## Dependencies

- `SDD-001`
- `SDD-003`
- `SDD-004`

## Acceptance Criteria

- Base routes resolve correctly.
- Query client is wired into the app.
- App shell can host list, detail, bets, and form routes.

## Notes And Risks

- Keep route definition separate from route-page implementation where useful, while preserving the component naming rule.
