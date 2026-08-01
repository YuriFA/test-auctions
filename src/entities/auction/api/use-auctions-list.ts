import type { AuctionListRequest, AuctionListResponse } from '@shared/api'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { AuctionListItemVM } from '../lib/list-item'
import { toAuctionListItemVM } from '../lib/list-item'
import { auctionListQueryOptions } from './query-options'

type AuctionsListViewData = {
  items: AuctionListItemVM[]
  currentPage: number
  lastPage: number
  total: number
}

export function useAuctionsList(filters: AuctionListRequest) {
  return useQuery({
    ...auctionListQueryOptions(filters),
    placeholderData: keepPreviousData,
    select: toAuctionsListViewData,
  })
}

function toAuctionsListViewData(response: AuctionListResponse): AuctionsListViewData {
  return {
    items: (response.data ?? [])
      .map(toAuctionListItemVM)
      .filter((item): item is AuctionListItemVM => item !== null),
    currentPage: response.meta?.current_page ?? 1,
    lastPage: Math.max(response.meta?.last_page ?? 1, 1),
    total: response.meta?.total ?? 0,
  }
}
