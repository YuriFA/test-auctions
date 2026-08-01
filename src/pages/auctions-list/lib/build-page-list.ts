export type PageListEntry = number | 'ellipsis'

// NOTE: render at most 7 slots so the bar stays tappable on mobile — always
// pin first and last, show a 3-page window around the current page, and
// collapse the gaps with a single ellipsis each. Returns `ellipsis` markers
// alongside page numbers so the JSX can switch on the discriminated entry.
export function buildPageList(currentPage: number, lastPage: number): PageListEntry[] {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, i) => i + 1)
  }
  const entries: PageListEntry[] = [1]
  const windowStart = Math.max(2, currentPage - 1)
  const windowEnd = Math.min(lastPage - 1, currentPage + 1)
  if (windowStart > 2) {
    entries.push('ellipsis')
  }
  for (let p = windowStart; p <= windowEnd; p++) {
    entries.push(p)
  }
  if (windowEnd < lastPage - 1) {
    entries.push('ellipsis')
  }
  entries.push(lastPage)
  return entries
}
