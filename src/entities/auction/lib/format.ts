// Domain-specific ru-RU formatters for the auction list and detail UIs.
//
// All formatters collapse null/undefined/bad input into the em-dash "—"
// fallback rather than throwing — the card treats them as "missing data" and
// renders the dash in place. Callers don't need to pre-check.

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

// price ÷ distance with safe handling. Distance ≤ 0 collapses to "—" because
// the route may be unknown or the value simply not provided by the DTO yet —
// rendering "0 ₽/км" would be misleading.
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
