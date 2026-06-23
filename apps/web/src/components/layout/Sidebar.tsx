import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, CalendarDays, Dumbbell, Sparkles,
  LineChart, TrendingUp, Plug, Mountain, LogOut,
  ChevronLeft, Settings, User, ChevronDown,
} from 'lucide-react'
import { sidebarNav } from '../../lib/navigation'
import { useI18n } from '../../hooks/useI18n'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../lib/auth'
import { APP_NAME } from '../../lib/constants'
import { Logo } from '../ui/Logo'

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  Home, CalendarDays, Dumbbell, Sparkles,
  LineChart, TrendingUp, Plug, Mountain,
}

export function Sidebar({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  const { language } = useI18n()
  const { profile, refresh } = useAuth()
  const displayName = profile?.display_name ?? 'Atleta'
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  async function handleSignOut() {
    setDropdownOpen(false)
    await signOut()
    await refresh()
  }

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Logo + Brand */}
      <div className="sidebar-brand">
        <Logo size={34} />
        {!collapsed && <span className="brand-name">{APP_NAME}</span>}
      </div>

      {/* Avatar + Dropdown at top */}
      <div className="sidebar-profile-section" ref={dropdownRef}>
        <button
          type="button"
          className="sidebar-avatar-btn"
          onClick={() => setDropdownOpen((o) => !o)}
          title={collapsed ? displayName : undefined}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="sidebar-avatar-img" />
          ) : (
            <div className="sidebar-avatar-letter">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          {!collapsed && (
            <>
              <div className="sidebar-avatar-info">
                <span className="sidebar-avatar-name">{displayName}</span>
                <span className="sidebar-avatar-role">{language === 'es' ? 'Atleta' : 'Athlete'}</span>
              </div>
              <ChevronDown size={14} className={`sidebar-chevron${dropdownOpen ? ' open' : ''}`} />
            </>
          )}
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="sidebar-dropdown">
            <NavLink
              to="/app/ajustes"
              className="sidebar-dropdown-item"
              onClick={() => setDropdownOpen(false)}
            >
              <Settings size={15} strokeWidth={1.5} />
              <span>{language === 'es' ? 'Configuración' : 'Settings'}</span>
            </NavLink>
            <div className="sidebar-dropdown-divider" />
            <button
              type="button"
              className="sidebar-dropdown-item sidebar-dropdown-danger"
              onClick={handleSignOut}
            >
              <LogOut size={15} strokeWidth={1.5} />
              <span>{language === 'es' ? 'Cerrar sesión' : 'Sign out'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {sidebarNav.map((item) => {
          const Icon = iconMap[item.icon] ?? Home
          const label = language === 'es' ? item.label_es : item.label_en
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} strokeWidth={1.5} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Collapse toggle at bottom */}
      <div className="sidebar-collapse-wrap">
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggle}
          aria-label={collapsed ? (language === 'es' ? 'Abrir menú' : 'Open menu') : (language === 'es' ? 'Cerrar menú' : 'Close menu')}
        >
          <ChevronLeft size={16} strokeWidth={1.5} className={`sidebar-collapse-icon${collapsed ? ' rotated' : ''}`} />
          {!collapsed && <span>{language === 'es' ? 'Colapsar' : 'Collapse'}</span>}
        </button>
      </div>
    </aside>
  )
}
