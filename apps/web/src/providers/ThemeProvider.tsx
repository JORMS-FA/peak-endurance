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

// One-time migration: if the user had "green" (old default) and never
// actively picked it, switch them to "rgb" so they see the new default.
function migrateAccent() {
  const migKey = 'peak_accent_migrated_rgb'
  if (localStorage.getItem(migKey)) return
  localStorage.setItem(migKey, '1')
  const raw = localStorage.getItem(STORAGE_KEYS.accent)
  if (!raw || JSON.parse(raw) === 'green') {
    localStorage.setItem(STORAGE_KEYS.accent, JSON.stringify('rgb'))
  }
}
migrateAccent()

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
      root.style.removeProperty('--accent')
      root.style.removeProperty('--accent-hover')
      root.style.removeProperty('--accent-soft')
      root.style.removeProperty('--accent-glow')
      root.style.removeProperty('--accent-h')
      return
    }
    let h = 150
    function hslToHex(hue: number, s: number, l: number): string {
      const a = s * Math.min(l, 1 - l)
      const f = (n: number) => {
        const k = (n + hue / 30) % 12
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        return Math.round(color * 255).toString(16).padStart(2, '0')
      }
      return `#${f(0)}${f(8)}${f(4)}`
    }
    function apply() {
      const hex = hslToHex(h, 0.85, 0.56)
      const hexHover = hslToHex(h, 0.9, 0.64)
      root.style.setProperty('--accent', hex)
      root.style.setProperty('--accent-hover', hexHover)
      root.style.setProperty('--accent-soft', hex + '24')
      root.style.setProperty('--accent-glow', hex + '52')
    }
    apply()
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    const speed = Number(localStorage.getItem('peak_rgb_speed')) || 5
    const intervalMs = Math.max(20, 300 / speed)
    const id = window.setInterval(() => {
      h = (h + 3) % 360
      apply()
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [accentColor])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, language, setLanguage, accentColor, setAccentColor }),
    [theme, setTheme, language, setLanguage, accentColor, setAccentColor]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
