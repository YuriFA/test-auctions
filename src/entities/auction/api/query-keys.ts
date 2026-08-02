export const auctionKeys = {
  all: () => ['auctions'] as const,
  lists: () => [...auctionKeys.all(), 'list'] as const,
  list: (filters: unknown) => [...auctionKeys.lists(), filters] as const,
  details: () => [...auctionKeys.all(), 'detail'] as const,
  detail: (auctionUuid: string) => [...auctionKeys.details(), auctionUuid] as const,
  bets: (auctionUuid: string, options: { includeCanceled?: boolean } = {}) =>
    [...auctionKeys.detail(auctionUuid), 'bets', options] as const,
} as const

export const betMutationInvalidationTargets = (auctionUuid: string) =>
  [auctionKeys.lists(), auctionKeys.detail(auctionUuid), auctionKeys.bets(auctionUuid)] as const
