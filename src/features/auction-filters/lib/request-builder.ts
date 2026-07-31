import type { AuctionListRequest } from '@shared/api'

import { DEFAULT_AUCTIONS_LIST_FILTERS, type AuctionsListFilters } from './search-params'

const API_AUC_TYPES = ['Request', 'Up', 'Down', 'FixPrice'] as const

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

  const aucType = parsed.auc_type.filter((value) =>
    (API_AUC_TYPES as readonly string[]).includes(value),
  )
  if (aucType.length > 0) {
    request.auc_type = aucType as AuctionListRequest['auc_type']
  }

  if (parsed.status.length > 0) {
    request.status = parsed.status as AuctionListRequest['status']
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

  if (parsed.create_date_from) {
    request.create_date_from = parsed.create_date_from
  }
  if (parsed.create_date_to) {
    request.create_date_to = parsed.create_date_to
  }
  if (parsed.load_date_from) {
    request.load_date_from = parsed.load_date_from
  }
  if (parsed.load_date_to) {
    request.load_date_to = parsed.load_date_to
  }

  if (typeof parsed.is_available === 'boolean') {
    request.is_available = parsed.is_available
  }
  if (typeof parsed.is_bidder === 'boolean') {
    request.is_bidder = parsed.is_bidder
  }

  return request
}
