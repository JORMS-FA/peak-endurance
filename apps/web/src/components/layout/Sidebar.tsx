import { NavLink, Link } from 'react-router-dom'
import {
  Home, CalendarDays, Dumbbell, Sparkles,
  LineChart, TrendingUp, Plug, Mountain, User,
  ChevronLeft,
} from 'lucide-react'
import { sidebarNav } from '../../lib/navigation'
import { useI18n } from '../../hooks/useI18n'
import { useAuth } from '../../hooks/useAuth'
import { APP_NAME } from '../../lib/constants'
import { Logo } from '../ui/Logo'

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  Home, CalendarDays, Dumbbell, Sparkles,
  LineChart, TrendingUp, Plug, Mountain, User,
}

export function Sidebar({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  const { language } = useI18n()
  const { profile } = useAuth()
  const displayName = profile?.display_name ?? 'Atleta'

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Avatar flush to top — click opens profile */}
      <div className="sidebar-avatar-flush">
        <Link
          to="/app/perfil"
          className="sidebar-avatar-flush-btn"
          title={displayName}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="sidebar-avatar-flush-img" />
          ) : (
            <div className="sidebar-avatar-flush-letter">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          {!collapsed && (
            <div className="sidebar-avatar-flush-info">
              <span className="sidebar-avatar-flush-name">{displayName}</span>
            </div>
          )}
        </Link>
      </div>

      {/* Logo + Brand */}
      <div className="sidebar-brand">
        <Logo size={34} />
        {!collapsed && <span className="brand-name">{APP_NAME}</span>}
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
