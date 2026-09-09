import { useState, useMemo } from 'react'
import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  CircleAlert,
  Cpu,
  Layers,
  ShieldAlert,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getClusters, getFeatureFusionAnalysis } from '../services/mockServices'
import type { ClusterId } from '../types/domain'
import { NeuralFusionCanvas } from '../components/fusion/NeuralFusionCanvas'
import { ThreatWeightTuning } from '../components/fusion/ThreatWeightTuning'
import { ThreatVectorMatrix } from '../components/fusion/ThreatVectorMatrix'
import { RiskBreakdown } from '../components/fusion/RiskBreakdown'
import { RiskLevelDefinitions } from '../components/fusion/RiskLevelDefinitions'
import { FusionTriageActions } from '../components/fusion/FusionTriageActions'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'

const clusters = getClusters()
const defaultCluster = clusters.find((cluster) => cluster.id === 'cluster_42') ?? clusters[0]

export function ThreatFusionPage() {
  const [clusterId, setClusterId] = useState<ClusterId>(defaultCluster.id)
  const [ellipticWeight, setEllipticWeight] = useState<number>(0.55)
  const [ugransomeWeight, setUgransomeWeight] = useState<number>(0.45)
  const [activeViewSection, setActiveViewSection] = useState<'pipeline' | 'vectors' | 'attribution'>('pipeline')

  const context = getFeatureFusionAnalysis(clusterId)

  // Dynamic recalculation of fused score and risk when weights change
  const { effectiveFusedScore, effectiveRiskScore, effectiveSeverity } = useMemo(() => {
    const ellipticScore = context.models.find((m) => m.model === 'ELLIPTIC++')?.anomalyScore ?? 0.87
    const ugransomeScore = context.models.find((m) => m.model === 'UGRANSOME')?.anomalyScore ?? 0.81
    
    // Weighted fused anomaly
    const fused = +(ellipticScore * ellipticWeight + ugransomeScore * ugransomeWeight).toFixed(3)
    
    // Derived risk score out of 100
    const baseRisk = context.risk ? context.risk.score : Math.round(fused * 100)
    // Scale slightly with weight shift
    const weightDelta = (ellipticWeight - 0.55) * 6
    const dynamicScore = Math.min(100, Math.max(10, Math.round(baseRisk + weightDelta)))
    
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'HIGH'
    if (dynamicScore >= 80) severity = 'CRITICAL'
    else if (dynamicScore >= 50) severity = 'HIGH'
    else if (dynamicScore >= 25) severity = 'MEDIUM'
    else severity = 'LOW'

    return {
      effectiveFusedScore: fused,
      effectiveRiskScore: dynamicScore,
      effectiveSeverity: severity,
    }
  }, [context, ellipticWeight, ugransomeWeight])

  const handleWeightsChange = (e: number, u: number) => {
    setEllipticWeight(e)
    setUgransomeWeight(u)
  }

  const handleResetWeights = () => {
    setEllipticWeight(0.55)
    setUgransomeWeight(0.45)
  }

  const hasOutput = Boolean(context.models.length >= 2 && context.fusion && context.risk)

  return (
    <div className="threat-fusion-page">
      {/* Top Page Header */}
      <PageHeader
        eyebrow="AI THREAT INTELLIGENCE"
        title="AI Threat Fusion Engine"
        description="Unified multi-model neural consensus engine uniting on-chain graph topology, deep UTXO heuristics, and network behavioral telemetry into deterministic threat scoring."
        actions={
          <div className="fusion-header-actions">
            <StatusBadge label="NEURAL ENSEMBLE ACTIVE" tone="operational" />
            <span className="fusion-sync-badge">
              <span className="sync-pulse-dot" /> DUAL-MODEL SYNC: 100%
            </span>
          </div>
        }
      />

      {/* Cluster Context Toolbar */}
      <section className="threat-context-bar">
        <div className="threat-context-bar__left">
          <BrainCircuit size={17} className="text-cyan" />
          <span className="context-label">INVESTIGATION CONTEXT:</span>
          <label className="context-cluster-select">
            <span>CLUSTER</span>
            <select
              value={clusterId}
              onChange={(e) => {
                setClusterId(e.target.value as ClusterId)
                handleResetWeights()
              }}
            >
              {clusters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayId} ({c.severity} RISK - {c.riskScore} PTS)
                </option>
              ))}
            </select>
          </label>
        </div>

        {context.cluster && (
          <div className="threat-context-bar__metrics">
            <span className="context-pill">
              <b>{context.cluster.transactionIds.length}</b> Transactions
            </span>
            <span className="context-pill">
              <b>{context.cluster.walletIds.length}</b> Wallets
            </span>
            <span className="context-pill">
              <b>{context.cluster.ipAddressIds.length}</b> Monitored IPs
            </span>
            <span className="context-pill context-pill--threat">
              <b>{context.cluster.severity}</b> Severity
            </span>
          </div>
        )}
      </section>

      {/* Top 4 KPI Metric Strips */}
      <div className="threat-kpi-grid">
        <div className="threat-kpi-card threat-kpi-card--cyan">
          <div className="kpi-top">
            <span className="kpi-label">FUSED ANOMALY SCORE</span>
            <Zap size={16} className="text-cyan" />
          </div>
          <div className="kpi-body">
            <strong>{effectiveFusedScore.toFixed(3)}</strong>
            <span className="kpi-badge kpi-badge--cyan">94.0% Confidence</span>
          </div>
          <p className="kpi-meta">+34.2% sensitivity above single-model baseline</p>
        </div>

        <div className="threat-kpi-card threat-kpi-card--red">
          <div className="kpi-top">
            <span className="kpi-label">DYNAMIC COMPOSITE RISK</span>
            <ShieldAlert size={16} className="text-red" />
          </div>
          <div className="kpi-body">
            <strong className="text-red">
              {effectiveRiskScore} <small>/ 100</small>
            </strong>
            <span className={`kpi-badge kpi-badge--${effectiveSeverity.toLowerCase()}`}>
              {effectiveSeverity}
            </span>
          </div>
          <p className="kpi-meta">Determined by Bayesian multimodal consensus</p>
        </div>

        <div className="threat-kpi-card threat-kpi-card--purple">
          <div className="kpi-top">
            <span className="kpi-label">DUAL-BRANCH AGREEMENT</span>
            <Activity size={16} className="text-purple" />
          </div>
          <div className="kpi-body">
            <strong className="text-purple">94.8%</strong>
            <span className="kpi-badge kpi-badge--purple">Converged</span>
          </div>
          <p className="kpi-meta">Jensen-Shannon divergence: 0.038 (Low Conflict)</p>
        </div>

        <div className="threat-kpi-card threat-kpi-card--amber">
          <div className="kpi-top">
            <span className="kpi-label">FORENSIC VECTORS</span>
            <Layers size={16} className="text-amber" />
          </div>
          <div className="kpi-body">
            <strong className="text-amber">6 Vectors</strong>
            <span className="kpi-badge kpi-badge--amber">Deconstructed</span>
          </div>
          <p className="kpi-meta">Cross-evaluated across graph & network layers</p>
        </div>
      </div>

      {hasOutput && context.fusion && context.risk ? (
        <>
          {/* Interactive Weight Tuning Control */}
          <ThreatWeightTuning
            ellipticWeight={ellipticWeight}
            ugransomeWeight={ugransomeWeight}
            onWeightChange={handleWeightsChange}
            onReset={handleResetWeights}
            fusedScore={effectiveFusedScore}
            riskScore={effectiveRiskScore}
            severity={effectiveSeverity}
          />

          {/* Section Navigation Tabs */}
          <div className="threat-view-tabs">
            <button
              type="button"
              className={`view-tab ${activeViewSection === 'pipeline' ? 'view-tab--active' : ''}`}
              onClick={() => setActiveViewSection('pipeline')}
            >
              <Cpu size={15} /> 1. Neural Architecture & Tensor Flow
            </button>
            <button
              type="button"
              className={`view-tab ${activeViewSection === 'vectors' ? 'view-tab--active' : ''}`}
              onClick={() => setActiveViewSection('vectors')}
            >
              <Layers size={15} /> 2. Multi-Dimensional Threat Vectors
            </button>
            <button
              type="button"
              className={`view-tab ${activeViewSection === 'attribution' ? 'view-tab--active' : ''}`}
              onClick={() => setActiveViewSection('attribution')}
            >
              <Activity size={15} /> 3. Explainable XAI Attribution
            </button>
          </div>

          {/* Tab 1: Neural Pipeline Canvas */}
          {activeViewSection === 'pipeline' && (
            <NeuralFusionCanvas
              models={context.models}
              fusion={context.fusion}
              risk={context.risk}
              ellipticWeight={ellipticWeight}
              ugransomeWeight={ugransomeWeight}
              effectiveFusedScore={effectiveFusedScore}
            />
          )}

          {/* Tab 2: Forensic Threat Vectors */}
          {activeViewSection === 'vectors' && <ThreatVectorMatrix />}

          {/* Tab 3: Explainable Attribution */}
          {activeViewSection === 'attribution' && (
            <div className="threat-attribution-grid">
              <RiskBreakdown risk={{ ...context.risk, score: effectiveRiskScore, severity: effectiveSeverity }} />
              <RiskLevelDefinitions definitions={context.riskLevels} selected={effectiveSeverity} />
            </div>
          )}

          {/* Analyst Interpretation & Observed Evidence Card */}
          <div className="threat-analyst-dossier">
            <div className="dossier-header">
              <div className="dossier-title">
                <CheckCircle2 size={17} className="text-cyan" />
                <span>INTELLIGENCE SYNTHESIS & ANALYST RATIONALE</span>
              </div>
              <span className="dossier-tag">VERIFIED OBSERVATIONS</span>
            </div>

            <div className="dossier-body">
              <div className="dossier-reasons">
                <span className="reasons-label">CONVERGING THREAT SIGNALS:</span>
                <ul className="reasons-list">
                  {context.risk.rationale.map((reason) => (
                    <li key={reason} className="reason-item">
                      <span className="reason-bullet" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="dossier-recommendation">
                <div className="recommendation-badge">ACTIONABLE RECOMMENDATION</div>
                <p className="recommendation-text">{context.risk.recommendation}</p>
                <div className="recommendation-actions">
                  <Link to="/ai-alerts?alert=alert_0042" className="rec-btn rec-btn--primary">
                    Open Prioritized AI Alert <ArrowUpRight size={14} />
                  </Link>
                  <Link to={`/entity-graph?cluster=${clusterId}`} className="rec-btn rec-btn--secondary">
                    Inspect Entity Subgraph <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Triage Actions */}
          <FusionTriageActions
            clusterId={clusterId}
            risk={{ ...context.risk, score: effectiveRiskScore, severity: effectiveSeverity }}
            fusedScore={effectiveFusedScore}
          />
        </>
      ) : (
        <div className="fusion-empty">
          <CircleAlert size={24} className="text-amber" />
          <strong>No neural fusion model configured for this cluster</strong>
          <span>Select Cluster #42 or #88 to view the deterministic neural threat consensus.</span>
        </div>
      )}
    </div>
  )
}
