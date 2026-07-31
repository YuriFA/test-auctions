import type { AuctionDetail } from '@shared/api'
import { describe, expect, it } from 'vitest'

import { toAuctionDetailVM } from './detail'

function makeDetail(overrides: Partial<AuctionDetail> = {}): AuctionDetail {
  const base: AuctionDetail = {
    main: {
      id: 1,
      cargo_num: 'MSK-001',
      cargo_date: '2026-08-12T09:00:00+03:00',
      order_uid: 'order-1',
      auc_type: 'Down',
      created_at: '2026-07-20T10:15:00+03:00',
    },
    organizer: {
      organization_name: 'ООО "Рога и Копыта"',
      organization_inn: '7701234567',
      organization_kpp: '770101001',
    },
    contacts: [
      { name: 'Иван Иванов', phone: '+7 999 123-45-67', email: 'ivan@example.com', uid: 'u-1' },
    ],
    cargo: {
      body_type: 'тентованный',
      distance: 820,
      truck_count: 1,
      temp_from: -10,
      temp_to: 5,
      car: { type: 'тент', weight: 20, volume: 82, length: 13.6, width: 2.45, height: 2.7 },
    },
    trading: {
      status: 'Auction',
      status_mobile: 'Leading',
      start_time: '2026-07-25T10:00:00+03:00',
      stop_time: '2026-08-10T18:00:00+03:00',
      bid_measurement_type: 'PerRoute',
      can_set_bet: true,
      hide_bets_history: false,
      no_view_cargo_price: false,
      hide_points_address_and_contacts: false,
      price: {
        start: 50000,
        current: 45000,
        current_no_vat: 37500,
        available: 44500,
        available_no_vat: 37083,
        min: 40000,
        max: null,
        step: 500,
        price_per_km: 54.88,
      },
      your: { bet: true, last_bet: 45000, last_bet_with_vat: 45000, win: false },
    },
    payment: {
      condition: 'Безналичный расчёт',
      form: 'Безналичный',
      delay: 30,
      delay_type: 'CalendarDays',
      currency_code: '643',
      prepay: '0%',
    },
    assembly: { num: 'A-100', date: '2026-08-12T08:00:00+03:00' },
    routes: [
      {
        op_type: 'Loading',
        start_date: '2026-08-12T09:00:00+03:00',
        end_date: '2026-08-12T12:00:00+03:00',
        contractor: 'Склад №1',
        contractor_inn: '7700000001',
        location: { city_name: 'Москва', loading_address: 'ул. Складочная, 1' },
        cargo: { name: 'Бытовая техника', weight: '12.000', volume: '38.000' },
        contact: { name: 'Приёмщик', phone: '+7 495 100-20-30' },
      },
      {
        op_type: 'Unloading',
        start_date: '2026-08-13T10:00:00+03:00',
        end_date: '2026-08-13T15:00:00+03:00',
        contractor: 'ТЦ Казань',
        contractor_inn: '1600000002',
        location: { city_name: 'Казань', loading_address: 'ул. Товарная, 14' },
        cargo: { name: 'Бытовая техника', weight: '12.000', volume: '38.000' },
      },
    ],
    admitted_organizations: [],
  }
  return { ...base, ...overrides }
}

