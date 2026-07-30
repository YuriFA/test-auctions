import { createRoute } from "@tanstack/react-router";

import { AuctionsListComponent } from "@pages/auctions-list";
import { auctionsRoute } from "./auctions.route";

export const auctionsIndexRoute = createRoute({
  getParentRoute: () => auctionsRoute,
  path: "/",
  component: AuctionsListComponent,
});
