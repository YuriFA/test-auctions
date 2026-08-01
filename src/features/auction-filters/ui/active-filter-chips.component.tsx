import { XIcon } from 'lucide-react'

import { Badge, Button } from '@shared/ui'

import { getActiveFilterChips, removeFilterValue } from '../lib/filter-chips'
import { DEFAULT_AUCTIONS_LIST_FILTERS } from '../lib/search-params'
import { useAuctionsListFiltersCommit } from '../lib/use-auctions-list-filters-commit'

export function ActiveFilterChips() {
  const { initialFilters, commitFilters } = useAuctionsListFiltersCommit()
  const chips = getActiveFilterChips(initialFilters)

  if (chips.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ul aria-label="Активные фильтры" className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <li key={chip.id} className="flex items-center">
            <FilterChip
              label={chip.label}
              onRemove={() =>
                commitFilters(removeFilterValue(initialFilters, chip.key, chip.value))
              }
            />
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => commitFilters({ ...DEFAULT_AUCTIONS_LIST_FILTERS })}
      >
        Очистить всё
      </Button>
    </div>
  )
}

interface FilterChipProps {
  label: string
  onRemove: () => void
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <Badge variant="secondary" className="gap-1 py-0 pr-1 pl-2">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Убрать фильтр: ${label}`}
      >
        <XIcon className="size-3" aria-hidden />
      </button>
    </Badge>
  )
}
