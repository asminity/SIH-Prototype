import { useState } from 'react'
import {
  ShieldAlert,
  Search,
  Network,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Globe,
  Wallet as WalletIcon,
  Bot,
  Flame,
  ShieldCheck,
} from 'lucide-react'
import type { Cluster } from '../../types/domain'
import { SectionCard } from '../ui/SectionCard'
import { useNavigate } from 'react-router-dom'
import { investigationStore } from '../../state/investigationStore'
import { entities, wallets, ipAddresses } from '../../data/mockData'

type SuspiciousActivityPanelProps = {
  primaryCluster: Cluster
  onToast?: (message: string) => void
}

export function SuspiciousActivityPanel({ primaryCluster, onToast }: SuspiciousActivityPanelProps) {
  const navigate = useNavigate()
  const entity = entities.find((e) => e.id === primaryCluster.entityId)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'evidence' | 'ai'>('evidence')
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [isEscalated, setIsEscalated] = useState(false)
  const [isTriaged, setIsTriaged] = useState(false)

  const handleInvestigate = () => {
    if (entity) {
      investigationStore.selectEntity(entity)
      navigate(`/entity-explorer?entity=${entity.id}`)
    }
  }

  const handleViewGraph = () => {
    if (entity) {
      investigationStore.selectEntity(entity)
    }
    investigationStore.highlightSuspiciousPath()
    navigate('/entity-graph')
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedItem(id)
    setTimeout(() => setCopiedItem(null), 1800)
    onToast?.(`Copied ${id} to clipboard`)
  }

  const handleEscalate = () => {
    setIsEscalated(true)
    onToast?.('High-priority Case #CASE-2026-42 opened for Cluster #42')
  }

  const handleTriageToggle = () => {
    setIsTriaged(!isTriaged)
    onToast?.(isTriaged ? 'Cluster #42 marked unassigned' : 'Cluster #42 marked as TRIAGED / UNDER REVIEW')
  }

  const clusterWallets = wallets.filter((w) => primaryCluster.walletIds.includes(w.id)).slice(0, 4)
  const clusterIps = ipAddresses.filter((ip) => primaryCluster.ipAddressIds.includes(ip.id)).slice(0, 4)

  return (
    <SectionCard
      eyebrow="PRIORITY SURVEILLANCE & TRIAGE"
      title="Suspicious Cluster Detected"
      className="suspicious-activity-panel"
    >
      <div className="suspicious-activity-panel__content">
        <div className="suspicious-activity-panel__primary">
          <div className="entity-highlight">
            <div className="entity-highlight__beacon">
              <ShieldAlert size={22} className="entity-highlight__icon" />
            </div>
            <div className="entity-highlight__info">
              <div className="entity-highlight__header">
                <h3>{entity?.label || primaryCluster.displayId}</h3>
                <span className="threat-pill threat-pill--critical">
                  <AlertTriangle size={11} />
                  Risk {primaryCluster.riskScore}/100 · {primaryCluster.severity}
                </span>
                <span className="threat-pill threat-pill--confidence">
                  {Math.round(primaryCluster.confidence * 100)}% Confidence
                </span>
                {isEscalated ? (
                  <span className="threat-pill threat-pill--escalated">
                    <Flame size={11} /> CASE #CASE-2026-42 OPEN
                  </span>
                ) : null}
                {isTriaged ? (
                  <span className="threat-pill threat-pill--triaged">
                    <ShieldCheck size={11} /> IN REVIEW
                  </span>
                ) : null}
              </div>
              <p className="entity-description">
                Strong observed association across {primaryCluster.transactionIds.length} linked transactions, involving {primaryCluster.walletIds.length} wallets and {primaryCluster.ipAddressIds.length} IP addresses. High velocity multi-hop dispersion detected.
              </p>
              <div className="entity-meta-chips">
                <button
                  type="button"
                  className={`meta-chip meta-chip--interactive ${isExpanded && activeTab === 'evidence' ? 'meta-chip--active' : ''}`}
                  onClick={() => {
                    setIsExpanded(true)
                    setActiveTab('evidence')
                  }}
                  title="Inspect linked transactions"
                >
                  <strong>{primaryCluster.transactionIds.length}</strong> Transactions
                </button>
                <button
                  type="button"
                  className={`meta-chip meta-chip--interactive ${isExpanded && activeTab === 'evidence' ? 'meta-chip--active' : ''}`}
                  onClick={() => {
                    setIsExpanded(true)
                    setActiveTab('evidence')
                  }}
                  title="Inspect linked wallets"
                >
                  <strong>{primaryCluster.walletIds.length}</strong> Wallets
                </button>
                <button
                  type="button"
                  className={`meta-chip meta-chip--interactive ${isExpanded && activeTab === 'evidence' ? 'meta-chip--active' : ''}`}
                  onClick={() => {
                    setIsExpanded(true)
                    setActiveTab('evidence')
                  }}
                  title="Inspect relay IP addresses"
                >
                  <strong>{primaryCluster.ipAddressIds.length}</strong> IP Relays
                </button>
                <span className="meta-chip meta-chip--alert">Seed Hub #42</span>
                <button
                  type="button"
                  className={`meta-chip meta-chip--ai ${isExpanded && activeTab === 'ai' ? 'meta-chip--active' : ''}`}
                  onClick={() => {
                    setIsExpanded(true)
                    setActiveTab('ai')
                  }}
                  title="View AI Threat Analysis"
                >
                  <Bot size={11} /> AI Synthesis
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="suspicious-activity-panel__actions">
          <button
            className="button button--secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            title="Inspect Indicators and Relays"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>{isExpanded ? 'Hide Intel Brief' : 'Inspect Evidence'}</span>
          </button>
          <button
            className={`button ${isTriaged ? 'button--outline' : 'button--secondary'}`}
            onClick={handleTriageToggle}
            type="button"
            title="Toggle review status"
          >
            <ShieldCheck size={14} />
            <span>{isTriaged ? 'In Review' : 'Triage'}</span>
          </button>
          <button
            className={`button ${isEscalated ? 'button--outline' : 'button--amber'}`}
            onClick={handleEscalate}
            type="button"
            disabled={isEscalated}
          >
            <Flame size={14} />
            <span>{isEscalated ? 'Case Active' : 'Escalate to Case'}</span>
          </button>
          <button className="button button--primary" onClick={handleInvestigate} type="button">
            <Search size={14} />
            <span>Investigate</span>
          </button>
          <button className="button button--secondary" onClick={handleViewGraph} type="button">
            <Network size={14} />
            <span>View Graph</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {isExpanded ? (
        <div className="cluster-expansion">
          <div className="cluster-expansion__tabs">
            <button
              type="button"
              className={`cluster-tab ${activeTab === 'evidence' ? 'cluster-tab--active' : ''}`}
              onClick={() => setActiveTab('evidence')}
            >
              <Network size={13} />
              <span>Observable Relays & Wallets</span>
            </button>
            <button
              type="button"
              className={`cluster-tab ${activeTab === 'ai' ? 'cluster-tab--active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              <Bot size={13} />
              <span>AI Behavioral Synthesis</span>
            </button>
          </div>

          {activeTab === 'evidence' ? (
            <div className="cluster-evidence-grid">
              <div className="cluster-evidence-col">
                <div className="evidence-col-title">
                  <WalletIcon size={13} />
                  <span>Key Associated Wallets ({primaryCluster.walletIds.length})</span>
                </div>
                <div className="evidence-list">
                  {clusterWallets.map((w) => (
                    <div className="evidence-item" key={w.id}>
                      <div className="evidence-item__main">
                        <span className="evidence-item__id">{w.id.replace('wallet_', 'W-')}</span>
                        <code className="evidence-item__addr" title={w.address}>
                          {w.address.slice(0, 8)}...{w.address.slice(-6)}
                        </code>
                        <span className="evidence-item__risk">{w.riskSignal}</span>
                      </div>
                      <div className="evidence-item__actions">
                        <button
                          type="button"
                          className="icon-button icon-button--small"
                          onClick={() => handleCopy(w.address, w.id)}
                          title="Copy Wallet Address"
                        >
                          {copiedItem === w.id ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                        </button>
                        <button
                          type="button"
                          className="evidence-item__link"
                          onClick={() => {
                            investigationStore.selectWallet(w)
                            navigate(`/entity-explorer?entity=${entity?.id || ''}`)
                          }}
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cluster-evidence-col">
                <div className="evidence-col-title">
                  <Globe size={13} />
                  <span>Observed IP Relays ({primaryCluster.ipAddressIds.length})</span>
                </div>
                <div className="evidence-list">
                  {clusterIps.map((ip) => (
                    <div className="evidence-item" key={ip.id}>
                      <div className="evidence-item__main">
                        <span className="evidence-item__id">{ip.country}</span>
                        <code className="evidence-item__addr">{ip.address}</code>
                        <span className="evidence-item__asn">{ip.asn}</span>
                      </div>
                      <div className="evidence-item__actions">
                        <button
                          type="button"
                          className="icon-button icon-button--small"
                          onClick={() => handleCopy(ip.address, ip.id)}
                          title="Copy IP Address"
                        >
                          {copiedItem === ip.id ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                        </button>
                        <button
                          type="button"
                          className="evidence-item__link"
                          onClick={() => {
                            investigationStore.selectIp(ip)
                            navigate('/network-activity')
                          }}
                        >
                          Trace
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="cluster-ai-brief">
              <div className="cluster-ai-brief__header">
                <span className="cluster-ai-brief__tag">ANOMALY FINGERPRINT: MULTI-HOP PEELING CHAIN</span>
                <span className="cluster-ai-brief__confidence">Attribution: 94.2% high confidence</span>
              </div>
              <p>
                Deterministic heuristic models detected an automated peeling sequence emanating from Seed Hub #42.
                Funds are routed across 14 high-dispersion intermediary addresses within 4 blocks (approx. 38 minutes),
                concurring with Tor exit relays ({clusterIps[0]?.address || '185.220.101.42'}) and high-risk European bulletproof hosting autonomous systems.
              </p>
              <div className="cluster-ai-brief__recommendations">
                <strong>RECOMMENDED ANALYST ACTION:</strong>
                <ul>
                  <li>Freeze egress monitoring on downstream exchange deposit addresses.</li>
                  <li>Initiate taint analysis correlation against known Darknet mixer seeds.</li>
                  <li>Request ASN subscriber telemetry for Quintex Alliance AS60729.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </SectionCard>
  )
}
