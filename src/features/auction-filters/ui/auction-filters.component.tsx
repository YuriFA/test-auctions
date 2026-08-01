import {
  Badge,
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shared/ui'
import { useSearch } from '@tanstack/react-router'
import { SlidersHorizontalIcon } from 'lucide-react'
import { useState } from 'react'

import { DEFAULT_AUCTIONS_LIST_FILTERS, countActiveFilters } from '../lib/search-params'
import { AuctionFiltersForm } from './auction-filters-form.component'

export function AuctionFilters() {
  const [open, setOpen] = useState(false)
  const search = useSearch({ from: '/' })
  const filters = { ...DEFAULT_AUCTIONS_LIST_FILTERS, ...search }
  const activeCount = countActiveFilters(filters)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button type="button" variant="outline">
            <SlidersHorizontalIcon data-icon="inline-start" />
            Фильтры
            {activeCount > 0 && (
              <Badge variant="secondary" className="min-w-5 rounded-full px-1.5">
                {activeCount}
              </Badge>
            )}
          </Button>
        }
      />
      <SheetContent side="right" className="w-full p-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Фильтры</SheetTitle>
          <SheetDescription className="sr-only">
            Параметры фильтрации списка аукционов
          </SheetDescription>
        </SheetHeader>
        <AuctionFiltersForm onApplied={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
