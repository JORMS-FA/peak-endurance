import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { TopBar } from './TopBar'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem('peak_sidebar_collapsed') === '1',
  )

  function toggle() {
    setCollapsed((c) => {
      const next = !c
      localStorage.setItem('peak_sidebar_collapsed', next ? '1' : '0')
      return next
    })
  }

  return (
    <div className={`app-shell${collapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="app-rgb-bg" aria-hidden />
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div className="app-main">
        <TopBar onToggleSidebar={toggle} sidebarCollapsed={collapsed} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
