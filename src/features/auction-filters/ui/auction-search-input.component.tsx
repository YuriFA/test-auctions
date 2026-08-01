import { InputGroup, InputGroupAddon, InputGroupInput } from '@shared/ui'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { DEFAULT_AUCTIONS_LIST_FILTERS, toAuctionsListSearch } from '../lib/search-params'

export function AuctionSearchInput() {
  const navigate = useNavigate({ from: '/' })
  const search = useSearch({ from: '/' })
  const filters = { ...DEFAULT_AUCTIONS_LIST_FILTERS, ...search }

  const [local, setLocal] = useState(filters.cargo_num)
  useEffect(() => {
    setLocal(filters.cargo_num)
  }, [filters.cargo_num])

  const commit = () => {
    if (local === filters.cargo_num) {
      return
    }
    navigate({
      to: '/',
      search: toAuctionsListSearch({ ...filters, cargo_num: local, page: 1 }),
    })
  }

  return (
    <InputGroup className="min-w-42 flex-1">
      <InputGroupAddon align="inline-start">
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        type="text"
        inputMode="text"
        value={local}
        className="min-w-41"
        placeholder="Поиск по номеру заявки"
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit()
          }
        }}
      />
    </InputGroup>
  )
}
