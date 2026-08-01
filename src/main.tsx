import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/app.component'

// NOTE: must await worker.start() before createRoot — otherwise the first
// app fetches race the MSW worker and leak to the network. The worker is
// started in every environment (including PROD on Netlify) because there is
// no real backend; without it, /api/v1 requests 404 against the static host.
async function enableMockWorker(): Promise<void> {
  const { worker, installMockResolver } = await import('@shared/api/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
  installMockResolver()
}

await enableMockWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
