import { describe, expect, it } from 'vitest'

import type { AuctionStatus, AuctionType, TradingStatus } from '@shared/api'

import {
  AUCTION_STATUS_CODES,
  AUCTION_STATUS_LABELS,
  AUCTION_TYPE_LABELS,
  TRADING_STATUS_LABELS,
  describeAuctionStatus,
  describeAuctionStatusCode,
  describeAuctionType,
  describeTradingStatus,
} from './describe'

describe('describeAuctionType', () => {
  it.each<[AuctionType, string]>([
    ['Request', 'Заявочный'],
    ['Up', 'На повышение'],
    ['Down', 'На понижение'],
    ['FixPrice', 'Фиксированная цена'],
    ['Unknown', 'Неизвестный тип'],
  ])('returns Russian label for %s', (value, expected) => {
    expect(describeAuctionType(value)).toBe(expected)
  })

  it('returns fallback for unexpected value', () => {
    expect(describeAuctionType('SomethingNew' as AuctionType)).toBe('—')
  })
})

describe('describeTradingStatus', () => {
  it.each<[TradingStatus, string]>([
    ['NotParticipating', 'Не участвует'],
    ['Leading', 'Лидирует'],
    ['Losing', 'Перебит'],
    ['Winner', 'Победитель'],
    ['Confirmed', 'Подтверждён'],
    ['Unknown', 'Неизвестный статус'],
  ])('returns Russian label for %s', (value, expected) => {
    expect(describeTradingStatus(value)).toBe(expected)
  })

  it('returns fallback for unexpected value', () => {
    expect(describeTradingStatus('SomethingNew' as TradingStatus)).toBe('—')
  })
})

describe('describeAuctionStatus', () => {
  it.each<[AuctionStatus, string]>([
    ['Planning', 'Планирование'],
    ['Auction', 'Идут торги'],
    ['DeterminateWinner', 'Определение победителя'],
    ['WaitDeal', 'Ожидание сделки'],
    ['InProgress', 'В работе'],
    ['Finished', 'Завершён'],
    ['Stopped', 'Остановлен'],
    ['Canceled', 'Отменён'],
    ['Unknown', 'Неизвестный статус'],
  ])('returns Russian label for %s', (value, expected) => {
    expect(describeAuctionStatus(value)).toBe(expected)
  })

  it('returns fallback for unexpected value', () => {
    expect(describeAuctionStatus('SomethingNew' as AuctionStatus)).toBe('—')
  })
})

describe('describeAuctionStatusCode', () => {
  it('maps 1..7 onto the AuctionStatus enum order declared in the OpenAPI spec', () => {
    expect(describeAuctionStatusCode(1)).toBe('Планирование')
    expect(describeAuctionStatusCode(2)).toBe('Идут торги')
    expect(describeAuctionStatusCode(3)).toBe('Определение победителя')
    expect(describeAuctionStatusCode(4)).toBe('Ожидание сделки')
    expect(describeAuctionStatusCode(5)).toBe('В работе')
    expect(describeAuctionStatusCode(6)).toBe('Завершён')
    expect(describeAuctionStatusCode(7)).toBe('Остановлен')
  })

  it.each<[number]>([[0], [8], [-1], [100], [1.5]])(
    'returns fallback for out-of-range code %s',
    (code) => {
      expect(describeAuctionStatusCode(code)).toBe('—')
    },
  )
})

describe('AUCTION_STATUS_CODES', () => {
  it('exposes exactly 7 codes — matches the URL filter range 1..7', () => {
    expect(AUCTION_STATUS_CODES).toHaveLength(7)
  })

  it('keeps enum order from the OpenAPI comments (Planning..Stopped)', () => {
    expect(AUCTION_STATUS_CODES[0]).toBe<AuctionStatus>('Planning')
    expect(AUCTION_STATUS_CODES[6]).toBe<AuctionStatus>('Stopped')
  })

  it('excludes Canceled/Unknown — they are not URL-filterable', () => {
    expect(AUCTION_STATUS_CODES).not.toContain('Canceled')
    expect(AUCTION_STATUS_CODES).not.toContain('Unknown')
  })
})

describe('label sets stay disjoint across enums', () => {
  // The same Russian string must not be the label of two different enums —
  // otherwise the UI could silently render a value from one enum as if it
  // belonged to another.
  it('AuctionType and AuctionStatus share no labels', () => {
    const typeLabels = new Set(Object.values(AUCTION_TYPE_LABELS))
    const statusLabels = new Set(Object.values(AUCTION_STATUS_LABELS))
    for (const label of typeLabels) {
      expect(statusLabels.has(label)).toBe(false)
    }
  })

  it('AuctionType and TradingStatus share no labels', () => {
    const typeLabels = new Set(Object.values(AUCTION_TYPE_LABELS))
    const tradingLabels = new Set(Object.values(TRADING_STATUS_LABELS))
    for (const label of typeLabels) {
      expect(tradingLabels.has(label)).toBe(false)
    }
  })
})
