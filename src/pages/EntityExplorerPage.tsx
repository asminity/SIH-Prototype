import { useState, useMemo, useEffect } from 'react'
import {
  ArrowUpRight,
  Clock3,
  Globe2,
  ShieldAlert,
  WalletCards,
  Search,
  CheckCircle2,
  X,
  ExternalLink,
  Copy,
  Check,
  GitBranch,
  ReceiptText,
  Activity,
  Download,
  AlertTriangle,
  Building2,
  Shuffle,
  Server,
  Layers3,
  BadgeAlert,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  getEntities,
  getInvestigation,
  getTimelineEvents,
  getWallets,
  getIpAddresses,
  getTransactions,
} from '../services/mockServices'
import type { Entity, Severity } from '../types/domain'
import { MetricCard } from '../components/ui/MetricCard'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'

type EntityCategory = 'ALL' | 'THREAT' | 'EXCHANGE' | 'COMMERCIAL' | 'UNCLASSIFIED'
type ActiveTab = 'WALLETS' | 'NETWORK' | 'TRANSACTIONS' | 'FORENSICS'

const getEntityRiskScore = (entity: Entity): number => {
  if (entity.id === 'entity_066') return 98
  if (entity.id === 'entity_088') return 96
  if (entity.id === 'entity_091') return 94
  if (entity.id === 'entity_042') return 91
  if (entity.id === 'entity_008') return 76
  if (entity.id === 'entity_055') return 42
  if (entity.id === 'entity_033') return 24
  if (entity.id === 'entity_017') return 18
  if (entity.id === 'entity_024') return 15
  if (entity.id === 'entity_012') return 12
  return 30
}

const getEntitySeverity = (score: number): Severity => {
  if (score >= 90) return 'CRITICAL'
  if (score >= 70) return 'HIGH'
  if (score >= 40) return 'MEDIUM'
  return 'LOW'
}

const getEntityCategory = (entity: Entity): EntityCategory => {
  if (['entity_042', 'entity_088', 'entity_066', 'entity_091'].includes(entity.id)) return 'THREAT'
  if (['entity_017', 'entity_055'].includes(entity.id)) return 'EXCHANGE'
  if (['entity_033', 'entity_024', 'entity_012'].includes(entity.id)) return 'COMMERCIAL'
  return 'UNCLASSIFIED'
}

const getEntityJurisdiction = (entity: Entity): string => {
  if (entity.id === 'entity_012') return 'Switzerland · FINMA Regulated Vault'
  if (entity.id === 'entity_017') return 'United States / EU · FinCEN & MAS Dual Compliant'
  if (entity.id === 'entity_033') return 'Singapore · MAS Regulated Payment Provider'
  if (entity.id === 'entity_024') return 'United States · Institutional Multi-Sig Custody'
  if (entity.id === 'entity_055') return 'Bermuda / UK · Global Institutional OTC'
  if (entity.id === 'entity_088') return 'Offshore / Non-Custodial · CoinJoin Privacy Pool'
  if (entity.id === 'entity_066') return 'Hostile Jurisdiction · Ransomware Infiltration'
  if (entity.id === 'entity_091') return 'Darknet Onion Space · Illicit Escrow Nexus'
  if (entity.id === 'entity_042') return 'Multi-Jurisdictional Syndicate · Europol Tier-1 Watchlist'
  return 'Unspecified Sovereign Zone'
}

