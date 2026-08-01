export function parseOptionalBoolean(raw: string | null | undefined): boolean | undefined {
  if (raw === 'true') {
    return true
  }
  if (raw === 'false') {
    return false
  }
  return undefined
}
