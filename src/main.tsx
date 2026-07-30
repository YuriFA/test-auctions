import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppComponent } from './app/app.component'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppComponent />
  </StrictMode>,
)
