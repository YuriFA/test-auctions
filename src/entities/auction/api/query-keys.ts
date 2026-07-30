// Hierarchical keys: each level is a prefix of its children, so invalidating
// a parent refreshes every nested query. Layout:
//   ['auctions']
//   ['auctions', 'list', filters]
//   ['auctions', 'detail', auctionUuid]
//   ['auctions', 'detail', auctionUuid, 'bets', betsOptions]
export const auctionKeys = {
  all: () => ['auctions'] as const,
  lists: () => [...auctionKeys.all(), 'list'] as const,
  list: (filters: unknown) => [...auctionKeys.lists(), filters] as const,
  details: () => [...auctionKeys.all(), 'detail'] as const,
  detail: (auctionUuid: string) => [...auctionKeys.details(), auctionUuid] as const,
  bets: (auctionUuid: string, options: { includeCanceled?: boolean } = {}) =>
    [...auctionKeys.detail(auctionUuid), 'bets', options] as const,
} as const

// Targets that must refetch after a successful bet mutation. bets is a child
// of detail so invalidating detail(uuid) already covers it via prefix
// matching, but listing each target explicitly reads as documentation and
// survives future key restructuring.
export const betMutationInvalidationTargets = (auctionUuid: string) =>
  [auctionKeys.lists(), auctionKeys.detail(auctionUuid), auctionKeys.bets(auctionUuid)] as const
