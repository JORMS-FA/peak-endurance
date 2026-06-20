import { NavLink } from 'react-router-dom'
import { CalendarDays, Dumbbell, Home, MoreHorizontal, Sparkles } from 'lucide-react'

const ICONS = {
  home: Home,
  calendar: CalendarDays,
  sparkles: Sparkles,
  dumbbell: Dumbbell,
  more: MoreHorizontal,
} as const

export const bottomNavItems = [
  { id: 'home', path: '/', icon: 'home' as const, label: 'Hoy' },
  { id: 'calendar', path: '/calendario', icon: 'calendar' as const, label: 'Plan' },
  { id: 'sessions', path: '/entrenamientos', icon: 'dumbbell' as const, label: 'Sesiones' },
  { id: 'coach', path: '/ia-coach', icon: 'sparkles' as const, label: 'Coach' },
  { id: 'more', path: '/ajustes', icon: 'more' as const, label: 'Más' },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {bottomNavItems.map((item) => {
        const Icon = ICONS[item.icon]
        return (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' is-active' : ''}`}
          >
            <Icon size={20} aria-hidden />
            <span>{item.label}</span>
            <span className="nav-dot" />
          </NavLink>
        )
      })}
    </nav>
  )
}
