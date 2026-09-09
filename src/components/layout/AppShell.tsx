import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { TransactionDetailsDrawer } from '../transactions/TransactionDetailsDrawer'
import { EntityInvestigationPanel } from '../investigation/EntityInvestigationPanel'

export function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar />
      {isSidebarOpen ? <button className="sidebar-scrim" onClick={() => setIsSidebarOpen(false)} type="button" aria-label="Close navigation" /> : null}
      <div className="app-shell__main">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="page-container"><Outlet /></main>
        <footer className="app-footer">
          <span>BITCOIN FI / SECURE ANALYST WORKSPACE</span>
          <span>BUILD 0.1.0 / DEMONSTRATION</span>
        </footer>
      </div>
      <TransactionDetailsDrawer />
      <EntityInvestigationPanel />
    </div>
  )
}
