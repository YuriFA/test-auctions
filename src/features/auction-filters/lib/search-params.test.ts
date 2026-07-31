import { describe, expect, it } from 'vitest'

import type { AuctionsListFilters } from './search-params'
import {
  DEFAULT_AUCTIONS_LIST_FILTERS,
  countActiveFilters,
  isDefaultFilters,
  parseAuctionsListSearchParams,
  serializeAuctionsListSearchParams,
} from './search-params'

describe('parseAuctionsListSearchParams', () => {
  it('returns defaults for empty input', () => {
    expect(parseAuctionsListSearchParams(new URLSearchParams())).toEqual(
      DEFAULT_AUCTIONS_LIST_FILTERS,
    )
  })

  it('returns defaults for undefined input', () => {
    expect(parseAuctionsListSearchParams(undefined)).toEqual(DEFAULT_AUCTIONS_LIST_FILTERS)
  })

  it('coerces page to a positive integer', () => {
    expect(parseAuctionsListSearchParams(new URLSearchParams('page=3')).page).toBe(3)
  })

  it('falls back to default page when value is not a positive integer', () => {
    expect(parseAuctionsListSearchParams(new URLSearchParams('page=0')).page).toBe(
      DEFAULT_AUCTIONS_LIST_FILTERS.page,
    )
    expect(parseAuctionsListSearchParams(new URLSearchParams('page=-5')).page).toBe(
      DEFAULT_AUCTIONS_LIST_FILTERS.page,
    )
    expect(parseAuctionsListSearchParams(new URLSearchParams('page=abc')).page).toBe(
      DEFAULT_AUCTIONS_LIST_FILTERS.page,
    )
  })

  it('parses is_oldest=true as ascending sort', () => {
    expect(parseAuctionsListSearchParams(new URLSearchParams('is_oldest=true')).is_oldest).toBe(
      true,
    )
  })

  it('parses is_oldest=false as descending sort', () => {
    expect(parseAuctionsListSearchParams(new URLSearchParams('is_oldest=false')).is_oldest).toBe(
      false,
    )
  })

  it('falls back to default is_oldest for unknown value', () => {
    expect(parseAuctionsListSearchParams(new URLSearchParams('is_oldest=yes')).is_oldest).toBe(
      DEFAULT_AUCTIONS_LIST_FILTERS.is_oldest,
    )
  })

  it('parses cargo_num string', () => {
    expect(parseAuctionsListSearchParams(new URLSearchParams('cargo_num=MSK-001')).cargo_num).toBe(
      'MSK-001',
    )
  })

  it('parses repeated auc_type keys as an array', () => {
    expect(
      parseAuctionsListSearchParams(new URLSearchParams('auc_type=Down&auc_type=Up')).auc_type,
    ).toEqual(['Down', 'Up'])
  })

  it('drops unknown auc_type enum values', () => {
    expect(
      parseAuctionsListSearchParams(new URLSearchParams('auc_type=Down&auc_type=Garbage')).auc_type,
    ).toEqual(['Down'])
  })

  it('parses repeated status keys as an array', () => {
    expect(
      parseAuctionsListSearchParams(new URLSearchParams('status=Leading&status=Losing')).status,
    ).toEqual(['Leading', 'Losing'])
  })

  it('drops unknown status enum values', () => {
    expect(
      parseAuctionsListSearchParams(new URLSearchParams('status=Leading&status=NotARealStatus'))
        .status,
    ).toEqual(['Leading'])
  })

  it('parses numeric statuses as an array of integers', () => {
    expect(
      parseAuctionsListSearchParams(new URLSearchParams('statuses=1&statuses=2&statuses=3'))
        .statuses,
    ).toEqual([1, 2, 3])
  })

  it('drops numeric statuses outside 1..7 range', () => {
    expect(
      parseAuctionsListSearchParams(new URLSearchParams('statuses=1&statuses=8&statuses=0'))
        .statuses,
    ).toEqual([1])
  })

  it('parses load_city and unload_city strings', () => {
    const result = parseAuctionsListSearchParams(
      new URLSearchParams('load_city=Москва&unload_city=Казань'),
    )
    expect(result.load_city).toBe('Москва')
    expect(result.unload_city).toBe('Казань')
  })

  it('parses boolean is_available=true', () => {
    expect(
      parseAuctionsListSearchParams(new URLSearchParams('is_available=true')).is_available,
    ).toBe(true)
  })

  it('parses boolean is_available=false', () => {
    expect(
      parseAuctionsListSearchParams(new URLSearchParams('is_available=false')).is_available,
    ).toBe(false)
  })

  it('omits is_available when not present', () => {
    expect(parseAuctionsListSearchParams(new URLSearchParams()).is_available).toBeUndefined()
  })

  it('falls back to undefined is_available for garbage value', () => {
    expect(
      parseAuctionsListSearchParams(new URLSearchParams('is_available=yes')).is_available,
    ).toBeUndefined()
  })

  it('parses numeric current_price_from / current_price_to', () => {
    const result = parseAuctionsListSearchParams(
      new URLSearchParams('current_price_from=1000&current_price_to=5000'),
    )
    expect(result.current_price_from).toBe(1000)
    expect(result.current_price_to).toBe(5000)
  })

  it('falls back to undefined current_price_* on garbage', () => {
    expect(
      parseAuctionsListSearchParams(new URLSearchParams('current_price_from=abc'))
        .current_price_from,
    ).toBeUndefined()
  })

  it('passes through create_date_* as ISO strings', () => {
    expect(
      parseAuctionsListSearchParams(new URLSearchParams('create_date_from=2026-01-01T00:00:00Z'))
        .create_date_from,
    ).toBe('2026-01-01T00:00:00Z')
  })

  it('passes through load_date_* as ISO strings', () => {
    expect(
      parseAuctionsListSearchParams(new URLSearchParams('load_date_from=2026-06-01T08:00:00Z'))
        .load_date_from,
    ).toBe('2026-06-01T08:00:00Z')
  })

  it('ignores unknown query keys', () => {
    expect(parseAuctionsListSearchParams(new URLSearchParams('unknown_key=foo'))).toEqual(
      DEFAULT_AUCTIONS_LIST_FILTERS,
    )
  })
})

