export type Theme = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'

export const THEME_CYCLE: readonly Theme[] = ['system', 'light', 'dark'] as const

export function isTheme(value: unknown): value is Theme {
  return value === 'system' || value === 'light' || value === 'dark'
}

export function readStoredTheme(raw: string | null | undefined): Theme {
  return isTheme(raw) ? raw : 'system'
}

export function nextTheme(current: Theme): Theme {
  const idx = THEME_CYCLE.indexOf(current)
  return THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]!
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme
}

export function applyTheme(theme: Theme): ResolvedTheme {
  const resolved = resolveTheme(theme)
  const root = document.documentElement
  if (root.classList.contains('dark') === (resolved === 'dark')) {
    return resolved
  }

  const apply = () => root.classList.toggle('dark', resolved === 'dark')
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!prefersReducedMotion && typeof document.startViewTransition === 'function') {
    document.startViewTransition(apply)
  } else {
    apply()
  }

  return resolved
}

export function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // ignore: private mode / quota / disabled storage
  }
}
