import { useState } from 'react'
import {
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  CircleAlert,
  FileText,
  FolderLock,
  GitBranch,
  Radio,
  ShieldAlert,
  Table2,
  UsersRound,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getClusters, getFeatureFusionAnalysis } from '../services/mockServices'
import type { ClusterId } from '../types/domain'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'

const clusters = getClusters()
const defaultCluster = clusters.find((cluster) => cluster.id === 'cluster_42') ?? clusters[0]

export function FusionAnalysisPage() {
  const [clusterId, setClusterId] = useState<ClusterId>(defaultCluster.id)

  const context = getFeatureFusionAnalysis(clusterId)
  const { cluster, models, fusion, risk } = context

  const elliptic = models.find((m) => m.model === 'ELLIPTIC++') ?? {
    model: 'ELLIPTIC++',
    anomalyScore: 0.87,
    classification: 'SUSPICIOUS',
    confidence: 0.92,
    features: ['Transaction behavior', 'Wallet interaction', 'Graph structure', 'Transaction frequency', 'Counterparty behavior'],
    assessment: 'Complementary transaction and graph signals indicate a potential suspicious pattern.',
  }

  const ugransome = models.find((m) => m.model === 'UGRANSOME') ?? {
    model: 'UGRANSOME',
    anomalyScore: 0.81,
    classification: 'SUSPICIOUS',
    confidence: 0.89,
    features: ['Network activity', 'IP behavior', 'Communication frequency', 'Temporal patterns', 'Network relationships'],
    assessment: 'Network observations and temporal relationships show an elevated anomaly signal.',
  }

  const fusedScore = fusion?.fusedScore ?? 0.842
  const riskScore = risk?.score ?? 91
  const severity = risk?.severity ?? 'HIGH'
  const isHighRisk = severity === 'HIGH' || severity === 'CRITICAL'

  return (
    <div className="simple-fusion-page">
      {/* Header */}
      <PageHeader
        eyebrow="AI FUSION"
        title="Fusion Analysis"
        description="Unified multi-model threat evaluation combining on-chain graph analysis (Elliptic++) with network telemetry (UGRansome)."
        actions={<StatusBadge label="PROTOTYPE RISK OUTPUT" tone="warning" />}
      />

      {/* Cluster Context Toolbar */}
      <section className="fusion-cluster-bar">
        <div className="fusion-cluster-bar__left">
          <BrainCircuit size={17} className="text-cyan" />
          <span className="fusion-bar-label">INVESTIGATION CLUSTER:</span>
          <select
            value={clusterId}
            onChange={(e) => setClusterId(e.target.value as ClusterId)}
            className="fusion-cluster-select"
          >
            {clusters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayId} ({c.severity} RISK - {c.riskScore} PTS)
              </option>
            ))}
          </select>
        </div>

        {cluster && (
          <div className="fusion-cluster-bar__pills">
            <span className="bar-pill">
              <b>{cluster.transactionIds.length}</b> Transactions
            </span>
            <span className="bar-pill">
              <b>{cluster.walletIds.length}</b> Wallets
            </span>
            <span className="bar-pill">
              <b>{cluster.ipAddressIds.length}</b> IP Addresses
            </span>
            <span className="bar-pill bar-pill--status">
              <b>{cluster.severity}</b> Severity
            </span>
          </div>
        )}
      </section>

      {/* 1. PRIMARY SCORES: Elliptic++, UGRansome, and Fused Score */}
      <div className="fusion-scores-grid">
        {/* Card 1: Elliptic++ */}
        <div className="score-card score-card--elliptic">
          <div className="score-card__header">
            <span className="score-card__badge">BRANCH A</span>
            <span className="score-card__type">ON-CHAIN GRAPH MODEL</span>
          </div>
          <h3 className="score-card__title">ELLIPTIC++</h3>
          <div className="score-card__number-row">
            <strong className="score-val text-amber">{elliptic.anomalyScore.toFixed(2)}</strong>
            <div className="score-card__sub">
              <span className="score-classification status-tag--suspicious">{elliptic.classification}</span>
              <small>{Math.round(elliptic.confidence * 100)}% confidence</small>
            </div>
          </div>
          <p className="score-card__desc">
            Evaluates blockchain transaction topology, GCN subgraph embeddings, and peeling-chain flow.
          </p>
          <div className="score-card__features">
            <span className="feat-chip">GCN Embeddings</span>
            <span className="feat-chip">Peeling Flow</span>
            <span className="feat-chip">UTXO Velocity</span>
          </div>
        </div>

        {/* Card 2: UGRansome */}
        <div className="score-card score-card--ugransome">
          <div className="score-card__header">
            <span className="score-card__badge">BRANCH B</span>
            <span className="score-card__type">NETWORK TELEMETRY MODEL</span>
          </div>
          <h3 className="score-card__title">UGRANSOME</h3>
          <div className="score-card__number-row">
            <strong className="score-val text-purple">{ugransome.anomalyScore.toFixed(2)}</strong>
            <div className="score-card__sub">
              <span className="score-classification status-tag--suspicious">{ugransome.classification}</span>
              <small>{Math.round(ugransome.confidence * 100)}% confidence</small>
            </div>
          </div>
          <p className="score-card__desc">
            Analyzes Tor exit relay co-occurrences, autonomous system routing, and temporal burst intervals.
          </p>
          <div className="score-card__features">
            <span className="feat-chip feat-chip--net">Tor Relays</span>
            <span className="feat-chip feat-chip--net">BGP Routing</span>
            <span className="feat-chip feat-chip--net">Timing Jitter</span>
          </div>
        </div>

        {/* Card 3: Fusion Score (Hero Card) */}
        <div className="score-card score-card--fusion">
          <div className="score-card__header">
            <span className="score-card__badge score-card__badge--fusion">
              <Zap size={12} /> COMBINED AI
            </span>
            <span className="score-card__type text-cyan">UNIFIED FUSION</span>
          </div>
          <h3 className="score-card__title">FUSION SCORE</h3>
          <div className="score-card__number-row">
            <strong className="score-val text-cyan">{fusedScore.toFixed(3)}</strong>
            <div className="score-card__sub">
              <span className={`score-classification ${isHighRisk ? 'status-tag--red' : 'status-tag--amber'}`}>
                {severity} RISK
              </span>
              <small>Score: <b>{riskScore}</b> / 100</small>
            </div>
          </div>
          <p className="score-card__desc">
            Bayesian multimodal consensus combining 55% Elliptic++ graph signals with 45% UGRansome telemetry.
          </p>
          <div className="score-card__consensus-bar">
            <div className="bar-fill" style={{ width: `${Math.min(100, Math.round(fusedScore * 100))}%` }} />
          </div>
          <span className="score-card__meta">
            <CheckCircle2 size={13} className="text-green" /> 94% statistical consensus agreement
          </span>
        </div>
      </div>

      {/* 2. DETECTION SUMMARY: Transactions, IPs, Wallets */}
      <div className="detection-summary-grid">
        <div className="detection-card">
          <div className="detection-card__top">
            <div className="detection-card__icon text-amber">
              <Table2 size={20} />
            </div>
            <div>
              <span className="detection-card__label">TRANSACTIONS DETECTED</span>
              <strong className="detection-card__val">{cluster ? cluster.transactionIds.length : 27} Transactions</strong>
            </div>
          </div>
          <p className="detection-card__desc">
            Multiple sequential transaction hops totaling 1.450 BTC exhibiting cyclic peeling and rapid velocity.
          </p>
          <Link to="/transactions" className="detection-card__link">
            Examine in Transaction Explorer <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="detection-card">
          <div className="detection-card__top">
            <div className="detection-card__icon text-purple">
              <Radio size={20} />
            </div>
            <div>
              <span className="detection-card__label">IP ADDRESSES DETECTED</span>
              <strong className="detection-card__val">{cluster ? cluster.ipAddressIds.length : 6} Monitored IPs</strong>
            </div>
          </div>
          <p className="detection-card__desc">
            Observed broadcast addresses aligning with active Tor exit relay windows and cross-border BGP autonomous routing.
          </p>
          <Link to="/network-activity" className="detection-card__link">
            Trace in Network Activity <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="detection-card">
          <div className="detection-card__top">
            <div className="detection-card__icon text-cyan">
              <UsersRound size={20} />
            </div>
            <div>
              <span className="detection-card__label">WALLETS CLUSTERED</span>
              <strong className="detection-card__val">{cluster ? cluster.walletIds.length : 14} Linked Wallets</strong>
            </div>
          </div>
          <p className="detection-card__desc">
            Cryptographically linked via common-input heuristics and multi-hop co-spending into a unified entity cluster.
          </p>
          <Link to="/entity-explorer" className="detection-card__link">
            Inspect in Entity Explorer <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {/* 3. WHY THIS SCORE? (REASONS & ATTRIBUTION) */}
      <div className="fusion-why-section">
        <div className="why-header">
          <div className="why-title">
            <ShieldAlert size={18} className="text-red" />
            <span>Why this score? (Observed Reasons & Evidence)</span>
          </div>
          <span className="why-tag">EXPLAINABLE AI EVIDENCE</span>
        </div>

        <div className="why-body">
          {/* List of concrete reasons */}
          <div className="why-reasons-column">
            <span className="column-subheading">OBSERVED PATTERNS & RATIONALE:</span>
            <ul className="why-reasons-list">
              {risk ? (
                risk.rationale.map((reason) => (
                  <li key={reason} className="why-reason-item">
                    <span className="bullet-dot" />
                    <span>{reason}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="why-reason-item">
                    <span className="bullet-dot" />
                    <span>Elevated transaction velocity across a concentrated time window</span>
                  </li>
                  <li className="why-reason-item">
                    <span className="bullet-dot" />
                    <span>Six IP addresses show strong observed association with fourteen wallets</span>
                  </li>
                  <li className="why-reason-item">
                    <span className="bullet-dot" />
                    <span>Multi-hop movement and potential peeling-chain behavior detected</span>
                  </li>
                  <li className="why-reason-item">
                    <span className="bullet-dot" />
                    <span>Both model branches produce complementary suspicious signals</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Point attribution breakdown */}
          <div className="why-breakdown-column">
            <span className="column-subheading">ATTRIBUTION POINTS BREAKDOWN:</span>
            <div className="why-factors-list">
              {risk &&
                risk.breakdown.map((factor) => (
                  <div key={factor.label} className="why-factor-row">
                    <div className="why-factor-row__top">
                      <span>{factor.label}</span>
                      <strong>+{factor.points} pts</strong>
                    </div>
                    <div className="why-factor-bar">
                      <div
                        className="why-factor-bar__fill"
                        style={{ width: `${Math.min(100, Math.round((factor.points / riskScore) * 100))}%` }}
                      />
                    </div>
                    <p>{factor.evidence}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="why-footer">
          <CircleAlert size={14} className="text-amber" />
          <span>
            These findings represent deterministic multi-model simulated evidence for analyst prioritization; human review is required before legal or compliance determinations.
          </span>
        </div>
      </div>

      {/* 4. ACTION OPTIONS: Case File, Entity Graph, Threat Alert, etc. */}
      <div className="fusion-actions-section">
        <div className="actions-header">
          <span className="actions-title">Recommended Investigation Actions</span>
          <span className="actions-subtitle">Take direct action on this cluster across the platform</span>
        </div>

        <div className="actions-cards-grid">
          {/* Action 1: See on Entity Graph */}
          <Link to={`/entity-graph?cluster=${clusterId}`} className="action-tile action-tile--graph">
            <div className="action-tile__icon">
              <GitBranch size={22} />
            </div>
            <div className="action-tile__content">
              <strong>See on Entity Graph</strong>
              <p>Explore visual topology connecting wallets, transactions, and network IP nodes.</p>
              <span className="action-tile__btn">Open Entity Graph →</span>
            </div>
          </Link>

          {/* Action 2: Open Case File */}
          <Link to="/cases" className="action-tile action-tile--case">
            <div className="action-tile__icon">
              <FolderLock size={22} />
            </div>
            <div className="action-tile__content">
              <strong>Open Case File</strong>
              <p>Escalate this cluster and link forensic evidence to an operational analyst case.</p>
              <span className="action-tile__btn">View Case Docket →</span>
            </div>
          </Link>

          {/* Action 3: View Threat Alert */}
          <Link to="/ai-alerts?alert=alert_0042" className="action-tile action-tile--alert">
            <div className="action-tile__icon">
              <ShieldAlert size={22} />
            </div>
            <div className="action-tile__content">
              <strong>View Threat Alert</strong>
              <p>Review the active alert generated by this high-anomaly cluster co-occurrence.</p>
              <span className="action-tile__btn">Open Threat Alert #0042 →</span>
            </div>
          </Link>

          {/* Action 4: Generate Forensic Report */}
          <Link to="/reports" className="action-tile action-tile--report">
            <div className="action-tile__icon">
              <FileText size={22} />
            </div>
            <div className="action-tile__content">
              <strong>Generate Forensic Report</strong>
              <p>Export a comprehensive intelligence dossier containing all model metrics and logs.</p>
              <span className="action-tile__btn">Export Report →</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
