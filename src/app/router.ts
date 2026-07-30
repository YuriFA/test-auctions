import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { queryClient } from "./lib/query-client";
import { routeTree } from "./routes/route-tree";

export interface RouterAppContext {
  queryClient: typeof queryClient;
}

export const router = createTanStackRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  context: {
    queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
