const FALLBACK = '—'

const PRICE_NUMBER = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
})

const PLAIN_NUMBER = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
})

const DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatPrice(value: number | null | undefined): string {
  if (value == null) {
    return FALLBACK
  }
  return `${PRICE_NUMBER.format(value)} ₽`
}

export function formatWeight(value: number | null | undefined): string {
  if (value == null) {
    return FALLBACK
  }
  return `${PLAIN_NUMBER.format(value)} т`
}

export function formatVolume(value: number | null | undefined): string {
  if (value == null) {
    return FALLBACK
  }
  return `${PLAIN_NUMBER.format(value)} м³`
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) {
    return FALLBACK
  }
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) {
    return FALLBACK
  }
  return DATE_FORMATTER.format(parsed)
}

// NOTE: distance ≤ 0 collapses to "—" — the route may be unknown or the value
// not provided by the DTO yet; "0 ₽/км" would mislead.
export function formatPricePerKm(
  price: number | null | undefined,
  distance: number | null | undefined,
): string {
  if (price == null || distance == null || distance <= 0) {
    return FALLBACK
  }
  const perKm = Math.floor(price / distance)
  return `${PLAIN_NUMBER.format(perKm)} ₽/км`
}
