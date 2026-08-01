import type { AuctionCardPrimaryAction } from '@entities/auction'
import { Button } from '@shared/ui'
import { Link } from '@tanstack/react-router'

interface Props {
  action: AuctionCardPrimaryAction
  auctionUuid: string
}

export function AuctionAction({ action, auctionUuid }: Props) {
  if (action.kind === 'disabled') {
    return (
      <Button variant="outline" className="relative" disabled>
        {action.label}
      </Button>
    )
  }

  if (action.route === 'bet') {
    return (
      <Button
        className="relative"
        nativeButton={false}
        render={<Link to="/auctions/$auctionUuid/bet" params={{ auctionUuid }} />}
      >
        {action.label}
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      className="relative"
      nativeButton={false}
      render={<Link to="/auctions/$auctionUuid/bets" params={{ auctionUuid }} />}
    >
      {action.label}
    </Button>
  )
}
