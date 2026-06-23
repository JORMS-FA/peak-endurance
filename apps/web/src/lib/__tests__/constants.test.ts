import { describe, it, expect } from 'vitest'
import { APP_NAME, APP_VERSION, STORAGE_KEYS, THEMES, ACCENT_COLORS, LANGUAGES } from '../constants'

describe('constants', () => {
  it('exposes the app name and a semver-style version', () => {
    expect(APP_NAME).toBe('Peak Endurance')
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('exposes storage keys for theme, language and accent', () => {
    expect(STORAGE_KEYS.theme).toBe('peak-theme')
    expect(STORAGE_KEYS.language).toBe('peak-lang')
    expect(STORAGE_KEYS.accent).toBe('peak-accent')
  })

  it('THEMES contains the four supported theme modes', () => {
    expect(THEMES).toEqual(['dark', 'light', 'midnight', 'forest'])
  })

  it('ACCENT_COLORS starts with the rgb default and is unique', () => {
    expect(ACCENT_COLORS[0]).toBe('rgb')
    expect(new Set(ACCENT_COLORS).size).toBe(ACCENT_COLORS.length)
  })

  it('LANGUAGES exposes es and en', () => {
    expect(LANGUAGES.map((l) => l.value)).toEqual(['es', 'en'])
    for (const lang of LANGUAGES) {
      expect(lang.label.length).toBeGreaterThan(0)
    }
  })
})