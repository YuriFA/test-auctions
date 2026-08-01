import { describe, expect, it } from 'vitest'

import { formatDate, toEndOfDayISO, toStartOfDayISO } from './date'

const OFFSET_PATTERN = /[+-]\d{2}:\d{2}$/

describe('formatDate', () => {
  it('formats an ISO date into a human-readable ru-RU form', () => {
    const out = formatDate('2026-07-31T14:30:00Z')
    expect(out).toMatch(/^31[\s ]июл/)
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

describe('toStartOfDayISO', () => {
  it('expands YYYY-MM-DD to T00:00:00 with local offset', () => {
    const result = toStartOfDayISO('2026-03-15')
    expect(result).toMatch(/^2026-03-15T00:00:00[+-]\d{2}:\d{2}$/)
  })

  it('appended offset matches pattern ±HH:MM', () => {
    expect(toStartOfDayISO('2026-01-01')).toMatch(OFFSET_PATTERN)
  })

  it('passes through an already-expanded datetime string unchanged', () => {
    expect(toStartOfDayISO('2026-03-15T00:00:00+03:00')).toBe('2026-03-15T00:00:00+03:00')
  })

  it('passes through garbage strings unchanged', () => {
    expect(toStartOfDayISO('not-a-date')).toBe('not-a-date')
  })
})

describe('toEndOfDayISO', () => {
  it('expands YYYY-MM-DD to T23:59:59 with local offset', () => {
    const result = toEndOfDayISO('2026-03-15')
    expect(result).toMatch(/^2026-03-15T23:59:59[+-]\d{2}:\d{2}$/)
  })

  it('appended offset matches pattern ±HH:MM', () => {
    expect(toEndOfDayISO('2026-12-31')).toMatch(OFFSET_PATTERN)
  })

  it('passes through an already-expanded datetime string unchanged', () => {
    expect(toEndOfDayISO('2026-03-15T23:59:59+03:00')).toBe('2026-03-15T23:59:59+03:00')
  })

  it('passes through garbage strings unchanged', () => {
    expect(toEndOfDayISO('not-a-date')).toBe('not-a-date')
  })
})
