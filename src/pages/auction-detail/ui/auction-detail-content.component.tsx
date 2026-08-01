import type { AuctionDetailVM } from '@entities/auction'
import {
  AuctionStatusBadge,
  AuctionTypeBadge,
  TradingStatusBadge,
  deriveAuctionCardPrimaryAction,
  deriveAuctionRestrictions,
} from '@entities/auction'
import { formatDate } from '@shared/lib'

import { CargoCard } from './cards/cargo-card.component'
import { ContactsCard } from './cards/contacts-card.component'
import { OrganizerCard } from './cards/organizer-card.component'
import { PaymentCard } from './cards/payment-card.component'
import { RoutesCard } from './cards/routes-card.component'
import { TradingCard } from './cards/trading-card.component'
import { YourBetCard } from './cards/your-bet-card.component'
import { DetailActionBar } from './detail-action-bar.component'

export interface AuctionDetailContentProps {
  vm: AuctionDetailVM
  auctionRef: string
}

export function AuctionDetailContent({ vm, auctionRef }: AuctionDetailContentProps) {
  const restrictions = deriveAuctionRestrictions({
    canSetBet: vm.canSetBet,
    hideBetsHistory: vm.hideBetsHistory,
    hidePointsAddressAndContacts: vm.hidePointsAddressAndContacts,
    noViewCargoPrice: vm.noViewCargoPrice,
  })
  const action = deriveAuctionCardPrimaryAction({
    auctionStatus: vm.auctionStatus,
    canSetBet: restrictions.canPlaceBet,
    hasUserBet: vm.hasUserBet,
  })

  return (
    <>
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {vm.cargoNum && (
            <span className="text-lg font-semibold tracking-tight">№ {vm.cargoNum}</span>
          )}
          {vm.createdAt && (
            <span className="text-sm text-muted-foreground">
              · создан {formatDate(vm.createdAt)}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <AuctionTypeBadge type={vm.aucType} label={vm.aucTypeLabel} />
          <AuctionStatusBadge status={vm.auctionStatus} label={vm.auctionStatusLabel} />
          <TradingStatusBadge status={vm.tradingStatus} label={vm.tradingStatusLabel} />
        </div>
      </header>

      <DetailActionBar action={action} auctionRef={auctionRef} restrictions={restrictions} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OrganizerCard vm={vm} />
        <ContactsCard vm={vm} restrictions={restrictions} />
        <PaymentCard vm={vm} />
        <YourBetCard vm={vm} restrictions={restrictions} />
      </div>

      <RoutesCard vm={vm} restrictions={restrictions} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CargoCard vm={vm} />
        <TradingCard vm={vm} restrictions={restrictions} />
      </div>
    </>
  )
}
