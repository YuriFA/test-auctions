import type { AuctionStatus } from '@shared/api'

// SDD-019 owns the primary-action decision tree for the list card. SDD-021
// only flips restriction flags; SDD-022/025 consume the resulting route.
//
// Priority:
//   1. Terminal auction status (Finished/Stopped/Canceled) disables the CTA,
//      regardless of `can_set_bet`. The auction is over; no action is allowed.
//   2. `can_set_bet && !hasUserBet` -> place-bet.
//   3. `can_set_bet && hasUserBet`  -> change-bet.
//   4. otherwise                    -> view-bets (still readable, just no input).
export type AuctionCardPrimaryActionKind =
  | 'place-bet'
  | 'change-bet'
  | 'view-bets'
  | 'disabled'

export type AuctionCardPrimaryActionRoute = 'bet' | 'bets' | 'detail'

export interface AuctionCardPrimaryAction {
  kind: AuctionCardPrimaryActionKind
  label: string
  // Relative segment under `/auctions/$auctionUuid/`. `detail` means the
  // auction root itself (used for disabled CTA, which still routes to detail).
  route: AuctionCardPrimaryActionRoute
}

export interface AuctionCardPrimaryActionSource {
  auctionStatus: AuctionStatus | undefined
  canSetBet: boolean
  hasUserBet: boolean
}

const DISABLED_LABELS: Readonly<Partial<Record<AuctionStatus, string>>> = {
  Finished: 'Аукцион завершён',
  Stopped: 'Аукцион остановлен',
  Canceled: 'Аукцион отменён',
}

export function deriveAuctionCardPrimaryAction(
  source: AuctionCardPrimaryActionSource,
): AuctionCardPrimaryAction {
  const disabledLabel =
    source.auctionStatus !== undefined ? DISABLED_LABELS[source.auctionStatus] : undefined
  if (disabledLabel) {
    return { kind: 'disabled', label: disabledLabel, route: 'detail' }
  }

  if (source.canSetBet) {
    return source.hasUserBet
      ? { kind: 'change-bet', label: 'Изменить ставку', route: 'bet' }
      : { kind: 'place-bet', label: 'Сделать ставку', route: 'bet' }
  }

  return { kind: 'view-bets', label: 'Смотреть ставки', route: 'bets' }
}
