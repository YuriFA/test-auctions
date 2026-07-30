import { createRoute } from "@tanstack/react-router";

import { AuctionsLayoutComponent } from "../layouts/auctions-layout.component";
import { rootRoute } from "./root.route";

export const auctionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "auctions",
  component: AuctionsLayoutComponent,
});
