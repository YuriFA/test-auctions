import { isStepAligned } from '@shared/lib'
import { z } from 'zod'

export type BetPriceConstraints = {
  min?: number | null
  max?: number | null
  step?: number | null
  base?: number | null
}

export function nextStepPrice(current: number, constraints: BetPriceConstraints): number {
  const step = constraints.step
  if (step == null || step <= 0) {
    return current
  }
  const base = constraints.base ?? 0
  const max = constraints.max
  const drift = current - base
  const stepsTaken = Math.floor(drift / step)
  const candidate = base + (stepsTaken + 1) * step
  if (max != null && candidate > max) {
    return max
  }
  return candidate
}

export function prevStepPrice(current: number, constraints: BetPriceConstraints): number {
  const step = constraints.step
  if (step == null || step <= 0) {
    return current
  }
  const base = constraints.base ?? 0
  const min = constraints.min
  const drift = current - base
  const stepsTaken = Math.ceil(drift / step)
  const candidate = base + (stepsTaken - 1) * step
  if (min != null && candidate < min) {
    return min
  }
  return candidate
}

function toCoercedNumber(value: unknown): number | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') {
      return undefined
    }
    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : Number.NaN
  }
  if (typeof value === 'number') {
    return value
  }
  return Number.NaN
}

export function betFormSchema(constraints: BetPriceConstraints = {}) {
  const min = constraints.min ?? null
  const max = constraints.max ?? null
  const step = constraints.step ?? null
  const base = constraints.base ?? 0

  return z.object({
    price: z
      .any()
      .superRefine((value, ctx) => {
        if (value == null) {
          ctx.addIssue({
            code: 'custom',
            message: 'Введите цену ставки',
            path: [],
          })
          return
        }
        const num = toCoercedNumber(value)
        if (num === undefined) {
          ctx.addIssue({
            code: 'custom',
            message: 'Введите цену ставки',
            path: [],
          })
          return
        }
        if (Number.isNaN(num)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Цена должна быть числом',
            path: [],
          })
          return
        }
        if (num <= 0) {
          ctx.addIssue({
            code: 'custom',
            message: 'Цена должна быть больше 0',
            path: [],
          })
          return
        }
        if (min != null && num < min) {
          ctx.addIssue({
            code: 'custom',
            message: `Минимальная цена — ${min}`,
            path: [],
          })
          return
        }
        if (max != null && num > max) {
          ctx.addIssue({
            code: 'custom',
            message: `Максимальная цена — ${max}`,
            path: [],
          })
          return
        }
        if (step != null && step > 0 && !isStepAligned(num, step, base)) {
          ctx.addIssue({
            code: 'custom',
            message: `Шаг ставки — ${step}`,
            path: [],
          })
        }
      })
      .transform((value) => toCoercedNumber(value) as number),
  })
}

export type BetFormValues = z.infer<ReturnType<typeof betFormSchema>>
