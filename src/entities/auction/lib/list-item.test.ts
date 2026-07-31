import type { AuctionListItem } from '@shared/api'
import { describe, expect, it } from 'vitest'

import { toAuctionListItemVM } from './list-item'

// `auction_uuid` is injected by the mock layer; the production DTO type
// doesn't carry it. Tests construct it directly, so we widen the main type
// here to avoid pretending the field exists on the production shape.
type TestMain = NonNullable<AuctionListItem['main']> & { auction_uuid?: string }
type TestItem = Omit<AuctionListItem, 'main'> & { main?: TestMain }

function makeItem(overrides: Partial<TestItem> & { auctionUuid?: string } = {}): AuctionListItem {
  const { auctionUuid, main: mainOverride, ...rest } = overrides
  const base: TestItem = {
    main: {
      id: 1,
      cargo_num: 'MSK-001',
      cargo_date: '2026-08-12T09:00:00+03:00',
      auc_type: 'Down',
      order_uid: 'order-1',
      auction_uuid: auctionUuid ?? '00000000-0000-4000-8000-000000000001',
      created_at: '2026-07-20T10:15:00+03:00',
      price_per_km: 28.5,
      ...mainOverride,
    },
    route: {
      load: {
        city: 'Москва',
        address: 'ул. Складочная, 1',
        date: '2026-08-12T09:00:00+03:00',
      },
      unload: {
        city: 'Казань',
        address: 'ул. Товарная, 14',
        date: '2026-08-13T18:00:00+03:00',
      },
    },
    cargo: {
      name: 'Бытовая техника',
      weight: 12,
      volume: 38,
      body_type: 'тентованный',
    },
    trading: {
      status: 'Auction',
      status_mobile: 'Leading',
      can_set_bet: true,
      direction: 'Москва → Казань',
      price: { start: 50000, current: 45000, current_no_vat: 37500 },
      your: { bet: true, last_bet: 45000 },
    },
  }
  return { ...base, ...rest } as unknown as AuctionListItem
}

describe('toAuctionListItemVM', () => {
  it('returns null when auction_uuid is missing', () => {
    // The mock layer injects `auction_uuid`; if it ever disappears the card
    // cannot route, so the VM refuses to render. The list filters nulls.
    const item = makeItem()
    delete (item.main as { auction_uuid?: string }).auction_uuid
    expect(toAuctionListItemVM(item)).toBeNull()
  })

  it('maps every required card field', () => {
    const vm = toAuctionListItemVM(makeItem())
    expect(vm).toMatchObject({
      auctionUuid: '00000000-0000-4000-8000-000000000001',
      cargoNum: 'MSK-001',
      orderUid: 'order-1',
      aucType: 'Down',
      aucTypeLabel: 'На понижение',
      pricePerKm: 28.5,
      loadCity: 'Москва',
      unloadCity: 'Казань',
      cargoName: 'Бытовая техника',
      cargoWeight: 12,
      cargoVolume: 38,
      cargoBodyType: 'тентованный',
      auctionStatus: 'Auction',
      auctionStatusLabel: 'Идут торги',
      tradingStatusLabel: 'Лидирует',
      canSetBet: true,
      hasUserBet: true,
      userLastBet: 45000,
      currentPrice: 45000,
      currentPriceNoVat: 37500,
      startPrice: 50000,
    })
  })

  it('preferves load/unload ISO date strings verbatim', () => {
    const vm = toAuctionListItemVM(makeItem())
    expect(vm?.loadDate).toBe('2026-08-12T09:00:00+03:00')
    expect(vm?.unloadDate).toBe('2026-08-13T18:00:00+03:00')
  })

  it('keeps trading.direction when present, otherwise derives from cities', () => {
    expect(toAuctionListItemVM(makeItem())?.direction).toBe('Москва → Казань')

    const noDirection = makeItem({
      trading: {
        status: 'Auction',
        can_set_bet: true,
        direction: '  ',
        price: { current: 100 },
      },
    })
    expect(noDirection.trading?.direction).toBe('  ')
    expect(toAuctionListItemVM(noDirection)?.direction).toBe('Москва → Казань')
  })

  it('returns empty direction when both trading.direction and cities are missing', () => {
    const vm = toAuctionListItemVM(
      makeItem({
        route: {},
        trading: { status: 'Auction', can_set_bet: false },
      }),
    )
    expect(vm?.direction).toBe('')
  })

  it('falls back to "—" labels when enum value is missing', () => {
    const vm = toAuctionListItemVM(
      makeItem({
        main: { auction_uuid: 'x', cargo_num: 'X', auc_type: undefined },
        trading: { status: undefined, status_mobile: undefined, can_set_bet: false },
      }),
    )
    expect(vm?.aucType).toBeUndefined()
    expect(vm?.aucTypeLabel).toBe('—')
    expect(vm?.auctionStatus).toBeUndefined()
    expect(vm?.auctionStatusLabel).toBe('—')
    expect(vm?.tradingStatusLabel).toBe('—')
  })

  it('nullifies price fields when trading.price is null', () => {
    const vm = toAuctionListItemVM(
      makeItem({
        trading: {
          status: 'Auction',
          can_set_bet: false,
          price: null,
          your: null,
        },
      }),
    )
    expect(vm?.currentPrice).toBeNull()
    expect(vm?.currentPriceNoVat).toBeNull()
    expect(vm?.startPrice).toBeNull()
    expect(vm?.hasUserBet).toBe(false)
    expect(vm?.userLastBet).toBeNull()
  })

  it('reports hasUserBet=false and canSetBet=false from undefined trading', () => {
    const vm = toAuctionListItemVM(makeItem({ trading: undefined }))
    expect(vm?.canSetBet).toBe(false)
    expect(vm?.hasUserBet).toBe(false)
  })
})
