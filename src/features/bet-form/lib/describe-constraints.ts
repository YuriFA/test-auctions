import type { AuctionDetailVM } from '@entities/auction'
import { formatPrice } from '@shared/lib'

export function describeConstraints(vm: AuctionDetailVM): string {
  const parts: string[] = []
  if (vm.priceMin != null) {
    parts.push(`от ${formatPrice(vm.priceMin)}`)
  }
  if (vm.priceMax != null) {
    parts.push(`до ${formatPrice(vm.priceMax)}`)
  }
  if (vm.priceStep != null) {
    parts.push(`шаг ${formatPrice(vm.priceStep)}`)
  }
  return parts.length > 0 ? parts.join(' · ') : 'Без явных ограничений'
}
