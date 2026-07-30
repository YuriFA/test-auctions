# Freight Auctions SPA

Frontend test project for working with freight auctions based on the provided OpenAPI schema.

## Current Status

- Clean React + TypeScript + Vite bootstrap
- Project-specific app shell instead of the default Vite demo
- FSD-oriented source layout baseline
- Baseline lint, typecheck, and Steiger configuration

## Planned Stack

- React
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- React Hook Form
- Zod
- MSW
- Zustand
- Tailwind CSS with `shadcn/ui`

## Run

```bash
pnpm install
pnpm dev
```

## Available Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm typecheck
pnpm lint
pnpm lint:fsd
pnpm check
pnpm codegen        # regenerate OpenAPI SDK + types from docs/openapi.auctions.v0.json
```

## Verification

Current bootstrap verification:

- the app starts with Vite
- TypeScript project references are configured
- baseline lint config is present
- source folders are aligned with the chosen architecture direction
- Hey API codegen regenerates the SDK into `src/shared/api/generated/`

## Limitations

- The auctions domain flows are not implemented yet.
- Hey API, TanStack Router, TanStack Query, Tailwind CSS, and `shadcn/ui` are wired; React Hook Form, Zod, and MSW are not yet integrated.
- This README will be expanded as implementation tasks are completed.
