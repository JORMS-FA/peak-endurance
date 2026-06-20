export const APP_NAME = 'Peak Endurance'
export const APP_VERSION = '2.0.0'

export const STORAGE_KEYS = {
  theme: 'peak-theme',
  language: 'peak-lang',
} as const

export const THEMES = ['dark', 'light', 'midnight', 'forest'] as const
export const LANGUAGES = [
  { value: 'es' as const, label: 'Espanol' },
  { value: 'en' as const, label: 'English' },
]
