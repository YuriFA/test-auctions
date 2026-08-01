import { useCallback, useEffect, useState } from 'react'

import {
  applyTheme,
  nextTheme,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type Theme,
} from './theme'

export interface UseThemeResult {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  cycleTheme: () => void
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'system'
  }
  return readStoredTheme(window.localStorage.getItem(THEME_STORAGE_KEY))
}

export function useTheme(): UseThemeResult {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(getInitialTheme()),
  )

  useEffect(() => {
    const resolved = applyTheme(theme)
    setResolvedTheme(resolved)
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') {
      return
    }
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setResolvedTheme(applyTheme('system'))
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [theme])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return
      }
      setThemeState(readStoredTheme(event.newValue))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    storeTheme(next)
  }, [])

  const cycleTheme = useCallback(() => {
    setThemeState((current) => {
      const n = nextTheme(current)
      storeTheme(n)
      return n
    })
  }, [])

  return { theme, resolvedTheme, setTheme, cycleTheme }
}
