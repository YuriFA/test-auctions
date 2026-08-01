import { createRootRouteWithContext } from '@tanstack/react-router'

import { RootError } from '../layouts/root-error.component'
import { RootLayout } from '../layouts/root-layout.component'
import { RootNotFound } from '../layouts/root-not-found.component'
import type { RouterAppContext } from '../router'

export const rootRoute = createRootRouteWithContext<RouterAppContext>()({
  component: RootLayout,
  errorComponent: RootError,
  notFoundComponent: RootNotFound,
})
