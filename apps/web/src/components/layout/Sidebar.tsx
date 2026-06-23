import { NavLink, Link } from 'react-router-dom'
import {
  Home, CalendarDays, Dumbbell, Flag, Sparkles,
  LineChart, TrendingUp, Plug, Mountain, Settings, LogOut,
} from 'lucide-react'
import { sidebarNav } from '../../lib/navigation'
import { useI18n } from '../../hooks/useI18n'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../lib/auth'
import { APP_NAME } from '../../lib/constants'
import { Logo } from '../ui/Logo'

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Home, CalendarDays, Dumbbell, Flag, Sparkles,
  LineChart, TrendingUp, Plug, Mountain, Settings,
}

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const { language } = useI18n()
  const { profile, refresh } = useAuth()
  const displayName = profile?.display_name ?? 'Atleta'

  async function handleSignOut() {
    await signOut()
    await refresh()
  }

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <Link to="/app" className="sidebar-brand">
        <Logo size={34} />
        {!collapsed && <span className="brand-name">{APP_NAME}</span>}
      </Link>

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
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-profile" onClick={handleSignOut} type="button" title={collapsed ? displayName : undefined}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="avatar-sm avatar-img" />
          ) : (
            <div className="avatar-sm">{displayName.charAt(0).toUpperCase()}</div>
          )}
          {!collapsed && <span className="sidebar-profile-name">{displayName}</span>}
          {!collapsed && <LogOut size={14} />}
        </button>
        {!collapsed && (
          <div className="app-credits">
            Peak Endurance © 2026 · <a href="https://github.com/JORMS-FA" target="_blank" rel="noopener noreferrer">Jorman Fagua</a>
          </div>
        )}
      </div>
    </aside>
  )
}
