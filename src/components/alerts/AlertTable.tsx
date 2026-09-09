import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Alert } from '../../types/domain'
import { SeverityBadge } from '../ui/SeverityBadge'
import { SectionCard } from '../ui/SectionCard'

type AlertTableProps = {
  alerts: Alert[]
  selectedId?: string
  onSelect: (id: string) => void
}

const formatTime = (timestamp: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(timestamp))
const shortHash = (hash: string) => `${hash.slice(0, 6)}...${hash.slice(-5)}`

export function AlertTable({ alerts, selectedId, onSelect }: AlertTableProps) {
  return <SectionCard eyebrow="PRIORITIZED ANALYST QUEUE" title="AI alert register" className="alert-register"><div className="alert-register__wrap"><table className="alert-register__table"><thead><tr><th>ALERT ID</th><th>SEVERITY</th><th>ENTITY</th><th>TRANSACTION</th><th>RISK</th><th>CONFIDENCE</th><th>REASON</th><th>TIMESTAMP</th><th>STATUS</th><th /></tr></thead><tbody>{alerts.map((alert) => <tr className={alert.id === selectedId ? 'alert-register__row alert-register__row--selected' : 'alert-register__row'} key={alert.id} onClick={() => onSelect(alert.id)} tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(alert.id) }}><td className="mono-cell">{alert.id.replace('alert_', 'ALERT-')}</td><td><SeverityBadge severity={alert.severity} /></td><td><Link onClick={(event) => event.stopPropagation()} to={`/entity-explorer?entity=${alert.entityId}`}>{alert.entityId.replace('entity_', 'ENTITY-')}</Link></td><td className="mono-cell">{shortHash(alert.transactionIds[0].replace('tx_', ''))}</td><td><strong className="alert-register__risk">{alert.riskScore}</strong><small> / 100</small></td><td className="mono-cell">{Math.round(alert.confidence * 100)}%</td><td className="alert-register__reason">{alert.title}</td><td className="mono-cell">{formatTime(alert.generatedAt)}</td><td><span className={`alert-status alert-status--${alert.status.toLowerCase()}`}>{alert.status}</span></td><td><ChevronRight className="alert-register__chevron" size={14} /></td></tr>)}</tbody></table>{alerts.length === 0 ? <p className="dashboard-empty">No alerts match the current filter set.</p> : null}</div></SectionCard>
}
