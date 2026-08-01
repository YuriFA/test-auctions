import { describe, expect, it } from 'vitest'

import { getActiveFilterChips, removeFilterValue } from './filter-chips'
import type { AuctionsListFilters } from './search-params'
import { DEFAULT_AUCTIONS_LIST_FILTERS } from './search-params'

describe('getActiveFilterChips', () => {
  it('returns an empty array for default filters', () => {
    expect(getActiveFilterChips(DEFAULT_AUCTIONS_LIST_FILTERS)).toEqual([])
  })

  it('excludes page and cargo_num — they have their own controls', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      page: 5,
      cargo_num: 'MSK-001',
    }
    expect(getActiveFilterChips(filters)).toEqual([])
  })

  it('emits one chip per value for array fields', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      auc_type: ['Down', 'Up'],
    }
    const chips = getActiveFilterChips(filters)
    expect(chips).toHaveLength(2)
    expect(chips[0]).toMatchObject({ id: 'auc_type-Down', key: 'auc_type', value: 'Down' })
    expect(chips[1]).toMatchObject({ id: 'auc_type-Up', key: 'auc_type', value: 'Up' })
    expect(chips.map((c) => c.label)).toEqual(
      expect.arrayContaining(['Тип: На понижение', 'Тип: На повышение']),
    )
  })

  it('emits one chip for a scalar string field with prefix', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      load_city: 'Москва',
    }
    const chips = getActiveFilterChips(filters)
    expect(chips).toEqual([
      { id: 'load_city', key: 'load_city', value: 'Москва', label: 'Погрузка: Москва' },
    ])
  })

  it('renders labels for full contract trading statuses', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      status: ['ChoosingWinner', 'Accepted'],
    }
    const labels = getActiveFilterChips(filters).map((chip) => chip.label)
    expect(labels).toEqual(['Мой статус: Выбор победителя', 'Мой статус: Принят'])
  })

  it('formats price with ru-RU thousands separator and currency', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      current_price_from: 1500,
    }
    const label = getActiveFilterChips(filters)[0].label
    // ru-RU uses non-breaking space ( ) as thousands separator
    expect(label).toBe(`Цена от: ${(1500).toLocaleString('ru-RU')} ₽`)
    expect(label).toContain('1')
    expect(label).toContain('500')
    expect(label).toContain('₽')
  })

  it('emits chip for is_oldest=true with sort label', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      is_oldest: true,
    }
    expect(getActiveFilterChips(filters)).toEqual([
      { id: 'is_oldest', key: 'is_oldest', value: true, label: 'Сначала старые' },
    ])
  })

  it('emits chip with bare label for is_available=true', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      is_available: true,
    }
    expect(getActiveFilterChips(filters)).toEqual([
      { id: 'is_available', key: 'is_available', value: true, label: 'Только доступные' },
    ])
  })

  it('emits chip with ": нет" suffix for is_available=false', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      is_available: false,
    }
    expect(getActiveFilterChips(filters)[0].label).toBe('Только доступные: нет')
  })

  it('produces chips for every active field in a fully-populated filter object', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      is_oldest: true,
      auc_type: ['Down', 'Up'],
      status: ['ChoosingWinner'],
      statuses: [1, 2],
      load_city: 'Москва',
      unload_city: 'Казань',
      current_price_from: 1000,
      current_price_to: 5000,
      create_date_from: '2026-01-01',
      load_date_from: '2026-02-01',
      is_available: true,
      is_bidder: true,
    }
    const chips = getActiveFilterChips(filters)
    // 2 (auc_type) + 1 (status) + 2 (statuses) + 9 scalars (is_oldest, 2 cities,
    // 2 prices, 2 dates, 2 booleans) = 14
    expect(chips).toHaveLength(14)
    expect(new Set(chips.map((c) => c.id)).size).toBe(chips.length)
  })
})

describe('removeFilterValue', () => {
  it('removes a single value from an array field', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      auc_type: ['Down', 'Up', 'FixPrice'],
    }
    expect(removeFilterValue(filters, 'auc_type', 'Up').auc_type).toEqual(['Down', 'FixPrice'])
  })

  it('does not mutate the original filters object', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      auc_type: ['Down', 'Up'],
    }
    removeFilterValue(filters, 'auc_type', 'Down')
    expect(filters.auc_type).toEqual(['Down', 'Up'])
  })

  it('clears a string scalar to empty string', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      load_city: 'Москва',
    }
    expect(removeFilterValue(filters, 'load_city').load_city).toBe('')
  })

  it('clears an optional number to undefined', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      current_price_from: 1500,
    }
    expect(removeFilterValue(filters, 'current_price_from').current_price_from).toBeUndefined()
  })

  it('clears an optional boolean to undefined (not false)', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      is_available: true,
    }
    expect(removeFilterValue(filters, 'is_available').is_available).toBeUndefined()
  })

  it('clears an optional date string to undefined', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      create_date_from: '2026-01-01',
    }
    expect(removeFilterValue(filters, 'create_date_from').create_date_from).toBeUndefined()
  })

  it('resets is_oldest to its default', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      is_oldest: true,
    }
    expect(removeFilterValue(filters, 'is_oldest').is_oldest).toBe(false)
  })

  it('preserves other fields when removing one', () => {
    const filters: AuctionsListFilters = {
      ...DEFAULT_AUCTIONS_LIST_FILTERS,
      auc_type: ['Down', 'Up'],
      load_city: 'Москва',
      is_available: true,
    }
    const next = removeFilterValue(filters, 'auc_type', 'Down')
    expect(next.load_city).toBe('Москва')
    expect(next.is_available).toBe(true)
    expect(next.auc_type).toEqual(['Up'])
  })
})
