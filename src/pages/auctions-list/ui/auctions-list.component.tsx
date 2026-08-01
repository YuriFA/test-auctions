import { useAuctionsList, usePrefetchAuctionDetail } from '@entities/auction'
import {
  DEFAULT_AUCTIONS_LIST_FILTERS,
  buildAuctionListRequest,
  toAuctionsListSearch,
} from '@features/auction-filters'
import { cn } from '@shared/lib/cn'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Empty,
  EmptyDescription,
  EmptyTitle,
  Skeleton,
} from '@shared/ui'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

import { AuctionListItemCard } from './auction-list-item-card.component'

export function AuctionsList() {
  const navigate = useNavigate({ from: '/' })
  const prefetchAuctionDetail = usePrefetchAuctionDetail()

  const search = useSearch({ from: '/' })
  const filters = useMemo(() => ({ ...DEFAULT_AUCTIONS_LIST_FILTERS, ...search }), [search])
  const request = useMemo(() => buildAuctionListRequest(filters), [filters])
  const query = useAuctionsList(request)

  const setPage = useCallback(
    (next: number) => {
      const lastPage = query.data?.lastPage ?? 1
      const clamped = Math.min(Math.max(next, 1), lastPage)
      if (clamped === filters.page) {
        return
      }
      navigate({
        to: '/',
        search: toAuctionsListSearch({ ...filters, page: clamped }),
      })
    },
    [filters, navigate, query.data?.lastPage],
  )

  const handleIntent = useCallback(
    (auctionUuid: string) => {
      prefetchAuctionDetail(auctionUuid)
    },
    [prefetchAuctionDetail],
  )

  if (query.isPending) {
    return (
      <div
        className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        aria-busy="true"
        aria-live="polite"
      >
        {Array.from({ length: 8 }).map((_, idx) => (
          <Skeleton key={idx} className="h-48" />
        ))}
      </div>
    )
  }

  if (query.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Не удалось загрузить аукционы</AlertTitle>
        <AlertDescription>
          {query.error?.message || 'Произошла непредвиденная ошибка. Попробуйте ещё раз.'}
        </AlertDescription>
        <Button variant="outline" size="sm" onClick={() => setPage(filters.page)}>
          Повторить
        </Button>
      </Alert>
    )
  }

  const { items, currentPage, lastPage } = query.data

  if (items.length === 0) {
    return (
      <Empty>
        <EmptyTitle>Ничего не найдено</EmptyTitle>
        <EmptyDescription>
          Под текущие фильтры не подошёл ни один аукцион. Попробуйте сбросить фильтры или изменить
          диапазоны.
        </EmptyDescription>
      </Empty>
    )
  }

  return (
    <>
      <section
        className={cn(
          'relative grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
          query.isFetching && 'opacity-60 transition-opacity',
        )}
      >
        {items.map((item) => (
          <AuctionListItemCard key={item.auctionUuid} item={item} onIntent={handleIntent} />
        ))}
      </section>

      <nav className="flex items-center justify-between gap-3" aria-label="Пагинация">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(currentPage - 1)}
          disabled={query.isFetching || currentPage <= 1}
        >
          Назад
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentPage} / {lastPage}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(currentPage + 1)}
          disabled={query.isFetching || currentPage >= lastPage}
        >
          Вперёд
        </Button>
      </nav>
    </>
  )
}
