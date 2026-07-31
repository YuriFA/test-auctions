import { AuctionFilters, AuctionSearchInput } from '@features/auction-filters'

import { AuctionsList } from './auctions-list.component'

export function AuctionsPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Аукционы</h1>
        <div className="flex items-center gap-2">
          <AuctionSearchInput />
          <AuctionFilters />
        </div>
      </header>

      <AuctionsList />
    </div>
  )
}
