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
  it('derives price-per-km and formats with the ₽/км suffix', () => {
    // 72000 / 1200 = 60
    const out = formatPricePerKm(72000, 1200)
    expect(out).toMatch(/^60[\s ]₽\/км$/)
  })

  it('rounds fractional results to whole units', () => {
    // 72000 / 1200 = 60; 72500 / 1200 ≈ 60.42 → "60"
    const out = formatPricePerKm(72500, 1200)
    expect(out).toMatch(/^60[\s ]₽\/км$/)
  })

  it('returns em-dash fallback when distance is zero', () => {
    expect(formatPricePerKm(72000, 0)).toBe('—')
  })

  it('returns em-dash fallback when distance is negative', () => {
    expect(formatPricePerKm(72000, -10)).toBe('—')
  })

  it('returns em-dash fallback when price is null', () => {
    expect(formatPricePerKm(null, 1200)).toBe('—')
  })

  it('returns em-dash fallback when distance is null', () => {
    expect(formatPricePerKm(72000, null)).toBe('—')
  })
})
