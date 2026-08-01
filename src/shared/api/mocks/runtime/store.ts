import type {
  AuctionListMeta,
  AuctionListRequest,
  AuctionListResponseBase,
  AuctionShowResponse,
  AuctionShowTrading,
  AuctionShowTradingYour,
  AuctionStatus,
  AuctionType,
  BetItem,
  ProblemDetail,
  TradingStatus,
  ValidationProblem,
  ValidationError,
} from '../../generated'
import type { MockAuctionListItem, SeedAuction } from '../auctions'
import { seedAuctions } from '../auctions'
import { generateFillerAuctions } from '../auctions-filler'
import { mockCurrentUser } from '../user'

// NOTE: matches the backend's default page size (Laravel paginator) so the
// list UI sees multiple pages on the dev dataset without the frontend sending
// `per_page` — `per_page` is an admin-only field the transport-facing list
// request must never emit (see request-builder leakage guards).
const DEFAULT_PER_PAGE = 12

// NOTE: how many derived filler auctions to seed alongside the curated seed
// set. 24 fillers + 10 seeds = 34 entries → 3 pages at DEFAULT_PER_PAGE=12.
const FILLER_AUCTION_COUNT = 24

const VAT_RATE = 0.2

// NOTE: positional map for the `statuses[]` numeric filter — the spec lists
// 1..7 by comment position in `AuctionListRequest.statuses`. Canceled(8) and
// Unknown are excluded because they are not URL-filterable.
const AUCTION_STATUS_BY_NUMBER: AuctionStatus[] = [
  'Planning',
  'Auction',
  'DeterminateWinner',
  'WaitDeal',
  'InProgress',
  'Finished',
  'Stopped',
]

interface MockRuntimeState {
  auctions: SeedAuction[]
  nextBetId: number
}

let state: MockRuntimeState = createInitialState()

function createInitialState(): MockRuntimeState {
  const auctions = structuredClone([
    ...seedAuctions,
    ...generateFillerAuctions(FILLER_AUCTION_COUNT),
  ]) as SeedAuction[]
  const maxBetId = auctions.reduce((max, auction) => {
    return auction.bets.reduce((inner, bet) => Math.max(inner, bet.id ?? 0), max)
  }, 0)
  return { auctions, nextBetId: maxBetId + 1 }
}

export function resetMockRuntime(): void {
  state = createInitialState()
}

export function readAuctionDetail(uuid: string): AuctionShowResponse | undefined {
  const auction = findAuction(uuid)
  return auction?.detail
}

export function resolveAuctionUuidFromRef(ref: string): string | undefined {
  return state.auctions.find(
    (auction) => auction.uuid === ref || auction.list.main?.order_uid === ref,
  )?.uuid
}

export function readAuctionBets(
  uuid: string,
  options: { includeCanceled?: boolean } = {},
): BetItem[] | undefined {
  const auction = findAuction(uuid)
  if (!auction) {
    return undefined
  }
  const includeCanceled = options.includeCanceled === true
  return auction.bets
    .filter((bet) => includeCanceled || !bet.is_rejected)
    .map((bet) => ({ ...bet }))
}

export function readAuctionList(filters: AuctionListRequest = {}): AuctionListResponseBase {
  const filtered = state.auctions.filter((auction) => matchesFilters(auction, filters))
  const sorted = applySort(filtered, filters)
  const { page, perPage, paged } = applyPagination(sorted, filters)
  const meta: AuctionListMeta = buildMeta(sorted.length, page, perPage, paged.length)
  return {
    data: paged.map((auction) => auction.list),
    meta,
  }
}

export type PlaceBetResult =
  | { ok: true; bet: BetItem }
  | { ok: false; status: 404; problem: ProblemDetail }
  | { ok: false; status: 422; problem: ValidationProblem }

// NOTE: auction statuses that do not allow new bets regardless of can_set_bet.
const TERMINAL_STATUSES: AuctionStatus[] = [
  'Planning',
  'DeterminateWinner',
  'WaitDeal',
  'InProgress',
  'Finished',
  'Stopped',
  'Canceled',
]

