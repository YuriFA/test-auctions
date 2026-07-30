import { Outlet } from '@tanstack/react-router'

export function RootLayoutComponent() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Outlet />
    </div>
  )
}
