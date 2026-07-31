export interface AuctionRestrictionSource {
  canSetBet: boolean
  hideBetsHistory: boolean
  hidePointsAddressAndContacts: boolean
  noViewCargoPrice: boolean
}

export interface AuctionRestrictions {
  canPlaceBet: boolean
  canViewBetsHistory: boolean
  canViewContacts: boolean
  canViewCargoPrice: boolean
}

export function deriveAuctionRestrictions(source: AuctionRestrictionSource): AuctionRestrictions {
  return {
    canPlaceBet: source.canSetBet,
    canViewBetsHistory: !source.hideBetsHistory,
    canViewContacts: !source.hidePointsAddressAndContacts,
    canViewCargoPrice: !source.noViewCargoPrice,
  }
}
