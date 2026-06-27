import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, X, Settings, LogOut, Menu, ArrowRight, CheckCheck, Activity, Calendar, Dumbbell } from 'lucide-react'
import { SearchIcon } from '../ui/icons/SearchIcon'
import { useI18n } from '../../hooks/useI18n'
import { useAuth } from '../../hooks/useAuth'
import { useSearch } from '../../hooks/useSearch'
import type { SearchResultItem } from '../../hooks/useSearch'
import { signOut } from '../../lib/auth'
import { Logo } from '../ui/Logo'
import { mockNotifications } from '../../lib/notificationsMock'

const NOTIF_STORAGE_KEY = 'peak_notifications_read'
const NOTIF_CHANGE_EVENT = 'peak:notifications-changed'

function getUnreadCount(): number {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY)
    const readIds: string[] = raw ? JSON.parse(raw) : []
    const readSet = new Set(readIds)
    return mockNotifications.filter((n) => !n.read && !readSet.has(n.id)).length
  } catch {
    return mockNotifications.filter((n) => !n.read).length
  }
}

function GroupIcon({ type }: { type: string }) {
  switch (type) {
    case 'page': return <SearchIcon size={12} />
    case 'activity': return <Activity size={12} />
    case 'session': return <Calendar size={12} />
    default: return <SearchIcon size={12} />
  }
}

function ResultIcon({ type }: { type: string }) {
  switch (type) {
    case 'page': return <SearchIcon size={14} />
    case 'activity': return <Dumbbell size={14} />
    case 'session': return <Calendar size={14} />
    default: return <SearchIcon size={14} />
  }
}

function groupResults(items: SearchResultItem[]): { type: string; label: string; items: SearchResultItem[] }[] {
  const groups: Record<string, SearchResultItem[]> = {}
  for (const item of items) {
    if (!groups[item.type]) groups[item.type] = []
    groups[item.type].push(item)
  }
  return Object.entries(groups).map(([type, typeItems]) => ({
    type,
    label: type === 'page' ? 'Páginas' : type === 'activity' ? 'Actividades' : 'Sesiones',
    items: typeItems,
  }))
}

