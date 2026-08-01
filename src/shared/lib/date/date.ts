const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const FALLBACK = '—'

const DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

function localOffsetString(): string {
  const offsetMinutes = new Date().getTimezoneOffset()
  const sign = offsetMinutes <= 0 ? '+' : '-'
  const abs = Math.abs(offsetMinutes)
  const hh = String(Math.floor(abs / 60)).padStart(2, '0')
  const mm = String(abs % 60).padStart(2, '0')
  return `${sign}${hh}:${mm}`
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

// NOTE: HTML date inputs produce YYYY-MM-DD; OpenAPI requires date-time with offset.
// `_from` fields map to start of day, `_to` fields map to end of day, both in the
// browser's local timezone so the user's intent is preserved on the server side.
export function toStartOfDayISO(date: string): string {
  if (!DATE_PATTERN.test(date)) {
    return date
  }
  return `${date}T00:00:00${localOffsetString()}`
}

export function toEndOfDayISO(date: string): string {
  if (!DATE_PATTERN.test(date)) {
    return date
  }
  return `${date}T23:59:59${localOffsetString()}`
}
