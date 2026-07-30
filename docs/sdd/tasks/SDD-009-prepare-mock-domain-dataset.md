# SDD-009 Prepare Mock Domain Dataset

## Status

Completed.

## Purpose

Prepare seed data that can support the required UI and edge cases.

## Scope

- Create seed auctions data.
- Create detail DTO data.
- Create bets data.
- Create the mock cities dictionary.

## Dependencies

- `SDD-006`

## Acceptance Criteria

- Mock data covers list, detail, and bets scenarios.
- Mock data includes a variety of statuses, auction types, and restriction flags.
- City lookup data exists for required filters.

## Notes And Risks

- Prepare edge cases early so UI work does not assume only happy paths.

## Implementation Notes

- The seed dataset lives under `src/shared/api/mocks/` and is intentionally
  not re-exported from `src/shared/api/index.ts`. The folder is treated as
  dev/test infrastructure reachable via `@shared/api/mocks`; higher FSD layers
  must not import it directly. This keeps the production `shared/api` adapter
  free of mock artifacts.
- Each `SeedAuction` bundles the three DTO shapes that must stay consistent at
  runtime: the list item, the detail payload, and the bets history. Bundling
  them per-UUID lets the runtime store (SDD-010) and the handlers (SDD-011
  through SDD-014) consume one source of truth.
- The list DTO does not expose a UUID, but the detail/bets/set-bet endpoints require `auctionUuid` in `format: uuid`. Per `docs/sdd/decisions.md` D-011 we close this contract gap in the mock layer the way a real backend would: the `MockAuctionListItemMain` type (in `src/shared/api/mocks/auctions.ts`) extends the generated `AuctionListItemMain` with a required `auction_uuid` field, and each seed list item populates it from `seedAuctionUuids.<key>`. `SeedAuction.uuid === list.main.auction_uuid`, while `main.order_uid` stays independent under `seedOrderUids` so the auction-vs-order separation is preserved. MSW handlers (SDD-011+) will resolve path parameters by matching against `main.auction_uuid`; client links will be built with `params={{ auctionUuid: item.main.auction_uuid }}`. The extension is mock-only and MUST NOT leak into production `shared/api` types or higher FSD layers.
- Ten seed auctions cover every `AuctionStatus`, every `AuctionType`, and the
  user-facing `TradingStatus` branches exposed by the schema. Edge cases
  included: `hide_bets_history=true` (auction 6), `hide_points_address_and_contacts=true`
  with empty contacts (auctions 5 and 7), `no_view_cargo_price=true` (auction
  5), `can_set_bet=false` for non-active statuses (auctions 4, 5, 6, 8, 9, 10),
  no current price (auctions 5, 8, 10), empty bets history (auctions 5, 8, 10),
  and a rejected/canceled user bet (auction 9).
- `MockCurrentUser` plus four `MockCompetitors` carry stable organization IDs,
  INNs, and contact details so the bets endpoint can populate carrier rows
  consistently across the list, detail, and bets surfaces.
- `mockCities` exposes the canonical name and `gc_id` for ten real Russian
  cities used as load/unload points. Route points reference the same names so
  `load_city` / `unload_city` filter results stay consistent.
- Where the schema marks a field as `string` (not nullable), empty strings
  replace `null` to honor the OpenAPI contract — e.g. `RoutePointLocation.loading_address`
  for hidden-contact auctions and `AuctionShowCargo.price` for auctions
  without a quoted price. Nullable fields keep `null` to exercise the null
  branch in downstream UI work.
- Typecheck, oxlint, steiger FSD check, and production build all pass against
  the new dataset.
