import { describe, expect, it } from 'vitest'

import { formatVolume, formatWeight } from './format'

describe('formatWeight', () => {
  it('formats a tonnage with the "т" suffix', () => {
    expect(formatWeight(32)).toMatch(/^32[\s ]т$/)
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
    expect(formatVolume(90)).toMatch(/^90[\s ]м³$/)
  })

  it('returns em-dash fallback for null', () => {
    expect(formatVolume(null)).toBe('—')
  })

  it('returns em-dash fallback for undefined', () => {
    expect(formatVolume(undefined)).toBe('—')
  })
})
