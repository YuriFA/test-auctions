import type { AuctionListItemVM } from '@entities/auction'
import { formatPrice, formatPricePerKm } from '@shared/lib/format'

interface Props {
  item: Pick<AuctionListItemVM, 'currentPrice' | 'pricePerKm'>
}

export function AuctionTrading({ item }: Props) {
  if (item.currentPrice == null) {
    return null
  }

  const hasPricePerKm = item.pricePerKm != null && item.pricePerKm > 0

  return (
    <div className="flex flex-col">
      <dt className="text-[0.625rem] tracking-wide text-muted-foreground uppercase">
        Текущая цена
      </dt>
      <dd className="flex flex-wrap items-baseline gap-x-2 text-base font-semibold text-foreground sm:text-lg">
        <span>{formatPrice(item.currentPrice)}</span>
        {hasPricePerKm && (
          <span className="text-xs font-normal text-muted-foreground">
            · {formatPricePerKm(item.currentPrice, item.pricePerKm)}
          </span>
        )}
      </dd>
    </div>
  )
}
