import { Header } from '@shared/ui'
import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'

export function RootLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <Outlet />
      <Toaster richColors closeButton />
    </div>
  )
}
