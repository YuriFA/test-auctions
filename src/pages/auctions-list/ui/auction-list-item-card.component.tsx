import { Link } from '@tanstack/react-router'

import { cn } from '@shared/lib/cn'
import type { AuctionListItemVM } from '@entities/auction'

interface Props {
  item: AuctionListItemVM
  onIntent?: (auctionUuid: string) => void
}

export function AuctionListItemCard({ item, onIntent }: Props) {
  const handleIntent = () => onIntent?.(item.auctionUuid)

  return (
    <Link
      to="/auctions/$auctionUuid"
      params={{ auctionUuid: item.auctionUuid }}
      onMouseEnter={handleIntent}
      onFocus={handleIntent}
      className={cn(
        'flex flex-col gap-1 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors',
        'hover:border-primary/40 focus-visible:border-primary/40 focus-visible:outline-none',
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {item.aucType ?? '—'}
      </span>
      <span className="text-sm font-semibold">{item.cargoNum || 'Без номера заявки'}</span>
    </Link>
  )
}
