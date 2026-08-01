import { describe, expect, it } from 'vitest'

import { describeConstraints } from './describe-constraints'

describe('describeConstraints', () => {
  it('returns a fallback when no constraints are present', () => {
    expect(describeConstraints({ min: null, max: null, step: null })).toBe('Без явных ограничений')
  })

  it('joins min, max, and step in display order', () => {
    expect(describeConstraints({ min: 1000, max: 5000, step: 500 })).toBe(
      'от 1\u00A0000 ₽ · до 5\u00A0000 ₽ · шаг 500 ₽',
    )
  })

  it('omits missing constraints', () => {
    expect(describeConstraints({ min: 1000, max: null, step: 500 })).toBe(
      'от 1\u00A0000 ₽ · шаг 500 ₽',
    )
  })
})
