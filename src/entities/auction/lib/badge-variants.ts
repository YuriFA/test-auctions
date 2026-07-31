import type { AuctionStatus, AuctionType, TradingStatus } from '@shared/api'

export type AuctionBadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'destructive'
  | 'info'
  | 'success'
  | 'warning'

const FALLBACK_VARIANT: AuctionBadgeVariant = 'secondary'

export const AUCTION_TYPE_BADGE_VARIANTS: Readonly<Record<AuctionType, AuctionBadgeVariant>> = {
  Request: 'secondary',
  Up: 'success',
  Down: 'destructive',
  FixPrice: 'info',
  Unknown: 'secondary',
}

export const TRADING_STATUS_BADGE_VARIANTS: Readonly<Record<TradingStatus, AuctionBadgeVariant>> = {
  NotParticipating: 'secondary',
  Leading: 'info',
  Losing: 'warning',
  OnPending: 'secondary',
  Confirmed: 'success',
  ChoosingWinner: 'info',
  Winner: 'success',
  Accepted: 'success',
  Unknown: 'secondary',
}

export const AUCTION_STATUS_BADGE_VARIANTS: Readonly<Record<AuctionStatus, AuctionBadgeVariant>> = {
  Planning: 'info',
  Auction: 'success',
  DeterminateWinner: 'info',
  WaitDeal: 'secondary',
  InProgress: 'info',
  Finished: 'secondary',
  Stopped: 'destructive',
  Canceled: 'destructive',
  Unknown: 'secondary',
}

export function auctionTypeBadgeVariant(type: AuctionType): AuctionBadgeVariant {
  return AUCTION_TYPE_BADGE_VARIANTS[type] ?? FALLBACK_VARIANT
}

export function tradingStatusBadgeVariant(status: TradingStatus): AuctionBadgeVariant {
  return TRADING_STATUS_BADGE_VARIANTS[status] ?? FALLBACK_VARIANT
}

export function auctionStatusBadgeVariant(status: AuctionStatus): AuctionBadgeVariant {
  return AUCTION_STATUS_BADGE_VARIANTS[status] ?? FALLBACK_VARIANT
}
