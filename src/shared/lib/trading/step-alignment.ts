const STEP_EPSILON = 1e-6

export function isStepAligned(price: number, step: number, base: number): boolean {
  const drift = Math.abs(price - base)
  const remainder = drift % step
  return remainder <= STEP_EPSILON || step - remainder <= STEP_EPSILON
}
