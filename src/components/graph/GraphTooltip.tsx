import type { GraphNodeType, ActivityClass } from '../../types/domain'

export type TooltipData = {
  id: string
  label: string
  type: GraphNodeType
  riskScore: number
  status: ActivityClass | 'NORMAL'
  detailText?: string
  x: number
  y: number
}

export function GraphTooltip({ data }: { data: TooltipData | null }) {
  if (!data) return null

  const typeLabels: Record<GraphNodeType, string> = {
    WALLET: 'Wallet',
    TRANSACTION: 'Transaction',
    IP_ADDRESS: 'IP Address',
    CLUSTER: 'Cluster',
    ENTITY: 'Entity',
    ASN: 'Autonomous System',
    COUNTRY: 'Jurisdiction',
  }

  const statusTones: Record<string, string> = {
    HIGH_RISK: 'critical',
    SUSPICIOUS: 'warning',
    ELEVATED: 'neutral',
    NORMAL: 'operational',
    BASELINE: 'operational',
  }

  const tone = statusTones[data.status] || 'neutral'

  return (
    <div
      className="graph-tooltip"
      style={{
        left: `${data.x + 14}px`,
        top: `${data.y + 14}px`,
      }}
    >
      <div className="graph-tooltip__header">
        <span className={`graph-tooltip__badge graph-tooltip__badge--${tone}`}>
          {data.status.replace('_', ' ')}
        </span>
        <span className="graph-tooltip__type">{typeLabels[data.type] || data.type}</span>
      </div>

      <div className="graph-tooltip__title">{data.label}</div>

      <div className="graph-tooltip__grid">
        <div className="graph-tooltip__stat">
          <span className="stat-label">Risk</span>
          <strong className={`stat-val stat-val--${tone}`}>{data.riskScore}%</strong>
        </div>
        {data.detailText && (
          <div className="graph-tooltip__stat">
            <span className="stat-label">Info</span>
            <strong className="stat-val">{data.detailText}</strong>
          </div>
        )}
      </div>
    </div>
  )
}
