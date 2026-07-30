import { createRoute } from "@tanstack/react-router";

import { AuctionLayoutComponent } from "../layouts/auction-layout.component";
import { auctionsRoute } from "./auctions.route";

export const auctionDetailRoute = createRoute({
  getParentRoute: () => auctionsRoute,
  path: "$auctionUuid",
  component: AuctionLayoutComponent,
});
