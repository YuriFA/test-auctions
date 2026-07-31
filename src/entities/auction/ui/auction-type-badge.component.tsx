import type { AuctionBadgeVariant } from '@entities/auction'
import { auctionTypeBadgeVariant, describeAuctionType } from '@entities/auction'
import type { AuctionType } from '@shared/api'
import { Badge } from '@shared/ui'
import { HelpCircle, Megaphone, Tag, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'

interface Props {
  type: AuctionType | undefined
  label?: string
}

const AUCTION_TYPE_ICON: Readonly<Record<AuctionType, LucideIcon>> = {
  Request: Megaphone,
  Up: TrendingUp,
  Down: TrendingDown,
  FixPrice: Tag,
  Unknown: HelpCircle,
}

export function AuctionTypeBadge({ type, label }: Props) {
  if (!type) {
    return null
  }
  const variant = auctionTypeBadgeVariant(type) as Extract<
    AuctionBadgeVariant,
    'secondary' | 'info' | 'success' | 'destructive'
  >
  const Icon = AUCTION_TYPE_ICON[type]
  return (
    <Badge variant={variant}>
      <Icon className="size-2.5" aria-hidden />
      {label ?? describeAuctionType(type)}
    </Badge>
  )
}
