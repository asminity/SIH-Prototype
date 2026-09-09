import { AlertTriangle, Gauge } from 'lucide-react'
import type { RiskLevelDefinition } from '../../types/domain'

type RiskLevelDefinitionsProps = {
  definitions: RiskLevelDefinition[]
  selected: string
}

export function RiskLevelDefinitions({ definitions, selected }: RiskLevelDefinitionsProps) {
  return (
    <div className="risk-level-card">
      <div className="risk-level-card__header">
        <div className="risk-level-card__title">
          <Gauge size={17} className="text-cyan" />
          <span>GOVERNANCE RISK TIERS & THRESHOLDS</span>
        </div>
        <span className="risk-level-card__badge">TIER MATRIX</span>
      </div>

      <div className="risk-tier-spectrum">
        <div className="spectrum-segment spectrum-segment--low">LOW (0–24)</div>
        <div className="spectrum-segment spectrum-segment--med">MED (25–49)</div>
        <div className="spectrum-segment spectrum-segment--high">HIGH (50–79)</div>
        <div className="spectrum-segment spectrum-segment--crit">CRITICAL (80–100)</div>
      </div>

      <div className="risk-level-list">
        {definitions.map((def) => {
          const isCurrent = selected.toUpperCase() === def.level.toUpperCase()
          return (
            <div
              key={def.level}
              className={`risk-level-row risk-level-row--${def.level.toLowerCase()} ${
                isCurrent ? 'risk-level-row--active' : ''
              }`}
            >
              <div className="level-indicator">
                <span className="level-dot" />
              </div>

              <div className="level-content">
                <div className="level-top">
                  <span className="level-name">{def.level}</span>
                  <span className="level-range">{def.range} PTS</span>
                  {isCurrent && (
                    <span className="level-current-badge">
                      <AlertTriangle size={11} /> CURRENT TIER
                    </span>
                  )}
                </div>
                <p className="level-desc">{def.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