describe('serializeAuctionsListSearchParams', () => {
  it('produces empty URLSearchParams for default filters', () => {
    expect(serializeAuctionsListSearchParams(DEFAULT_AUCTIONS_LIST_FILTERS).toString()).toBe('')
  })

  it('omits page when equal to default', () => {
    expect(
      serializeAuctionsListSearchParams({
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        page: DEFAULT_AUCTIONS_LIST_FILTERS.page,
      }).has('page'),
    ).toBe(false)
  })

  it('omits is_oldest when equal to default', () => {
    expect(serializeAuctionsListSearchParams(DEFAULT_AUCTIONS_LIST_FILTERS).has('is_oldest')).toBe(
      false,
    )
  })

  it('serializes page when not equal to default', () => {
    expect(
      serializeAuctionsListSearchParams({ ...DEFAULT_AUCTIONS_LIST_FILTERS, page: 3 }).get('page'),
    ).toBe('3')
  })

  it('serializes is_oldest=true when true', () => {
    expect(
      serializeAuctionsListSearchParams({
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        is_oldest: true,
      }).get('is_oldest'),
    ).toBe('true')
  })

  it('serializes cargo_num when non-empty', () => {
    expect(
      serializeAuctionsListSearchParams({
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        cargo_num: 'MSK-001',
      }).get('cargo_num'),
    ).toBe('MSK-001')
  })

  it('omits cargo_num when empty', () => {
    expect(
      serializeAuctionsListSearchParams({
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        cargo_num: '',
      }).has('cargo_num'),
    ).toBe(false)
  })

  it('serializes arrays as repeated keys, not as CSV', () => {
    expect(
      serializeAuctionsListSearchParams({
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        auc_type: ['Down', 'Up'],
      }).getAll('auc_type'),
    ).toEqual(['Down', 'Up'])
  })

  it('omits empty arrays', () => {
    expect(
      serializeAuctionsListSearchParams({
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        auc_type: [],
      }).has('auc_type'),
    ).toBe(false)
  })

  it('serializes boolean is_available as "true" / "false"', () => {
    expect(
      serializeAuctionsListSearchParams({
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        is_available: true,
      }).get('is_available'),
    ).toBe('true')
    expect(
      serializeAuctionsListSearchParams({
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        is_available: false,
      }).get('is_available'),
    ).toBe('false')
  })

  it('omits is_available when undefined', () => {
    expect(
      serializeAuctionsListSearchParams(DEFAULT_AUCTIONS_LIST_FILTERS).has('is_available'),
    ).toBe(false)
  })

  it('serializes numbers canonically', () => {
    expect(
      serializeAuctionsListSearchParams({
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        current_price_from: 1000,
      }).get('current_price_from'),
    ).toBe('1000')
  })
})

