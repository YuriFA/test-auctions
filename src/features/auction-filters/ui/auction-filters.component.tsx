import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@shared/ui'
import { useSearch } from '@tanstack/react-router'
import { SlidersHorizontalIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { DEFAULT_AUCTIONS_LIST_FILTERS, countActiveFilters } from '../lib/search-params'
import { AuctionFiltersForm } from './auction-filters-form.component'

export function AuctionFilters() {
  const [open, setOpen] = useState(false)
  const search = useSearch({ from: '/auctions' })
  const filters = useMemo(() => ({ ...DEFAULT_AUCTIONS_LIST_FILTERS, ...search }), [search])
  const activeCount = countActiveFilters(filters)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button type="button" variant="outline">
            <SlidersHorizontalIcon />
            Фильтры
            {activeCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        }
      />
      <SheetContent side="right" className="w-full p-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Фильтры</SheetTitle>
        </SheetHeader>
        <AuctionFiltersForm onApplied={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
