// NOTE: hierarchical keys — each level is a prefix of its children, so
// invalidating a parent refreshes every nested query.
//   ['auctions']
//   ['auctions', 'list', filters]
//   ['auctions', 'detail', auctionRef]
//   ['auctions', 'detail', auctionRef, 'bets', betsOptions]
export const auctionKeys = {
  all: () => ['auctions'] as const,
  lists: () => [...auctionKeys.all(), 'list'] as const,
  list: (filters: unknown) => [...auctionKeys.lists(), filters] as const,
  details: () => [...auctionKeys.all(), 'detail'] as const,
  detail: (auctionRef: string) => [...auctionKeys.details(), auctionRef] as const,
  bets: (auctionRef: string, options: { includeCanceled?: boolean } = {}) =>
    [...auctionKeys.detail(auctionRef), 'bets', options] as const,
} as const

// NOTE: listing each target explicitly survives future key restructuring —
// invalidating detail(ref) already covers bets via prefix matching, but the
// explicit list documents intent and stays correct if the hierarchy changes.
export const betMutationInvalidationTargets = (auctionRef: string) =>
  [auctionKeys.lists(), auctionKeys.detail(auctionRef), auctionKeys.bets(auctionRef)] as const