describe('round-trip parse ∘ serialize', () => {
  it('preserves default filters', () => {
    const serialized = serializeAuctionsListSearchParams(DEFAULT_AUCTIONS_LIST_FILTERS)
    expect(parseAuctionsListSearchParams(serialized)).toEqual(DEFAULT_AUCTIONS_LIST_FILTERS)
  })

  it('preserves a fully-populated filter object', () => {
    const value: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      page: 4,
      is_oldest: true,
      cargo_num: 'MSK-001',
      auc_type: ['Down', 'Up'],
      status: ['Leading', 'Losing'],
      statuses: [1, 2, 3],
      load_city: 'Москва',
      unload_city: 'Казань',
      is_available: true,
      is_bidder: false,
      current_price_from: 1000,
      current_price_to: 5000,
      create_date_from: '2026-01-01T00:00:00Z',
      create_date_to: '2026-12-31T23:59:59Z',
      load_date_from: '2026-06-01T08:00:00Z',
    }
    const serialized = serializeAuctionsListSearchParams(value)
    expect(parseAuctionsListSearchParams(serialized)).toEqual(value)
  })

  it('round-trip preserves the falsy `is_available: false`', () => {
    const value = { ...DEFAULT_AUCTIONS_LIST_FILTERS, is_available: false }
    const serialized = serializeAuctionsListSearchParams(value)
    expect(parseAuctionsListSearchParams(serialized).is_available).toBe(false)
  })
})

describe('isDefaultFilters', () => {
  it('returns true for the canonical defaults object', () => {
    expect(isDefaultFilters(DEFAULT_AUCTIONS_LIST_FILTERS)).toBe(true)
  })

  it('returns false when page differs', () => {
    expect(isDefaultFilters({ ...DEFAULT_AUCTIONS_LIST_FILTERS, page: 2 })).toBe(false)
  })

  it('returns false when any array is non-empty', () => {
    expect(isDefaultFilters({ ...DEFAULT_AUCTIONS_LIST_FILTERS, auc_type: ['Down'] })).toBe(false)
  })

  it('returns false when is_available is set (even to false)', () => {
    expect(isDefaultFilters({ ...DEFAULT_AUCTIONS_LIST_FILTERS, is_available: false })).toBe(false)
  })
})

describe('countActiveFilters', () => {
  it('returns 0 for the canonical defaults object', () => {
    expect(countActiveFilters(DEFAULT_AUCTIONS_LIST_FILTERS)).toBe(0)
  })

  it('counts page as one active filter when not default', () => {
    expect(countActiveFilters({ ...DEFAULT_AUCTIONS_LIST_FILTERS, page: 2 })).toBe(1)
  })

  it('counts each non-default scalar as one, not per array item', () => {
    const value: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      auc_type: ['Down', 'Up'],
      status: ['Leading'],
      cargo_num: 'MSK-001',
    }
    expect(countActiveFilters(value)).toBe(3)
  })

  it('counts is_available as active when set to true OR false', () => {
    expect(countActiveFilters({ ...DEFAULT_AUCTIONS_LIST_FILTERS, is_available: true })).toBe(1)
    expect(countActiveFilters({ ...DEFAULT_AUCTIONS_LIST_FILTERS, is_available: false })).toBe(1)
  })
})
