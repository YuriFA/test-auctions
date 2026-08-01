import { describe, expect, it } from 'vitest'

import type { AuctionDetailVM } from './detail'
import { deriveAuctionRestrictions, restrictionsFromVM } from './restrictions'

const ALL_OPEN = {
  canSetBet: true,
  hideBetsHistory: false,
  hidePointsAddressAndContacts: false,
  noViewCargoPrice: false,
}

describe('deriveAuctionRestrictions', () => {
  it('returns all-open result when no restrictions are set', () => {
    expect(deriveAuctionRestrictions(ALL_OPEN)).toEqual({
      canPlaceBet: true,
      canViewBetsHistory: true,
      canViewContacts: true,
      canViewCargoPrice: true,
    })
  })

  it('maps canSetBet=false to canPlaceBet=false', () => {
    expect(deriveAuctionRestrictions({ ...ALL_OPEN, canSetBet: false }).canPlaceBet).toBe(false)
  })

  it('maps hideBetsHistory=true to canViewBetsHistory=false', () => {
    expect(
      deriveAuctionRestrictions({ ...ALL_OPEN, hideBetsHistory: true }).canViewBetsHistory,
    ).toBe(false)
  })

  it('maps hidePointsAddressAndContacts=true to canViewContacts=false', () => {
    expect(
      deriveAuctionRestrictions({ ...ALL_OPEN, hidePointsAddressAndContacts: true })
        .canViewContacts,
    ).toBe(false)
  })

  it('maps noViewCargoPrice=true to canViewCargoPrice=false', () => {
    expect(
      deriveAuctionRestrictions({ ...ALL_OPEN, noViewCargoPrice: true }).canViewCargoPrice,
    ).toBe(false)
  })

  it('handles fully-locked auctions', () => {
    const result = deriveAuctionRestrictions({
      canSetBet: false,
      hideBetsHistory: true,
      hidePointsAddressAndContacts: true,
      noViewCargoPrice: true,
    })
    expect(result).toEqual({
      canPlaceBet: false,
      canViewBetsHistory: false,
      canViewContacts: false,
      canViewCargoPrice: false,
    })
  })

  it('keeps each restriction independent — locking one does not lock another', () => {
    const result = deriveAuctionRestrictions({
      canSetBet: false,
      hideBetsHistory: false,
      hidePointsAddressAndContacts: true,
      noViewCargoPrice: false,
    })
    expect(result).toEqual({
      canPlaceBet: false,
      canViewBetsHistory: true,
      canViewContacts: false,
      canViewCargoPrice: true,
    })
  })
})

describe('restrictionsFromVM', () => {
  function vmWith(
    overrides: Partial<
      Pick<
        AuctionDetailVM,
        'canSetBet' | 'hideBetsHistory' | 'hidePointsAddressAndContacts' | 'noViewCargoPrice'
      >
    >,
  ) {
    return {
      canSetBet: true,
      hideBetsHistory: false,
      hidePointsAddressAndContacts: false,
      noViewCargoPrice: false,
      ...overrides,
    } as AuctionDetailVM
  }

  it('returns all-open restrictions for an unrestricted VM', () => {
    expect(restrictionsFromVM(vmWith({}))).toEqual({
      canPlaceBet: true,
      canViewBetsHistory: true,
      canViewContacts: true,
      canViewCargoPrice: true,
    })
  })

  it('flips each hide/no-view flag into the matching can-view restriction', () => {
    expect(
      restrictionsFromVM(
        vmWith({
          canSetBet: false,
          hideBetsHistory: true,
          hidePointsAddressAndContacts: true,
          noViewCargoPrice: true,
        }),
      ),
    ).toEqual({
      canPlaceBet: false,
      canViewBetsHistory: false,
      canViewContacts: false,
      canViewCargoPrice: false,
    })
  })

  it('matches deriveAuctionRestrictions for the same field values', () => {
    const vm = vmWith({ canSetBet: false, hideBetsHistory: true })
    expect(restrictionsFromVM(vm)).toEqual(
      deriveAuctionRestrictions({
        canSetBet: vm.canSetBet,
        hideBetsHistory: vm.hideBetsHistory,
        hidePointsAddressAndContacts: vm.hidePointsAddressAndContacts,
        noViewCargoPrice: vm.noViewCargoPrice,
      }),
    )
  })
})
