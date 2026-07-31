import type { AuctionListItemVM } from '@entities/auction'
import { formatPrice, formatPricePerKm } from '@entities/auction'

interface Props {
  item: Pick<
    AuctionListItemVM,
    'currentPrice' | 'pricePerKm' | 'hasUserBet' | 'userLastBet'
  >
}

// Trading block: current price is the second-most-prominent element after the
// route. Layout: large price on the left, meta column (price/km + own bid) on
// the right. Hidden entirely when there is no current price AND no user bid —
// a card with no tradeable signal shouldn't pretend to have one.
export function AuctionTrading({ item }: Props) {
  const hasPrice = item.currentPrice != null
  const hasUserBet = item.hasUserBet && item.userLastBet != null
  if (!hasPrice && !hasUserBet) {
    return null
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      {hasPrice && (
        <div className="flex flex-col">
          <dt className="text-[0.625rem] tracking-wide text-muted-foreground uppercase">
            Текущая цена
          </dt>
          <dd className="text-base font-semibold text-foreground sm:text-lg">
            {formatPrice(item.currentPrice)}
          </dd>
        </div>
      )}
      <dl className="flex flex-col gap-0.5 text-xs text-muted-foreground">
        {item.pricePerKm != null && item.pricePerKm > 0 && (
          <div className="flex gap-1">
            <dt>Цена/км:</dt>
            <dd className="font-medium text-foreground">
              {formatPricePerKm(item.currentPrice, item.pricePerKm)}
            </dd>
          </div>
        )}
        {hasUserBet && (
          <div className="flex gap-1 py-1">
            <dt>Моя ставка:</dt>
            <dd className="font-medium text-foreground">{formatPrice(item.userLastBet)}</dd>
          </div>
        )}
        {!hasUserBet && (
          <div className="py-1">
            <dt className="italic">Нет моей ставки</dt>
          </div>
        )}
      </dl>
    </div>
  )
}