// NOTE: never throws — returns a discriminated union so MSW handlers map the
// failure case onto the matching HTTP response without re-validating. Keeps
// list/detail/bets reads consistent by recomputing places and refreshing the
// trading block in both DTOs after a successful mutation.
export function writeBet(uuid: string, price: number): PlaceBetResult {
  if (!Number.isFinite(price) || price <= 0) {
    return {
      ok: false,
      status: 422,
      problem: validationProblem([
        {
          field: 'price',
          message: 'Цена ставки должна быть больше 0',
          code: 'greater_than_zero',
        },
      ]),
    }
  }

  const auction = findAuction(uuid)
  if (!auction) {
    return {
      ok: false,
      status: 404,
      problem: problemDetail(
        'auction_not_found',
        'Аукцион не найден',
        `Аукцион с UUID ${uuid} не существует`,
      ),
    }
  }

  const trading = auction.detail.trading
  const auctionStatus = trading?.status

  if (auctionStatus && TERMINAL_STATUSES.includes(auctionStatus)) {
    return {
      ok: false,
      status: 422,
      problem: validationProblem([
        {
          field: 'price',
          message: `Ставки не принимаются: аукцион в статусе ${auctionStatus}`,
          code: 'auction_not_biddable',
        },
      ]),
    }
  }

  if (trading?.can_set_bet === false) {
    return {
      ok: false,
      status: 422,
      problem: validationProblem([
        {
          field: 'price',
          message: 'Ставка запрещена для данного аукциона',
          code: 'bet_not_allowed',
        },
      ]),
    }
  }

  const priceConstraints = trading?.price
  if (priceConstraints) {
    const { min, max, step, available } = priceConstraints
    if (min != null && price < min) {
      return {
        ok: false,
        status: 422,
        problem: validationProblem([
          {
            field: 'price',
            message: `Ставка ниже минимально допустимой (${min})`,
            code: 'price_below_min',
          },
        ]),
      }
    }
    if (max != null && price > max) {
      return {
        ok: false,
        status: 422,
        problem: validationProblem([
          {
            field: 'price',
            message: `Ставка выше максимально допустимой (${max})`,
            code: 'price_above_max',
          },
        ]),
      }
    }
    if (step != null && step > 0 && available != null) {
      const diff = Math.abs(price - available)
      const remainder = Math.round((diff % step) * 1e9) / 1e9
      if (remainder > 1e-6) {
        return {
          ok: false,
          status: 422,
          problem: validationProblem([
            {
              field: 'price',
              message: `Ставка не соответствует шагу торгов (шаг: ${step})`,
              code: 'price_invalid_step',
            },
          ]),
        }
      }
    }
  }

  const previousUserBet = findUserActiveBet(auction)
  const previousUserPrice = previousUserBet?.price_with_vat ?? null

  const newBet: BetItem = makeUserBetRecord(auction, price)
  state.nextBetId += 1

  if (previousUserBet) {
    previousUserBet.is_rejected = true
    previousUserBet.cancel_reason = 'Перебито новой ставкой'
    previousUserBet.place = null
  }

  auction.bets.push(newBet)
  recomputePlaces(auction)
  applyBetToTrading(auction, newBet, previousUserPrice)

  return { ok: true, bet: { ...newBet } }
}

function makeUserBetRecord(auction: SeedAuction, priceWithVat: number): BetItem {
  const id = state.nextBetId
  const auctionId = auction.detail.main?.id ?? auction.list.main?.id ?? 0
  return {
    id,
    auction_id: auctionId,
    created_at: new Date().toISOString(),
    subscriber_id: mockCurrentUser.subscriber_id,
    contact_name: mockCurrentUser.contact_name,
    contact_phone: mockCurrentUser.contact_phone,
    price_with_vat: priceWithVat,
    price_no_vat: roundPrice(priceWithVat / (1 + VAT_RATE)),
    organization_id: mockCurrentUser.organization_id,
    organization_inn: mockCurrentUser.organization_inn,
    organization_name: mockCurrentUser.organization_name,
    is_rejected: false,
    is_counter: false,
    place: null,
    is_win: false,
    run_number: 0,
    cancel_reason: '',
  }
}

function findAuction(uuid: string): SeedAuction | undefined {
  return state.auctions.find((auction) => auction.uuid === uuid)
}

function findUserActiveBet(auction: SeedAuction): BetItem | undefined {
  return [...auction.bets]
    .filter((bet) => !bet.is_rejected && bet.organization_id === mockCurrentUser.organization_id)
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0]
}

