import type { AuctionListRequest } from '@shared/api'
import { describe, expect, it } from 'vitest'

import { buildAuctionListRequest } from './request-builder'
import type { AuctionsListFilters } from './search-params'
import { DEFAULT_AUCTIONS_LIST_FILTERS } from './search-params'

describe('buildAuctionListRequest', () => {
  it('returns an empty object for default filters', () => {
    expect(buildAuctionListRequest(DEFAULT_AUCTIONS_LIST_FILTERS)).toEqual({})
  })

  it('returns an empty object for an empty partial', () => {
    expect(buildAuctionListRequest({ ...DEFAULT_AUCTIONS_LIST_FILTERS })).toEqual({})
  })

  describe('page', () => {
    it('maps non-default page as a number', () => {
      const filters: AuctionsListFilters = { ...DEFAULT_AUCTIONS_LIST_FILTERS, page: 3 }
      expect(buildAuctionListRequest(filters)).toEqual({ page: 3 })
    })

    it('does not include page when at default', () => {
      const filters: AuctionsListFilters = { ...DEFAULT_AUCTIONS_LIST_FILTERS }
      expect(buildAuctionListRequest(filters)).not.toHaveProperty('page')
    })
  })

  describe('is_oldest', () => {
    it('maps non-default is_oldest as a boolean', () => {
      const filters: AuctionsListFilters = { ...DEFAULT_AUCTIONS_LIST_FILTERS, is_oldest: true }
      expect(buildAuctionListRequest(filters)).toEqual({ is_oldest: true })
    })

    it('does not include is_oldest when at default (false)', () => {
      const filters: AuctionsListFilters = { ...DEFAULT_AUCTIONS_LIST_FILTERS }
      expect(buildAuctionListRequest(filters)).not.toHaveProperty('is_oldest')
    })
  })

  describe('cargo_num', () => {
    it('maps non-empty cargo_num as a string', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        cargo_num: 'MSK-001',
      }
      expect(buildAuctionListRequest(filters)).toEqual({ cargo_num: 'MSK-001' })
    })

    it('does not include cargo_num when empty', () => {
      const filters: AuctionsListFilters = { ...DEFAULT_AUCTIONS_LIST_FILTERS, cargo_num: '' }
      expect(buildAuctionListRequest(filters)).not.toHaveProperty('cargo_num')
    })
  })

  describe('auc_type', () => {
    it('maps non-empty auc_type as an enum array', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        auc_type: ['Down', 'Up'],
      }
      expect(buildAuctionListRequest(filters)).toEqual({ auc_type: ['Down', 'Up'] })
    })

    it('filters out Unknown values absent from the API enum', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        auc_type: ['Down', 'Unknown'],
      }
      expect(buildAuctionListRequest(filters)).toEqual({ auc_type: ['Down'] })
    })

    it('drops the auc_type key entirely when only Unknown was selected', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        auc_type: ['Unknown'],
      }
      expect(buildAuctionListRequest(filters)).toEqual({})
    })

    it('does not include auc_type when empty', () => {
      const filters: AuctionsListFilters = { ...DEFAULT_AUCTIONS_LIST_FILTERS, auc_type: [] }
      expect(buildAuctionListRequest(filters)).not.toHaveProperty('auc_type')
    })
  })

  describe('status (trading status mobile)', () => {
    it('maps non-empty status as an enum array', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        status: ['Leading', 'Losing'],
      }
      const request = buildAuctionListRequest(filters) as Pick<AuctionListRequest, 'status'>
      expect(request.status).toEqual(['Leading', 'Losing'])
    })

    it('does not include status when empty', () => {
      const filters: AuctionsListFilters = { ...DEFAULT_AUCTIONS_LIST_FILTERS, status: [] }
      expect(buildAuctionListRequest(filters)).not.toHaveProperty('status')
    })
  })

  describe('statuses (numeric auction status)', () => {
    it('maps non-empty statuses as a number array', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        statuses: [1, 2, 7],
      }
      expect(buildAuctionListRequest(filters)).toEqual({ statuses: [1, 2, 7] })
    })

    it('does not include statuses when empty', () => {
      const filters: AuctionsListFilters = { ...DEFAULT_AUCTIONS_LIST_FILTERS, statuses: [] }
      expect(buildAuctionListRequest(filters)).not.toHaveProperty('statuses')
    })
  })

  describe('city filters', () => {
    it('maps load_city and unload_city as strings', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        load_city: 'Москва',
        unload_city: 'Казань',
      }
      expect(buildAuctionListRequest(filters)).toEqual({
        load_city: 'Москва',
        unload_city: 'Казань',
      })
    })

    it('does not include empty city fields', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        load_city: '',
        unload_city: '',
      }
      expect(buildAuctionListRequest(filters)).toEqual({})
    })
  })

  describe('price range', () => {
    it('maps current_price_from and current_price_to as numbers', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        current_price_from: 100,
        current_price_to: 500,
      }
      expect(buildAuctionListRequest(filters)).toEqual({
        current_price_from: 100,
        current_price_to: 500,
      })
    })

    it('drops both when undefined', () => {
      const filters: AuctionsListFilters = { ...DEFAULT_AUCTIONS_LIST_FILTERS }
      const request = buildAuctionListRequest(filters)
      expect(request).not.toHaveProperty('current_price_from')
      expect(request).not.toHaveProperty('current_price_to')
    })

    it('supports one-sided range (only from)', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        current_price_from: 100,
      }
      expect(buildAuctionListRequest(filters)).toEqual({ current_price_from: 100 })
    })
  })

  describe('date filters', () => {
    it('converts YYYY-MM-DD create_date_from to start-of-day datetime with offset', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        create_date_from: '2026-01-01',
      }
      const result = buildAuctionListRequest(filters)
      expect(result.create_date_from).toMatch(/^2026-01-01T00:00:00[+-]\d{2}:\d{2}$/)
    })

    it('converts YYYY-MM-DD create_date_to to end-of-day datetime with offset', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        create_date_to: '2026-01-31',
      }
      const result = buildAuctionListRequest(filters)
      expect(result.create_date_to).toMatch(/^2026-01-31T23:59:59[+-]\d{2}:\d{2}$/)
    })

    it('converts YYYY-MM-DD load_date_from to start-of-day datetime with offset', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        load_date_from: '2026-02-01',
      }
      const result = buildAuctionListRequest(filters)
      expect(result.load_date_from).toMatch(/^2026-02-01T00:00:00[+-]\d{2}:\d{2}$/)
    })

    it('converts YYYY-MM-DD load_date_to to end-of-day datetime with offset', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        load_date_to: '2026-02-28',
      }
      const result = buildAuctionListRequest(filters)
      expect(result.load_date_to).toMatch(/^2026-02-28T23:59:59[+-]\d{2}:\d{2}$/)
    })

    it('passes through already-expanded datetime strings unchanged', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        load_date_from: '2026-02-01T00:00:00+03:00',
      }
      const result = buildAuctionListRequest(filters)
      expect(result.load_date_from).toBe('2026-02-01T00:00:00+03:00')
    })

    it('drops undefined date fields', () => {
      const filters: AuctionsListFilters = { ...DEFAULT_AUCTIONS_LIST_FILTERS }
      const request = buildAuctionListRequest(filters)
      expect(request).not.toHaveProperty('create_date_from')
      expect(request).not.toHaveProperty('create_date_to')
      expect(request).not.toHaveProperty('load_date_from')
      expect(request).not.toHaveProperty('load_date_to')
    })
  })

  describe('boolean toggles', () => {
    it('maps is_available=true', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        is_available: true,
      }
      expect(buildAuctionListRequest(filters)).toEqual({ is_available: true })
    })

    it('maps is_available=false as a real boolean (not just truthy)', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        is_available: false,
      }
      expect(buildAuctionListRequest(filters)).toEqual({ is_available: false })
    })

    it('maps is_bidder=true', () => {
      const filters: AuctionsListFilters = {
        ...DEFAULT_AUCTIONS_LIST_FILTERS,
        is_bidder: true,
      }
      expect(buildAuctionListRequest(filters)).toEqual({ is_bidder: true })
    })

    it('drops both toggles when undefined', () => {
      const filters: AuctionsListFilters = { ...DEFAULT_AUCTIONS_LIST_FILTERS }
      const request = buildAuctionListRequest(filters)
      expect(request).not.toHaveProperty('is_available')
      expect(request).not.toHaveProperty('is_bidder')
    })
  })

  describe('leakage guards', () => {
    it('does not emit weight_* fields', () => {
      const filters: AuctionsListFilters = { ...DEFAULT_AUCTIONS_LIST_FILTERS, page: 2 }
      const request = buildAuctionListRequest(filters)
      expect(request).not.toHaveProperty('weight_from')
      expect(request).not.toHaveProperty('weight_to')
    })

    it('does not emit volume_* fields', () => {
      const filters: AuctionsListFilters = { ...DEFAULT_AUCTIONS_LIST_FILTERS, page: 2 }
      const request = buildAuctionListRequest(filters)
      expect(request).not.toHaveProperty('volume_from')
      expect(request).not.toHaveProperty('volume_to')
    })

    it('never emits admin-only fields', () => {
      const filters: AuctionsListFilters = { ...DEFAULT_AUCTIONS_LIST_FILTERS, page: 2 }
      const request = buildAuctionListRequest(filters)
      expect(request).not.toHaveProperty('customer')
      expect(request).not.toHaveProperty('customer_ids')
      expect(request).not.toHaveProperty('auction_ids')
      expect(request).not.toHaveProperty('per_page')
    })
  })

  describe('fully-populated integration', () => {
    it('builds a complete request from a fully-populated filter object', () => {
      const filters: AuctionsListFilters = {
        page: 2,
        is_oldest: true,
        cargo_num: 'MSK-001',
        auc_type: ['Down', 'Up'],
        status: ['Leading'],
        statuses: [1, 2],
        load_city: 'Москва',
        unload_city: 'Казань',
        current_price_from: 100,
        current_price_to: 500,
        create_date_from: '2026-01-01',
        create_date_to: '2026-01-31',
        load_date_from: '2026-02-01',
        load_date_to: '2026-02-28',
        is_available: true,
        is_bidder: false,
      }
      const result = buildAuctionListRequest(filters)
      expect(result).toMatchObject({
        page: 2,
        is_oldest: true,
        cargo_num: 'MSK-001',
        auc_type: ['Down', 'Up'],
        status: ['Leading'],
        statuses: [1, 2],
        load_city: 'Москва',
        unload_city: 'Казань',
        current_price_from: 100,
        current_price_to: 500,
        is_available: true,
        is_bidder: false,
      })
      expect(result.create_date_from).toMatch(/^2026-01-01T00:00:00[+-]\d{2}:\d{2}$/)
      expect(result.create_date_to).toMatch(/^2026-01-31T23:59:59[+-]\d{2}:\d{2}$/)
      expect(result.load_date_from).toMatch(/^2026-02-01T00:00:00[+-]\d{2}:\d{2}$/)
      expect(result.load_date_to).toMatch(/^2026-02-28T23:59:59[+-]\d{2}:\d{2}$/)
    })
  })
})
