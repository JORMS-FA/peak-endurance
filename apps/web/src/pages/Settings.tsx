import { useI18n } from '../hooks/useI18n'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { signOut } from '../lib/auth'
import { THEMES, LANGUAGES, ACCENT_COLORS } from '../lib/constants'
import type { AccentColor, AppLanguage, ThemeMode } from '../lib/types'
import type { I18nKey } from '../lib/i18n'

const ACCENT_HEX: Record<string, string> = {
  green: '#22c55e',
  orange: '#f97316',
  yellow: '#eab308',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  red: '#ef4444',
  pink: '#ec4899',
  cyan: '#06b6d4',
}

const ACCENT_I18N_KEYS: Record<string, I18nKey> = {
  green: 'green',
  orange: 'orange',
  yellow: 'yellow',
  blue: 'blue',
  purple: 'purple',
  red: 'red',
  pink: 'pink',
  cyan: 'cyan',
}

function isValidTheme(val: string): val is ThemeMode {
  return ['dark', 'light', 'midnight', 'forest'].includes(val)
}

function isValidLang(val: string): val is AppLanguage {
  return val === 'es' || val === 'en'
}

function isValidAccent(val: string): val is AccentColor {
  return ACCENT_COLORS.includes(val)
}

export function Settings() {
  const { t } = useI18n()
  const { theme, setTheme, language, setLanguage, accentColor, setAccentColor } = useTheme()
  const { profile, configured, refresh } = useAuth()

  async function handleSignOut() {
    await signOut()
    await refresh()
  }

  function handleThemeChange(val: string) {
    if (isValidTheme(val)) setTheme(val)
  }

  function handleLangChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (isValidLang(val)) setLanguage(val)
  }

  function handleAccentChange(val: string) {
    if (isValidAccent(val)) setAccentColor(val)
  }

  return (
    <div className="page-settings">
      <div className="page-header">
        <h2>{t('settings')}</h2>
      </div>

      {profile && (
        <section className="card settings-section">
          <h3>{t('profile')}</h3>
          <div className="settings-profile">
            <div className="avatar-lg">
              {(profile.display_name ?? 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{profile.display_name ?? 'Atleta'}</strong>
              <small>{profile.email}</small>
            </div>
          </div>
        </section>
      )}

      <section className="card settings-section">
        <h3>{t('theme')}</h3>
        <div className="theme-grid">
          {THEMES.map((th) => (
            <button
              key={th}
              type="button"
              className={`theme-option ${th === theme ? 'active' : ''}`}
              onClick={() => handleThemeChange(th)}
            >
              <div className={`theme-preview theme-preview-${th}`} />
              <span>{th === 'dark' ? t('dark') : th === 'light' ? t('light') : th === 'midnight' ? t('midnight') : t('forest')}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card settings-section">
        <h3>{t('accentColor')}</h3>
        <div className="accent-grid">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`accent-option ${color === accentColor ? 'active' : ''}`}
              onClick={() => handleAccentChange(color)}
            >
              <div
                className="accent-swatch"
                style={{ background: ACCENT_HEX[color] }}
              />
              <span>{t(ACCENT_I18N_KEYS[color] ?? 'green')}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card settings-section">
        <h3>{t('language')}</h3>
        <div className="settings-row">
          <select
            value={language}
            onChange={handleLangChange}
            className="settings-select"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="card settings-section">
        <h3>Estado del sistema</h3>
        <div className="settings-status">
          <div className="status-row">
            <span>Supabase</span>
            <span className={`status-badge ${configured ? 'success' : 'warning'}`}>
              {configured ? t('connected') : t('notConfigured')}
            </span>
          </div>
          <div className="status-row">
            <span>Strava</span>
            <span className="status-badge warning">{t('disconnected')}</span>
          </div>
        </div>
      </section>

      <button type="button" className="btn-danger" onClick={handleSignOut}>
        {t('signOut')}
      </button>
    </div>
  )
}
