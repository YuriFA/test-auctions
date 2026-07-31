import type {
  AuctionStatus,
  AuctionType,
  BidMeasurementType,
  OperationType,
  PaymentDelayType,
  TradingStatus,
} from '@shared/api'

export const AUCTION_TYPE_LABELS: Readonly<Record<AuctionType, string>> = {
  Request: 'Заявочный',
  Up: 'На повышение',
  Down: 'На понижение',
  FixPrice: 'Фиксированная цена',
  Unknown: 'Неизвестный тип',
}

export const OPERATION_TYPE_LABELS: Readonly<Record<OperationType, string>> = {
  Loading: 'Погрузка',
  Unloading: 'Выгрузка',
  Unknown: 'Точка маршрута',
}

export const PAYMENT_DELAY_TYPE_LABELS: Readonly<Record<PaymentDelayType, string>> = {
  CalendarDays: 'календарных дней',
  WorkDays: 'рабочих дней',
  Unknown: '—',
}

export const BID_MEASUREMENT_TYPE_LABELS: Readonly<Record<BidMeasurementType, string>> = {
  PerRoute: 'За маршрут',
  PerKm: 'За километр',
  Unknown: '—',
}

export const TRADING_STATUS_LABELS: Readonly<Record<TradingStatus, string>> = {
  NotParticipating: 'Не участвует',
  Leading: 'Лидирует',
  Losing: 'Перебит',
  OnPending: 'В ожидании',
  Confirmed: 'Подтверждён',
  ChoosingWinner: 'Выбор победителя',
  Winner: 'Победитель',
  Accepted: 'Принят',
  Unknown: 'Неизвестный статус',
}

export const AUCTION_STATUS_LABELS: Readonly<Record<AuctionStatus, string>> = {
  Planning: 'Планирование',
  Auction: 'Идут торги',
  DeterminateWinner: 'Определение победителя',
  WaitDeal: 'Ожидание сделки',
  InProgress: 'В работе',
  Finished: 'Завершён',
  Stopped: 'Остановлен',
  Canceled: 'Отменён',
  Unknown: 'Неизвестный статус',
}

// NOTE: 1..7 are the URL filter codes from the spec comments. They map
// positionally onto AuctionStatus EXCLUDING Canceled(8)/Unknown, which are
// not URL-filterable.
export const AUCTION_STATUS_CODES = [
  'Planning',
  'Auction',
  'DeterminateWinner',
  'WaitDeal',
  'InProgress',
  'Finished',
  'Stopped',
] as const satisfies readonly AuctionStatus[]

const FALLBACK_LABEL = '—'

export function describeAuctionType(type: AuctionType): string {
  return AUCTION_TYPE_LABELS[type] ?? FALLBACK_LABEL
}

export function describeTradingStatus(status: TradingStatus): string {
  return TRADING_STATUS_LABELS[status] ?? FALLBACK_LABEL
}

export function describeAuctionStatus(status: AuctionStatus): string {
  return AUCTION_STATUS_LABELS[status] ?? FALLBACK_LABEL
}

export function describeAuctionStatusCode(code: number): string {
  if (!Number.isInteger(code) || code < 1 || code > AUCTION_STATUS_CODES.length) {
    return FALLBACK_LABEL
  }
  return AUCTION_STATUS_LABELS[AUCTION_STATUS_CODES[code - 1]] ?? FALLBACK_LABEL
}

export function describeOperationType(type: OperationType): string {
  return OPERATION_TYPE_LABELS[type] ?? FALLBACK_LABEL
}

export function describePaymentDelayType(type: PaymentDelayType): string {
  return PAYMENT_DELAY_TYPE_LABELS[type] ?? FALLBACK_LABEL
}

export function describeBidMeasurementType(type: BidMeasurementType): string {
  return BID_MEASUREMENT_TYPE_LABELS[type] ?? FALLBACK_LABEL
}
