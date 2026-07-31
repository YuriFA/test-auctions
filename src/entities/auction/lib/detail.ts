import type {
  AuctionDetail,
  AuctionStatus,
  AuctionType,
  BidMeasurementType,
  Contact,
  OperationType,
  PaymentDelayType,
  TradingStatus,
} from '@shared/api'

import {
  describeAuctionStatus,
  describeAuctionType,
  describeBidMeasurementType,
  describeOperationType,
  describePaymentDelayType,
  describeTradingStatus,
} from './describe'

export type AuctionDetailContactVM = {
  name: string
  phone: string
  workPhone: string
  email: string
  uid: string
}

export type AuctionDetailRoutePointCargoVM = {
  name: string
  packageName: string
  weight: string
  volume: string
  length: string
  width: string
  height: string
  oversized: boolean
}

export type AuctionDetailRoutePointVM = {
  opType: OperationType | undefined
  opTypeLabel: string
  startDate: string | undefined
  endDate: string | undefined
  comment: string
  contractor: string
  contractorInn: string
  cityName: string
  loadingAddress: string
  cargo: AuctionDetailRoutePointCargoVM | null
  contactName: string
  contactPhone: string
}

export type AuctionDetailCarRequirementsVM = {
  type: string
  weight: number | null
  volume: number | null
  length: number | null
  width: number | null
  height: number | null
}

export type AuctionDetailVM = {
  cargoNum: string
  orderUid: string
  aucType: AuctionType | undefined
  aucTypeLabel: string
  createdAt: string | undefined

  organizerName: string
  organizerInn: string
  organizerKpp: string

  contacts: AuctionDetailContactVM[]

  cargoBodyType: string
  cargoDistance: number | null
  cargoTruckCount: number | null
  cargoTempFrom: number | null
  cargoTempTo: number | null
  carRequirements: AuctionDetailCarRequirementsVM | null

  auctionStatus: AuctionStatus | undefined
  auctionStatusLabel: string
  tradingStatus: TradingStatus | undefined
  tradingStatusLabel: string
  startTime: string | undefined
  stopTime: string | undefined
  bidMeasurementType: BidMeasurementType | undefined
  bidMeasurementTypeLabel: string

  priceStart: number | null
  priceCurrent: number | null
  priceCurrentNoVat: number | null
  priceAvailable: number | null
  priceAvailableNoVat: number | null
  priceMin: number | null
  priceMax: number | null
  priceStep: number | null
  pricePerKm: number | null

  hasUserBet: boolean
  userLastBet: number | null
  userLastBetWithVat: number | null
  userWin: boolean

  paymentCondition: string
  paymentForm: string
  paymentDelay: number | null
  paymentDelayType: PaymentDelayType | undefined
  paymentDelayTypeLabel: string
  paymentCurrencyCode: string
  paymentPrepay: string

  assemblyNum: string
  assemblyDate: string | undefined

  routes: AuctionDetailRoutePointVM[]

  // NOTE: raw restriction flags — UI consumers must read via
  // deriveAuctionRestrictions, never directly from this VM.
  canSetBet: boolean
  hideBetsHistory: boolean
  hidePointsAddressAndContacts: boolean
  noViewCargoPrice: boolean
}

const FALLBACK_LABEL = '—'

