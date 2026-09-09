import { ArrowUpRight, CheckCircle2, CircleHelp, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { RiskAssessment } from '../../types/domain'

type RiskBreakdownProps = {
  risk: RiskAssessment
}

export function RiskBreakdown({ risk }: RiskBreakdownProps) {
  const isHigh = risk.score >= 75

  return (
    <div className="risk-breakdown-card">
      <div className="risk-breakdown-card__header">
        <div className="risk-breakdown-card__title">
          <ShieldCheck size={17} className="text-cyan" />
          <span>EXPLAINABLE NEURAL ATTRIBUTION & SHAP WATERFALL</span>
        </div>
        <span className="risk-breakdown-card__tag">XAI DECOMPOSITION</span>
      </div>

      <div className="risk-breakdown-card__total">
        <div className="total-metric">
          <span>AGGREGATED THREAT SCORE</span>
          <strong className={isHigh ? 'text-red' : 'text-amber'}>
            {risk.score}
            <small> / 100 PTS</small>
          </strong>
        </div>
        <div className="total-divider" />
        <div className="total-metric">
          <span>RISK SEVERITY</span>
          <b className={`severity-tag severity-tag--${risk.severity.toLowerCase()}`}>{risk.severity}</b>
        </div>
        <div className="total-divider" />
        <div className="total-metric">
          <span>STATISTICAL CONFIDENCE</span>
          <b className="text-cyan">{Math.round(risk.confidence * 100)}%</b>
        </div>
        <div className="total-badge">
          <CheckCircle2 size={16} className="text-green" />
          <span>CONSENSUS VERIFIED</span>
        </div>
      </div>

      <div className="risk-factor-list">
        {risk.breakdown.map((factor) => {
          const percentage = Math.round((factor.points / risk.score) * 100)
          return (
            <div className="risk-factor-item" key={factor.label}>
              <div className="risk-factor-item__top">
                <span className="risk-factor-item__label">{factor.label}</span>
                <span className="risk-factor-item__points">+{factor.points} pts ({percentage}%)</span>
              </div>
              <div className="risk-factor-item__bar">
                <div
                  className="risk-factor-item__bar-inner"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="risk-factor-item__evidence">{factor.evidence}</p>
              <Link to={factor.evidencePath} className="risk-factor-item__link">
                Inspect forensic evidence <ArrowUpRight size={13} />
              </Link>
            </div>
          )
        })}
      </div>

      <div className="risk-breakdown-card__footer">
        <CircleHelp size={14} className="text-amber" />
        <span>
          Attribution weights reflect empirical simulated observations across both model branches. Final criminal
          designation requires human analyst corroboration.
        </span>
      </div>
    </div>
  )
}
