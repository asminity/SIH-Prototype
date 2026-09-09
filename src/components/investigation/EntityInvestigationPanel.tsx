import { useEffect, useState } from 'react'
import {
  X,
  AlertTriangle,
  GitBranch,
  ArrowRightLeft,
  Activity,
  Shield,
  Layers,
  ExternalLink,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useInvestigationState, investigationStore } from '../../state/investigationStore'
import { TruncatedId } from '../ui/TruncatedId'
import { clusters } from '../../data/mockData'
import './EntityInvestigationPanel.css'

export function EntityInvestigationPanel() {
  const navigate = useNavigate()
  const [isWhyFlaggedOpen, setIsWhyFlaggedOpen] = useState(true)
  const {
    isInvestigationPanelOpen,
    selectedEntity,
    selectedCluster,
    selectedWallet,
    selectedIp,
    selectedNodeId,
    highlightedPath,
  } = useInvestigationState()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isInvestigationPanelOpen) {
        investigationStore.setInvestigationPanelOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isInvestigationPanelOpen])

  if (!isInvestigationPanelOpen) return null

  const cluster = selectedCluster ?? clusters[0]
  const entity = selectedEntity

  const handleClose = () => {
    investigationStore.setInvestigationPanelOpen(false)
  }

  const handleExpandNetwork = () => {
    if (selectedNodeId) {
      investigationStore.expandNeighbors(selectedNodeId)
    } else {
      investigationStore.expandNeighbors('cluster_42')
    }
  }

  const handleHighlightPath = () => {
    if (highlightedPath.length > 0) {
      investigationStore.clearHighlightedPath()
    } else {
      investigationStore.highlightSuspiciousPath()
    }
  }

  const handleViewTransactions = () => {
    investigationStore.setActiveEntityTab('transactions')
    navigate('/transactions')
  }

  const handleOpenEntityExplorer = () => {
    navigate('/entity-explorer')
  }

  const score = cluster?.riskScore ?? 91
  const confidence = cluster?.confidence ?? 94.7
  const anomalyRate = 91.4
  const connectionCount =
    (selectedEntity?.walletIds.length ?? 14) + (selectedEntity?.ipAddressIds.length ?? 6)

  return (
    <>
      <div className="investigation-drawer-backdrop" onClick={handleClose} />
      <aside className="investigation-drawer" aria-label="Entity investigation detail panel">
        {/* Header */}
        <div className="investigation-drawer__header">
          <div className="investigation-drawer__identity">
            <span className="investigation-drawer__tag">INVESTIGATION TARGET</span>
            <h2 className="investigation-drawer__title">
              {entity?.label ?? selectedWallet?.id ?? selectedIp?.address ?? 'ENTITY-042'}
            </h2>
            <span className="investigation-drawer__subtitle">
              ID: {entity?.id ?? selectedWallet?.id ?? selectedIp?.id ?? 'entity_042'}
            </span>
          </div>
          <button
            type="button"
            className="icon-button icon-button--close"
            onClick={handleClose}
            aria-label="Close investigation panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Risk Banner */}
        <div className="investigation-drawer__risk-banner">
          <div className="risk-score-display">
            <div className="risk-score-badge">
              <AlertTriangle size={15} />
              <span>HIGH RISK</span>
            </div>
            <div className="risk-score-number">
              <strong>{score}</strong>
              <span>/ 100</span>
            </div>
          </div>

          <div className="risk-metrics-row">
            <div className="risk-metric-box">
              <span className="risk-metric-box__label">Anomaly Rate</span>
              <strong className="risk-metric-box__val">{anomalyRate}%</strong>
            </div>
            <div className="risk-metric-box">
              <span className="risk-metric-box__label">Confidence</span>
              <strong className="risk-metric-box__val">{confidence}%</strong>
            </div>
            <div className="risk-metric-box">
              <span className="risk-metric-box__label">Connections</span>
              <strong className="risk-metric-box__val">{connectionCount}</strong>
            </div>
          </div>
        </div>

        {/* AI Evidence / Dual-Branch Fusion */}
        <div className="investigation-drawer__section">
          <h3 className="investigation-drawer__section-title">
            <BrainCircuit size={14} className="text-cyan" />
            <span>AI EVIDENCE & FEATURE FUSION</span>
          </h3>
          <div className="ai-fusion-mini-card">
            <div className="ai-fusion-branches">
              <div className="ai-branch-box">
                <span className="ai-branch-label">ELLIPTIC++</span>
                <span className="ai-branch-desc">GraphSAGE / Chain</span>
                <strong className="ai-branch-score text-cyan">0.82</strong>
              </div>
              <div className="ai-branch-plus">+</div>
              <div className="ai-branch-box">
                <span className="ai-branch-label">UGRANSOME</span>
                <span className="ai-branch-desc">GraphSAGE / Network</span>
                <strong className="ai-branch-score text-amber">0.88</strong>
              </div>
            </div>
            <div className="ai-fusion-arrow">↓ Feature Fusion Layer ↓</div>
            <div className="ai-fusion-result">
              <div className="ai-fusion-result-info">
                <span className="fusion-tag">COMBINED RISK PROBABILITY</span>
                <strong>91.4% Anomaly Score</strong>
              </div>
              <span className="badge-risk-signal badge-risk-signal--critical">CRITICAL</span>
            </div>
          </div>
        </div>

        {/* Why Flagged */}
        <div className="investigation-drawer__section">
          <div
            className="investigation-drawer__section-title investigation-drawer__section-title--clickable"
            onClick={() => setIsWhyFlaggedOpen((prev) => !prev)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsWhyFlaggedOpen((prev) => !prev) }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} className="text-cyan" />
              <span>WHY FLAGGED?</span>
            </div>
            {isWhyFlaggedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
          {isWhyFlaggedOpen && (
            <ul className="flagged-signals-list">
              <li className="flagged-signal-item">
                <div className="flagged-signal-item__dot" />
                <div>
                  <strong>Multi-hop structuring behavior</strong>
                  <p>Rapid fan-out into 14 wallets within 48 hours to evade threshold detection.</p>
                </div>
              </li>
              <li className="flagged-signal-item">
                <div className="flagged-signal-item__dot" />
                <div>
                  <strong>Unusual transaction frequency</strong>
                  <p>Peaked at 27 correlated bursts overlapping automated bot scheduling.</p>
                </div>
              </li>
              <li className="flagged-signal-item">
                <div className="flagged-signal-item__dot" />
                <div>
                  <strong>Suspicious Network Association</strong>
                  <p>Observed broadcasting transactions via 6 high-risk VPN/Tor nodes (Germany/Netherlands).</p>
                </div>
              </li>
              <li className="flagged-signal-item">
                <div className="flagged-signal-item__dot" />
                <div>
                  <strong>Cross-Source AI Concordance</strong>
                  <p>Elliptic++ (0.82) and UGRansome (0.88) both classify cluster as anomalous.</p>
                </div>
              </li>
            </ul>
          )}
        </div>

        {/* Selected Wallet or IP sub-detail if active */}
        {selectedWallet && (
          <div className="investigation-drawer__section">
            <h3 className="investigation-drawer__section-title">
              <Layers size={14} className="text-cyan" />
              <span>ACTIVE WALLET NODE</span>
            </h3>
            <div className="node-detail-card">
              <div className="node-detail-row">
                <span>Address:</span>
                <TruncatedId value={selectedWallet.address} prefixLen={10} suffixLen={6} />
              </div>
              <div className="node-detail-row">
                <span>Transactions:</span>
                <strong>{selectedWallet.transactionCount} records</strong>
              </div>
              <div className="node-detail-row">
                <span>Total Volume:</span>
                <strong>{selectedWallet.totalVolumeBtc} BTC</strong>
              </div>
              <div className="node-detail-row">
                <span>Signal:</span>
                <span className="badge-risk-signal">{selectedWallet.riskSignal}</span>
              </div>
            </div>
          </div>
        )}

        {selectedIp && (
          <div className="investigation-drawer__section">
            <h3 className="investigation-drawer__section-title">
              <Activity size={14} className="text-cyan" />
              <span>ACTIVE IP NODE</span>
            </h3>
            <div className="node-detail-card">
              <div className="node-detail-row">
                <span>IP Address:</span>
                <code>{selectedIp.address}</code>
              </div>
              <div className="node-detail-row">
                <span>Provider:</span>
                <strong>{selectedIp.provider}</strong>
              </div>
              <div className="node-detail-row">
                <span>Location:</span>
                <strong>{selectedIp.country} ({selectedIp.asn})</strong>
              </div>
              <div className="node-detail-row">
                <span>Risk Signal:</span>
                <span className="badge-risk-signal">{selectedIp.riskSignal}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="investigation-drawer__actions">
          <div className="investigation-drawer__actions-row">
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleHighlightPath}
            >
              <GitBranch size={14} />
              <span>Highlight Path</span>
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleExpandNetwork}
            >
              <Layers size={14} />
              <span>Expand Network</span>
            </button>
          </div>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleViewTransactions}
          >
            <ArrowRightLeft size={14} />
            <span>View Transactions</span>
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleOpenEntityExplorer}
          >
            <span>Full Entity Workspace</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </aside>
    </>
  )
}
