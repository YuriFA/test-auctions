export function parseOptionalNumber(raw: string | null | undefined): number | undefined {
  if (raw == null || raw.trim() === '') {
    return undefined
  }
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}
