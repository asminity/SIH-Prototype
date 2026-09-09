import { ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navigationSections, routes } from '../../data/navigation'

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="brand-mark brand-mark--img" aria-hidden="true">
          <img src="/logo.png" alt="BlockCH-ai Logo" className="brand-logo-img" />
        </div>
        <div>
          <p className="brand-name">BlockCH-ai</p>
          <p className="brand-subtitle">INTELLIGENCE PLATFORM</p>
        </div>
      </div>

      <div className="sidebar__environment">
        <span className="sidebar__environment-dot" aria-hidden="true" />
        <span>DEMONSTRATION ENVIRONMENT</span>
      </div>

      <nav className="sidebar__nav" aria-label="Primary navigation">
        {navigationSections.map((section) => (
          <div className="nav-group" key={section}>
            <p className="nav-group__label">{section}</p>
            {routes.filter((route) => route.section === section).map((route) => {
              const Icon = route.icon
              return (
                <NavLink
                  className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
                  end={route.path === '/'}
                  key={route.path}
                  to={route.path}
                >
                  <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                  <span>{route.label}</span>
                  <ChevronRight className="nav-link__chevron" size={13} aria-hidden="true" />
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
