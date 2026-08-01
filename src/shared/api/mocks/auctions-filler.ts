import type { MockAuctionListItem, SeedAuction } from './auctions'
import { seedAuctionUuids, seedAuctions } from './auctions'

// NOTE: dev-only filler dataset that multiplies the curated seeds so the list
// UI has enough volume to exercise pagination, sort, and filter combinations.
// Edge-case coverage stays in `seedAuctions` — fillers only vary observable
// fields (route, cargo, status, price, dates) so visual diversity is plausible
// without re-asserting every DTO branch. Identity fields (uuid / order_uid)
// are kept unique and stable so routing and mutations behave like seeds.

const FILLER_UUID_PREFIX = '00000000-0000-4000-8000'
// Fillers start at index 100 to stay clear of the 1..10 seed suffixes; the
// suffix is rendered as a 12-digit zero-padded string to match uuid v4 layout.
const FILLER_INDEX_OFFSET = 100

interface CityPair {
  load: string
  loadGc: number
  unload: string
  unloadGc: number
  tz: string
  distance: number
}

const CITY_PAIRS: CityPair[] = [
  { load: 'Москва', loadGc: 1, unload: 'Казань', unloadGc: 5, tz: '+03:00', distance: 820 },
  { load: 'Санкт-Петербург', loadGc: 2, unload: 'Москва', unloadGc: 1, tz: '+03:00', distance: 710 },
  { load: 'Екатеринбург', loadGc: 3, unload: 'Уфа', unloadGc: 9, tz: '+05:00', distance: 460 },
  { load: 'Новосибирск', loadGc: 4, unload: 'Краснодар', unloadGc: 10, tz: '+07:00', distance: 3650 },
  { load: 'Нижний Новгород', loadGc: 6, unload: 'Самара', unloadGc: 7, tz: '+03:00', distance: 410 },
  { load: 'Ростов-на-Дону', loadGc: 8, unload: 'Москва', unloadGc: 1, tz: '+03:00', distance: 1080 },
  { load: 'Уфа', loadGc: 9, unload: 'Екатеринбург', unloadGc: 3, tz: '+05:00', distance: 460 },
  { load: 'Казань', loadGc: 5, unload: 'Нижний Новгород', unloadGc: 6, tz: '+03:00', distance: 410 },
  { load: 'Самара', loadGc: 7, unload: 'Санкт-Петербург', unloadGc: 2, tz: '+04:00', distance: 1700 },
  { load: 'Краснодар', loadGc: 10, unload: 'Ростов-на-Дону', unloadGc: 8, tz: '+03:00', distance: 270 },
]

interface CargoPreset {
  name: string
  bodyType: string
  carType: string
  weight: number
  volume: number
}

const CARGO_PRESETS: CargoPreset[] = [
  { name: 'Бытовая техника', bodyType: 'тентованный', carType: 'тент', weight: 12, volume: 38 },
  { name: 'Строительные материалы', bodyType: 'тентованный', carType: 'тент', weight: 20, volume: 60 },
  { name: 'Металлопрокат', bodyType: 'открытый', carType: 'бортовая', weight: 20, volume: 35 },
  { name: 'Продовольственные товары', bodyType: 'рефрижератор', carType: 'реф', weight: 18, volume: 70 },
  { name: 'Промышленное оборудование', bodyType: 'тентованный', carType: 'тент', weight: 16, volume: 40 },
  { name: 'Электроника', bodyType: 'тентованный', carType: 'тент', weight: 6, volume: 25 },
  { name: 'Мебель', bodyType: 'тентованный', carType: 'тент', weight: 10, volume: 45 },
  { name: 'Автозапчасти', bodyType: 'тентованный', carType: 'тент', weight: 8, volume: 30 },
]

interface TradingPreset {
  status: 'Auction' | 'WaitDeal' | 'Finished' | 'Planning' | 'Stopped'
  mobile: 'Leading' | 'Losing' | 'NotParticipating' | 'Winner' | 'Confirmed'
  participates: boolean
}

