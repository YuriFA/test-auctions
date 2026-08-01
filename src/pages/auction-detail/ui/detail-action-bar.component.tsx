import type { AuctionRestrictions } from '@entities/auction'
import type { deriveAuctionCardPrimaryAction } from '@entities/auction'
import { Button } from '@shared/ui'
import { Link } from '@tanstack/react-router'

export interface DetailActionBarProps {
  action: ReturnType<typeof deriveAuctionCardPrimaryAction>
  auctionRef: string
  restrictions: AuctionRestrictions
}

// NOTE: two distinct Link branches keep `to` a string literal — TanStack
// Router infers param types from the literal, so a computed value would lose it.
export function DetailActionBar({ action, auctionRef, restrictions }: DetailActionBarProps) {
  if (action.kind === 'disabled') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" disabled>
          {action.label}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {action.kind === 'place-bet' || action.kind === 'change-bet' ? (
        <Button
          nativeButton={false}
          render={<Link to="/auctions/$auctionRef/bet" params={{ auctionRef }} />}
        >
          {action.label}
        </Button>
      ) : (
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link to="/auctions/$auctionRef/bets" params={{ auctionRef }} />}
        >
          {action.label}
        </Button>
      )}
      {restrictions.canViewBetsHistory && (
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link to="/auctions/$auctionRef/bets" params={{ auctionRef }} />}
        >
          История ставок
        </Button>
      )}
    </div>
  )
}
