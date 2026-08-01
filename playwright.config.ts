import { defineConfig, devices } from '@playwright/test'

/**
 * E2E / smoke tests. Replaces the hand-rolled `scripts/*-smoke.mjs` driver
 * scripts with `@playwright/test` so assertions auto-wait (killing the
 * networkidle race class of bugs) and the dev server is lifecycle-managed
 * via `webServer`.
 *
 * The MSW worker is enabled by the app itself (src/main.tsx) in dev — the
 * browser tests just drive the resulting UI, same as the old smoke scripts.
 */
const PORT = process.env.SMOKE_PORT ?? '5175'
const BASE = process.env.SMOKE_BASE ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: BASE,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm exec vite --port ${PORT} --strictPort`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
