const FALLBACK = '—'

const PLAIN_NUMBER = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
})

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

export function formatDistance(value: number | null | undefined): string {
  if (value == null) {
    return FALLBACK
  }
  return `${PLAIN_NUMBER.format(value)} км`
}

export function formatLength(value: number | null | undefined): string {
  if (value == null) {
    return FALLBACK
  }
  return `${PLAIN_NUMBER.format(value)} м`
}