const TRADING_PRESETS: TradingPreset[] = [
  { status: 'Auction', mobile: 'Leading', participates: true },
  { status: 'Auction', mobile: 'Losing', participates: true },
  { status: 'Auction', mobile: 'NotParticipating', participates: false },
  { status: 'WaitDeal', mobile: 'Winner', participates: true },
  { status: 'Finished', mobile: 'Confirmed', participates: true },
  { status: 'Planning', mobile: 'NotParticipating', participates: false },
  { status: 'Stopped', mobile: 'Losing', participates: true },
]

const AUCTION_TYPES = ['Down', 'Up', 'Request'] as const

const ORG_NAMES = [
  'ООО «ТрансЛогист»',
  'ООО «Север-Карго»',
  'ООО «Юг-Трейд»',
  'ООО «Восток-Логистик»',
  'ООО «Центр-Карго»',
  'ООО «Столичный Транспорт»',
  'ООО «Поволжье-Логистика»',
  'ООО «Урал-Транс»',
]

const ORG_INNS = [
  '7700000031',
  '7700000032',
  '7700000033',
  '7700000034',
  '7700000035',
  '7700000036',
  '7700000037',
  '7700000038',
]

const LOAD_ADDRESSES = [
  'ул. Складочная, 1',
  'Софийская ул., 60',
  'ул. Промышленная, 5',
  'ул. Большевистская, 131',
  'ул. Транспортная, 1',
  'Заводское шоссе, 31',
  'ул. Доватора, 150',
  'ул. Российская, 70',
]

const UNLOAD_ADDRESSES = [
  'ул. Товарная, 14',
  'МКАД 75 км',
  'ул. Складская, 2',
  'ул. Ленина, 250',
  'ул. Сормовская, 12',
  'ул. Станционная, 8',
  'ул. Промышленная, 12',
  'Заводское шоссе, 5',
]

const VAT_RATE = 0.2

function padSuffix(n: number): string {
  return String(n).padStart(12, '0')
}

function fillerUuid(index: number): string {
  return `${FILLER_UUID_PREFIX}-${padSuffix(FILLER_INDEX_OFFSET + index)}`
}

function fillerOrderUid(index: number): string {
  const suffix = (FILLER_INDEX_OFFSET + index).toString(16).padStart(12, '0')
  return `b0000000-0000-4000-8000-${suffix}`
}

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length]
}

function fillerCreatedAt(index: number): string {
  // Spread across Jan..Jul 2026 so default sort (newest first) interleaves
  // fillers with seeds instead of dumping them as a block.
  const month = (index % 7) + 1
  const day = (index % 28) + 1
  return `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T10:00:00+03:00`
}

function fillerCargoDate(index: number, tz: string): string {
  // Cargo dates land in Aug..Dec 2026 (after created_at).
  const month = (index % 5) + 8
  const day = (index % 27) + 1
  return `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T09:00:00${tz}`
}

function fillerTradingTimes(index: number, tz: string): { start: string; stop: string } {
  const startMonth = (index % 4) + 7
  const stopMonth = startMonth + 1
  return {
    start: `2026-${String(startMonth).padStart(2, '0')}-10T10:00:00${tz}`,
    stop: `2026-${String(stopMonth).padStart(2, '0')}-20T18:00:00${tz}`,
  }
}

function priceNoVat(priceWithVat: number): number {
  return Math.round((priceWithVat / (1 + VAT_RATE)) * 100) / 100
}

