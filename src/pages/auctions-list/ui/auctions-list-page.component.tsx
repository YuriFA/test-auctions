import { AuctionsList } from './auctions-list.component'

export function AuctionsPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Аукционы</h1>
      </header>

      <AuctionsList />
    </div>
  )
}
