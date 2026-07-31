// Maps domain enums to shadcn Badge variant names.
//
// The Badge cva in `src/shared/ui/badge.component.tsx` is the single source
// of variant styling — these tables only pick which variant applies to which
// enum value. Centralisation guarantees that two UIs rendering the same
// TradingStatus (e.g. list card and detail page) agree on the colour.

import type { AuctionStatus, AuctionType, TradingStatus } from '@shared/api'

// Variants the auction UI may request. The Badge cva implements every name
// listed here (existing: default/secondary/outline/destructive; added by
// SDD-019: info/success/warning).
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
