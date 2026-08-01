import { useAuctionsList, usePrefetchAuctionDetail } from '@entities/auction'
import {
  DEFAULT_AUCTIONS_LIST_FILTERS,
  buildAuctionListRequest,
  toAuctionsListSearch,
} from '@features/auction-filters'
import { cn } from '@shared/lib/cn'
import {
  Empty,
  EmptyDescription,
  EmptyTitle,
  ErrorAlert,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Skeleton,
} from '@shared/ui'
import { Link, useSearch } from '@tanstack/react-router'

import { buildPageList } from '../lib/build-page-list'
import { AuctionListItemCard } from './auction-list-item-card.component'

export function AuctionsList() {
  const prefetchAuctionDetail = usePrefetchAuctionDetail()

  const search = useSearch({ from: '/' })
  const filters = { ...DEFAULT_AUCTIONS_LIST_FILTERS, ...search }
  const request = buildAuctionListRequest(filters)
  const query = useAuctionsList(request)

  const handleIntent = (auctionRef: string) => {
    prefetchAuctionDetail(auctionRef)
  }

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
      <ErrorAlert
        title="Не удалось загрузить аукционы"
        description={query.error?.message || 'Произошла непредвиденная ошибка. Попробуйте ещё раз.'}
        onRetry={() => query.refetch()}
      />
    )
  }

  const { items, currentPage, lastPage } = query.data
  const pageList = buildPageList(currentPage, lastPage)
  const searchForPage = (page: number) => toAuctionsListSearch({ ...filters, page })

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
          <AuctionListItemCard key={item.auctionRef} item={item} onIntent={handleIntent} />
        ))}
      </section>

      <Pagination className="mx-auto flex w-full justify-center" aria-label="Пагинация">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              text="Назад"
              render={<Link to="/" search={searchForPage(Math.max(1, currentPage - 1))} />}
              aria-disabled={query.isFetching || currentPage <= 1}
              className={cn(
                (query.isFetching || currentPage <= 1) && 'pointer-events-none opacity-50',
              )}
            />
          </PaginationItem>
          {pageList.map((entry) =>
            entry === 'ellipsis' ? (
              <PaginationItem key="ellipsis">
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={entry}>
                <PaginationLink
                  isActive={entry === currentPage}
                  render={
                    <Link
                      to="/"
                      search={searchForPage(entry)}
                      aria-current={entry === currentPage ? 'page' : undefined}
                    />
                  }
                >
                  {entry}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              text="Вперёд"
              render={<Link to="/" search={searchForPage(Math.min(lastPage, currentPage + 1))} />}
              aria-disabled={query.isFetching || currentPage >= lastPage}
              className={cn(
                (query.isFetching || currentPage >= lastPage) && 'pointer-events-none opacity-50',
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  )
}
