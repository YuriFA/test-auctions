import { SearchIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { DEFAULT_AUCTIONS_LIST_FILTERS, toAuctionsListSearch } from '../lib/search-params'

const INPUT_CLASS =
  'h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none'

export function AuctionSearchInput() {
  const navigate = useNavigate({ from: '/auctions' })
  const search = useSearch({ from: '/auctions' })
  const filters = useMemo(
    () => ({ ...DEFAULT_AUCTIONS_LIST_FILTERS, ...search }),
    [search],
  )

  const [local, setLocal] = useState(filters.cargo_num)
  useEffect(() => {
    setLocal(filters.cargo_num)
  }, [filters.cargo_num])

  const commit = () => {
    if (local === filters.cargo_num) {
      return
    }
    navigate({
      to: '/auctions',
      search: toAuctionsListSearch({ ...filters, cargo_num: local, page: 1 }),
    })
  }

  return (
    <div className="relative w-full max-w-xs">
      <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        inputMode="text"
        value={local}
        placeholder="Поиск по номеру заявки"
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit()
          }
        }}
        className={INPUT_CLASS}
      />
    </div>
  )
}
