# SDD-011 Implement MSW List Endpoint

## Purpose

Implement the auctions list endpoint according to the schema.

## Scope

- Implement `POST /auctions/list`.
- Support pagination.
- Support the required minimum filters.

## Dependencies

- `SDD-006`
- `SDD-010`

## Acceptance Criteria

- Response shape matches `AuctionListResponseBase`.
- Request handling respects the relevant filter fields.
- Pagination metadata is coherent with filtered results.

## Notes And Risks

- Be careful with date and numeric filters.
