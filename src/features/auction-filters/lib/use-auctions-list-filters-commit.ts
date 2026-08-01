import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'

import {
  DEFAULT_AUCTIONS_LIST_FILTERS,
  toAuctionsListSearch,
  type AuctionsListFilters,
} from './search-params'

export function useAuctionsListFiltersCommit() {
  const navigate = useNavigate({ from: '/' })
  const search = useSearch({ from: '/' })

  const initialFilters: AuctionsListFilters = {
    ...DEFAULT_AUCTIONS_LIST_FILTERS,
    ...search,
  }

  const commitFilters = useCallback(
    (next: AuctionsListFilters) => {
      navigate({
        to: '/',
        search: toAuctionsListSearch({ ...next, page: 1 }),
      })
    },
    [navigate],
  )

  return { initialFilters, commitFilters }
}