export function TopBar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { t, language } = useI18n()
  const { profile, refresh } = useAuth()
  const navigate = useNavigate()
  const fullName = profile?.display_name ?? 'Atleta'
  const firstName = fullName.split(' ')[0] ?? fullName
  const isEs = language === 'es'

  // Responsive detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 640)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Search modal state
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchListRef = useRef<HTMLDivElement>(null)
  const { results: searchResults, loading: searchLoading } = useSearch(searchQuery)
  const [selectedIdx, setSelectedIdx] = useState(-1)

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

  // Subscriber check from real profile data
  const tier = profile?.subscription_tier ?? null
  const isSubscriber = tier === 'pro' || tier === 'premium'

  // Unread notifications count — synced with localStorage
  const [unreadCount, setUnreadCount] = useState(getUnreadCount)
  const refreshUnread = useCallback(() => setUnreadCount(getUnreadCount()), [])
  useEffect(() => {
    window.addEventListener(NOTIF_CHANGE_EVENT, refreshUnread)
    return () => window.removeEventListener(NOTIF_CHANGE_EVENT, refreshUnread)
  }, [refreshUnread])

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="topbar-collapse-btn"
            onClick={onToggleSidebar}
            aria-label={language === 'es' ? 'Menú' : 'Menu'}
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className="topbar-logo-btn"
            onClick={onToggleSidebar}
            aria-label={language === 'es' ? 'Abrir menú' : 'Open menu'}
          >
            <Logo size={36} />
          </button>

          <span className="brand-name">PEAK ENDURANCE</span>
        </div>

        <div className="topbar-right">
          {/* Search button */}
          <button
            type="button"
            className="topbar-action topbar-search-btn topbar-btn-round"
            aria-label={t('search')}
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon size={40} />
            <kbd className="topbar-kbd">{navigator.platform?.includes('Mac') ? '⌘K' : 'Ctrl+K'}</kbd>
          </button>

          {/* Notifications button */}
          <div className="avatar-menu-wrap" ref={notifRef}>
            <button
              type="button"
              className="topbar-action topbar-notif-btn topbar-btn-round"
              aria-label={t('notifications')}
              onClick={() => {
                if (isMobile) {
                  navigate('/app/notificaciones')
                } else {
                  setNotifOpen((o) => !o)
                }
              }}
            >
              <Bell size={24} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <span className="notif-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Desktop dropdown */}
            {!isMobile && notifOpen && (
              <div className="notif-dropdown">
                <div className="notif-dropdown-header">
                  <h3>{t('notifications')}</h3>
                  <Link
                    to="/app/notificaciones"
                    className="notif-dropdown-view-all"
                    onClick={() => setNotifOpen(false)}
                  >
                    {isEs ? 'Ver todas' : 'View all'}
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </Link>
                </div>
                <div className="notif-dropdown-list">
                  {mockNotifications.length === 0 ? (
                    <div className="notif-dropdown-empty">
                      <Bell size={24} strokeWidth={1.5} />
                      <span>{isEs ? 'Sin notificaciones' : 'No notifications'}</span>
                    </div>
                  ) : (
                    mockNotifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        className={`notif-dropdown-item${notif.read ? '' : ' unread'}`}
                      >
                        <div className="notif-dropdown-item-icon">
                          {notif.read ? (
                            <CheckCheck size={12} strokeWidth={1.5} className="notif-read-icon" />
                          ) : (
                            <span className="notif-unread-dot" />
                          )}
                        </div>
                        <div className="notif-dropdown-item-body">
                          <div className="notif-dropdown-item-top">
                            <span className="notif-item-title">{notif.title}</span>
                            <span className="notif-item-time">{notif.time}</span>
                          </div>
                          <p className="notif-item-desc">{notif.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar with dropdown menu */}
          <div className="avatar-menu-wrap" ref={avatarRef}>
            <button
              type="button"
              className="avatar-menu-btn topbar-btn-round"
              onClick={() => setAvatarOpen((o) => !o)}
              aria-label={t('settings')}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className={`topbar-avatar topbar-avatar-img${isSubscriber ? ' subscriber' : ''}`}
                />
              ) : (
                <div className={`topbar-avatar${isSubscriber ? ' subscriber' : ''}`}>
                  {firstName.charAt(0).toUpperCase()}
                </div>
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
              <SearchIcon size={18} className="search-modal-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="search-modal-input"
                placeholder={language === 'es' ? 'Buscar actividades, planes...' : 'Search activities, plans...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSelectedIdx(-1)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setSelectedIdx((prev) => Math.min(prev + 1, searchResults.length - 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setSelectedIdx((prev) => Math.max(prev - 1, 0))
                  } else if (e.key === 'Enter' && selectedIdx >= 0 && searchResults[selectedIdx]) {
                    e.preventDefault()
                    setSearchOpen(false)
                    navigate(searchResults[selectedIdx].path)
                  } else if (e.key === 'Escape') {
                    setSearchOpen(false)
                  }
                }}
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
              <div className="search-modal-results" ref={searchListRef}>
                {searchLoading ? (
                  <p className="search-modal-empty">
                    {language === 'es' ? 'Buscando...' : 'Searching...'}
                  </p>
                ) : searchResults.length === 0 ? (
                  <p className="search-modal-empty">
                    {language === 'es' ? 'Sin resultados' : 'No results'}
                  </p>
                ) : (
                  <div className="search-results-list">
                    {groupResults(searchResults).map((group) => (
                      <div key={group.label} className="search-group">
                        <div className="search-group-label">
                          <GroupIcon type={group.type} />
                          <span>{group.label}</span>
                        </div>
                        {group.items.map((item, idx) => {
                          const globalIdx = searchResults.indexOf(item)
                          return (
                            <button
                              key={item.id}
                              type="button"
                              className={`search-result-item${globalIdx === selectedIdx ? ' selected' : ''}`}
                              onClick={() => {
                                setSearchOpen(false)
                                navigate(item.path)
                              }}
                              onMouseEnter={() => setSelectedIdx(globalIdx)}
                            >
                              <div className="search-result-icon">
                                <ResultIcon type={item.type} />
                              </div>
                              <div className="search-result-text">
                                <span className="search-result-title">{item.label}</span>
                                {item.description && (
                                  <span className="search-result-desc">{item.description}</span>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
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

    </>
  )
}
