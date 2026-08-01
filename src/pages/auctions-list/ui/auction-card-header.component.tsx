import type { AuctionListItemVM } from '@entities/auction'
import { AuctionStatusBadge, AuctionTypeBadge, TradingStatusBadge } from '@entities/auction'
import { Link } from '@tanstack/react-router'

interface Props {
  item: Pick<
    AuctionListItemVM,
    | 'auctionRef'
    | 'cargoNum'
    | 'aucType'
    | 'auctionStatus'
    | 'tradingStatus'
    | 'tradingStatusLabel'
  > &
    Partial<Pick<AuctionListItemVM, 'aucTypeLabel' | 'auctionStatusLabel'>>
}

export function AuctionCardHeader({ item }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Link
        to="/auctions/$auctionRef"
        params={{ auctionRef: item.auctionRef }}
        aria-label={`Открыть аукцион ${item.cargoNum || 'без номера'}`}
        className="text-sm font-medium text-foreground underline-offset-4 after:absolute after:inset-0"
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
