import type { AuctionListItemVM } from '@entities/auction'
import { Link } from '@tanstack/react-router'

import { AuctionStatusBadge } from './auction-status-badge.component'
import { AuctionTypeBadge } from './auction-type-badge.component'
import { TradingStatusBadge } from './trading-status-badge.component'

interface Props {
  item: Pick<
    AuctionListItemVM,
    | 'auctionUuid'
    | 'cargoNum'
    | 'aucType'
    | 'auctionStatus'
    | 'tradingStatus'
    | 'tradingStatusLabel'
  > &
    Partial<Pick<AuctionListItemVM, 'aucTypeLabel' | 'auctionStatusLabel'>>
}

// Header row: clickable cargo number on the left (primary navigation target)
// + three semantic badges (type / auction status / trading status). Trading
// status is hidden when NotParticipating/Unknown — see TradingStatusBadge.
export function AuctionCardHeader({ item }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Link
        to="/auctions/$auctionUuid"
        params={{ auctionUuid: item.auctionUuid }}
        aria-label={`Открыть аукцион ${item.cargoNum || 'без номера'}`}
        className="text-sm font-medium text-foreground hover:underline underline-offset-4"
      >
        {item.cargoNum ? `№ ${item.cargoNum}` : 'Аукцион без номера'}
      </Link>
      <div className="flex flex-wrap items-center gap-1.5">
        <AuctionTypeBadge type={item.aucType} label={item.aucTypeLabel} />
        <AuctionStatusBadge status={item.auctionStatus} label={item.auctionStatusLabel} />
        <TradingStatusBadge status={item.tradingStatus} label={item.tradingStatusLabel} />
      </div>
    </div>
  )
}
