import { NavLink } from 'react-router-dom'
import {
  Home, CalendarDays, Dumbbell, Flag, Sparkles,
  LineChart, TrendingUp, Plug, Mountain, Settings, LogOut,
} from 'lucide-react'
import { sidebarNav } from '../../lib/navigation'
import { useI18n } from '../../hooks/useI18n'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../lib/auth'
import { APP_NAME } from '../../lib/constants'

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Home, CalendarDays, Dumbbell, Flag, Sparkles,
  LineChart, TrendingUp, Plug, Mountain, Settings,
}

export function Sidebar() {
  const { language } = useI18n()
  const { profile, refresh } = useAuth()
  const displayName = profile?.display_name ?? 'Atleta'

  async function handleSignOut() {
    await signOut()
    await refresh()
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">P</div>
        <span className="brand-name">{APP_NAME}</span>
      </div>

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
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-profile" onClick={handleSignOut} type="button">
          <div className="avatar-sm">{displayName.charAt(0).toUpperCase()}</div>
          <span className="sidebar-profile-name">{displayName}</span>
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
