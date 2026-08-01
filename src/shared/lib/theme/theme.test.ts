import { describe, expect, it } from 'vitest'

import { THEME_CYCLE, isTheme, nextTheme, readStoredTheme, resolveTheme } from './theme'

describe('theme', () => {
  describe('isTheme', () => {
    it('accepts known theme values', () => {
      expect(isTheme('system')).toBe(true)
      expect(isTheme('light')).toBe(true)
      expect(isTheme('dark')).toBe(true)
    })

    it('rejects unknown and empty values', () => {
      expect(isTheme('blue')).toBe(false)
      expect(isTheme('')).toBe(false)
      expect(isTheme(null)).toBe(false)
      expect(isTheme(undefined)).toBe(false)
      expect(isTheme({ theme: 'dark' })).toBe(false)
    })
  })

  describe('readStoredTheme', () => {
    it('returns the stored value when valid', () => {
      expect(readStoredTheme('dark')).toBe('dark')
      expect(readStoredTheme('light')).toBe('light')
      expect(readStoredTheme('system')).toBe('system')
    })

    it('falls back to system when invalid or missing', () => {
      expect(readStoredTheme(null)).toBe('system')
      expect(readStoredTheme(undefined)).toBe('system')
      expect(readStoredTheme('blue')).toBe('system')
      expect(readStoredTheme('')).toBe('system')
    })
  })

  describe('nextTheme', () => {
    it('cycles system -> light -> dark -> system', () => {
      expect(nextTheme('system')).toBe('light')
      expect(nextTheme('light')).toBe('dark')
      expect(nextTheme('dark')).toBe('system')
    })

    it('returns to the starting theme after a full cycle', () => {
      for (const start of THEME_CYCLE) {
        const after = nextTheme(nextTheme(nextTheme(start)))
        expect(after).toBe(start)
      }
    })
  })

  describe('resolveTheme', () => {
    it('returns explicit themes unchanged', () => {
      expect(resolveTheme('light')).toBe('light')
      expect(resolveTheme('dark')).toBe('dark')
    })
  })
})
