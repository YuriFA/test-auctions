import type { BetItem, BetListResponse } from '@shared/api'

export type AuctionBetVM = {
  id: number
  createdAt: string | undefined
  priceWithVat: number | null
  priceNoVat: number | null
  organizationName: string
  place: number | null
  isWin: boolean
  isRejected: boolean
  cancelReason: string
}

export type AuctionBetsVM = {
  bets: AuctionBetVM[]
  participantCount: number
}

export function toAuctionBetsVM(response: BetListResponse): AuctionBetsVM {
  const bets = response.bets.map(toAuctionBetVM)
  const orgIds = new Set<number>()
  for (const bet of response.bets) {
    if (bet.organization_id != null) {
      orgIds.add(bet.organization_id)
    }
  }
  return {
    bets,
    participantCount: orgIds.size,
  }
}

function toAuctionBetVM(bet: BetItem): AuctionBetVM {
  return {
    id: bet.id ?? 0,
    createdAt: bet.created_at,
    priceWithVat: bet.price_with_vat ?? null,
    priceNoVat: bet.price_no_vat ?? null,
    organizationName: bet.organization_name ?? '',
    place: bet.place ?? null,
    isWin: Boolean(bet.is_win),
    isRejected: Boolean(bet.is_rejected),
    cancelReason: bet.cancel_reason ?? '',
  }
}
