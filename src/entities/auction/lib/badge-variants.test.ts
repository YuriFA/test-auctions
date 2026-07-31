import type { AuctionStatus, AuctionType, TradingStatus } from '@shared/api'
import { describe, expect, it } from 'vitest'

import {
  AUCTION_STATUS_BADGE_VARIANTS,
  AUCTION_TYPE_BADGE_VARIANTS,
  TRADING_STATUS_BADGE_VARIANTS,
  auctionStatusBadgeVariant,
  auctionTypeBadgeVariant,
  tradingStatusBadgeVariant,
} from './badge-variants'

describe('auctionTypeBadgeVariant', () => {
  it.each<[AuctionType, string]>([
    ['Request', 'secondary'],
    ['Up', 'success'],
    ['Down', 'destructive'],
    ['FixPrice', 'info'],
    ['Unknown', 'secondary'],
  ])('maps %s to %s variant', (value, expected) => {
    expect(auctionTypeBadgeVariant(value)).toBe(expected)
  })

  it('returns secondary fallback for unexpected values', () => {
    expect(auctionTypeBadgeVariant('SomethingNew' as AuctionType)).toBe('secondary')
  })

  it('covers every AuctionType enum member', () => {
    // If the OpenAPI enum gains a new member, this test forces a conscious
    // decision rather than a silent fallback in production.
    const known: AuctionType[] = ['Request', 'Up', 'Down', 'FixPrice', 'Unknown']
    for (const value of known) {
      expect(AUCTION_TYPE_BADGE_VARIANTS[value]).toBeDefined()
    }
  })
})

describe('tradingStatusBadgeVariant', () => {
  it.each<[TradingStatus, string]>([
    ['NotParticipating', 'secondary'],
    ['Leading', 'info'],
    ['Losing', 'warning'],
    ['Winner', 'success'],
    ['OnPending', 'secondary'],
    ['Confirmed', 'success'],
    ['ChoosingWinner', 'info'],
    ['Accepted', 'success'],
    ['Unknown', 'secondary'],
  ])('maps %s to %s variant', (value, expected) => {
    expect(tradingStatusBadgeVariant(value)).toBe(expected)
  })

  it('returns secondary fallback for unexpected values', () => {
    expect(tradingStatusBadgeVariant('SomethingNew' as TradingStatus)).toBe('secondary')
  })

  it('covers every TradingStatus enum member', () => {
    const known: TradingStatus[] = [
      'NotParticipating',
      'Leading',
      'Losing',
      'OnPending',
      'Confirmed',
      'ChoosingWinner',
      'Winner',
      'Accepted',
      'Unknown',
    ]
    for (const value of known) {
      expect(TRADING_STATUS_BADGE_VARIANTS[value]).toBeDefined()
    }
  })
})

describe('auctionStatusBadgeVariant', () => {
  it.each<[AuctionStatus, string]>([
    ['Planning', 'info'],
    ['Auction', 'success'],
    ['DeterminateWinner', 'info'],
    ['WaitDeal', 'secondary'],
    ['InProgress', 'info'],
    ['Finished', 'secondary'],
    ['Stopped', 'destructive'],
    ['Canceled', 'destructive'],
    ['Unknown', 'secondary'],
  ])('maps %s to %s variant', (value, expected) => {
    expect(auctionStatusBadgeVariant(value)).toBe(expected)
  })

  it('returns secondary fallback for unexpected values', () => {
    expect(auctionStatusBadgeVariant('SomethingNew' as AuctionStatus)).toBe('secondary')
  })

  it('covers every AuctionStatus enum member', () => {
    const known: AuctionStatus[] = [
      'Planning',
      'Auction',
      'DeterminateWinner',
      'WaitDeal',
      'InProgress',
      'Finished',
      'Stopped',
      'Canceled',
      'Unknown',
    ]
    for (const value of known) {
      expect(AUCTION_STATUS_BADGE_VARIANTS[value]).toBeDefined()
    }
  })
})
