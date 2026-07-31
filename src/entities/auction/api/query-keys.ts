// NOTE: hierarchical keys — each level is a prefix of its children, so
// invalidating a parent refreshes every nested query.
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

// NOTE: listing each target explicitly survives future key restructuring —
// invalidating detail(uuid) already covers bets via prefix matching, but the
// explicit list documents intent and stays correct if the hierarchy changes.
export const betMutationInvalidationTargets = (auctionUuid: string) =>
  [auctionKeys.lists(), auctionKeys.detail(auctionUuid), auctionKeys.bets(auctionUuid)] as const