export function generateFillerAuctions(count: number): SeedAuction[] {
  const template = seedAuctions.find((auction) => auction.uuid === seedAuctionUuids.downLeading)
  if (!template) {
    return []
  }

  const fillers: SeedAuction[] = []
  for (let i = 0; i < count; i++) {
    const base = structuredClone(template) as SeedAuction
    const uuid = fillerUuid(i)
    const orderUid = fillerOrderUid(i)
    const cityPair = pick(CITY_PAIRS, i)
    const cargo = pick(CARGO_PRESETS, i)
    const trading = pick(TRADING_PRESETS, i)
    const aucType = pick(AUCTION_TYPES, i)
    const orgName = pick(ORG_NAMES, i)
    const orgInn = pick(ORG_INNS, i)
    const loadAddress = pick(LOAD_ADDRESSES, i)
    const unloadAddress = pick(UNLOAD_ADDRESSES, i)
    const createdAt = fillerCreatedAt(i)
    const cargoDate = fillerCargoDate(i, cityPair.tz)
    const times = fillerTradingTimes(i, cityPair.tz)
    const direction = `${cityPair.load} → ${cityPair.unload}`
    const startPrice = 40000 + (i % 10) * 1500
    const currentPrice =
      aucType === 'Up' ? startPrice + 2000 - (i % 3) * 250 : startPrice - 2000 + (i % 3) * 250
    const cargoNum = `F-${String(i + 1).padStart(3, '0')}`
    const pricePerKm =
      cityPair.distance > 0
        ? Math.round((currentPrice / cityPair.distance) * 100) / 100
        : null

    const list = base.list as MockAuctionListItem
    if (list.main) {
      list.main.id = 1000 + i
      list.main.cargo_num = cargoNum
      list.main.cargo_date = cargoDate
      list.main.auc_type = aucType
      list.main.order_uid = orderUid
      list.main.created_at = createdAt
      list.main.priority_sort = 100 - i
      list.main.price_per_km = pricePerKm
    }
    if (list.organizer) {
      list.organizer.organization_id = 6000 + i
      list.organizer.organization_name = orgName
      list.organizer.organization_inn = orgInn
      list.organizer.organization_kpp = '770001001'
      list.organizer.is_hide_organization = false
    }
    if (list.route?.load) {
      list.route.load.city = cityPair.load
      list.route.load.address = loadAddress
      list.route.load.date = cargoDate
      list.route.load.city_gc_id = cityPair.loadGc
    }
    if (list.route?.unload) {
      list.route.unload.city = cityPair.unload
      list.route.unload.address = unloadAddress
      list.route.unload.date = cargoDate
      list.route.unload.city_gc_id = cityPair.unloadGc
    }
    if (list.cargo) {
      list.cargo.name = cargo.name
      list.cargo.weight = cargo.weight
      list.cargo.volume = cargo.volume
      list.cargo.body_type = cargo.bodyType
      if (list.cargo.car) {
        list.cargo.car.type = cargo.carType
      }
    }
    if (list.trading) {
      list.trading.status = trading.status
      list.trading.status_mobile = trading.mobile
      list.trading.start_time = times.start
      list.trading.stop_time = times.stop
      list.trading.direction = direction
      list.trading.bid_measurement_type = 'PerRoute'
      list.trading.can_set_bet = trading.status === 'Auction'
      list.trading.allow_counter_bets = aucType !== 'Request'
      list.trading.hide_points_address_and_contacts = false
      list.trading.is_bidder = trading.participates
      list.trading.is_available = trading.status === 'Auction' || trading.status === 'WaitDeal'
      list.trading.is_accredited = trading.status !== 'Planning'
      list.trading.is_favorite = i % 5 === 0
      list.trading.price = {
        start: startPrice,
        current: currentPrice,
        current_no_vat: priceNoVat(currentPrice),
      }
      list.trading.your = trading.participates
        ? { bet: true, last_bet: trading.mobile === 'Leading' ? currentPrice : currentPrice + 500 }
        : { bet: false, last_bet: null }
      list.trading.red_bet_with_vat = false
      list.trading.red_bet_no_vat = false
      list.trading.is_last_bet_with_vat = trading.participates
    }

    // Detail parity — keep the cloned structure, override the same observable
    // fields so the detail page does not contradict the card.
    if (base.detail.main) {
      base.detail.main.id = 1000 + i
      base.detail.main.cargo_num = cargoNum
      base.detail.main.cargo_date = cargoDate
      base.detail.main.auc_type = aucType
      base.detail.main.order_uid = orderUid
      base.detail.main.created_at = createdAt
    }
    if (base.detail.organizer) {
      base.detail.organizer.organization_id = 6000 + i
      base.detail.organizer.organization_name = orgName
      base.detail.organizer.organization_inn = orgInn
      base.detail.organizer.organization_kpp = '770001001'
      base.detail.organizer.subscriber_id = 200 + i
    }
    if (base.detail.cargo) {
      base.detail.cargo.price = String(startPrice)
      base.detail.cargo.distance = cityPair.distance
      base.detail.cargo.body_type = cargo.bodyType
      if (base.detail.cargo.car) {
        base.detail.cargo.car.type = cargo.carType
      }
    }
    if (base.detail.trading) {
      base.detail.trading.status = trading.status
      base.detail.trading.status_mobile = trading.mobile
      base.detail.trading.start_time = times.start
      base.detail.trading.stop_time = times.stop
      base.detail.trading.bid_measurement_type = 'PerRoute'
      base.detail.trading.can_set_bet = trading.status === 'Auction'
      base.detail.trading.allow_counter_bets = aucType !== 'Request'
      base.detail.trading.hide_bets_history = false
      base.detail.trading.hide_places = false
      base.detail.trading.no_view_cargo_price = false
      base.detail.trading.hide_points_address_and_contacts = false
      base.detail.trading.is_bidder = trading.participates
      base.detail.trading.is_favorite = i % 5 === 0
      base.detail.trading.is_last_bet_with_vat = trading.participates ? true : null
      base.detail.trading.red_bet_with_vat = false
      base.detail.trading.red_bet_no_vat = false
      base.detail.trading.send_deal_before_load = trading.status === 'Finished'
      base.detail.trading.chat_id = i % 3 === 0 ? `chat-f-${i}` : null
      const detailPrice = base.detail.trading.price ?? {}
      detailPrice.start = startPrice
      detailPrice.start_no_vat = priceNoVat(startPrice)
      detailPrice.current = currentPrice
      detailPrice.current_no_vat = priceNoVat(currentPrice)
      detailPrice.available = currentPrice - 500
      detailPrice.available_no_vat = priceNoVat(currentPrice - 500)
      detailPrice.min = aucType === 'Down' ? startPrice - 8000 : null
      detailPrice.min_no_vat = detailPrice.min != null ? priceNoVat(detailPrice.min) : null
      detailPrice.max = aucType === 'Up' ? startPrice + 12000 : null
      detailPrice.max_no_vat = detailPrice.max != null ? priceNoVat(detailPrice.max) : null
      detailPrice.step = 500
      detailPrice.step_no_vat = 417
      detailPrice.price_per_km = pricePerKm ?? 0
      base.detail.trading.price = detailPrice
      if (base.detail.trading.your) {
        if (trading.participates) {
          base.detail.trading.your.bet = true
          base.detail.trading.your.last_bet = currentPrice
          base.detail.trading.your.last_bet_with_vat = currentPrice
          base.detail.trading.your.win = trading.status === 'Finished' || trading.status === 'WaitDeal'
        } else {
          base.detail.trading.your.bet = false
          base.detail.trading.your.last_bet = null
          base.detail.trading.your.last_bet_with_vat = null
          base.detail.trading.your.win = false
        }
      }
    }

    // NOTE: bets are cloned verbatim. Their IDs collide across fillers but
    // bets are always namespaced per auction on the read path, so the
    // duplicate IDs are harmless. Adjust prices toward the new current price
    // so the bets tab does not contradict the trading block.
    for (const bet of base.bets) {
      const place = bet.place ?? 1
      const drift = (aucType === 'Up' ? 1 : -1) * place * 250
      const betPrice = Math.max(1000, currentPrice + drift)
      bet.price_with_vat = betPrice
      bet.price_no_vat = priceNoVat(betPrice)
    }

    base.uuid = uuid
    fillers.push(base)
  }

  return fillers
}
