import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Search, X, Settings, LogOut, Menu } from 'lucide-react'
import { useI18n } from '../../hooks/useI18n'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../lib/auth'
import { Logo } from '../ui/Logo'

export function TopBar({ onToggleSidebar, sidebarCollapsed }: { onToggleSidebar?: () => void; sidebarCollapsed?: boolean }) {
  const { t, language } = useI18n()
  const { profile, refresh } = useAuth()
  const fullName = profile?.display_name ?? 'Atleta'
  const firstName = fullName.split(' ')[0] ?? fullName
  const isEs = language === 'es'

  // Search modal state
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Notifications panel state
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Avatar dropdown menu state
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  // Open search on Ctrl+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // Close notifications on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [notifOpen])

  // Close avatar menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    if (avatarOpen) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [avatarOpen])

  async function handleSignOut() {
    setAvatarOpen(false)
    await signOut()
    await refresh()
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          {onToggleSidebar && (
            <button
              type="button"
              className="topbar-collapse-btn"
              onClick={onToggleSidebar}
              aria-label={language === 'es' ? 'Menú' : 'Menu'}
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          )}
          <Logo size={24} />
        </div>

        <div className="topbar-right">
          {/* Search button */}
          <button
            type="button"
            className="topbar-action topbar-search-btn topbar-btn-round"
            aria-label={t('search')}
            onClick={() => setSearchOpen(true)}
          >
            <Search size={22} strokeWidth={1.5} />
            <kbd className="topbar-kbd">{navigator.platform?.includes('Mac') ? '⌘K' : 'Ctrl+K'}</kbd>
          </button>

          {/* Notifications button */}
          <button
            type="button"
            className="topbar-action topbar-notif-btn topbar-btn-round"
            aria-label={t('notifications')}
            onClick={() => setNotifOpen((o) => !o)}
          >
            <Bell size={24} strokeWidth={1.5} />
            <span className="topbar-dot" />
          </button>

          {/* Avatar with dropdown menu */}
          <div className="avatar-menu-wrap" ref={avatarRef}>
            <button
              type="button"
              className="avatar-menu-btn topbar-btn-round"
              onClick={() => setAvatarOpen((o) => !o)}
              aria-label={t('settings')}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="topbar-avatar topbar-avatar-img" />
              ) : (
                <div className="topbar-avatar">{firstName.charAt(0).toUpperCase()}</div>
              )}
            </button>

            {avatarOpen && (
              <div className="avatar-menu">
                <div className="avatar-menu-header">
                  <strong>{fullName}</strong>
                  {profile?.email && <small>{profile.email}</small>}
                </div>
                <Link
                  to="/app/perfil"
                  className="avatar-menu-item"
                  onClick={() => setAvatarOpen(false)}
                >
                  <Settings size={16} strokeWidth={1.5} />
                  <span>{isEs ? 'Perfil' : 'Profile'}</span>
                </Link>
                <button
                  type="button"
                  className="avatar-menu-item"
                  onClick={handleSignOut}
                >
                  <LogOut size={16} strokeWidth={1.5} />
                  <span>{t('signOut')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Search Modal Overlay ─────────────────────────────────── */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <Search size={18} strokeWidth={1.5} className="search-modal-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="search-modal-input"
                placeholder={language === 'es' ? 'Buscar actividades, planes...' : 'Search activities, plans...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="search-modal-close"
                onClick={() => setSearchOpen(false)}
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            {searchQuery.trim() ? (
              <div className="search-modal-results">
                <p className="search-modal-empty">
                  {language === 'es' ? 'Buscando...' : 'Searching...'}
                </p>
              </div>
            ) : (
              <div className="search-modal-hints">
                <p className="search-modal-empty text-muted">
                  {language === 'es'
                    ? 'Escribe para buscar actividades, entrenamientos, o ir a una página...'
                    : 'Type to search activities, workouts, or navigate to a page...'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Notifications Panel ──────────────────────────────────── */}
      {notifOpen && (
        <div className="notif-backdrop" onClick={() => setNotifOpen(false)}>
          <div className="notif-panel" ref={notifRef} onClick={(e) => e.stopPropagation()}>
            <div className="notif-panel-header">
              <h3>{t('notifications')}</h3>
            </div>
            <div className="notif-panel-body">
              <div className="empty-state">
                <Bell size={32} strokeWidth={1.5} className="empty-icon-svg" />
                <p>{language === 'es' ? 'Sin notificaciones' : 'No notifications'}</p>
                <small className="text-muted">
                  {language === 'es'
                    ? 'Aquí aparecerán tus notificaciones cuando tengas alguna.'
                    : 'Your notifications will appear here when you have any.'}
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
