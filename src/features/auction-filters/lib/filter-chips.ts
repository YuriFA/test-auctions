import {
  describeAuctionStatusCode,
  describeAuctionType,
  describeTradingStatus,
} from '@entities/auction'
import type { AuctionType, TradingStatus } from '@shared/api'

import {
  ACTIVE_FIELDS,
  DEFAULT_IS_OLDEST,
  DEFAULT_PAGE,
  FIELD_KINDS,
  NON_FILTER_FIELDS,
  isActive,
  type AuctionsListFilters,
} from './search-params'

export type ActiveFilterChip = {
  id: string
  key: keyof AuctionsListFilters
  value?: string | number | boolean
  label: string
}

const FILTER_LABEL_PREFIX = {
  auc_type: 'Тип',
  status: 'Мой статус',
  statuses: 'Статус аукциона',
  load_city: 'Погрузка',
  unload_city: 'Выгрузка',
  current_price_from: 'Цена от',
  current_price_to: 'Цена до',
  create_date_from: 'Создан с',
  create_date_to: 'Создан по',
  load_date_from: 'Погрузка с',
  load_date_to: 'Погрузка по',
} as const

const BOOLEAN_FLAG_LABEL = {
  is_available: 'Только доступные',
  is_bidder: 'Только мои участия',
} as const

const IS_OLDEST_LABEL = 'Сначала старые'

function formatPrice(value: number): string {
  return `${value.toLocaleString('ru-RU')} ₽`
}

function describeValue(key: keyof AuctionsListFilters, value: string | number | boolean): string {
  switch (key) {
    case 'auc_type':
      return `${FILTER_LABEL_PREFIX.auc_type}: ${describeAuctionType(value as AuctionType)}`
    case 'status':
      return `${FILTER_LABEL_PREFIX.status}: ${describeTradingStatus(value as TradingStatus)}`
    case 'statuses':
      return `${FILTER_LABEL_PREFIX.statuses}: ${describeAuctionStatusCode(value as number)}`
    case 'current_price_from':
    case 'current_price_to':
      return `${FILTER_LABEL_PREFIX[key]}: ${formatPrice(value as number)}`
    case 'load_city':
    case 'unload_city':
    case 'create_date_from':
    case 'create_date_to':
    case 'load_date_from':
    case 'load_date_to':
      return `${FILTER_LABEL_PREFIX[key]}: ${value}`
    case 'is_available':
      return value === true
        ? BOOLEAN_FLAG_LABEL.is_available
        : `${BOOLEAN_FLAG_LABEL.is_available}: нет`
    case 'is_bidder':
      return value === true ? BOOLEAN_FLAG_LABEL.is_bidder : `${BOOLEAN_FLAG_LABEL.is_bidder}: нет`
    case 'is_oldest':
      return IS_OLDEST_LABEL
    default:
      return String(value)
  }
}

export function getActiveFilterChips(filters: AuctionsListFilters): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []
  for (const key of ACTIVE_FIELDS) {
    if (NON_FILTER_FIELDS.has(key)) {
      continue
    }
    const value = filters[key]
    if (!isActive(key, value)) {
      continue
    }

    if (FIELD_KINDS[key] === 'array') {
      const items = value as unknown[]
      for (const item of items) {
        const itemValue = item as string | number | boolean
        chips.push({
          id: `${key}-${String(item)}`,
          key,
          value: itemValue,
          label: describeValue(key, itemValue),
        })
      }
      continue
    }

    const scalarValue = value as string | number | boolean
    chips.push({
      id: String(key),
      key,
      value: scalarValue,
      label: describeValue(key, scalarValue),
    })
  }
  return chips
}

// Returns a new filters object with the given field cleared (or one value
// removed for arrays). Page is not a filter, but we still handle the kind
// defensively — see NON_FILTER_FIELDS in search-params.ts.
export function removeFilterValue(
  filters: AuctionsListFilters,
  key: keyof AuctionsListFilters,
  value?: string | number | boolean,
): AuctionsListFilters {
  const next: Record<string, unknown> = { ...filters }
  const current = filters[key]

  if (Array.isArray(current)) {
    next[key] = current.filter((v) => v !== value)
    return next as AuctionsListFilters
  }

  switch (FIELD_KINDS[key]) {
    case 'optionalNumber':
    case 'optionalBoolean':
    case 'optionalString':
      next[key] = undefined
      break
    case 'string':
      next[key] = ''
      break
    case 'defaultNumber':
      next[key] = DEFAULT_PAGE
      break
    case 'defaultBoolean':
      next[key] = DEFAULT_IS_OLDEST
      break
  }
  return next as AuctionsListFilters
}
