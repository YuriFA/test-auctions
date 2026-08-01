import { z } from 'zod'

const AUCTION_TYPES = ['Request', 'Up', 'Down', 'FixPrice', 'Unknown'] as const

// NOTE: list DTO never surfaces OnPending/ChoosingWinner/Accepted — exclude
// them from the URL filter set so unknown values drop on parse.
const MOBILE_STATUSES = [
  'NotParticipating',
  'Leading',
  'Losing',
  'Winner',
  'Confirmed',
  'Unknown',
] as const

const AUCTION_STATUS_MIN = 1
const AUCTION_STATUS_MAX = 7

export const DEFAULT_PAGE = 1
export const DEFAULT_IS_OLDEST = false

export const DEFAULT_AUCTIONS_LIST_FILTERS = Object.freeze({
  page: DEFAULT_PAGE,
  is_oldest: DEFAULT_IS_OLDEST,
  cargo_num: '',
  auc_type: [],
  status: [],
  statuses: [],
  load_city: '',
  unload_city: '',
  current_price_from: undefined,
  current_price_to: undefined,
  create_date_from: undefined,
  create_date_to: undefined,
  load_date_from: undefined,
  load_date_to: undefined,
})

export type AuctionsListFilters = {
  page: number
  is_oldest: boolean
  cargo_num: string
  auc_type: Array<(typeof AUCTION_TYPES)[number]>
  status: Array<(typeof MOBILE_STATUSES)[number]>
  statuses: number[]
  load_city: string
  unload_city: string
  current_price_from?: number
  current_price_to?: number
  create_date_from?: string
  create_date_to?: string
  load_date_from?: string
  load_date_to?: string
  is_available?: boolean
  is_bidder?: boolean
}

function toPlainObject(raw: URLSearchParams): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const key of raw.keys()) {
    out[key] = raw.getAll(key)
  }
  return out
}

const first = <T>(arr: T[] | undefined): T | undefined => arr?.[0]

const stringArray = z.array(z.string()).optional()

export const auctionsListFiltersSchema: z.ZodType<AuctionsListFilters> = z.object({
  page: stringArray.transform((arr) => parsePage(first(arr) ?? null)),
  is_oldest: stringArray.transform((arr) => parseSortFlag(first(arr) ?? null)),
  cargo_num: stringArray.transform((arr) => first(arr) ?? ''),
  auc_type: stringArray.transform((arr) => parseEnumArray(arr ?? [], AUCTION_TYPES)),
  status: stringArray.transform((arr) => parseEnumArray(arr ?? [], MOBILE_STATUSES)),
  statuses: stringArray.transform((arr) => parseNumericStatuses(arr ?? [])),
  load_city: stringArray.transform((arr) => first(arr) ?? ''),
  unload_city: stringArray.transform((arr) => first(arr) ?? ''),
  current_price_from: stringArray.transform((arr) => parseOptionalNumber(first(arr) ?? null)),
  current_price_to: stringArray.transform((arr) => parseOptionalNumber(first(arr) ?? null)),
  create_date_from: stringArray.transform((arr) => first(arr)),
  create_date_to: stringArray.transform((arr) => first(arr)),
  load_date_from: stringArray.transform((arr) => first(arr)),
  load_date_to: stringArray.transform((arr) => first(arr)),
  is_available: stringArray.transform((arr) => parseOptionalBoolean(first(arr) ?? null)),
  is_bidder: stringArray.transform((arr) => parseOptionalBoolean(first(arr) ?? null)),
})

export function parseAuctionsListSearchParams(
  raw: URLSearchParams | undefined | null,
): AuctionsListFilters {
  return auctionsListFiltersSchema.parse(toPlainObject(raw ?? new URLSearchParams()))
}

function parsePage(raw: string | null): number {
  if (raw === null) {
    return DEFAULT_PAGE
  }
  const num = Number(raw)
  if (!Number.isInteger(num) || num <= 0) {
    return DEFAULT_PAGE
  }
  return num
}

function parseSortFlag(raw: string | null): boolean {
  if (raw === 'true') {
    return true
  }
  if (raw === 'false') {
    return false
  }
  return DEFAULT_IS_OLDEST
}

function parseEnumArray<T extends readonly string[]>(
  values: string[],
  allowed: T,
): Array<T[number]> {
  return values.filter((v): v is T[number] => (allowed as readonly string[]).includes(v))
}

function parseNumericStatuses(values: string[]): number[] {
  return values
    .map((v) => Number(v))
    .filter(
      (n): n is number => Number.isInteger(n) && n >= AUCTION_STATUS_MIN && n <= AUCTION_STATUS_MAX,
    )
}

function parseOptionalNumber(raw: string | null): number | undefined {
  if (raw === null || raw === '') {
    return undefined
  }
  const num = Number(raw)
  if (!Number.isFinite(num)) {
    return undefined
  }
  return num
}

function parseOptionalBoolean(raw: string | null): boolean | undefined {
  if (raw === 'true') {
    return true
  }
  if (raw === 'false') {
    return false
  }
  return undefined
}