const getEntityForensicSignals = (entity: Entity): string[] => {
  if (entity.id === 'entity_042') {
    return [
      'Heuristic peel-chain dispersion across 14 monitored wallet addresses.',
      'Tor exit relay broadcasts originating from Quintex Alliance (AS60729 Frankfurt).',
      'Rapid UTXO consolidation preceding automated mixer routing.',
      'Elliptic++ model classification: 0.94 anomaly score with severe layering signature.',
    ]
  }
  if (entity.id === 'entity_088') {
    return [
      'CoinJoin equal-output dispersion with deterministic transaction sizes.',
      'M247 bulletproof proxy (AS9009 Amsterdam) and WorldStream mixing relay (AS49981).',
      'High-entropy multi-party transactions confounding standard clustering heuristics.',
      'Correlated with known illicit capital egress channels.',
    ]
  }
  if (entity.id === 'entity_066') {
    return [
      'High-velocity extortion payout consolidation from enterprise victims.',
      'Transit routed via AlexHost bulletproof infrastructure in Moldova (AS39798).',
      'Darknet exit node correlation with Saint Petersburg telemetry (AS44050).',
      'Direct correlation to LockBit 3.0 ransomware affiliate wallets.',
    ]
  }
  if (entity.id === 'entity_091') {
    return [
      'Automated marketplace vendor escrow settlement transactions.',
      'Micro-deposit aggregation followed by scheduled batch payouts.',
      'Repeated onion routing signals via offshore proxy gateways.',
    ]
  }
  if (entity.id === 'entity_017') {
    return [
      'Verified hot-wallet rebalancing matching Northstar Exchange operational schedule.',
      'Zero mixer contamination across 8,700 monitored baseline transactions.',
      'Regulated cloud infrastructure deployed on Google Cloud (AS396982) and AWS (AS16509).',
    ]
  }
  if (entity.id === 'entity_055') {
    return [
      'High-volume bilateral OTC block transfers without intermediate layering hops.',
      'Direct commercial bank wire fiat gateway settlement verification.',
      'DigitalOcean Singapore enterprise infrastructure routing.',
    ]
  }
  if (entity.id === 'entity_033') {
    return [
      'Continuous merchant checkout volume adhering to global retail commerce curves.',
      'Low anomaly score (0.04) with deterministic payment protocol compliance.',
      'Clean UTXO origins verified against FATF and OFAC screening registries.',
    ]
  }
  if (entity.id === 'entity_024') {
    return [
      'Multi-signature institutional cold storage reserve deposit sweeps.',
      'Deterministic time-locked scripts (OP_CHECKLOCKTIMEVERIFY) detected on-chain.',
      'Isolated enterprise gateway communication with strict IP whitelisting.',
    ]
  }
  if (entity.id === 'entity_012') {
    return [
      'FINMA-compliant segregated asset segregation with Swiss vault protection.',
      'Encrypted VPN tunnel routing through Private Layer INC in Zurich (AS51852).',
      'Fully audited cryptographic reserve proofs (Merkle-tree attestation).',
    ]
  }
  return [
    'Uncategorized peer-to-peer network observations pending cluster classification.',
    'Fast-flux transit nodes detected via Quasi Networks (AS202425).',
    'Low statistical confidence (0.65); recommended for active monitoring.',
  ]
}

const getEntitySectorIcon = (entity: Entity) => {
  const cat = getEntityCategory(entity)
  if (cat === 'THREAT') return <BadgeAlert size={18} />
  if (cat === 'EXCHANGE') return <Shuffle size={18} />
  if (cat === 'COMMERCIAL') return <Building2 size={18} />
  return <Layers3 size={18} />
}

