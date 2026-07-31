import type { AuctionBadgeVariant } from '@entities/auction'
import { describeTradingStatus, tradingStatusBadgeVariant } from '@entities/auction'
import type { TradingStatus } from '@shared/api'
import { Badge } from '@shared/ui'

interface Props {
  status: TradingStatus | undefined
  label?: string
}

// `NotParticipating` and `Unknown` are technically valid TradingStatus values
// but carry no decision-relevant signal for the carrier at list-view time —
// hide the badge rather than show a gray pill that competes for attention with
// actionable statuses (Leading/Losing/Winner).
const HIDDEN: ReadonlyArray<TradingStatus> = ['NotParticipating', 'Unknown']

export function TradingStatusBadge({ status, label }: Props) {
  if (!status || HIDDEN.includes(status)) {
    return null
  }
  const variant = tradingStatusBadgeVariant(status) as Extract<
    AuctionBadgeVariant,
    'info' | 'success' | 'warning'
  >
  return <Badge variant={variant}>{label ?? describeTradingStatus(status)}</Badge>
}
