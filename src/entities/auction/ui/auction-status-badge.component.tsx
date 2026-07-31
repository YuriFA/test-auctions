import type { AuctionBadgeVariant } from '@entities/auction'
import { auctionStatusBadgeVariant, describeAuctionStatus } from '@entities/auction'
import type { AuctionStatus } from '@shared/api'
import { Badge } from '@shared/ui'

interface Props {
  status: AuctionStatus | undefined
  label?: string
}

export function AuctionStatusBadge({ status, label }: Props) {
  if (!status) {
    return null
  }
  const variant = auctionStatusBadgeVariant(status) as Extract<
    AuctionBadgeVariant,
    'secondary' | 'info' | 'success' | 'destructive'
  >
  return <Badge variant={variant}>{label ?? describeAuctionStatus(status)}</Badge>
}
