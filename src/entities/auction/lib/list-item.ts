import type { AuctionListItem, AuctionRef, AuctionStatus, AuctionType, TradingStatus } from '@shared/api'
import { extractAuctionRef } from '@shared/api'

import { describeAuctionStatus, describeAuctionType, describeTradingStatus } from './describe'

export type AuctionListItemVM = {
  auctionRef: AuctionRef

  cargoNum: string
  orderUid: string
  aucType: AuctionType | undefined
  aucTypeLabel: string
  pricePerKm: number | null

  loadCity: string
  unloadCity: string
  loadDate: string | undefined
  unloadDate: string | undefined
  direction: string

  cargoName: string
  cargoWeight: number | null
  cargoVolume: number | null
  cargoBodyType: string

  auctionStatus: AuctionStatus | undefined
  auctionStatusLabel: string
  tradingStatus: TradingStatus | undefined
  tradingStatusLabel: string
  canSetBet: boolean
  hasUserBet: boolean
  userLastBet: number | null
  currentPrice: number | null
  currentPriceNoVat: number | null
  startPrice: number | null
}

export function toAuctionListItemVM(item: AuctionListItem): AuctionListItemVM | null {
  const auctionRef = extractAuctionRef(item)
  if (!auctionRef) {
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
    tradingStatus: statusMobile,
    tradingStatusLabel: statusMobile ? describeTradingStatus(statusMobile) : '—',
    canSetBet: Boolean(trading?.can_set_bet),
    hasUserBet: Boolean(your?.bet),
    userLastBet: your?.last_bet ?? null,
    currentPrice: price?.current ?? null,
    currentPriceNoVat: price?.current_no_vat ?? null,
    startPrice: price?.start ?? null,
    auctionRef,
  }
}
