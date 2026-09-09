import { Briefcase, ArrowRight, ShieldAlert, Clock, User, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Case } from '../../types/domain'

type HighPriorityCasesProps = {
  cases: Case[]
  onToast?: (msg: string) => void
}

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))

export function HighPriorityCases({ cases, onToast }: HighPriorityCasesProps) {
  const urgentCases = cases.filter((c) => c.priority === 'URGENT' || c.status === 'OPEN').slice(0, 2)

  if (urgentCases.length === 0) return null

  return (
    <section className="dashboard-cases-section" aria-label="High Priority Escalated Cases">
      <div className="cases-section-header">
        <div className="cases-section-title">
          <Briefcase size={15} className="text-cyan" />
          <span className="cases-section-eyebrow">ESCALATED INCIDENTS &amp; LEGAL HOLDS</span>
          <span className="cases-count-badge">2 URGENT CASES ACTIVE</span>
        </div>
        <Link to="/cases" className="cases-view-all-link">
          <span>View All Cases</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      <div className="cases-grid">
        {urgentCases.map((c) => {
          const isUrgent = c.priority === 'URGENT'

          return (
            <div key={c.id} className="case-card">
              <div className="case-card__header">
                <div className="case-card__id-group">
                  <span className="case-card__tag">{c.id.replace('case_', 'CASE-')}</span>
                  <span className={`case-priority-badge ${isUrgent ? 'case-priority-badge--urgent' : ''}`}>
                    <ShieldAlert size={12} />
                    <span>{c.priority}</span>
                  </span>
                  <span className={`case-status-badge case-status-badge--${c.status.toLowerCase()}`}>
                    <span className="status-dot" />
                    <span>{c.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <span className="case-card__date">
                  <Clock size={11} />
                  <span>{formatTime(c.createdAt)}</span>
                </span>
              </div>

              <h3 className="case-card__title">{c.title}</h3>

              <div className="case-card__meta">
                <div className="case-meta-item">
                  <User size={12} />
                  <span>Assigned: <strong>{c.assignedTo}</strong></span>
                </div>
                <div className="case-meta-item">
                  <FileText size={12} />
                  <span>Evidence: <strong>{c.evidenceIds.length} artifacts</strong></span>
                </div>
              </div>

              <div className="case-card__evidence-tags">
                <span className="evidence-chip">Chain Surveillance</span>
                <span className="evidence-chip">Tor Exit Correlation</span>
                {c.id.includes('42') ? (
                  <span className="evidence-chip evidence-chip--highlight">Seed Hub #42</span>
                ) : (
                  <span className="evidence-chip evidence-chip--highlight">ShadowMix Egress</span>
                )}
              </div>

              <div className="case-card__actions">
                <Link
                  to={`/cases?case=${c.id}`}
                  className="button button--secondary button--small"
                  onClick={() => onToast?.(`Opened ${c.title}`)}
                >
                  <Briefcase size={12} />
                  <span>Open Case File</span>
                </Link>
                <Link
                  to="/reports"
                  className="case-action-sub"
                  onClick={() => onToast?.(`Accessing Case Dossier`)}
                >
                  <span>Dossier &amp; Export</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
