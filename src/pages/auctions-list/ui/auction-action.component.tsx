import type { AuctionCardPrimaryAction } from '@entities/auction'
import { Button } from '@shared/ui'
import { Link } from '@tanstack/react-router'

interface Props {
  action: AuctionCardPrimaryAction
  auctionRef: string
}

export function AuctionAction({ action, auctionRef }: Props) {
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
        render={<Link to="/auctions/$auctionRef/bet" params={{ auctionRef }} />}
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
      render={<Link to="/auctions/$auctionRef/bets" params={{ auctionRef }} />}
    >
      {action.label}
    </Button>
  )
}
