import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'

import { AppHeader } from './app-header.component'

export function RootLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <AppHeader />
      <Outlet />
      <Toaster richColors closeButton />
    </div>
  )
}