function recomputePlaces(auction: SeedAuction): void {
  const direction = auctionDirection(auction)
  for (const bet of auction.bets) {
    if (bet.is_rejected) {
      bet.place = null
    }
  }
  const active = auction.bets.filter((bet) => !bet.is_rejected)
  const ranked = [...active].sort((a, b) => compareForRank(a, b, direction))
  ranked.forEach((bet, index) => {
    bet.place = index + 1
  })
}

function compareForRank(a: BetItem, b: BetItem, direction: AuctionType | undefined): number {
  const priceA = a.price_with_vat ?? 0
  const priceB = b.price_with_vat ?? 0
  // NOTE: Down/Request/fixPrice auctions — lowest bet wins; Up — highest.
  const diff = direction === 'Up' ? priceB - priceA : priceA - priceB
  if (diff !== 0) {
    return diff
  }
  return (a.id ?? 0) - (b.id ?? 0)
}

function applyBetToTrading(
  auction: SeedAuction,
  newBet: BetItem,
  previousUserPrice: number | null,
): void {
  const direction = auctionDirection(auction)
  const active = auction.bets.filter((bet) => !bet.is_rejected)
  const ranked = [...active].sort((a, b) => compareForRank(a, b, direction))
  const leading = ranked[0]
  const userActive = active.filter((bet) => bet.organization_id === mockCurrentUser.organization_id)
  const userRanked = [...userActive].sort((a, b) => compareForRank(a, b, direction))
  const userLeading = userRanked[0]
  const isLeading = !!leading && !!userLeading && leading.id === userLeading.id

  const newStatusMobile: ListTradingStatus = userLeading
    ? isLeading
      ? 'Leading'
      : 'Losing'
    : toListTradingStatus(auction.detail.trading?.status_mobile ?? 'NotParticipating')

  const worseThanPrevious =
    previousUserPrice != null
      ? direction === 'Up'
        ? (newBet.price_with_vat ?? 0) < previousUserPrice
        : (newBet.price_with_vat ?? 0) > previousUserPrice
      : false

  updateDetailTrading(auction, leading, userLeading, isLeading, newStatusMobile, worseThanPrevious)
  updateListTrading(auction, leading, userLeading, newStatusMobile, worseThanPrevious)
}

function updateDetailTrading(
  auction: SeedAuction,
  leading: BetItem | undefined,
  userLeading: BetItem | undefined,
  isLeading: boolean,
  statusMobile: ListTradingStatus,
  worseThanPrevious: boolean,
): void {
  const trading: AuctionShowTrading | undefined = auction.detail.trading
  if (!trading) {
    return
  }

  const direction = auctionDirection(auction)
  if (leading) {
    const price = trading.price ?? {}
    price.current = leading.price_with_vat ?? price.current ?? null
    price.current_no_vat = leading.price_no_vat ?? price.current_no_vat ?? null
    price.available = nextAvailablePrice(price.current, price.step, direction)
    price.available_no_vat = nextAvailablePrice(price.current_no_vat, price.step_no_vat, direction)
    const pricePerKm = computePricePerKm(price.current_no_vat, auction.detail.cargo?.distance)
    price.price_per_km = pricePerKm ?? undefined
    trading.price = price
  }

  const your: AuctionShowTradingYour = trading.your ?? {}
  if (userLeading) {
    your.bet = true
    your.last_bet = userLeading.price_with_vat ?? null
    your.last_bet_with_vat = userLeading.price_with_vat ?? null
    your.win = isLeading && isAuctionFinished(auction) ? true : (your.win ?? false)
  } else {
    your.bet = false
    your.last_bet = null
    your.last_bet_with_vat = null
    your.win = false
  }
  trading.your = your

  trading.is_bidder = !!userLeading
  trading.status_mobile = statusMobile
  trading.is_last_bet_with_vat = true
  trading.red_bet_with_vat = worseThanPrevious
  trading.red_bet_no_vat = worseThanPrevious
}

