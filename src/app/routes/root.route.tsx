import { createRootRoute } from '@tanstack/react-router'

import { RootErrorComponent } from '../layouts/root-error.component'
import { RootLayoutComponent } from '../layouts/root-layout.component'
import { RootNotFoundComponent } from '../layouts/root-not-found.component'

export const rootRoute = createRootRoute({
  component: RootLayoutComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: RootNotFoundComponent,
})
