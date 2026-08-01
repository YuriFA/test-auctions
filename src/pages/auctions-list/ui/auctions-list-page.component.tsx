import { ActiveFilterChips, AuctionFilters, AuctionSearchInput } from '@features/auction-filters'
import { PageContainer } from '@shared/ui'

import { AuctionsList } from './auctions-list.component'

export function AuctionsPage() {
  return (
    <PageContainer className="max-w-7xl gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Аукционы</h1>
        <div className="flex items-center gap-2 max-sm:flex-wrap">
          <AuctionSearchInput />
          <AuctionFilters />
        </div>
      </header>

      <ActiveFilterChips />
      <AuctionsList />
    </PageContainer>
  )
}
