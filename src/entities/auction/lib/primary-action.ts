import type { AuctionStatus } from '@shared/api'

type AuctionCardPrimaryActionKind = 'place-bet' | 'change-bet' | 'view-bets' | 'disabled'

export interface AuctionCardPrimaryAction {
  kind: AuctionCardPrimaryActionKind
  label: string
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
    return { kind: 'disabled', label: disabledLabel }
  }

  if (source.canSetBet) {
    return source.hasUserBet
      ? { kind: 'change-bet', label: 'Изменить ставку' }
      : { kind: 'place-bet', label: 'Сделать ставку' }
  }

  return { kind: 'view-bets', label: 'Смотреть ставки' }
}