export function EntityExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<EntityCategory>('ALL')
  const [activeTab, setActiveTab] = useState<ActiveTab>('WALLETS')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => setToastMessage(msg)

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  // Data lookups
  const allEntities = useMemo(() => getEntities(), [])
  const allWallets = useMemo(() => getWallets(), [])
  const allIps = useMemo(() => getIpAddresses(), [])
  const allTxs = useMemo(() => getTransactions(), [])

  // Selected Entity
  const selectedEntityId = searchParams.get('entity') ?? 'entity_042'
  const selectedEntity = useMemo(() => {
    return allEntities.find((e) => e.id === selectedEntityId) ?? allEntities[0]
  }, [allEntities, selectedEntityId])

  // Filtered entity roster
  const filteredEntities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return allEntities.filter((e) => {
      const matchesCat = activeCategory === 'ALL' || getEntityCategory(e) === activeCategory
      const matchesQuery =
        !q ||
        e.id.toLowerCase().includes(q) ||
        e.label.toLowerCase().includes(q) ||
        e.entityType.toLowerCase().includes(q) ||
        e.walletIds.some((wid) => wid.toLowerCase().includes(q))
      return matchesCat && matchesQuery
    })
  }, [allEntities, searchQuery, activeCategory])

  // Entity Details
  const entityScore = getEntityRiskScore(selectedEntity)
  const entitySeverity = getEntitySeverity(entityScore)
  const entityCategory = getEntityCategory(selectedEntity)
  const entityJurisdiction = getEntityJurisdiction(selectedEntity)
  const entitySignals = getEntityForensicSignals(selectedEntity)

  // Associated Data
  const entityWallets = useMemo(() => {
    const set = new Set(selectedEntity.walletIds)
    return allWallets.filter((w) => set.has(w.id))
  }, [allWallets, selectedEntity])

  const entityIps = useMemo(() => {
    const set = new Set(selectedEntity.ipAddressIds)
    return allIps.filter((ip) => set.has(ip.id))
  }, [allIps, selectedEntity])

  const entityTxs = useMemo(() => {
    const set = new Set(selectedEntity.transactionIds)
    return allTxs.filter((tx) => set.has(tx.id) || tx.entityId === selectedEntity.id)
  }, [allTxs, selectedEntity])

  const totalVolumeBtc = useMemo(() => {
    return entityWallets.reduce((acc, w) => acc + w.totalVolumeBtc, 0)
  }, [entityWallets])

  const investigation = selectedEntity.clusterId
    ? getInvestigation('investigation_2026_0042')
    : undefined
  const timeline = investigation ? getTimelineEvents(investigation.id) : []

  const handleSelectEntity = (id: string) => {
    setSearchParams({ entity: id })
    showToast(`Loaded dossier for ${id.replace('entity_', 'ENTITY-')}`)
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    showToast(`Copied ${label} to clipboard`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleExportDossier = () => {
    const dossier = {
      entity: selectedEntity,
      riskScore: entityScore,
      severity: entitySeverity,
      jurisdiction: entityJurisdiction,
      totalVolumeBtc: totalVolumeBtc.toFixed(2),
      wallets: entityWallets,
      ipAddresses: entityIps,
      signals: entitySignals,
      exportTimestamp: new Date().toISOString(),
    }
    const dataStr = JSON.stringify(dossier, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedEntity.id}-dossier-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast(`Exported intelligence dossier for ${selectedEntity.label}`)
  }

  return (
    <div className="entity-explorer-page">
      {/* Toast Notification HUD */}
      {toastMessage && (
        <div className="hud-toast" role="status">
          <CheckCircle2 size={15} className="text-cyan" />
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} aria-label="Dismiss toast">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Header */}
      <PageHeader
        eyebrow="BLOCKCHAIN INTELLIGENCE / ENTITY DIRECTORY"
        title="Entity Explorer"
        description="Comprehensive forensic profiling, cryptographic cluster attribution, and behavioral risk assessment across monitored on-chain entities."
        actions={
          <div className="flex-actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={handleExportDossier}
              title="Download intelligence dossier as JSON"
            >
              <Download size={14} />
              <span>Export Dossier</span>
            </button>
            <StatusBadge
              label={selectedEntity.requiresReview ? 'REVIEW REQUIRED' : 'COMPLIANT BASELINE'}
              tone={selectedEntity.requiresReview ? 'warning' : 'operational'}
            />
          </div>
        }
      />

      {/* =========================================================================
          INTERACTIVE ENTITY SELECTOR SHELF (Quick-Switch Entities)
         ========================================================================= */}
      <section className="entity-selector-shelf" aria-label="Entity directory search and selection">
        <div className="shelf-header">
          <div className="shelf-search">
            <Search size={14} className="text-cyan" />
            <input
              type="text"
              placeholder="Search entities by name, ID, sector, or wallet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter entities"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="clear-search-btn"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="shelf-category-pills">
            {(
              [
                ['ALL', `All (${allEntities.length})`],
                ['THREAT', 'Threat & Syndicates'],
                ['EXCHANGE', 'Exchanges & OTC'],
                ['COMMERCIAL', 'Custody & Merchants'],
                ['UNCLASSIFIED', 'Unclassified'],
              ] as const
            ).map(([cat, label]) => (
              <button
                key={cat}
                type="button"
                className={`shelf-pill ${activeCategory === cat ? 'shelf-pill--active' : ''}`}
                onClick={() => setActiveCategory(cat as EntityCategory)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Entity Cards Grid */}
        <div className="entity-cards-grid">
          {filteredEntities.map((ent) => {
            const isSelected = ent.id === selectedEntity.id
            const score = getEntityRiskScore(ent)
            const sev = getEntitySeverity(score)
            const cat = getEntityCategory(ent)

            return (
              <button
                key={ent.id}
                type="button"
                onClick={() => handleSelectEntity(ent.id)}
                className={`entity-select-card ${isSelected ? 'entity-select-card--active' : ''} entity-select-card--${sev.toLowerCase()}`}
              >
                <div className="select-card-top">
                  <div className={`select-card-icon select-card-icon--${cat.toLowerCase()}`}>
                    {getEntitySectorIcon(ent)}
                  </div>
                  <span className={`select-card-risk-pill risk-${sev.toLowerCase()}`}>
                    {score}/100 {sev}
                  </span>
                </div>

                <div className="select-card-body">
                  <span className="select-card-id">{ent.id.replace('entity_', 'ENTITY-')}</span>
                  <strong className="select-card-label" title={ent.label}>
                    {ent.label}
                  </strong>
                  <span className="select-card-type">{ent.entityType}</span>
                </div>

                <div className="select-card-footer">
                  <span>{ent.walletIds.length} Wallets</span>
                  <span>{ent.ipAddressIds.length} IPs</span>
                  <span>{Math.round(ent.confidence * 100)}% Conf</span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* =========================================================================
          HERO INTELLIGENCE DOSSIER (Selected Entity Profile)
         ========================================================================= */}
      <section className="entity-hero-dossier" aria-label="Selected entity profile">
        <div className="dossier-left">
          <div className={`dossier-avatar dossier-avatar--${entityCategory.toLowerCase()}`}>
            <span className="dossier-avatar-letter">
              {selectedEntity.label.charAt(0).toUpperCase()}
            </span>
            <span className={`dossier-avatar-indicator dot-${entitySeverity.toLowerCase()}`} />
          </div>

          <div className="dossier-meta">
            <div className="dossier-eyebrow-row">
              <span className="dossier-eyebrow">
                {selectedEntity.id.replace('entity_', 'ENTITY-')}
              </span>
              <span className={`dossier-sector-tag sector-${entityCategory.toLowerCase()}`}>
                {selectedEntity.entityType}
              </span>
              {selectedEntity.requiresReview && (
                <span className="dossier-review-tag">
                  <AlertTriangle size={11} /> REQUIRES REVIEW
                </span>
              )}
            </div>

            <h2 className="dossier-title">{selectedEntity.label}</h2>
            <p className="dossier-jurisdiction">{entityJurisdiction}</p>

            <div className="dossier-actions">
              <Link
                to={`/entity-graph?cluster=${selectedEntity.clusterId || 'cluster_42'}`}
                className="dossier-action-btn dossier-action-btn--primary"
                title="Investigate in topological entity graph"
              >
                <GitBranch size={13} />
                <span>Investigate in Graph</span>
              </Link>
              <Link
                to="/transactions"
                className="dossier-action-btn dossier-action-btn--secondary"
                title="Inspect on-chain transactions"
              >
                <ReceiptText size={13} />
                <span>Transactions</span>
              </Link>
              <Link
                to="/network-activity"
                className="dossier-action-btn dossier-action-btn--secondary"
                title="View edge network observations"
              >
                <Globe2 size={13} />
                <span>Network Activity</span>
              </Link>
              <button
                type="button"
                onClick={() => handleCopy(selectedEntity.id, 'Entity Identifier')}
                className="dossier-action-btn dossier-action-btn--secondary"
                title="Copy Entity ID"
              >
                {copiedId === selectedEntity.id ? <Check size={13} className="text-green" /> : <Copy size={13} />}
                <span>{selectedEntity.id}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Risk Scoreboard */}
        <div className={`dossier-scoreboard scoreboard--${entitySeverity.toLowerCase()}`}>
          <div className="scoreboard-top">
            <span className="scoreboard-label">RISK ASSESSMENT</span>
            <ShieldAlert size={16} />
          </div>
          <div className="scoreboard-value">
            <strong>{entityScore}</strong>
            <small>/100</small>
          </div>
          <div className="scoreboard-tier">
            <span className={`tier-badge tier-badge--${entitySeverity.toLowerCase()}`}>
              {entitySeverity} RISK TIER
            </span>
          </div>
          <div className="scoreboard-confidence">
            <span>MODEL CONFIDENCE</span>
            <strong>{Math.round(selectedEntity.confidence * 100)}%</strong>
          </div>
          <div className="scoreboard-bar">
            <div
              className={`scoreboard-bar-fill fill-${entitySeverity.toLowerCase()}`}
              style={{ width: `${entityScore}%` }}
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          KEY TELEMETRY METRIC STRIP (4 Cards)
         ========================================================================= */}
      <div className="entity-metrics-strip">
        <MetricCard
          icon={<WalletCards size={17} />}
          label="CUMULATIVE FLOW"
          value={`${totalVolumeBtc.toFixed(2)} BTC`}
          detail={`${entityWallets.length} active wallet endpoints`}
          tone={entitySeverity === 'CRITICAL' || entitySeverity === 'HIGH' ? 'red' : 'cyan'}
        />
        <MetricCard
          icon={<ShieldAlert size={17} />}
          label="THREAT SEVERITY"
          value={`${entityScore} / 100`}
          detail={`${entitySeverity} classification signal`}
          tone={entitySeverity === 'CRITICAL' || entitySeverity === 'HIGH' ? 'red' : 'green'}
        />
        <MetricCard
          icon={<Globe2 size={17} />}
          label="NETWORK RELAYS"
          value={entityIps.length.toLocaleString('en-US')}
          detail={entityIps[0] ? `${entityIps[0].provider} (${entityIps[0].country})` : 'Zero observed edge nodes'}
          tone="default"
        />
        <MetricCard
          icon={<Clock3 size={17} />}
          label="ROUTED TRANSACTIONS"
          value={entityTxs.length.toLocaleString('en-US')}
          detail={selectedEntity.clusterId ? `${selectedEntity.clusterId.replace('cluster_', 'Cluster #')} linked` : 'Baseline transactions'}
          tone="default"
        />
      </div>

      {/* =========================================================================
          TABBED INVESTIGATION WORKBENCH (Wallets, Network, TXs, Forensics)
         ========================================================================= */}
      <div className="entity-workbench">
        <div className="workbench-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'WALLETS'}
            className={`workbench-tab ${activeTab === 'WALLETS' ? 'workbench-tab--active' : ''}`}
            onClick={() => setActiveTab('WALLETS')}
          >
            <WalletCards size={14} />
            <span>Cryptographic Wallets</span>
            <span className="tab-count">{entityWallets.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'NETWORK'}
            className={`workbench-tab ${activeTab === 'NETWORK' ? 'workbench-tab--active' : ''}`}
            onClick={() => setActiveTab('NETWORK')}
          >
            <Globe2 size={14} />
            <span>Routing Infrastructure</span>
            <span className="tab-count">{entityIps.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'TRANSACTIONS'}
            className={`workbench-tab ${activeTab === 'TRANSACTIONS' ? 'workbench-tab--active' : ''}`}
            onClick={() => setActiveTab('TRANSACTIONS')}
          >
            <ReceiptText size={14} />
            <span>On-Chain Transactions</span>
            <span className="tab-count">{entityTxs.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'FORENSICS'}
            className={`workbench-tab ${activeTab === 'FORENSICS' ? 'workbench-tab--active' : ''}`}
            onClick={() => setActiveTab('FORENSICS')}
          >
            <Activity size={14} />
            <span>Forensic Evidence & Timeline</span>
            <span className="tab-count">{entitySignals.length}</span>
          </button>
        </div>

        <div className="workbench-content">
          {/* TAB 1: WALLETS */}
          {activeTab === 'WALLETS' && (
            <div className="workbench-pane">
              <div className="pane-header">
                <h3>Associated Cryptographic Wallets ({entityWallets.length})</h3>
                <span className="text-muted">
                  Heuristically correlated unhosted and custodial Bitcoin addresses attributed to this entity.
                </span>
              </div>

              <div className="wallets-grid">
                {entityWallets.map((wallet) => (
                  <div key={wallet.id} className="wallet-card">
                    <div className="wallet-card-header">
                      <div className="wallet-identity">
                        <span className="wallet-id-badge">{wallet.id}</span>
                        <span className={`wallet-risk-pill risk-${wallet.riskSignal.toLowerCase()}`}>
                          {wallet.riskSignal}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(wallet.address, `Wallet ${wallet.id}`)}
                        className="wallet-copy-btn"
                        title="Copy address"
                      >
                        {copiedId === wallet.address ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                      </button>
                    </div>

                    <div className="wallet-address-box">
                      <code className="mono">{wallet.address}</code>
                    </div>

                    <div className="wallet-stats">
                      <div>
                        <span className="stats-lbl">FLOW VOLUME</span>
                        <strong className="stats-val">{wallet.totalVolumeBtc.toFixed(2)} BTC</strong>
                      </div>
                      <div>
                        <span className="stats-lbl">TRANSACTIONS</span>
                        <strong className="stats-val">{wallet.transactionCount} TXs</strong>
                      </div>
                    </div>

                    <div className="wallet-footer">
                      <span className="text-muted">
                        First: {new Date(wallet.firstSeen).toISOString().slice(0, 10)}
                      </span>
                      <Link
                        to={`/transactions`}
                        className="wallet-link"
                        title="Inspect wallet transactions"
                      >
                        <span>Filter TXs</span>
                        <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: NETWORK ROUTING */}
          {activeTab === 'NETWORK' && (
            <div className="workbench-pane">
              <div className="pane-header">
                <h3>Edge Relays & BGP Routing Topology ({entityIps.length})</h3>
                <span className="text-muted">
                  Observed temporal IP broadcast origins, Tor exit nodes, and Autonomous Systems correlated with on-chain mempool emergence.
                </span>
              </div>

              <div className="ips-grid">
                {entityIps.map((ip) => (
                  <div key={ip.id} className="ip-dossier-card">
                    <div className="ip-card-top">
                      <div className="ip-address-title">
                        <Server size={15} className="text-cyan" />
                        <code className="mono">{ip.address}</code>
                      </div>
                      <span className={`ip-risk-pill risk-${ip.riskSignal.toLowerCase()}`}>
                        {ip.riskSignal}
                      </span>
                    </div>

                    <div className="ip-meta-rows">
                      <div className="ip-meta-row">
                        <span>Autonomous System</span>
                        <strong className="mono">{ip.asn}</strong>
                      </div>
                      <div className="ip-meta-row">
                        <span>Provider / ISP</span>
                        <strong>{ip.provider}</strong>
                      </div>
                      <div className="ip-meta-row">
                        <span>Jurisdiction</span>
                        <strong>{ip.country}</strong>
                      </div>
                      <div className="ip-meta-row">
                        <span>Observed Packets</span>
                        <strong>{ip.observationCount} observations</strong>
                      </div>
                    </div>

                    <div className="ip-card-footer">
                      <Link
                        to={`/network-activity?ip=${ip.id}`}
                        className="ip-link"
                        title="View packet observations for this IP"
                      >
                        <span>Open Telemetry Feed</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TRANSACTIONS */}
          {activeTab === 'TRANSACTIONS' && (
            <div className="workbench-pane">
              <div className="pane-header">
                <h3>Monitored On-Chain Transactions ({entityTxs.length})</h3>
                <span className="text-muted">
                  Verified Bitcoin blockchain transactions flowing through this entity's cryptographic cluster.
                </span>
              </div>

              <div className="entity-tx-table-wrap">
                <table className="entity-tx-table">
                  <thead>
                    <tr>
                      <th>TXID / HASH</th>
                      <th>AMOUNT</th>
                      <th>RISK TIER</th>
                      <th>ACTIVITY CLASS</th>
                      <th>TIMESTAMP (UTC)</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entityTxs.slice(0, 12).map((tx) => (
                      <tr key={tx.id}>
                        <td>
                          <div className="tx-hash-cell">
                            <span className="mono">{tx.hash.slice(0, 16)}...</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(tx.hash, 'Transaction Hash')}
                              className="inline-copy-btn"
                              title="Copy hash"
                            >
                              {copiedId === tx.hash ? <Check size={11} className="text-green" /> : <Copy size={11} />}
                            </button>
                          </div>
                        </td>
                        <td>
                          <strong className="text-cyan mono">{tx.amountBtc.toFixed(3)} BTC</strong>
                        </td>
                        <td>
                          <span className={`risk-badge risk-${tx.riskLevel.toLowerCase()}`}>
                            {tx.riskLevel}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted">{tx.activityClass}</span>
                        </td>
                        <td className="mono text-muted text-xs">
                          {tx.timestamp.replace('T', ' ').slice(0, 16)}
                        </td>
                        <td>
                          <Link
                            to={`/transactions?tx=${tx.id}`}
                            className="table-action-link"
                            title="Inspect transaction"
                          >
                            <span>Inspect</span>
                            <ArrowUpRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FORENSICS & TIMELINE */}
          {activeTab === 'FORENSICS' && (
            <div className="workbench-pane">
              <div className="pane-header">
                <h3>Forensic Detection Signals & Chronological Timeline</h3>
                <span className="text-muted">
                  Fused machine learning heuristics (Elliptic++ GCN and UGRansome graph embeddings) and operational audit events.
                </span>
              </div>

              <div className="forensic-signals-box">
                <h4>Automated Machine Learning Detection Signals</h4>
                <ul className="signals-list">
                  {entitySignals.map((signal, idx) => (
                    <li key={idx}>
                      <ShieldAlert size={14} className="text-cyan" />
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="forensic-timeline-section">
                <h4>Chronological Audit Events</h4>
                <div className="entity-timeline-flow">
                  {timeline.length > 0 ? (
                    timeline.map((event) => (
                      <div key={event.id} className="timeline-flow-item">
                        <div className="flow-time">
                          {new Intl.DateTimeFormat('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          }).format(new Date(event.timestamp))}
                        </div>
                        <div className="flow-content">
                          <strong>{event.title}</strong>
                          <p>{event.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="timeline-flow-item">
                      <div className="flow-time">Active Observation</div>
                      <div className="flow-content">
                        <strong>Continuous On-Chain Surveillance Active</strong>
                        <p>Real-time mempool telemetry monitors this entity for anomalous UTXO dispersal and Tor edge relay activity.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
