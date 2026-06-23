import { Bell, Search } from 'lucide-react'
import { useI18n } from '../../hooks/useI18n'
import { useAuth } from '../../hooks/useAuth'

export function TopBar() {
  const { t } = useI18n()
  const { profile } = useAuth()
  const fullName = profile?.display_name ?? 'Atleta'
  const firstName = fullName.split(' ')[0] ?? fullName

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-greeting">
          <span className="topbar-greeting-full">
            {t('greeting')}, {fullName}
          </span>
          <span className="topbar-greeting-short">
            {t('greeting')}, {firstName}
          </span>
        </h1>
        <p className="topbar-subtitle">{t('subtitle')}</p>
      </div>

      <div className="topbar-right">
        <button type="button" className="topbar-search" aria-label={t('search')}>
          <Search size={15} />
          <span className="topbar-search-text">{t('search')}</span>
          <kbd className="topbar-kbd">Ctrl K</kbd>
        </button>

        <button type="button" className="topbar-action" aria-label={t('notifications')}>
          <Bell size={17} />
          <span className="topbar-dot" />
        </button>

        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="topbar-avatar topbar-avatar-img" />
        ) : (
          <div className="topbar-avatar">{firstName.charAt(0).toUpperCase()}</div>
        )}
      </div>
    </header>
  )
}
