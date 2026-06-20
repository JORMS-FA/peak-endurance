import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { TopBar } from './TopBar'

export function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