function updateListTrading(
  auction: SeedAuction,
  leading: BetItem | undefined,
  userLeading: BetItem | undefined,
  statusMobile: ListTradingStatus,
  worseThanPrevious: boolean,
): void {
  const listTrading = (auction.list as MockAuctionListItem).trading
  if (!listTrading) {
    return
  }

  if (leading) {
    const price = listTrading.price ?? {}
    price.current = leading.price_with_vat ?? price.current ?? undefined
    price.current_no_vat = leading.price_no_vat ?? price.current_no_vat ?? undefined
    listTrading.price = price

    const listMain = (auction.list as MockAuctionListItem).main
    if (listMain) {
      listMain.price_per_km = computePricePerKm(
        price.current_no_vat,
        auction.detail.cargo?.distance,
      )
    }
  }

  const your = listTrading.your ?? {}
  if (userLeading) {
    your.bet = true
    your.last_bet = userLeading.price_with_vat ?? null
  } else {
    your.bet = false
    your.last_bet = null
  }
  listTrading.your = your

  listTrading.is_bidder = !!userLeading
  listTrading.status_mobile = statusMobile
  listTrading.is_last_bet_with_vat = true
  listTrading.red_bet_with_vat = worseThanPrevious
  listTrading.red_bet_no_vat = worseThanPrevious
}

function nextAvailablePrice(
  current: number | null | undefined,
  step: number | null | undefined,
  direction: AuctionType | undefined,
): number | null {
  if (current == null || step == null) {
    return null
  }
  const raw = direction === 'Up' ? current + step : current - step
  return Math.max(0, Math.round(raw * 100) / 100)
}

function computePricePerKm(
  priceNoVat: number | null | undefined,
  distance: number | null | undefined,
): number | null {
  if (priceNoVat == null || distance == null || distance <= 0) {
    return null
  }

  return Math.round((priceNoVat / distance) * 100) / 100
}

// NOTE: list DTO exposes a narrower TradingStatus set than detail.
// OnPending/ChoosingWinner collapse to `Losing`, Accepted to `Confirmed`.
type ListTradingStatus =
  | 'NotParticipating'
  | 'Leading'
  | 'Losing'
  | 'Winner'
  | 'Confirmed'
  | 'Unknown'

function toListTradingStatus(status: TradingStatus): ListTradingStatus {
  if (status === 'OnPending' || status === 'ChoosingWinner') {
    return 'Losing'
  }
  if (status === 'Accepted') {
    return 'Confirmed'
  }
  return status
}

function isAuctionFinished(auction: SeedAuction): boolean {
  const status = auction.detail.trading?.status
  return (
    status === 'Finished' ||
    status === 'WaitDeal' ||
    status === 'InProgress' ||
    status === 'DeterminateWinner'
  )
}

function auctionDirection(auction: SeedAuction): AuctionType | undefined {
  return auction.detail.main?.auc_type ?? auction.list.main?.auc_type
}

