import { Bell, ChevronRight, Menu, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getRouteDefinition } from '../../data/navigation'
import { investigationStore, useInvestigationState } from '../../state/investigationStore'
import { NotificationCenter } from './NotificationCenter'
import { GlobalSearch } from './GlobalSearch'

type TopbarProps = {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { pathname } = useLocation()
  const route = getRouteDefinition(pathname)
  const { isGlobalSearchOpen, isNotificationOpen } = useInvestigationState()

  const currentTime = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())

  return (
    <header className="topbar">
      <div className="topbar__context">
        <button className="icon-button topbar__menu" onClick={onMenuClick} type="button" aria-label="Open navigation">
          <Menu size={18} />
        </button>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Platform</Link>
          <ChevronRight size={12} className="breadcrumb__sep" aria-hidden="true" />
          <strong className="breadcrumb__current">{route.label}</strong>
        </nav>
      </div>

      <div className="topbar__center">
        <button 
          className="topbar__search-trigger" 
          onClick={() => investigationStore.setGlobalSearchOpen(true)}
          type="button"
          aria-label="Search platform"
        >
          <Search size={14} />
          <span>Search wallet, TX, IP, entity...</span>
          <kbd>⌘K</kbd>
        </button>
      </div>

      <div className="topbar__signals">
        <div className="topbar__telemetry" title="All nodes operational · Latency <12ms">
          <span className="telemetry__dot" aria-hidden="true" />
          <span className="telemetry__status">OPERATIONAL</span>
          <span className="telemetry__divider" aria-hidden="true" />
          <span className="telemetry__time">{currentTime} UTC</span>
        </div>

        <div className="topbar__notification-container">
          <button 
            className={`icon-button icon-button--notification ${isNotificationOpen ? 'icon-button--active' : ''}`} 
            type="button" 
            aria-label="View notifications"
            onClick={() => investigationStore.setNotificationOpen(!isNotificationOpen)}
          >
            <Bell size={16} />
            <span className="notification-dot" aria-hidden="true" />
          </button>
          <NotificationCenter 
            isOpen={isNotificationOpen} 
            onClose={() => investigationStore.setNotificationOpen(false)} 
          />
        </div>
        
        <div className="analyst-badge" title="Cleared Operator · Analyst R-04">
          <div className="analyst-badge__avatar">AR</div>
          <span className="analyst-badge__name">ANALYST R-04</span>
          <span className="analyst-badge__dot" aria-hidden="true" />
        </div>
      </div>

      <GlobalSearch 
        isOpen={isGlobalSearchOpen} 
        onClose={() => investigationStore.setGlobalSearchOpen(false)} 
      />
    </header>
  )
}
