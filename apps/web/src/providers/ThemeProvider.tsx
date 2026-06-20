import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppLanguage, ThemeMode } from '../lib/types'
import { STORAGE_KEYS } from '../lib/constants'

export type ThemeContextValue = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  language: AppLanguage
  setLanguage: (lang: AppLanguage) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    loadStored(STORAGE_KEYS.theme, 'dark')
  )
  const [language, setLanguageState] = useState<AppLanguage>(() =>
    loadStored(STORAGE_KEYS.language, 'es')
  )

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t)
    localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(t))
  }, [])

  const setLanguage = useCallback((l: AppLanguage) => {
    setLanguageState(l)
    localStorage.setItem(STORAGE_KEYS.language, JSON.stringify(l))
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
  }, [language])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, language, setLanguage }),
    [theme, setTheme, language, setLanguage]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
