import { formatPrice } from '@shared/lib'

import type { BetPriceConstraints } from './bet-form-schema'

export function describeConstraints(
  constraints: Pick<BetPriceConstraints, 'min' | 'max' | 'step'>,
): string {
  const parts: string[] = []
  if (constraints.min != null) {
    parts.push(`от ${formatPrice(constraints.min)}`)
  }
  if (constraints.max != null) {
    parts.push(`до ${formatPrice(constraints.max)}`)
  }
  if (constraints.step != null) {
    parts.push(`шаг ${formatPrice(constraints.step)}`)
  }
  return parts.length > 0 ? parts.join(' · ') : 'Без явных ограничений'
}
