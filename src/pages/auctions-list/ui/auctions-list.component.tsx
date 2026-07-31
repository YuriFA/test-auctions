import { auctionKeys, useAuctionsList } from '@entities/auction'
import {
  DEFAULT_AUCTIONS_LIST_FILTERS,
  buildAuctionListRequest,
  toAuctionsListSearch,
} from '@features/auction-filters'
import { fetchAuctionDetail } from '@shared/api'
import { cn } from '@shared/lib/cn'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

import { AuctionListItemCard } from './auction-list-item-card.component'

const PREFETCH_STALE_TIME_MS = 60_000

export function AuctionsList() {
  const navigate = useNavigate({ from: '/auctions' })
  const queryClient = useQueryClient()

  const search = useSearch({ from: '/auctions' })
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
        to: '/auctions',
        search: toAuctionsListSearch({ ...filters, page: clamped }),
      })
    },
    [filters, navigate, query.data?.lastPage],
  )

  const handleIntent = useCallback(
    (auctionUuid: string) => {
      void queryClient.prefetchQuery({
        queryKey: auctionKeys.detail(auctionUuid),
        queryFn: () => fetchAuctionDetail(auctionUuid),
        // Avoid refetch on click after hover-prefetch.
        staleTime: PREFETCH_STALE_TIME_MS,
      })
    },
    [queryClient],
  )

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="h-20 animate-pulse rounded-lg border border-border bg-muted/40"
          />
        ))}
      </div>
    )
  }

  if (query.isError) {
    return (
      <section className="flex flex-col items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
        <h2 className="text-base font-semibold text-destructive">Не удалось загрузить аукционы</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          {query.error?.message || 'Произошла непредвиденная ошибка. Попробуйте ещё раз.'}
        </p>
        <button
          type="button"
          onClick={() => setPage(filters.page)}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Повторить
        </button>
      </section>
    )
  }

  const { items, currentPage, lastPage } = query.data

  if (items.length === 0) {
    return (
      <section className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <h2 className="text-base font-semibold">Ничего не найдено</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          Под текущие фильтры не подошёл ни один аукцион. Попробуйте сбросить фильтры или изменить
          диапазоны.
        </p>
      </section>
    )
  }

  return (
    <>
      <section
        className={cn(
          'relative flex flex-col gap-3',
          query.isFetching && 'opacity-60 transition-opacity',
        )}
      >
        {items.map((item) => (
          <AuctionListItemCard key={item.auctionUuid} item={item} onIntent={handleIntent} />
        ))}
      </section>

      <nav className="flex items-center justify-between gap-3" aria-label="Пагинация">
        <button
          type="button"
          onClick={() => setPage(currentPage - 1)}
          disabled={query.isFetching || currentPage <= 1}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Назад
        </button>
        <span className="text-sm text-muted-foreground">
          {currentPage} / {lastPage}
        </span>
        <button
          type="button"
          onClick={() => setPage(currentPage + 1)}
          disabled={query.isFetching || currentPage >= lastPage}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Вперёд
        </button>
      </nav>
    </>
  )
}
