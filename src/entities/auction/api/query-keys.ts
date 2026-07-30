/**
 * Hierarchical TanStack Query keys for the auctions domain.
 *
 * Layout (each level is a prefix of its children, so invalidating a parent
 * refreshes every nested query):
 *
 *   ['auctions']
 *   ['auctions', 'list', filters]
 *   ['auctions', 'detail', auctionUuid]
 *   ['auctions', 'detail', auctionUuid, 'bets', betsOptions]
 *
 * Keeping the keys in one factory prevents ad-hoc stringly-typed keys across
 * features and lets mutations invalidate the entire domain via `auctionKeys.all()`.
 */
export const auctionKeys = {
  all: () => ['auctions'] as const,
  lists: () => [...auctionKeys.all(), 'list'] as const,
  list: (filters: unknown) => [...auctionKeys.lists(), filters] as const,
  details: () => [...auctionKeys.all(), 'detail'] as const,
  detail: (auctionUuid: string) => [...auctionKeys.details(), auctionUuid] as const,
  bets: (auctionUuid: string, options: { includeCanceled?: boolean } = {}) =>
    [...auctionKeys.detail(auctionUuid), 'bets', options] as const,
} as const

/**
 * Query keys that must be refetched after a successful bet mutation.
 *
 * Per AGENTS.md, the runtime state must update consistently for:
 *   - auctions list (current price changes)
 *   - auction detail (current price, trading status, your state)
 *   - bets list (the new bet appears in history)
 *
 * The bets key is a child of the detail key, so invalidating `detail(uuid)`
 * already covers it via prefix matching. We still list each target explicitly
 * so the invalidation plan reads as documentation and survives future key
 * restructuring.
 */
export const betMutationInvalidationTargets = (auctionUuid: string) =>
  [auctionKeys.lists(), auctionKeys.detail(auctionUuid), auctionKeys.bets(auctionUuid)] as const
