import { NavLink } from 'react-router-dom'
import { Home, Dumbbell, Sparkles, CalendarDays } from 'lucide-react'
import { mobileNav } from '../../lib/navigation'
import { useI18n } from '../../hooks/useI18n'
import { useAuth } from '../../hooks/useAuth'

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  Home, Dumbbell, Sparkles, CalendarDays,
}

export function MobileNav() {
  const { language } = useI18n()
  const { profile } = useAuth()
  const fullName = profile?.display_name ?? 'Atleta'
  const initial = fullName.charAt(0).toUpperCase()

  return (
    <nav className="mobile-nav">
      {mobileNav.map((item) => {
        const Icon = iconMap[item.icon] ?? Home
        const label = language === 'es' ? item.label_es : item.label_en
        return (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/app'}
            className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span>{label}</span>
          </NavLink>
        )
      })}
      <NavLink
        to="/app/ajustes"
        className={({ isActive }) => `mobile-nav-item mobile-nav-profile${isActive ? ' active' : ''}`}
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="mobile-nav-avatar-img" />
        ) : (
          <span className="mobile-nav-avatar">{initial}</span>
        )}
        <span>{language === 'es' ? 'Perfil' : 'Profile'}</span>
      </NavLink>
    </nav>
  )
}
