import { describe, it, expect } from 'vitest'
import { t, type I18nKey } from '../i18n'

describe('i18n t()', () => {
  it('returns the Spanish translation for known keys', () => {
    expect(t('es', 'dashboard')).toBe('Inicio')
    expect(t('es', 'signIn')).toBe('Iniciar sesion')
    expect(t('es', 'connectStrava')).toBe('Conectar Strava')
  })

  it('returns the English translation for known keys', () => {
    expect(t('en', 'dashboard')).toBe('Dashboard')
    expect(t('en', 'signIn')).toBe('Sign in')
    expect(t('en', 'connectStrava')).toBe('Connect Strava')
  })

  it('returns different strings for es and en where appropriate', () => {
    const keys: I18nKey[] = ['dashboard', 'signIn', 'signOut', 'settings', 'calendar']
    for (const key of keys) {
      expect(t('es', key)).not.toBe(t('en', key))
    }
  })

  it('falls back to the key itself when the key is unknown', () => {
    const missing = 'this_key_does_not_exist' as I18nKey
    expect(t('es', missing)).toBe('this_key_does_not_exist')
    expect(t('en', missing)).toBe('this_key_does_not_exist')
  })
})