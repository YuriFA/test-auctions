import { describe, expect, it } from 'vitest'

import { formatPrice, formatPricePerKm } from './currency'

describe('formatPrice', () => {
  it('formats a plain integer with ru-RU grouping and the ₽ symbol', () => {
    const out = formatPrice(72000)
    expect(out).toMatch(/^72[\s ]000[\s ]₽$/)
  })

  it('formats a large value with multiple group separators', () => {
    const out = formatPrice(1_200_000)
    expect(out).toMatch(/^1[\s ]200[\s ]000[\s ]₽$/)
  })

  it('returns em-dash fallback for null', () => {
    expect(formatPrice(null)).toBe('—')
  })

  it('returns em-dash fallback for undefined', () => {
    expect(formatPrice(undefined)).toBe('—')
  })
})

describe('formatPricePerKm', () => {
  it('formats a raw integer value with the ₽/км suffix', () => {
    const out = formatPricePerKm(60)
    expect(out).toMatch(/^60[\s ]₽\/км$/)
  })

  it('preserves fractional precision from the DTO', () => {
    const out = formatPricePerKm(28.5)
    expect(out).toMatch(/^28,5[\s ]₽\/км$/)
  })

  it('keeps two decimal places when present in the DTO', () => {
    const out = formatPricePerKm(54.88)
    expect(out).toMatch(/^54,88[\s ]₽\/км$/)
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
