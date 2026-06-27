import { NavLink } from 'react-router-dom'
import { Home, Dumbbell, Star, CalendarDays } from 'lucide-react'
import { mobileNav } from '../../lib/navigation'
import { useI18n } from '../../hooks/useI18n'

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  Home, Dumbbell, Star, CalendarDays,
}

export function MobileNav() {
  const { language } = useI18n()

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
            <Icon size={20} strokeWidth={2.5} />
            <span>{label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
