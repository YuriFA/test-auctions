import { parseOptionalBoolean, parseOptionalNumber } from '@shared/lib'
import { z } from 'zod'

const AUCTION_TYPES = ['Request', 'Up', 'Down', 'FixPrice', 'Unknown'] as const

// API contract excludes 'Unknown' from the request payload even though the
// URL filter set accepts it — see request-builder.ts.
const API_AUC_TYPES = ['Request', 'Up', 'Down', 'FixPrice'] as const

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
  is_available: undefined,
  is_bidder: undefined,
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

type FieldKind =
  | 'defaultNumber'
  | 'defaultBoolean'
  | 'string'
  | 'optionalString'
  | 'array'
  | 'optionalNumber'
  | 'optionalBoolean'

export const FIELD_KINDS = {
  page: 'defaultNumber',
  is_oldest: 'defaultBoolean',
  cargo_num: 'string',
  load_city: 'string',
  unload_city: 'string',
  auc_type: 'array',
  status: 'array',
  statuses: 'array',
  current_price_from: 'optionalNumber',
  current_price_to: 'optionalNumber',
  create_date_from: 'optionalString',
  create_date_to: 'optionalString',
  load_date_from: 'optionalString',
  load_date_to: 'optionalString',
  is_available: 'optionalBoolean',
  is_bidder: 'optionalBoolean',
} as const satisfies Record<keyof AuctionsListFilters, FieldKind>

export const ACTIVE_FIELDS = Object.keys(FIELD_KINDS) as Array<keyof AuctionsListFilters>

// `page` and `cargo_num` are excluded from `countActiveFilters` /
// `isDefaultFilters`: pagination is navigation and search is a separate
// header input. Both still serialize to URL and the API request.
export const NON_FILTER_FIELDS: ReadonlySet<keyof AuctionsListFilters> = new Set([
  'page',
  'cargo_num',
])

export function isActive<K extends keyof AuctionsListFilters>(
  key: K,
  value: AuctionsListFilters[K],
): boolean {
  switch (FIELD_KINDS[key]) {
    case 'defaultNumber':
      return value !== DEFAULT_PAGE
    case 'defaultBoolean':
      return value !== DEFAULT_IS_OLDEST
    case 'optionalNumber':
      return typeof value === 'number'
    case 'optionalBoolean':
      return typeof value === 'boolean'
    case 'array':
      return (value as unknown[]).length > 0
    case 'optionalString':
    case 'string':
      return Boolean(value)
  }
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

const fromStringArray = <T>(fn: (val: string | undefined) => T) =>
  stringArray.transform((arr) => fn(first(arr)))

const enumArrayField = <T extends readonly string[]>(allowed: T) =>
  stringArray.transform((arr) => parseEnumArray(arr ?? [], allowed))

const auctionsListFiltersSchema: z.ZodType<AuctionsListFilters> = z.object({
  page: fromStringArray((v) => parsePage(v ?? null)),
  is_oldest: fromStringArray((v) => parseSortFlag(v ?? null)),
  cargo_num: fromStringArray((v) => v ?? ''),
  load_city: fromStringArray((v) => v ?? ''),
  unload_city: fromStringArray((v) => v ?? ''),
  auc_type: enumArrayField(AUCTION_TYPES),
  status: enumArrayField(MOBILE_STATUSES),
  statuses: stringArray.transform((arr) => parseNumericStatuses(arr ?? [])),
  current_price_from: fromStringArray((v) => parseOptionalNumber(v ?? null)),
  current_price_to: fromStringArray((v) => parseOptionalNumber(v ?? null)),
  create_date_from: fromStringArray((v) => parseOptionalDate(v ?? null)),
  create_date_to: fromStringArray((v) => parseOptionalDate(v ?? null)),
  load_date_from: fromStringArray((v) => parseOptionalDate(v ?? null)),
  load_date_to: fromStringArray((v) => parseOptionalDate(v ?? null)),
  is_available: fromStringArray((v) => parseOptionalBoolean(v ?? null)),
  is_bidder: fromStringArray((v) => parseOptionalBoolean(v ?? null)),
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

function parseOptionalDate(raw: string | null): string | undefined {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return undefined
  }
  return raw
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

// NOTE: defaults are not serialized so URLs stay readable and resilient to
// default changes; arrays become repeated keys, never CSV.
export function serializeAuctionsListSearchParams(value: AuctionsListFilters): URLSearchParams {
  const out = new URLSearchParams()
  for (const key of ACTIVE_FIELDS) {
    if (!isActive(key, value[key])) {
      continue
    }
    const field = value[key]
    if (Array.isArray(field)) {
      for (const item of field) {
        out.append(key, String(item))
      }
    } else {
      out.set(key, String(field))
    }
  }
  return out
}

export function isDefaultFilters(value: AuctionsListFilters): boolean {
  return countActiveFilters(value) === 0
}

export function countActiveFilters(value: AuctionsListFilters): number {
  let count = 0
  for (const key of ACTIVE_FIELDS) {
    if (!NON_FILTER_FIELDS.has(key) && isActive(key, value[key])) {
      count += 1
    }
  }
  return count
}

export type AuctionsListSearch = Partial<AuctionsListFilters>

export function parseAuctionsListSearch(raw: Record<string, unknown>): AuctionsListSearch {
  return toAuctionsListSearch(auctionsListFiltersSchema.parse(normalizeRecordSearch(raw)))
}

export function toAuctionsListSearch(filters: AuctionsListFilters): AuctionsListSearch {
  const out: Record<string, unknown> = {}
  for (const key of ACTIVE_FIELDS) {
    if (isActive(key, filters[key])) {
      out[key] = filters[key]
    }
  }
  return out as AuctionsListSearch
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

export function isApiAucType(value: string): value is ApiAucType {
  return (API_AUC_TYPES as readonly string[]).includes(value)
}

export type ApiAucType = (typeof API_AUC_TYPES)[number]
