import { ExternalLink, X, ShieldAlert, Network, Search, Layers } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { GraphNodeDetails } from '../../types/domain'
import { investigationStore } from '../../state/investigationStore'

type GraphDetailsPanelProps = {
  details: GraphNodeDetails
  onClose: () => void
}

const shortHash = (value: string) => `${value.slice(0, 8)}...${value.slice(-6)}`
const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value))
    : 'Active observation'

export function GraphDetailsPanel({ details, onClose }: GraphDetailsPanelProps) {
  const { node } = details
  const navigate = useNavigate()

  const handleInvestigate = () => {
    if (node.type === 'TRANSACTION') {
      investigationStore.openInvestigateTx(node.id)
      navigate(`/transactions?tx=${node.id}`)
    } else if (node.type === 'WALLET' || node.type === 'ENTITY') {
      investigationStore.openInvestigateEntity(node.id)
      navigate(`/entity-explorer?entity=${node.id}`)
    } else if (node.type === 'IP_ADDRESS') {
      navigate(`/network-activity?ip=${node.id}`)
    } else {
      navigate(`/investigations?investigation=investigation_2026_0042`)
    }
  }

  const handleExpandNeighborhood = () => {
    investigationStore.expandNeighbors(node.id)
  }

  const handleViewTransactions = () => {
    if (details.relatedTransactions.length > 0) {
      navigate(`/transactions?tx=${details.relatedTransactions[0].id}`)
    } else {
      navigate('/transactions')
    }
  }

  const riskTone =
    details.riskScore >= 75
      ? 'critical'
      : details.riskScore >= 50
        ? 'warning'
        : 'operational'

  return (
    <aside className="graph-details-panel">
      {/* HEADER */}
      <div className="graph-details-panel__header">
        <div>
          <span className="graph-details-eyebrow">ENTITY INTELLIGENCE</span>
          <h2>{node.label || node.id}</h2>
        </div>
        <button onClick={onClose} type="button" className="icon-close" aria-label="Close node details">
          <X size={16} />
        </button>
      </div>

      {/* RISK & TYPE SUMMARY */}
      <div className="graph-details-summary">
        <span className={`graph-type-badge graph-type-badge--${node.type.toLowerCase()}`}>
          {node.type.replace('_', ' ')}
        </span>
        <span className={`graph-risk-pill graph-risk-pill--${riskTone}`}>
          <ShieldAlert size={13} />
          Risk {details.riskScore}/100
        </span>
        <span className="graph-confidence-pill">
          {Math.round(details.confidence * 100)}% Confidence
        </span>
      </div>

      {/* ACTION BUTTONS */}
      <div className="graph-details-actions">
        <button
          type="button"
          onClick={handleInvestigate}
          className="graph-action-btn graph-action-btn--primary"
        >
          <Search size={13} />
          <span>Investigate</span>
        </button>
        <button
          type="button"
          onClick={handleExpandNeighborhood}
          className="graph-action-btn graph-action-btn--secondary"
          title="Expand multi-hop connected relationships"
        >
          <Network size={13} />
          <span>Expand</span>
        </button>
        <button
          type="button"
          onClick={handleViewTransactions}
          className="graph-action-btn graph-action-btn--secondary"
          title="View associated blockchain transactions"
        >
          <Layers size={13} />
          <span>Transactions</span>
        </button>
      </div>

      {/* METRIC OVERVIEW */}
      <div className="graph-details-stats-grid">
        <div className="stats-box">
          <span className="stats-box__label">Transactions</span>
          <strong className="stats-box__value">{details.relatedTransactions.length}</strong>
        </div>
        <div className="stats-box">
          <span className="stats-box__label">Linked IPs</span>
          <strong className="stats-box__value">{details.relatedIps.length}</strong>
        </div>
        <div className="stats-box">
          <span className="stats-box__label">Wallets</span>
          <strong className="stats-box__value">{details.relatedWallets.length}</strong>
        </div>
        <div className="stats-box">
          <span className="stats-box__label">Entities</span>
          <strong className="stats-box__value">{details.relatedEntities.length}</strong>
        </div>
      </div>

      {/* METADATA LIST */}
      <div className="graph-detail-meta-card">
        <div className="meta-row">
          <span className="meta-label">Identifier</span>
          <span className="meta-val mono">{node.id}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">First seen</span>
          <span className="meta-val">{formatDate(details.firstSeen)}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Last seen</span>
          <span className="meta-val">{formatDate(details.lastSeen)}</span>
        </div>
      </div>

      {/* DETECTION SIGNALS / EVIDENCE */}
      <div className="graph-detail-evidence">
        <div className="evidence-header">
          <h3>Detection Signals & Evidence</h3>
          <span className="evidence-badge">{details.evidence.length}</span>
        </div>
        <div className="evidence-list">
          {details.evidence.length > 0 ? (
            details.evidence.slice(0, 5).map((item, idx) => {
              const colonIndex = item.indexOf(':')
              if (colonIndex > 0) {
                const key = item.slice(0, colonIndex).trim()
                const val = item.slice(colonIndex + 1).trim()
                return (
                  <div key={idx} className="evidence-item">
                    <span className="evidence-key">{key}</span>
                    <span className="evidence-val">{val}</span>
                  </div>
                )
              }
              return (
                <div key={idx} className="evidence-item">
                  <span className="evidence-text">{item}</span>
                </div>
              )
            })
          ) : (
            <div className="evidence-item">
              <span className="evidence-text">Baseline telemetry context within current monitoring window.</span>
            </div>
          )}
        </div>
      </div>

      {/* RELATED TRANSACTIONS PREVIEW */}
      {details.relatedTransactions.length > 0 && (
        <div className="graph-detail-section">
          <div className="section-header">
            <h4>Transactions</h4>
            <span className="section-badge">{details.relatedTransactions.length}</span>
          </div>
          <div className="graph-detail-links">
            {details.relatedTransactions.slice(0, 4).map((tx) => (
              <Link key={tx.id} to={`/transactions?tx=${tx.id}`} className="graph-link-item">
                <span className="mono">{shortHash(tx.hash)}</span>
                <span className="tx-amt">{tx.amountBtc.toFixed(3)} BTC</span>
                <ExternalLink size={11} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* RELATED WALLETS PREVIEW */}
      {details.relatedWallets.length > 0 && (
        <div className="graph-detail-section">
          <div className="section-header">
            <h4>Connected Wallets</h4>
            <span className="section-badge">{details.relatedWallets.length}</span>
          </div>
          <div className="graph-detail-links">
            {details.relatedWallets.slice(0, 4).map((w) => (
              <Link key={w.id} to={`/entity-explorer?wallet=${w.id}`} className="graph-link-item">
                <span className="mono">{shortHash(w.address)}</span>
                <span className={`badge-risk badge-risk--${w.riskSignal.toLowerCase()}`}>
                  {w.riskSignal}
                </span>
                <ExternalLink size={11} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* RELATED IPS */}
      {details.relatedIps.length > 0 && (
        <div className="graph-detail-section">
          <div className="section-header">
            <h4>Observed IP Relays</h4>
            <span className="section-badge">{details.relatedIps.length}</span>
          </div>
          <div className="graph-detail-links">
            {details.relatedIps.slice(0, 3).map((ip) => (
              <Link key={ip.id} to={`/network-activity?ip=${ip.id}`} className="graph-link-item">
                <code className="mono">{ip.address}</code>
                <span>{ip.country}</span>
                <ExternalLink size={11} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