// NOTE: defaults are not serialized so URLs stay readable and resilient to
// default changes; arrays become repeated keys, never CSV.
export function serializeAuctionsListSearchParams(value: AuctionsListFilters): URLSearchParams {
  const out = new URLSearchParams()

  if (value.page !== DEFAULT_PAGE) {
    out.set('page', String(value.page))
  }
  if (value.is_oldest !== DEFAULT_IS_OLDEST) {
    out.set('is_oldest', String(value.is_oldest))
  }
  if (value.cargo_num) {
    out.set('cargo_num', value.cargo_num)
  }
  if (value.load_city) {
    out.set('load_city', value.load_city)
  }
  if (value.unload_city) {
    out.set('unload_city', value.unload_city)
  }
  for (const t of value.auc_type) {
    out.append('auc_type', t)
  }
  for (const s of value.status) {
    out.append('status', s)
  }
  for (const s of value.statuses) {
    out.append('statuses', String(s))
  }
  if (typeof value.current_price_from === 'number') {
    out.set('current_price_from', String(value.current_price_from))
  }
  if (typeof value.current_price_to === 'number') {
    out.set('current_price_to', String(value.current_price_to))
  }
  if (value.create_date_from) {
    out.set('create_date_from', value.create_date_from)
  }
  if (value.create_date_to) {
    out.set('create_date_to', value.create_date_to)
  }
  if (value.load_date_from) {
    out.set('load_date_from', value.load_date_from)
  }
  if (value.load_date_to) {
    out.set('load_date_to', value.load_date_to)
  }
  if (typeof value.is_available === 'boolean') {
    out.set('is_available', String(value.is_available))
  }
  if (typeof value.is_bidder === 'boolean') {
    out.set('is_bidder', String(value.is_bidder))
  }

  return out
}

export function isDefaultFilters(value: AuctionsListFilters): boolean {
  return countActiveFilters(value) === 0
}

// NOTE: `cargo_num` and `page` are excluded — search is a separate header
// input, and pagination is navigation. Both affect the URL but are not
// filters. Optionals count as active whenever present (true OR false), since
// defaults are `undefined`; arrays count as one field regardless of length.
export function countActiveFilters(value: AuctionsListFilters): number {
  let count = 0
  if (value.is_oldest !== DEFAULT_IS_OLDEST) {
    count += 1
  }
  if (value.load_city) {
    count += 1
  }
  if (value.unload_city) {
    count += 1
  }
  if (value.auc_type.length > 0) {
    count += 1
  }
  if (value.status.length > 0) {
    count += 1
  }
  if (value.statuses.length > 0) {
    count += 1
  }
  if (typeof value.current_price_from === 'number') {
    count += 1
  }
  if (typeof value.current_price_to === 'number') {
    count += 1
  }
  if (value.create_date_from) {
    count += 1
  }
  if (value.create_date_to) {
    count += 1
  }
  if (value.load_date_from) {
    count += 1
  }
  if (value.load_date_to) {
    count += 1
  }
  if (typeof value.is_available === 'boolean') {
    count += 1
  }
  if (typeof value.is_bidder === 'boolean') {
    count += 1
  }
  return count
}

export type AuctionsListSearch = Partial<AuctionsListFilters>

export function parseAuctionsListSearch(raw: Record<string, unknown>): AuctionsListSearch {
  return toAuctionsListSearch(auctionsListFiltersSchema.parse(normalizeRecordSearch(raw)))
}

export function toAuctionsListSearch(filters: AuctionsListFilters): AuctionsListSearch {
  return pickActiveFilters(filters)
}

function pickActiveFilters(filters: AuctionsListFilters): AuctionsListSearch {
  const out: AuctionsListSearch = {}
  if (filters.page !== DEFAULT_PAGE) {
    out.page = filters.page
  }
  if (filters.is_oldest !== DEFAULT_IS_OLDEST) {
    out.is_oldest = filters.is_oldest
  }
  if (filters.cargo_num) {
    out.cargo_num = filters.cargo_num
  }
  if (filters.load_city) {
    out.load_city = filters.load_city
  }
  if (filters.unload_city) {
    out.unload_city = filters.unload_city
  }
  if (filters.auc_type.length > 0) {
    out.auc_type = filters.auc_type
  }
  if (filters.status.length > 0) {
    out.status = filters.status
  }
  if (filters.statuses.length > 0) {
    out.statuses = filters.statuses
  }
  if (typeof filters.current_price_from === 'number') {
    out.current_price_from = filters.current_price_from
  }
  if (typeof filters.current_price_to === 'number') {
    out.current_price_to = filters.current_price_to
  }
  if (filters.create_date_from) {
    out.create_date_from = filters.create_date_from
  }
  if (filters.create_date_to) {
    out.create_date_to = filters.create_date_to
  }
  if (filters.load_date_from) {
    out.load_date_from = filters.load_date_from
  }
  if (filters.load_date_to) {
    out.load_date_to = filters.load_date_to
  }
  if (typeof filters.is_available === 'boolean') {
    out.is_available = filters.is_available
  }
  if (typeof filters.is_bidder === 'boolean') {
    out.is_bidder = filters.is_bidder
  }
  return out
}

function normalizeRecordSearch(raw: Record<string, unknown>): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string') {
      out[key] = [value]
    } else if (Array.isArray(value)) {
      const strings = value.filter((v): v is string => typeof v === 'string')
      if (strings.length > 0) {
        out[key] = strings
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      out[key] = [String(value)]
    }
  }
  return out
}