describe('toAuctionDetailVM', () => {
  it('maps every required section with happy-path data', () => {
    const vm = toAuctionDetailVM(makeDetail())
    expect(vm).toMatchObject({
      cargoNum: 'MSK-001',
      orderUid: 'order-1',
      aucType: 'Down',
      aucTypeLabel: 'На понижение',
      organizerName: 'ООО "Рога и Копыта"',
      organizerInn: '7701234567',
      auctionStatus: 'Auction',
      auctionStatusLabel: 'Идут торги',
      tradingStatusLabel: 'Лидирует',
      bidMeasurementTypeLabel: 'За маршрут',
      priceCurrent: 45000,
      priceAvailable: 44500,
      priceMin: 40000,
      priceStep: 500,
      hasUserBet: true,
      userLastBet: 45000,
      paymentCondition: 'Безналичный расчёт',
      paymentDelayTypeLabel: 'календарных дней',
      assemblyNum: 'A-100',
    })
    expect(vm.routes).toHaveLength(2)
    expect(vm.routes[0]).toMatchObject({
      opType: 'Loading',
      opTypeLabel: 'Погрузка',
      cityName: 'Москва',
      loadingAddress: 'ул. Складочная, 1',
      cargo: { name: 'Бытовая техника', weight: '12.000' },
    })
  })

  it('nullifies absent price fields without throwing', () => {
    const vm = toAuctionDetailVM(
      makeDetail({
        trading: {
          status: 'Auction',
          can_set_bet: false,
          price: { current: 100 },
        },
      }),
    )
    expect(vm.priceStart).toBeNull()
    expect(vm.priceAvailable).toBeNull()
    expect(vm.priceMin).toBeNull()
    expect(vm.priceMax).toBeNull()
    expect(vm.priceStep).toBeNull()
    expect(vm.priceCurrent).toBe(100)
  })

  it('reports hasUserBet=false and zeroed user fields when trading.your is undefined', () => {
    const vm = toAuctionDetailVM(
      makeDetail({
        trading: { status: 'Auction', can_set_bet: true },
      }),
    )
    expect(vm.hasUserBet).toBe(false)
    expect(vm.userLastBet).toBeNull()
    expect(vm.userWin).toBe(false)
  })

  it('reads restriction flags verbatim off trading', () => {
    const vm = toAuctionDetailVM(
      makeDetail({
        trading: {
          status: 'Auction',
          can_set_bet: false,
          hide_bets_history: true,
          no_view_cargo_price: true,
          hide_points_address_and_contacts: true,
        },
      }),
    )
    expect(vm.canSetBet).toBe(false)
    expect(vm.hideBetsHistory).toBe(true)
    expect(vm.noViewCargoPrice).toBe(true)
    expect(vm.hidePointsAddressAndContacts).toBe(true)
  })

  it('defaults all restriction flags to false when trading is undefined', () => {
    const vm = toAuctionDetailVM(makeDetail({ trading: undefined } as unknown as AuctionDetail))
    expect(vm.canSetBet).toBe(false)
    expect(vm.hideBetsHistory).toBe(false)
    expect(vm.noViewCargoPrice).toBe(false)
    expect(vm.hidePointsAddressAndContacts).toBe(false)
    expect(vm.auctionStatusLabel).toBe('—')
    expect(vm.tradingStatusLabel).toBe('—')
  })

  it('drops contacts that have no name/phone/email', () => {
    const vm = toAuctionDetailVM(
      makeDetail({
        contacts: [
          { name: 'Иван', phone: '+7' },
          { name: null, phone: null, email: null },
          { email: 'x@y.z' },
        ],
      }),
    )
    expect(vm.contacts).toHaveLength(2)
    expect(vm.contacts[0].name).toBe('Иван')
    expect(vm.contacts[1].email).toBe('x@y.z')
  })

  it('handles empty routes array and missing route fields', () => {
    const vm = toAuctionDetailVM(makeDetail({ routes: [] }))
    expect(vm.routes).toEqual([])
  })

  it('falls back to city_full_name when city_name is missing', () => {
    const vm = toAuctionDetailVM(
      makeDetail({
        routes: [
          {
            op_type: 'Loading',
            location: { city_full_name: 'г. Москва, ЦАО' },
          },
        ],
      }),
    )
    expect(vm.routes[0].cityName).toBe('г. Москва, ЦАО')
  })

  it('renders "—" labels for unknown enum values', () => {
    const vm = toAuctionDetailVM(
      makeDetail({
        main: { auc_type: 'Unknown' },
        trading: {
          status: 'Unknown',
          status_mobile: 'Unknown',
          bid_measurement_type: 'Unknown',
          can_set_bet: false,
        },
        payment: { delay_type: 'Unknown' },
      }),
    )
    expect(vm.aucTypeLabel).toBe('Неизвестный тип')
    expect(vm.auctionStatusLabel).toBe('Неизвестный статус')
    expect(vm.tradingStatusLabel).toBe('Неизвестный статус')
    expect(vm.bidMeasurementTypeLabel).toBe('—')
    expect(vm.paymentDelayTypeLabel).toBe('—')
  })

  it('survives fully empty DTO (only top-level keys present)', () => {
    const vm = toAuctionDetailVM({
      main: {},
      organizer: {},
      contacts: [],
      cargo: {},
      trading: {},
      payment: {},
      assembly: {},
      routes: [],
      admitted_organizations: [],
    } as unknown as AuctionDetail)
    expect(vm.cargoNum).toBe('')
    expect(vm.organizerName).toBe('')
    expect(vm.contacts).toEqual([])
    expect(vm.routes).toEqual([])
    expect(vm.carRequirements).toBeNull()
    expect(vm.hasUserBet).toBe(false)
  })
})
