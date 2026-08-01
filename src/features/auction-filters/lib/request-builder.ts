import type { AuctionListRequest } from '@shared/api'
import { toEndOfDayISO, toStartOfDayISO } from '@shared/lib'

import {
  DEFAULT_AUCTIONS_LIST_FILTERS,
  isApiAucType,
  type AuctionsListFilters,
} from './search-params'

export function buildAuctionListRequest(parsed: AuctionsListFilters): AuctionListRequest {
  const request: AuctionListRequest = {}

  if (parsed.page !== DEFAULT_AUCTIONS_LIST_FILTERS.page) {
    request.page = parsed.page
  }
  if (parsed.is_oldest !== DEFAULT_AUCTIONS_LIST_FILTERS.is_oldest) {
    request.is_oldest = parsed.is_oldest
  }
  if (parsed.cargo_num) {
    request.cargo_num = parsed.cargo_num
  }
  if (parsed.load_city) {
    request.load_city = parsed.load_city
  }
  if (parsed.unload_city) {
    request.unload_city = parsed.unload_city
  }

  const aucType = parsed.auc_type.filter(isApiAucType)
  if (aucType.length > 0) {
    request.auc_type = aucType
  }

  if (parsed.status.length > 0) {
    request.status = parsed.status
  }
  if (parsed.statuses.length > 0) {
    request.statuses = parsed.statuses
  }

  if (typeof parsed.current_price_from === 'number') {
    request.current_price_from = parsed.current_price_from
  }
  if (typeof parsed.current_price_to === 'number') {
    request.current_price_to = parsed.current_price_to
  }

  // NOTE: create_date_* are intentionally absent from the filter form UI; they
  // are kept in the type so programmatic / deep-link usage remains possible.
  if (parsed.create_date_from) {
    request.create_date_from = toStartOfDayISO(parsed.create_date_from)
  }
  if (parsed.create_date_to) {
    request.create_date_to = toEndOfDayISO(parsed.create_date_to)
  }
  if (parsed.load_date_from) {
    request.load_date_from = toStartOfDayISO(parsed.load_date_from)
  }
  if (parsed.load_date_to) {
    request.load_date_to = toEndOfDayISO(parsed.load_date_to)
  }

  if (typeof parsed.is_available === 'boolean') {
    request.is_available = parsed.is_available
  }
  if (typeof parsed.is_bidder === 'boolean') {
    request.is_bidder = parsed.is_bidder
  }

  return request
}
