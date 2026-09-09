import { useEffect } from 'react'
import {
  X,
  ArrowRightLeft,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Wallet as WalletIcon,
  GitBranch,
  Layers,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useInvestigationState, investigationStore } from '../../state/investigationStore'
import { TruncatedId } from '../ui/TruncatedId'
import { wallets } from '../../data/mockData'
import './TransactionDetailsDrawer.css'
import '../investigation/EntityInvestigationPanel.css'

export function TransactionDetailsDrawer() {
  const navigate = useNavigate()
  const { isTransactionDrawerOpen, selectedTransaction } = useInvestigationState()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTransactionDrawerOpen) {
        investigationStore.setTransactionDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTransactionDrawerOpen])

  if (!isTransactionDrawerOpen || !selectedTransaction) return null

  const handleClose = () => {
    investigationStore.setTransactionDrawerOpen(false)
  }

  const handleInvestigateInGraph = () => {
    investigationStore.selectNode(`node_${selectedTransaction.id}`)
    investigationStore.setTransactionDrawerOpen(false)
    navigate('/entity-graph')
  }

  const inputWallet = wallets.find((w) => w.id === selectedTransaction.inputWalletId)
  const outputWallet = wallets.find((w) => w.id === selectedTransaction.outputWalletId)
  const isHighRisk =
    selectedTransaction.riskLevel === 'HIGH' || selectedTransaction.riskLevel === 'CRITICAL'

  return (
    <>
      <div className="investigation-drawer-backdrop" onClick={handleClose} />
      <aside className="investigation-drawer" aria-label="Transaction details drawer">
        <div className="investigation-drawer__header">
          <div className="investigation-drawer__identity">
            <span className="investigation-drawer__tag">TRANSACTION INTELLIGENCE</span>
            <h2 className="investigation-drawer__title">
              TX {selectedTransaction.hash.slice(0, 8)}
            </h2>
            <div className="investigation-drawer__hash-row">
              <TruncatedId value={selectedTransaction.hash} prefixLen={12} suffixLen={8} />
            </div>
          </div>
          <button
            type="button"
            className="icon-button icon-button--close"
            onClick={handleClose}
            aria-label="Close transaction drawer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="investigation-drawer__risk-banner">
          <div className="risk-score-display">
            <div
              className={`risk-score-badge ${
                isHighRisk ? 'risk-score-badge--high' : 'risk-score-badge--normal'
              }`}
            >
              {isHighRisk ? <AlertTriangle size={15} /> : <ShieldCheck size={15} />}
              <span>{selectedTransaction.riskLevel} RISK</span>
            </div>
            <div className="risk-score-number">
              <strong>{selectedTransaction.amountBtc}</strong>
              <span>BTC</span>
            </div>
          </div>

          <div className="risk-metrics-row">
            <div className="risk-metric-box">
              <span className="risk-metric-box__label">Fee (BTC)</span>
              <strong className="risk-metric-box__val">{selectedTransaction.feeBtc}</strong>
            </div>
            <div className="risk-metric-box">
              <span className="risk-metric-box__label">Block Height</span>
              <strong className="risk-metric-box__val">{selectedTransaction.blockHeight}</strong>
            </div>
            <div className="risk-metric-box">
              <span className="risk-metric-box__label">Confirmations</span>
              <strong className="risk-metric-box__val">{selectedTransaction.confirmationCount}</strong>
            </div>
          </div>
        </div>

        <div className="investigation-drawer__section">
          <h3 className="investigation-drawer__section-title">
            <ArrowRightLeft size={14} className="text-cyan" />
            <span>FLOW PROVENANCE</span>
          </h3>
          <div className="tx-flow-provenance">
            <div className="tx-flow-step">
              <span className="tx-flow-step__label">INPUT ADDRESS</span>
              <div className="tx-flow-step__box">
                <WalletIcon size={14} className="text-muted" />
                <TruncatedId
                  value={inputWallet?.address ?? selectedTransaction.inputWalletId}
                  prefixLen={10}
                  suffixLen={6}
                />
              </div>
            </div>

            <div className="tx-flow-divider">
              <ArrowRightLeft size={14} className="text-cyan" />
            </div>

            <div className="tx-flow-step">
              <span className="tx-flow-step__label">OUTPUT ADDRESS</span>
              <div className="tx-flow-step__box">
                <WalletIcon size={14} className="text-muted" />
                <TruncatedId
                  value={outputWallet?.address ?? selectedTransaction.outputWalletId}
                  prefixLen={10}
                  suffixLen={6}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="investigation-drawer__section">
          <h3 className="investigation-drawer__section-title">
            <Globe size={14} className="text-cyan" />
            <span>NETWORK & CORRELATION ATTRIBUTION</span>
          </h3>
          <div className="node-detail-card">
            <div className="node-detail-row">
              <span>Timestamp:</span>
              <code className="text-muted">{selectedTransaction.timestamp}</code>
            </div>
            <div className="node-detail-row">
              <span>Entity Group:</span>
              <strong>{selectedTransaction.entityId}</strong>
            </div>
            <div className="node-detail-row">
              <span>Anomaly Rating:</span>
              <strong>{(selectedTransaction.anomalyScore * 100).toFixed(1)}%</strong>
            </div>
            <div className="node-detail-row">
              <span>Status:</span>
              <span className="badge-confirmed">{selectedTransaction.status}</span>
            </div>
          </div>
        </div>

        <div className="investigation-drawer__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleInvestigateInGraph}
          >
            <GitBranch size={14} />
            <span>Investigate in Graph</span>
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              investigationStore.selectEntity(selectedTransaction.entityId)
              navigate('/entity-explorer')
            }}
          >
            <Layers size={14} />
            <span>View Entity Profile</span>
          </button>
        </div>
      </aside>
    </>
  )
}
