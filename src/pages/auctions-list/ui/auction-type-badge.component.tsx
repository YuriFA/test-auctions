import type { AuctionBadgeVariant } from '@entities/auction'
import { auctionTypeBadgeVariant, describeAuctionType } from '@entities/auction'
import type { AuctionType } from '@shared/api'
import { Badge } from '@shared/ui'

interface Props {
  type: AuctionType | undefined
  label?: string
}

export function AuctionTypeBadge({ type, label }: Props) {
  if (!type) {
    return null
  }
  const variant = auctionTypeBadgeVariant(type) as Extract<
    AuctionBadgeVariant,
    'secondary' | 'info' | 'success' | 'warning'
  >
  return <Badge variant={variant}>{label ?? describeAuctionType(type)}</Badge>
}
