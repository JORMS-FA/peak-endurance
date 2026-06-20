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

const VALID_THEMES: ThemeMode[] = ['dark', 'light', 'midnight', 'forest']
const VALID_LANGS: AppLanguage[] = ['es', 'en']

function loadTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.theme)
    if (!raw) return 'dark'
    const parsed = JSON.parse(raw)
    if (VALID_THEMES.includes(parsed)) return parsed
    return 'dark'
  } catch {
    return 'dark'
  }
}

function loadLanguage(): AppLanguage {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.language)
    if (!raw) return 'es'
    const parsed = JSON.parse(raw)
    if (VALID_LANGS.includes(parsed)) return parsed
    return 'es'
  } catch {
    return 'es'
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(loadTheme)
  const [language, setLanguageState] = useState<AppLanguage>(loadLanguage)

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
