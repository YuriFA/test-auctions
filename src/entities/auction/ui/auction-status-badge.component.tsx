import type { AuctionStatus } from '@shared/api'
import { Badge } from '@shared/ui'

import type { AuctionBadgeVariant } from '../lib/badge-variants'
import { auctionStatusBadgeVariant } from '../lib/badge-variants'
import { describeAuctionStatus } from '../lib/describe'

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
