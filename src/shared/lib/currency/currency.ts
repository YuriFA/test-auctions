const FALLBACK = '—'

const PRICE_NUMBER = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
})

const PRICE_PER_KM_NUMBER = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
})

export function formatPrice(value: number | null | undefined): string {
  if (value == null) {
    return FALLBACK
  }
  return `${PRICE_NUMBER.format(value)} ₽`
}

export function formatPricePerKm(value: number | null | undefined): string {
  if (value == null) {
    return FALLBACK
  }
  return `${PRICE_PER_KM_NUMBER.format(value)} ₽/км`
}
