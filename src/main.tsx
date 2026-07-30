import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppComponent } from './app/app.component'

// MSW is a dev-only mock layer (D-009). In production the dynamic import is
// tree-shaken by Vite's `import.meta.env.PROD` branch, so `msw/browser` and
// the worker runtime never ship in the bundle. Awaiting `worker.start()` here
// guarantees no app fetch leaves the page before the worker is ready.
async function enableMockWorker(): Promise<void> {
  if (import.meta.env.PROD) return
  const { worker } = await import('@shared/api/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

await enableMockWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppComponent />
  </StrictMode>,
)
