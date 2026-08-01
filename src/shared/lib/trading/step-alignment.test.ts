import { describe, expect, it } from 'vitest'

import { isStepAligned } from './step-alignment'

describe('isStepAligned', () => {
  it('returns true when price is an exact multiple of step from base 0', () => {
    expect(isStepAligned(400, 200, 0)).toBe(true)
  })

  it('returns false when price is off the step grid from base 0', () => {
    expect(isStepAligned(150, 100, 0)).toBe(false)
  })

  it('measures drift from a non-zero base, not from 0', () => {
    expect(isStepAligned(150, 100, 50)).toBe(true)
    expect(isStepAligned(250, 100, 50)).toBe(true)
    expect(isStepAligned(200, 100, 50)).toBe(false)
  })

  it('treats prices symmetrically around the base', () => {
    expect(isStepAligned(37600, 200, 42000)).toBe(true)
    expect(isStepAligned(46400, 200, 42000)).toBe(true)
    expect(isStepAligned(37500, 200, 42000)).toBe(false)
  })

  it('tolerates floating-point drift near a grid boundary', () => {
    expect(isStepAligned(0.03, 0.01, 0)).toBe(true)
  })

  it('accepts prices whose remainder is within epsilon of the full step', () => {
    const justUnderStep = 200 - 1e-9
    expect(isStepAligned(justUnderStep, 200, 0)).toBe(true)
  })
})
