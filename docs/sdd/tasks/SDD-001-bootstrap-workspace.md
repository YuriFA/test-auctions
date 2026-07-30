# SDD-001 Bootstrap Workspace

## Status

Completed.

## Purpose

Create the initial runnable frontend workspace.

## Scope

- Initialize Vite with React and TypeScript.
- Add baseline dependencies needed by the chosen architecture.
- Configure TypeScript paths and basic project scripts.

## Dependencies

- None.

## Acceptance Criteria

- The project starts locally.
- Base scripts for dev, build, and test are present.
- TypeScript path aliases are ready for FSD layers.

## Notes And Risks

- Keep the initial setup minimal.
- Avoid introducing extra infrastructure before it is needed.

## Completion Notes

- Vite + React + TypeScript bootstrap is in place.
- Baseline scripts now include `dev`, `build`, `preview`, `typecheck`, `lint`, `lint:fsd`, and `check`.
- TypeScript path aliases for FSD layers were added.
- Local verification completed with `pnpm typecheck` and `pnpm build`.
