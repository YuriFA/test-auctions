import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/app.component'

// NOTE: must await worker.start() before createRoot — otherwise the first
// app fetches race the MSW worker and leak to the network. Dynamic import is
// tree-shaken in PROD so the worker runtime never ships in the bundle.
async function enableMockWorker(): Promise<void> {
  if (import.meta.env.PROD) {
    return
  }
  const { worker } = await import('@shared/api/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

await enableMockWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
