import type { ReactNode } from 'react'

type MetricCardProps = {
  label: string
  value: string
  detail?: string
  icon: ReactNode
  tone?: 'default' | 'amber' | 'green' | 'red' | 'cyan'
  isActive?: boolean
  onClick?: () => void
  badge?: string
}

export function MetricCard({ label, value, detail, icon, tone = 'default', isActive, onClick, badge }: MetricCardProps) {
  return (
    <article 
      className={`metric-card metric-card--${tone} ${isActive ? 'metric-card--active' : ''} ${onClick ? 'metric-card--clickable' : ''}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="metric-card__topline">
        <span className="metric-card__label">{label}</span>
        <span className="metric-card__icon">{icon}</span>
      </div>
      <div className="metric-card__value-row">
        <strong>{value}</strong>
        {badge ? <span className={`metric-card__badge metric-card__badge--${tone}`}>{badge}</span> : null}
      </div>
      {detail ? <span className="metric-card__detail">{detail}</span> : null}
      {isActive ? <div className="metric-card__active-bar" aria-hidden="true" /> : null}
    </article>
  )
}
