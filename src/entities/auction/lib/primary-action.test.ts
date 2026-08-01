import type { AuctionStatus } from '@shared/api'
import { describe, expect, it } from 'vitest'

import { deriveAuctionCardPrimaryAction } from './primary-action'

describe('deriveAuctionCardPrimaryAction', () => {
  describe('terminal auction status forces disabled', () => {
    it.each<[AuctionStatus]>([['Finished'], ['Stopped'], ['Canceled']])(
      'returns disabled for %s even when can_set_bet=true and user has bet',
      (status) => {
        const result = deriveAuctionCardPrimaryAction({
          auctionStatus: status,
          canSetBet: true,
          hasUserBet: true,
        })
        expect(result.kind).toBe('disabled')
      },
    )

    it('uses a status-specific disabled label', () => {
      expect(
        deriveAuctionCardPrimaryAction({
          auctionStatus: 'Finished',
          canSetBet: false,
          hasUserBet: false,
        }).label,
      ).toBe('Аукцион завершён')
      expect(
        deriveAuctionCardPrimaryAction({
          auctionStatus: 'Stopped',
          canSetBet: false,
          hasUserBet: false,
        }).label,
      ).toBe('Аукцион остановлен')
      expect(
        deriveAuctionCardPrimaryAction({
          auctionStatus: 'Canceled',
          canSetBet: false,
          hasUserBet: false,
        }).label,
      ).toBe('Аукцион отменён')
    })
  })

  it('returns place-bet when can_set_bet and no user bet', () => {
    const result = deriveAuctionCardPrimaryAction({
      auctionStatus: 'Auction',
      canSetBet: true,
      hasUserBet: false,
    })
    expect(result).toMatchObject({ kind: 'place-bet', label: 'Сделать ставку' })
  })

  it('returns change-bet when can_set_bet and user already has a bet', () => {
    const result = deriveAuctionCardPrimaryAction({
      auctionStatus: 'Auction',
      canSetBet: true,
      hasUserBet: true,
    })
    expect(result).toMatchObject({ kind: 'change-bet', label: 'Изменить ставку' })
  })

  it('returns view-bets when can_set_bet=false and status is non-terminal', () => {
    const result = deriveAuctionCardPrimaryAction({
      auctionStatus: 'WaitDeal',
      canSetBet: false,
      hasUserBet: true,
    })
    expect(result).toMatchObject({ kind: 'view-bets', label: 'Смотреть ставки' })
  })

  describe('missing status', () => {
    it('treats undefined status as non-terminal and falls through to can_set_bet branching', () => {
      const result = deriveAuctionCardPrimaryAction({
        auctionStatus: undefined,
        canSetBet: false,
        hasUserBet: false,
      })
      expect(result.kind).toBe('view-bets')
    })
  })
})
