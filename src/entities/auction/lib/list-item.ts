import type { AuctionListItem, AuctionStatus, AuctionType } from '@shared/api'
import { extractAuctionUuid } from '@shared/api'

import { describeAuctionStatus, describeAuctionType, describeTradingStatus } from './describe'

// ViewModel for the auctions list card. The raw DTO is deeply nested and
// mostly optional; the VM centralises null-handling and enum-to-label
// resolution so the card stays a pure render. SDD-019 owns this shape —
// downstream list pages should not reach into the raw DTO.
//
// Note on `step`: the list DTO's trading.price only exposes
// {start,current,current_no_vat}. The step is a detail-page field; the card
// therefore omits it (documented in AI_USAGE.md).
export type AuctionListItemVM = {
  auctionUuid: string

  // main
  cargoNum: string
  orderUid: string
  aucType: AuctionType | undefined
  aucTypeLabel: string
  pricePerKm: number | null

  // route
  loadCity: string
  unloadCity: string
  loadDate: string | undefined
  unloadDate: string | undefined
  direction: string

  // cargo
  cargoName: string
  cargoWeight: number | null
  cargoVolume: number | null
  cargoBodyType: string

  // trading
  auctionStatus: AuctionStatus | undefined
  auctionStatusLabel: string
  tradingStatusLabel: string
  canSetBet: boolean
  hasUserBet: boolean
  userLastBet: number | null
  currentPrice: number | null
  currentPriceNoVat: number | null
  startPrice: number | null
}

export function toAuctionListItemVM(item: AuctionListItem): AuctionListItemVM | null {
  const auctionUuid = extractAuctionUuid(item)
  if (!auctionUuid) {
    return null
  }

  const main = item.main
  const route = item.route
  const cargo = item.cargo
  const trading = item.trading
  const your = trading?.your ?? null
  const price = trading?.price ?? null

  const loadCity = route?.load?.city ?? ''
  const unloadCity = route?.unload?.city ?? ''
  const trimmedDirection = trading?.direction?.trim()
  const direction =
    trimmedDirection || (loadCity && unloadCity ? `${loadCity} → ${unloadCity}` : '')

  const aucType = main?.auc_type
  const auctionStatus = trading?.status
  const statusMobile = trading?.status_mobile

  return {
    auctionUuid,
    cargoNum: main?.cargo_num ?? '',
    orderUid: main?.order_uid ?? '',
    aucType,
    aucTypeLabel: aucType ? describeAuctionType(aucType) : '—',
    pricePerKm: main?.price_per_km ?? null,

    loadCity,
    unloadCity,
    loadDate: route?.load?.date,
    unloadDate: route?.unload?.date,
    direction,

    cargoName: cargo?.name ?? '',
    cargoWeight: cargo?.weight ?? null,
    cargoVolume: cargo?.volume ?? null,
    cargoBodyType: cargo?.body_type ?? '',

    auctionStatus,
    auctionStatusLabel: auctionStatus ? describeAuctionStatus(auctionStatus) : '—',
    tradingStatusLabel: statusMobile ? describeTradingStatus(statusMobile) : '—',
    canSetBet: Boolean(trading?.can_set_bet),
    hasUserBet: Boolean(your?.bet),
    userLastBet: your?.last_bet ?? null,
    currentPrice: price?.current ?? null,
    currentPriceNoVat: price?.current_no_vat ?? null,
    startPrice: price?.start ?? null,
  }
}
