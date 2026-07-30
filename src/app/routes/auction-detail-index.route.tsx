import { createRoute } from "@tanstack/react-router";

import { AuctionDetailComponent } from "@pages/auction-detail";
import { auctionDetailRoute } from "./auction-detail.route";

export const auctionDetailIndexRoute = createRoute({
  getParentRoute: () => auctionDetailRoute,
  path: "/",
  component: AuctionDetailComponent,
});
