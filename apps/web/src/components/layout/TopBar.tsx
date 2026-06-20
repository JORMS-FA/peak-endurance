import { Bell, Search, Globe } from 'lucide-react'
import { useI18n } from '../../hooks/useI18n'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { LANGUAGES } from '../../lib/constants'
import type { AppLanguage } from '../../lib/types'

export function TopBar() {
  const { t } = useI18n()
  const { profile } = useAuth()
  const { language, setLanguage } = useTheme()
  const displayName = profile?.display_name ?? 'Atleta'

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-greeting">
          {t('greeting')}, {displayName}
        </h1>
        <p className="topbar-subtitle">{t('subtitle')}</p>
      </div>
      <div className="topbar-right">
        <button type="button" className="icon-btn" aria-label={t('search')}>
          <Search size={18} />
        </button>
        <button type="button" className="icon-btn" aria-label={t('notifications')}>
          <Bell size={18} />
        </button>
        <label className="lang-switch">
          <Globe size={14} />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as AppLanguage)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </label>
        <div className="avatar-sm topbar-avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
