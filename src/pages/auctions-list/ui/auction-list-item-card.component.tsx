import type { AuctionCardPrimaryAction, AuctionListItemVM } from '@entities/auction'
import { deriveAuctionCardPrimaryAction } from '@entities/auction'
import { formatDate } from '@shared/lib/date'
import { Calendar, Clock } from 'lucide-react'

import { AuctionAction } from './auction-action.component'
import { AuctionCardHeader } from './auction-card-header.component'
import { AuctionCargo } from './auction-cargo.component'
import { AuctionRoute } from './auction-route.component'
import { AuctionTrading } from './auction-trading.component'
import { AuctionUserBetBadge } from './auction-user-bet-badge.component'

interface Props {
  item: AuctionListItemVM
  onIntent?: (auctionRef: string) => void
}

function DatesRow({
  loadDate,
  unloadDate,
}: {
  loadDate: string | undefined
  unloadDate: string | undefined
}) {
  const hasAny = Boolean(loadDate) || Boolean(unloadDate)
  if (!hasAny) {
    return null
  }
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {loadDate && (
        <div className="flex items-center gap-1.5">
          <Calendar className="size-3.5" aria-hidden />
          <span>Погрузка: {formatDate(loadDate)}</span>
        </div>
      )}
      {unloadDate && (
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5" aria-hidden />
          <span>Разгрузка: {formatDate(unloadDate)}</span>
        </div>
      )}
    </div>
  )
}

export function AuctionListItemCard({ item, onIntent }: Props) {
  const handleIntent = () => onIntent?.(item.auctionRef)
  const action: AuctionCardPrimaryAction = deriveAuctionCardPrimaryAction({
    auctionStatus: item.auctionStatus,
    canSetBet: item.canSetBet,
    hasUserBet: item.hasUserBet,
  })

  return (
    <article
      onMouseEnter={handleIntent}
      onFocus={handleIntent}
      className="group/card relative flex flex-col gap-3 rounded-lg bg-card p-4 text-xs/relaxed text-card-foreground ring-1 ring-foreground/10 transition-colors focus-within:ring-2 focus-within:ring-ring/30 [&:hover:not(:has(.auction-card-action:hover))]:bg-muted/30 [&:hover:not(:has(.auction-card-action:hover))]:ring-2"
    >
      <AuctionCardHeader item={item} />

      <div className="flex flex-col gap-3">
        <AuctionRoute
          loadCity={item.loadCity}
          unloadCity={item.unloadCity}
          direction={item.direction}
        />

        <DatesRow loadDate={item.loadDate} unloadDate={item.unloadDate} />

        <AuctionCargo
          name={item.cargoName}
          weight={item.cargoWeight}
          volume={item.cargoVolume}
          bodyType={item.cargoBodyType}
        />

        <AuctionTrading item={item} />
      </div>

      <div className="auction-card-action mt-auto flex items-center justify-between gap-2 border-t pt-3">
        <AuctionUserBetBadge item={item} />
        <AuctionAction action={action} auctionRef={item.auctionRef} />
      </div>
    </article>
  )
}
