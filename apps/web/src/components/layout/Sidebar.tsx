import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronLeft, Pencil } from 'lucide-react'
import { Home, CalendarDays, Dumbbell, Star, LineChart, Mountain, Plug, User } from 'lucide-react'
import { sidebarNav } from '../../lib/navigation'
import { useI18n } from '../../hooks/useI18n'

export function Sidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
  onCustomize,
}: {
  open: boolean
  collapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
  onCustomize: () => void
}) {
  const { language } = useI18n()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <aside
      ref={drawerRef}
      className={`drawer${open ? ' drawer-open' : ''}${collapsed ? ' drawer-collapsed' : ''}`}
      role="dialog"
      aria-modal={open}
      aria-label={language === 'es' ? 'Menú de navegación' : 'Navigation menu'}
    >
      <nav className="drawer-nav">
        {sidebarNav.map((item) => {
          const Icon = iconMap[item.icon]
          const label = language === 'es' ? item.label_es : item.label_en
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) => `drawer-link${isActive ? ' active' : ''}`}
              title={collapsed ? label : undefined}
              onClick={onClose}
            >
              <Icon size={22} strokeWidth={2.5} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Customize button */}
      <div className="drawer-section-divider" />
      <button
        type="button"
        className="drawer-link"
        onClick={onCustomize}
        title={collapsed ? (language === 'es' ? 'Personalizar' : 'Customize') : undefined}
      >
        <Pencil size={22} strokeWidth={2.5} />
        {!collapsed && <span>{language === 'es' ? 'Personalizar' : 'Customize'}</span>}
      </button>

      {/* Collapse toggle at bottom */}
      <div className="drawer-footer">
        <button
          type="button"
          className="drawer-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={
            collapsed
              ? language === 'es' ? 'Expandir menú' : 'Expand menu'
              : language === 'es' ? 'Colapsar menú' : 'Collapse menu'
          }
        >
          <ChevronLeft size={16} strokeWidth={1.5} className={`drawer-collapse-icon${collapsed ? ' rotated' : ''}`} />
          {!collapsed && <span>{language === 'es' ? 'Colapsar' : 'Collapse'}</span>}
        </button>
      </div>
    </aside>
  )
}

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  Home, CalendarDays, Dumbbell, Star,
  LineChart, Mountain, Plug, User,
}
