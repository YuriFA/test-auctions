import { describe, expect, it } from 'vitest'

import { formatDate, formatPrice, formatPricePerKm, formatVolume, formatWeight } from './format'

describe('formatPrice', () => {
  it('formats a plain integer with ru-RU grouping and the ₽ symbol', () => {
    // ru-RU uses NBSP (U+00A0) as the group separator.
    const out = formatPrice(72000)
    expect(out).toMatch(/^72[\s ]000[\s ]₽$/)
  })

  it('formats a large value with multiple group separators', () => {
    const out = formatPrice(1_200_000)
    expect(out).toMatch(/^1[\s ]200[\s ]000[\s ]₽$/)
  })

  it('returns em-dash fallback for null', () => {
    expect(formatPrice(null)).toBe('—')
  })

  it('returns em-dash fallback for undefined', () => {
    expect(formatPrice(undefined)).toBe('—')
  })
})

describe('formatWeight', () => {
  it('formats a tonnage with the "т" suffix', () => {
    expect(formatWeight(32)).toMatch(/^32[\s ]т$/)
  })

  it('returns em-dash fallback for null', () => {
    expect(formatWeight(null)).toBe('—')
  })

  it('returns em-dash fallback for undefined', () => {
    expect(formatWeight(undefined)).toBe('—')
  })
})

describe('formatVolume', () => {
  it('formats a volume with the "м³" suffix', () => {
    expect(formatVolume(90)).toMatch(/^90[\s ]м³$/)
  })

  it('returns em-dash fallback for null', () => {
    expect(formatVolume(null)).toBe('—')
  })

  it('returns em-dash fallback for undefined', () => {
    expect(formatVolume(undefined)).toBe('—')
  })
})

describe('formatDate', () => {
  it('formats an ISO date into a human-readable ru-RU form', () => {
    const out = formatDate('2026-07-31T14:30:00Z')
    // Expect "31 июл" (or "31 июл.") followed by time. Be tolerant of the
    // exact punctuation the runtime Intl layer emits.
    expect(out).toMatch(/^31[\s ]июл/)
    expect(out).toMatch(/\d{2}:\d{2}$/)
  })

  it('returns em-dash fallback for undefined', () => {
    expect(formatDate(undefined)).toBe('—')
  })

  it('returns em-dash fallback for an unparseable string', () => {
    expect(formatDate('not-a-date')).toBe('—')
  })

  it('returns em-dash fallback for empty string', () => {
    expect(formatDate('')).toBe('—')
  })
})

describe('formatPricePerKm', () => {
  it('formats a raw integer value with the ₽/км suffix', () => {
    const out = formatPricePerKm(60)
    expect(out).toMatch(/^60[\s ]₽\/км$/)
  })

  it('preserves fractional precision from the DTO', () => {
    const out = formatPricePerKm(28.5)
    expect(out).toMatch(/^28,5[\s ]₽\/км$/)
  })

  it('keeps two decimal places when present in the DTO', () => {
    const out = formatPricePerKm(54.88)
    expect(out).toMatch(/^54,88[\s ]₽\/км$/)
  })

  it('renders zero when the DTO explicitly carries zero', () => {
    expect(formatPricePerKm(0)).toBe('0 ₽/км')
  })

  it('returns em-dash fallback when value is null', () => {
    expect(formatPricePerKm(null)).toBe('—')
  })

  it('returns em-dash fallback when value is undefined', () => {
    expect(formatPricePerKm(undefined)).toBe('—')
  })
})
