import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { TopBar } from './TopBar'

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerCollapsed, setDrawerCollapsed] = useState(false)
  const [customizeMode, setCustomizeMode] = useState(false)

  return (
    <div className="app-shell">
      <div className="app-rgb-bg" aria-hidden />
      <TopBar onToggleSidebar={() => setDrawerOpen((o) => !o)} />
      <Sidebar
        open={drawerOpen}
        collapsed={drawerCollapsed}
        onClose={() => setDrawerOpen(false)}
        onToggleCollapse={() => setDrawerCollapsed((c) => !c)}
        onCustomize={() => setCustomizeMode((c) => !c)}
      />
      <div className="app-main">
        <main className="app-content">
          <Outlet context={{ customizeMode, setCustomizeMode }} />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
