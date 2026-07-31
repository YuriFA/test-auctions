import { Input } from '@shared/ui'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { SearchIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { DEFAULT_AUCTIONS_LIST_FILTERS, toAuctionsListSearch } from '../lib/search-params'

export function AuctionSearchInput() {
  const navigate = useNavigate({ from: '/auctions' })
  const search = useSearch({ from: '/auctions' })
  const filters = useMemo(() => ({ ...DEFAULT_AUCTIONS_LIST_FILTERS, ...search }), [search])

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
    <div className="relative flex w-full">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
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
        className="w-48 max-w-full flex-1 pl-8"
      />
    </div>
  )
}
