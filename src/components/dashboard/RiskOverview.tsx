import { useState } from 'react'
import type { DashboardRiskFilter, RiskDistribution } from '../../types/domain'
import { SectionCard } from '../ui/SectionCard'

type RiskOverviewProps = {
  distribution: RiskDistribution[]
  activeRisk?: DashboardRiskFilter
  onSelectRisk?: (risk: DashboardRiskFilter) => void
}

export function RiskOverview({ distribution, activeRisk = 'ALL', onSelectRisk }: RiskOverviewProps) {
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null)

  return (
    <SectionCard
      eyebrow="RISK POSTURE"
      title="Risk Distribution"
      className="risk-overview"
      actions={
        activeRisk !== 'ALL' ? (
          <button
            type="button"
            className="risk-overview-reset-btn"
            onClick={() => onSelectRisk?.('ALL')}
            title="Reset filter to all levels"
          >
            Reset filter
          </button>
        ) : null
      }
    >
      <div className="risk-overview__body">
        <div className="risk-overview__bar-container">
          <div className="risk-overview__bar" aria-label="Risk distribution bar">
            {distribution.map((bucket) => {
              const isSelected = activeRisk === bucket.level
              const isDimmed = (activeRisk !== 'ALL' && !isSelected) || (hoveredLevel !== null && hoveredLevel !== bucket.level)
              return (
                <button
                  type="button"
                  key={bucket.level}
                  className={`risk-segment risk-segment--${bucket.level.toLowerCase()} ${isSelected ? 'risk-segment--selected' : ''} ${isDimmed ? 'risk-segment--dimmed' : ''}`}
                  style={{ width: `${Math.max(bucket.percentage, 2)}%` }}
                  onMouseEnter={() => setHoveredLevel(bucket.level)}
                  onMouseLeave={() => setHoveredLevel(null)}
                  onClick={() => onSelectRisk?.(isSelected ? 'ALL' : (bucket.level as DashboardRiskFilter))}
                  title={`Filter by ${bucket.level}: ${bucket.count.toLocaleString()} (${bucket.percentage.toFixed(1)}%)`}
                />
              )
            })}
          </div>
          {hoveredLevel ? (
            <div className="risk-segment-tooltip">
              {distribution.find((b) => b.level === hoveredLevel)?.level}:{' '}
              {distribution.find((b) => b.level === hoveredLevel)?.count.toLocaleString()} records (
              {distribution.find((b) => b.level === hoveredLevel)?.percentage.toFixed(1)}%)
            </div>
          ) : null}
        </div>

        <div className="risk-overview__legend">
          {distribution.map((bucket) => {
            const isSelected = activeRisk === bucket.level
            return (
              <button
                type="button"
                className={`risk-legend-item ${isSelected ? 'risk-legend-item--selected' : ''}`}
                key={bucket.level}
                onClick={() => onSelectRisk?.(isSelected ? 'ALL' : (bucket.level as DashboardRiskFilter))}
                title={`Filter by ${bucket.level}`}
              >
                <span className={`risk-legend-item__marker risk-legend-item__marker--${bucket.level.toLowerCase()}`} />
                <div>
                  <strong>{bucket.level}</strong>
                  <span>{bucket.count.toLocaleString('en-US')} records</span>
                </div>
                <div className="risk-legend-item__pct">
                  <b>{bucket.percentage.toFixed(1)}%</b>
                  {isSelected ? <span className="risk-active-pill">ACTIVE</span> : null}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </SectionCard>
  )
}