function matchesFilters(auction: SeedAuction, filters: AuctionListRequest): boolean {
  const list = auction.list
  const trading = list.trading

  if (filters.auc_type && filters.auc_type.length > 0) {
    const type = list.main?.auc_type
    if (!type || !filters.auc_type.includes(type as 'Request' | 'Up' | 'Down' | 'FixPrice')) {
      return false
    }
  }

  if (filters.status && filters.status.length > 0) {
    const mobile = trading?.status_mobile
    if (!mobile || !filters.status.includes(mobile)) {
      return false
    }
  }

  if (filters.statuses && filters.statuses.length > 0) {
    const mapped = filters.statuses
      .map((value) => AUCTION_STATUS_BY_NUMBER[value - 1])
      .filter((value): value is AuctionStatus => Boolean(value))
    const current = trading?.status
    if (!current || !mapped.includes(current)) {
      return false
    }
  }

  if (filters.cargo_num) {
    const haystack = list.main?.cargo_num ?? ''
    if (!haystack.toLowerCase().includes(filters.cargo_num.toLowerCase())) {
      return false
    }
  }

  if (filters.body_types && filters.body_types.length > 0) {
    const body = list.cargo?.body_type
    if (!body || !filters.body_types.includes(body)) {
      return false
    }
  }

  if (typeof filters.weight_from === 'number' && (list.cargo?.weight ?? 0) < filters.weight_from) {
    return false
  }
  if (typeof filters.weight_to === 'number' && (list.cargo?.weight ?? 0) > filters.weight_to) {
    return false
  }
  if (typeof filters.volume_from === 'number' && (list.cargo?.volume ?? 0) < filters.volume_from) {
    return false
  }
  if (typeof filters.volume_to === 'number' && (list.cargo?.volume ?? 0) > filters.volume_to) {
    return false
  }

  if (typeof filters.is_international_shipment === 'boolean') {
    if (Boolean(list.cargo?.is_international) !== filters.is_international_shipment) {
      return false
    }
  }
  if (typeof filters.is_available === 'boolean') {
    if (Boolean(trading?.is_available) !== filters.is_available) {
      return false
    }
  }
  if (typeof filters.is_favorite === 'boolean') {
    if (Boolean(trading?.is_favorite) !== filters.is_favorite) {
      return false
    }
  }
  if (typeof filters.is_bidder === 'boolean') {
    if (Boolean(trading?.is_bidder) !== filters.is_bidder) {
      return false
    }
  }

  if (filters.load_gc_id !== undefined && list.route?.load?.city_gc_id !== filters.load_gc_id) {
    return false
  }
  if (
    filters.unload_gc_id !== undefined &&
    list.route?.unload?.city_gc_id !== filters.unload_gc_id
  ) {
    return false
  }
  if (filters.load_city) {
    const city = list.route?.load?.city ?? ''
    if (!city.toLowerCase().includes(filters.load_city.toLowerCase())) {
      return false
    }
  }
  if (filters.unload_city) {
    const city = list.route?.unload?.city ?? ''
    if (!city.toLowerCase().includes(filters.unload_city.toLowerCase())) {
      return false
    }
  }

  if (typeof filters.current_price_from === 'number') {
    if ((trading?.price?.current ?? 0) < filters.current_price_from) {
      return false
    }
  }
  if (typeof filters.current_price_to === 'number') {
    if ((trading?.price?.current ?? Number.POSITIVE_INFINITY) > filters.current_price_to) {
      return false
    }
  }

  if (typeof filters.price_per_km_from === 'number') {
    if ((list.main?.price_per_km ?? 0) < filters.price_per_km_from) {
      return false
    }
  }
  if (typeof filters.price_per_km_to === 'number') {
    if ((list.main?.price_per_km ?? Number.POSITIVE_INFINITY) > filters.price_per_km_to) {
      return false
    }
  }

  if (filters.customer) {
    const name = list.organizer?.organization_name ?? ''
    const inn = list.organizer?.organization_inn ?? ''
    const needle = filters.customer.toLowerCase()
    if (!name.toLowerCase().includes(needle) && !inn.toLowerCase().includes(needle)) {
      return false
    }
  }

  if (filters.create_date_from) {
    if ((list.main?.created_at ?? '') < filters.create_date_from) {
      return false
    }
  }
  if (filters.create_date_to) {
    if ((list.main?.created_at ?? '') > filters.create_date_to) {
      return false
    }
  }

  return true
}

function applySort(auctions: SeedAuction[], filters: AuctionListRequest): SeedAuction[] {
  const direction = filters.is_oldest ? 1 : -1
  return [...auctions].sort((a, b) => {
    const left = a.list.main?.created_at ?? ''
    const right = b.list.main?.created_at ?? ''
    if (left < right) {
      return -1 * direction
    }
    if (left > right) {
      return 1 * direction
    }
    return 0
  })
}

function applyPagination(
  auctions: SeedAuction[],
  filters: AuctionListRequest,
): { page: number; perPage: number; paged: SeedAuction[] } {
  const page = filters.page && filters.page > 0 ? filters.page : 1
  const perPage = filters.per_page && filters.per_page > 0 ? filters.per_page : DEFAULT_PER_PAGE
  const start = (page - 1) * perPage
  return { page, perPage, paged: auctions.slice(start, start + perPage) }
}

function buildMeta(
  total: number,
  page: number,
  perPage: number,
  pagedCount: number,
): AuctionListMeta {
  const lastPage = perPage === 0 ? 1 : Math.ceil(total / perPage)
  // NOTE: empty slice must read from=0, to=0 to match the Laravel paginator
  // and the non-nullable integer contract on `from` / `to`.
  const from = pagedCount === 0 ? 0 : (page - 1) * perPage + 1
  const to = pagedCount === 0 ? 0 : Math.min(page * perPage, total)
  return {
    current_page: page,
    from,
    last_page: lastPage,
    per_page: perPage,
    to,
    total,
  }
}

function roundPrice(value: number): number {
  return Math.round(value * 100) / 100
}

function problemDetail(code: string, title: string, message: string): ProblemDetail {
  return { code, title, message }
}

function validationProblem(errors: ValidationError[]): ValidationProblem {
  return {
    code: 'validation_failed',
    title: 'Ошибка валидации',
    message: 'Запрос не прошёл валидацию',
    errors,
  }
}