export function toAuctionDetailVM(detail: AuctionDetail): AuctionDetailVM {
  const main = detail.main
  const organizer = detail.organizer
  const trading = detail.trading
  const cargo = detail.cargo
  const payment = detail.payment
  const assembly = detail.assembly
  const price = trading?.price
  const your = trading?.your
  const car = cargo?.car ?? null

  const aucType = main?.auc_type
  const auctionStatus = trading?.status
  const tradingStatus = trading?.status_mobile
  const bidMeasurementType = trading?.bid_measurement_type
  const delayType = payment?.delay_type

  return {
    cargoNum: main?.cargo_num ?? '',
    orderUid: main?.order_uid ?? '',
    aucType,
    aucTypeLabel: aucType ? describeAuctionType(aucType) : FALLBACK_LABEL,
    createdAt: main?.created_at,

    organizerName: organizer?.organization_name ?? '',
    organizerInn: organizer?.organization_inn ?? '',
    organizerKpp: organizer?.organization_kpp ?? '',

    contacts: (detail.contacts ?? []).map(toContactVM).filter(hasContactInfo),

    cargoBodyType: cargo?.body_type ?? '',
    cargoDistance: cargo?.distance ?? null,
    cargoTruckCount: cargo?.truck_count ?? null,
    cargoTempFrom: cargo?.temp_from ?? null,
    cargoTempTo: cargo?.temp_to ?? null,
    carRequirements: car
      ? {
          type: car.type ?? '',
          weight: car.weight ?? null,
          volume: car.volume ?? null,
          length: car.length ?? null,
          width: car.width ?? null,
          height: car.height ?? null,
        }
      : null,

    auctionStatus,
    auctionStatusLabel: auctionStatus ? describeAuctionStatus(auctionStatus) : FALLBACK_LABEL,
    tradingStatus,
    tradingStatusLabel: tradingStatus ? describeTradingStatus(tradingStatus) : FALLBACK_LABEL,
    startTime: trading?.start_time,
    stopTime: trading?.stop_time,
    bidMeasurementType,
    bidMeasurementTypeLabel: bidMeasurementType
      ? describeBidMeasurementType(bidMeasurementType)
      : FALLBACK_LABEL,

    priceStart: price?.start ?? null,
    priceCurrent: price?.current ?? null,
    priceCurrentNoVat: price?.current_no_vat ?? null,
    priceAvailable: price?.available ?? null,
    priceAvailableNoVat: price?.available_no_vat ?? null,
    priceMin: price?.min ?? null,
    priceMax: price?.max ?? null,
    priceStep: price?.step ?? null,
    pricePerKm: price?.price_per_km ?? null,

    hasUserBet: Boolean(your?.bet),
    userLastBet: your?.last_bet ?? null,
    userLastBetWithVat: your?.last_bet_with_vat ?? null,
    userWin: Boolean(your?.win),

    paymentCondition: payment?.condition ?? '',
    paymentForm: payment?.form ?? '',
    paymentDelay: payment?.delay ?? null,
    paymentDelayType: delayType,
    paymentDelayTypeLabel: delayType ? describePaymentDelayType(delayType) : FALLBACK_LABEL,
    paymentCurrencyCode: payment?.currency_code ?? '',
    paymentPrepay: payment?.prepay ?? '',

    assemblyNum: assembly?.num ?? '',
    assemblyDate: assembly?.date ?? undefined,

    routes: (detail.routes ?? []).map(toRoutePointVM),

    canSetBet: Boolean(trading?.can_set_bet),
    hideBetsHistory: Boolean(trading?.hide_bets_history),
    hidePointsAddressAndContacts: Boolean(trading?.hide_points_address_and_contacts),
    noViewCargoPrice: Boolean(trading?.no_view_cargo_price),
  }
}

function toContactVM(contact: Contact): AuctionDetailContactVM {
  return {
    name: contact.name ?? '',
    phone: contact.phone ?? '',
    workPhone: contact.work_phone ?? '',
    email: contact.email ?? '',
    uid: contact.uid ?? '',
  }
}

function hasContactInfo(contact: AuctionDetailContactVM): boolean {
  return Boolean(contact.name || contact.phone || contact.workPhone || contact.email)
}

function toRoutePointVM(point: NonNullable<AuctionDetail['routes']>[number]): AuctionDetailRoutePointVM {
  const location = point.location
  const cargo = point.cargo
  const contact = point.contact
  const opType = point.op_type

  return {
    opType,
    opTypeLabel: opType ? describeOperationType(opType) : FALLBACK_LABEL,
    startDate: point.start_date,
    endDate: point.end_date,
    comment: point.comment ?? '',
    contractor: point.contractor ?? '',
    contractorInn: point.contractor_inn ?? '',
    cityName: location?.city_name ?? location?.city_full_name ?? '',
    loadingAddress: location?.loading_address ?? '',
    cargo: cargo
      ? {
          name: cargo.name ?? '',
          packageName: cargo.package_name ?? '',
          weight: cargo.weight ?? '',
          volume: cargo.volume ?? '',
          length: cargo.length ?? '',
          width: cargo.width ?? '',
          height: cargo.height ?? '',
          oversized: Boolean(cargo.oversized),
        }
      : null,
    contactName: contact?.name ?? '',
    contactPhone: contact?.phone ?? '',
  }
}
