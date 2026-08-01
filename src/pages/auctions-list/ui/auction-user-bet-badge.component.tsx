import type { AuctionListItemVM } from '@entities/auction'
import { formatPrice } from '@shared/lib/currency'

interface Props {
  item: Pick<AuctionListItemVM, 'hasUserBet' | 'userLastBet'>
}

export function AuctionUserBetBadge({ item }: Props) {
  if (item.hasUserBet && item.userLastBet != null) {
    return (
      <span className="text-xs text-muted-foreground">
        Моя ставка:{' '}
        <span className="font-medium text-foreground">{formatPrice(item.userLastBet)}</span>
      </span>
    )
  }
  return <span className="text-xs text-muted-foreground italic">Нет моей ставки</span>
}
