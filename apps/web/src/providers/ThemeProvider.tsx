import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AccentColor, AppLanguage, ThemeMode } from '../lib/types'
import { STORAGE_KEYS } from '../lib/constants'

export type ThemeContextValue = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  language: AppLanguage
  setLanguage: (lang: AppLanguage) => void
  accentColor: AccentColor
  setAccentColor: (color: AccentColor) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

const VALID_THEMES: ThemeMode[] = ['dark', 'light', 'midnight', 'forest']
const VALID_LANGS: AppLanguage[] = ['es', 'en']
const VALID_ACCENTS: AccentColor[] = ['rgb', 'green', 'orange', 'yellow', 'blue', 'purple', 'red', 'pink', 'cyan']

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

function loadAccentColor(): AccentColor {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.accent)
    if (!raw) return 'rgb'
    const parsed = JSON.parse(raw)
    if (VALID_ACCENTS.includes(parsed)) return parsed
    return 'rgb'
  } catch {
    return 'rgb'
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(loadTheme)
  const [language, setLanguageState] = useState<AppLanguage>(loadLanguage)
  const [accentColor, setAccentColorState] = useState<AccentColor>(loadAccentColor)

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t)
    localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(t))
  }, [])

  const setLanguage = useCallback((l: AppLanguage) => {
    setLanguageState(l)
    localStorage.setItem(STORAGE_KEYS.language, JSON.stringify(l))
  }, [])

  const setAccentColor = useCallback((c: AccentColor) => {
    setAccentColorState(c)
    localStorage.setItem(STORAGE_KEYS.accent, JSON.stringify(c))
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
  }, [language])

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor)
  }, [accentColor])

  // Drive the RGB-extreme accent by animating the hue from JS (reliable across
  // browsers, unlike pure CSS @property animation). Updates --accent-h, which
  // the [data-accent="rgb"] rule turns into the live --accent color.
  useEffect(() => {
    const root = document.documentElement
    if (accentColor !== 'rgb') {
      root.style.removeProperty('--accent-h')
      return
    }
    let h = 150
    root.style.setProperty('--accent-h', `${h}deg`)
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    const id = window.setInterval(() => {
      h = (h + 2) % 360
      root.style.setProperty('--accent-h', `${h}deg`)
    }, 70)
    return () => window.clearInterval(id)
  }, [accentColor])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, language, setLanguage, accentColor, setAccentColor }),
    [theme, setTheme, language, setLanguage, accentColor, setAccentColor]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
