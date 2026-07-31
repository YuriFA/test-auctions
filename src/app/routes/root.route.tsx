import { createRootRoute } from '@tanstack/react-router'

import { RootError } from '../layouts/root-error.component'
import { RootLayout } from '../layouts/root-layout.component'
import { RootNotFound } from '../layouts/root-not-found.component'

export const rootRoute = createRootRoute({
  component: RootLayout,
  errorComponent: RootError,
  notFoundComponent: RootNotFound,
})
