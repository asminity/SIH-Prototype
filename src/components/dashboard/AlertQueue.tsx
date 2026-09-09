import { useState, useMemo } from 'react'
import {
  ArrowUpRight,
  ExternalLink,
  Search,
  CheckCircle2,
  ShieldAlert,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { Alert } from '../../types/domain'
import { SeverityBadge } from '../ui/SeverityBadge'
import { SectionCard } from '../ui/SectionCard'
import { investigationStore } from '../../state/investigationStore'

type AlertQueueProps = {
  alerts: Alert[]
  onToast?: (msg: string) => void
}

const shortHash = (hash: string) => `${hash.slice(0, 10)}...${hash.slice(-6)}`

export function AlertQueue({ alerts, onToast }: AlertQueueProps) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL')
  const [sortBy, setSortBy] = useState<'risk' | 'confidence'>('risk')
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set())
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null)

  const filteredAlerts = useMemo(() => {
    return alerts
      .filter((alert) => {
        if (severityFilter !== 'ALL' && alert.severity !== severityFilter) return false
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase()
          return (
            alert.title.toLowerCase().includes(term) ||
            alert.id.toLowerCase().includes(term) ||
            alert.entityId.toLowerCase().includes(term) ||
            alert.description.toLowerCase().includes(term)
          )
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'risk') return b.riskScore - a.riskScore
        return b.confidence - a.confidence
      })
  }, [alerts, severityFilter, searchTerm, sortBy])

  const toggleAcknowledge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setAcknowledgedAlerts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        onToast?.(`Alert ${id.replace('alert_', 'ALERT-')} marked unresolved`)
      } else {
        next.add(id)
        onToast?.(`Alert ${id.replace('alert_', 'ALERT-')} acknowledged by Analyst R-04`)
      }
      return next
    })
  }

  const handleInspectEntity = (entityId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    investigationStore.selectEntity(entityId)
    navigate(`/entity-explorer?entity=${entityId}`)
  }

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length
  const highCount = alerts.filter((a) => a.severity === 'HIGH').length

  return (
    <SectionCard
      eyebrow="ANALYST QUEUE"
      title="High Priority Alerts"
      className="alert-queue"
      actions={
        <div className="alert-queue-controls">
          <div className="alert-queue-search">
            <Search size={13} />
            <input
              type="text"
              placeholder="Filter alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="alert-queue-tabs">
            <button
              type="button"
              className={`queue-tab ${severityFilter === 'ALL' ? 'queue-tab--active' : ''}`}
              onClick={() => setSeverityFilter('ALL')}
            >
              All ({alerts.length})
            </button>
            <button
              type="button"
              className={`queue-tab queue-tab--critical ${severityFilter === 'CRITICAL' ? 'queue-tab--active' : ''}`}
              onClick={() => setSeverityFilter('CRITICAL')}
            >
              Critical ({criticalCount})
            </button>
            <button
              type="button"
              className={`queue-tab queue-tab--high ${severityFilter === 'HIGH' ? 'queue-tab--active' : ''}`}
              onClick={() => setSeverityFilter('HIGH')}
            >
              High ({highCount})
            </button>
            <button
              type="button"
              className="queue-tab"
              onClick={() => setSortBy(sortBy === 'risk' ? 'confidence' : 'risk')}
              title={`Sorting by ${sortBy === 'risk' ? 'Risk Score' : 'Confidence'}. Click to toggle.`}
            >
              <ArrowUpDown size={11} />
              <span>{sortBy === 'risk' ? 'Risk' : 'Conf'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="alert-list">
        {filteredAlerts.length === 0 ? (
          <div className="dashboard-empty-queue">
            <ShieldAlert size={28} className="text-dim" />
            <p>No alerts match your filter criteria.</p>
            {(searchTerm || severityFilter !== 'ALL') && (
              <button
                type="button"
                className="button button--secondary"
                onClick={() => {
                  setSearchTerm('')
                  setSeverityFilter('ALL')
                }}
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isAck = acknowledgedAlerts.has(alert.id)
            const isExpanded = expandedAlertId === alert.id

            return (
              <article
                className={`alert-row ${isAck ? 'alert-row--acknowledged' : ''} ${isExpanded ? 'alert-row--expanded' : ''}`}
                key={alert.id}
              >
                <div className="alert-row__main">
                  <div className="alert-row__identity">
                    <span className="alert-row__id">{alert.id.replace('alert_', 'ALERT-')}</span>
                    <SeverityBadge severity={alert.severity} />
                    {isAck ? (
                      <span className="alert-ack-pill">
                        <CheckCircle2 size={11} /> ACKNOWLEDGED
                      </span>
                    ) : null}
                  </div>
                  <div className="alert-row__title-wrap">
                    <Link className="alert-row__title" to={`/investigations?alert=${alert.id}`}>
                      {alert.title}
                    </Link>
                  </div>
                  <p>{alert.description}</p>
                  <div className="alert-row__links">
                    <button
                      type="button"
                      className="alert-entity-btn"
                      onClick={(e) => handleInspectEntity(alert.entityId, e)}
                      title="Inspect this entity"
                    >
                      Entity {alert.entityId.replace('entity_', 'ENTITY-')}
                    </button>
                    {alert.transactionIds[0] ? (
                      <Link to={`/transactions?transaction=${alert.transactionIds[0]}`}>
                        TX {shortHash(alert.transactionIds[0].replace('tx_', ''))}
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      className="alert-entity-btn"
                      onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                    >
                      {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      <span>{isExpanded ? 'Hide Brief' : 'Details'}</span>
                    </button>
                  </div>

                  {isExpanded ? (
                    <div className="alert-expanded-brief">
                      <span><strong>Cluster ID:</strong> {alert.clusterId || 'Cluster #42'}</span>
                      <span><strong>Linked TXs:</strong> {alert.transactionIds.length} observations</span>
                      <span><strong>Confidence:</strong> {Math.round(alert.confidence * 100)}% algorithmic</span>
                    </div>
                  ) : null}
                </div>

                <div className="alert-row__score">
                  <strong className={alert.riskScore >= 85 ? 'text-red' : 'text-amber'}>
                    {alert.riskScore}
                  </strong>
                  <span>RISK / 100</span>
                  <small>{Math.round(alert.confidence * 100)}% conf.</small>
                </div>

                <div className="alert-row__actions">
                  <button
                    type="button"
                    className={`alert-ack-btn ${isAck ? 'alert-ack-btn--active' : ''}`}
                    onClick={(e) => toggleAcknowledge(alert.id, e)}
                    title={isAck ? 'Mark unreviewed' : 'Acknowledge alert'}
                  >
                    <CheckCircle2 size={13} />
                    <span>{isAck ? 'Acked' : 'Triage'}</span>
                  </button>
                  <Link className="outline-action" to={`/investigations?alert=${alert.id}`}>
                    Investigate
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </article>
            )
          })
        )}
      </div>

      <div className="alert-queue__footer">
        <span className="alert-queue__count">
          Showing {filteredAlerts.length} of {alerts.length} prioritized signals
        </span>
        <Link className="section-link" to="/ai-alerts">
          Open full alert register
          <ExternalLink size={13} />
        </Link>
      </div>
    </SectionCard>
  )
}
