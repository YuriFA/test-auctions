import { describe, expect, it } from 'vitest'

import type { BetPriceConstraints } from './bet-form-schema'
import { betFormSchema, nextStepPrice, prevStepPrice } from './bet-form-schema'

function parsePrice(constraints: BetPriceConstraints, price: unknown) {
  return betFormSchema(constraints).safeParse({ price })
}

function expectPriceError(constraints: BetPriceConstraints, price: unknown) {
  const result = parsePrice(constraints, price)
  expect(result.success).toBe(false)
  if (!result.success) {
    expect(result.error.issues).toHaveLength(1)
    expect(result.error.issues[0].path).toEqual(['price'])
  }
}

describe('betFormSchema', () => {
  describe('required and positive', () => {
    it('accepts a positive number when no constraints are set', () => {
      const result = parsePrice({}, 1000)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.price).toBe(1000)
      }
    })

    it('coerces numeric strings to numbers', () => {
      const result = parsePrice({}, '1500')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.price).toBe(1500)
      }
    })

    it('trims whitespace before coercion', () => {
      const result = parsePrice({}, '  250 ')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.price).toBe(250)
      }
    })

    it('rejects missing price with a single error at path price', () => {
      expectPriceError({}, undefined)
    })

    it('rejects empty string with a single error at path price', () => {
      expectPriceError({}, '')
    })

    it('rejects zero price with a single error at path price', () => {
      expectPriceError({}, 0)
    })

    it('rejects negative price with a single error at path price', () => {
      expectPriceError({}, -100)
    })
  })

  describe('non-numeric input is a structural error', () => {
    it('rejects "abc" without throwing', () => {
      expectPriceError({}, 'abc')
    })

    it('rejects NaN without throwing', () => {
      expectPriceError({}, Number.NaN)
    })
  })

  describe('min constraint', () => {
    it('rejects price below min', () => {
      expectPriceError({ min: 100 }, 50)
    })

    it('accepts price equal to min', () => {
      expect(parsePrice({ min: 100 }, 100).success).toBe(true)
    })

    it('does not enforce min when null', () => {
      expect(parsePrice({ min: null }, 1).success).toBe(true)
    })

    it('does not enforce min when undefined', () => {
      expect(parsePrice({ min: undefined }, 1).success).toBe(true)
    })
  })

  describe('max constraint', () => {
    it('rejects price above max', () => {
      expectPriceError({ max: 500 }, 600)
    })

    it('accepts price equal to max', () => {
      expect(parsePrice({ max: 500 }, 500).success).toBe(true)
    })
  })

  describe('step constraint', () => {
    it('rejects price not aligned to step from 0', () => {
      expectPriceError({ step: 100 }, 150)
    })

    it('accepts price aligned to step from 0', () => {
      expect(parsePrice({ step: 100 }, 300).success).toBe(true)
    })

    it('aligns from base when provided', () => {
      expect(parsePrice({ step: 100, base: 50 }, 150).success).toBe(true)
      expect(parsePrice({ step: 100, base: 50 }, 250).success).toBe(true)
    })

    it('rejects misaligned price from base', () => {
      expectPriceError({ step: 100, base: 50 }, 200)
    })

    it('tolerates floating-point drift', () => {
      expect(parsePrice({ step: 0.01 }, 0.03).success).toBe(true)
    })

    it('does not enforce step when null', () => {
      expect(parsePrice({ step: null }, 7).success).toBe(true)
    })

    it('does not enforce step when zero', () => {
      expect(parsePrice({ step: 0 }, 7).success).toBe(true)
    })
  })

  describe('combined constraints', () => {
    const constraints: BetPriceConstraints = {
      min: 100,
      max: 500,
      step: 50,
      base: 100,
    }

    it('accepts when every constraint is satisfied', () => {
      expect(parsePrice(constraints, 150).success).toBe(true)
      expect(parsePrice(constraints, 450).success).toBe(true)
    })

    it('rejects below min', () => {
      expectPriceError(constraints, 50)
    })

    it('rejects above max', () => {
      expectPriceError(constraints, 600)
    })

    it('rejects when not aligned to step', () => {
      expectPriceError(constraints, 175)
    })
  })

  describe('output shape', () => {
    it('returns price as a typed number on success', () => {
      const result = betFormSchema({}).safeParse({ price: '42' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({ price: 42 })
        expect(typeof result.data.price).toBe('number')
      }
    })
  })
})

describe('nextStepPrice', () => {
  it('returns current unchanged when step is missing', () => {
    expect(nextStepPrice(150, {})).toBe(150)
  })

  it('returns current unchanged when step is zero', () => {
    expect(nextStepPrice(150, { step: 0 })).toBe(150)
  })

  it('returns current unchanged when step is null', () => {
    expect(nextStepPrice(150, { step: null })).toBe(150)
  })

  it('snaps up to the next aligned value from base 0', () => {
    expect(nextStepPrice(150, { step: 100 })).toBe(200)
  })

  it('moves up by one step when already aligned from base 0', () => {
    expect(nextStepPrice(200, { step: 100 })).toBe(300)
  })

  it('aligns relative to a non-zero base', () => {
    expect(nextStepPrice(150, { step: 100, base: 50 })).toBe(250)
  })

  it('clamps to max when the next step would exceed it', () => {
    expect(nextStepPrice(450, { step: 100, max: 500 })).toBe(500)
  })

  it('does not exceed max when already at max', () => {
    expect(nextStepPrice(500, { step: 100, max: 500 })).toBe(500)
  })
})

describe('prevStepPrice', () => {
  it('returns current unchanged when step is missing', () => {
    expect(prevStepPrice(150, {})).toBe(150)
  })

  it('returns current unchanged when step is zero', () => {
    expect(prevStepPrice(150, { step: 0 })).toBe(150)
  })

  it('snaps down to the previous aligned value from base 0', () => {
    expect(prevStepPrice(150, { step: 100 })).toBe(100)
  })

  it('moves down by one step when already aligned from base 0', () => {
    expect(prevStepPrice(200, { step: 100 })).toBe(100)
  })

  it('aligns relative to a non-zero base', () => {
    expect(prevStepPrice(200, { step: 100, base: 50 })).toBe(150)
  })

  it('clamps to min when the previous step would undershoot it', () => {
    expect(prevStepPrice(150, { step: 100, min: 100 })).toBe(100)
  })

  it('does not undershoot min when already at min', () => {
    expect(prevStepPrice(100, { step: 100, min: 100 })).toBe(100)
  })
})
