import { useState } from 'react'
import { ArrowUpRight, BrainCircuit, CircleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getClusters, getFeatureFusionAnalysis } from '../services/mockServices'
import type { ClusterId } from '../types/domain'
import { FusionRiskArchitecture } from '../components/fusion/FusionRiskArchitecture'
import { RiskBreakdown } from '../components/fusion/RiskBreakdown'
import { RiskLevelDefinitions } from '../components/fusion/RiskLevelDefinitions'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import { StatusBadge } from '../components/ui/StatusBadge'

const clusters = getClusters()
const defaultCluster = clusters.find((cluster) => cluster.id === 'cluster_42') ?? clusters[0]

export function FeatureFusionPage() {
  const [clusterId, setClusterId] = useState<ClusterId>(defaultCluster.id)
  const context = getFeatureFusionAnalysis(clusterId)
  const hasOutput = Boolean(context.fusion && context.risk && context.models.length === 2)
  return <div className="fusion-page"><PageHeader eyebrow="AI ANALYSIS" title="Feature Fusion & Risk Engine" description="Connect the two independent prototype anomaly signals into an explainable deterministic risk assessment." actions={<StatusBadge label="PROTOTYPE RISK OUTPUT" tone="warning" />} /><section className="fusion-context-toolbar"><div><BrainCircuit size={16} /><span>RISK CONTEXT</span></div><label>CLUSTER<select value={clusterId} onChange={(event) => setClusterId(event.target.value as ClusterId)}>{clusters.map((cluster) => <option key={cluster.id} value={cluster.id}>{cluster.displayId}</option>)}</select></label>{context.cluster ? <span>{context.cluster.transactionIds.length} transactions / {context.cluster.walletIds.length} wallets / {context.cluster.ipAddressIds.length} IP addresses</span> : null}</section>{hasOutput && context.fusion && context.risk ? <><FusionRiskArchitecture models={context.models} fusion={context.fusion} risk={context.risk} /><div className="fusion-action-row"><span><CircleAlert size={14} /> Risk details are derived from centralized model, correlation, graph, and pattern evidence.</span><Link to="#risk-details">Open risk details <ArrowUpRight size={13} /></Link></div><div className="fusion-risk-grid" id="risk-details"><RiskBreakdown risk={context.risk} /><RiskLevelDefinitions definitions={context.riskLevels} selected={context.risk.severity} /></div><SectionCard eyebrow="ANALYST INTERPRETATION" title="Observed reasons for this assessment" className="risk-explanation"><ul>{context.risk.rationale.map((reason) => <li key={reason}>{reason}</li>)}</ul><div className="risk-explanation__footer"><span>{context.risk.recommendation}</span><Link to="/ai-alerts?alert=alert_0042">Open AI alert <ArrowUpRight size={13} /></Link></div></SectionCard></> : <div className="fusion-empty"><CircleAlert size={19} /><strong>No fusion output configured for this cluster</strong><span>Select Cluster #42 to view the deterministic feature fusion and risk assessment.</span></div>}</div>
}
