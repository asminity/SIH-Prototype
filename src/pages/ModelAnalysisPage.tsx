import { useState } from 'react'
import { Activity, BrainCircuit, ChevronRight, CircleAlert } from 'lucide-react'
import { getClusters, getModelAnalysisContext, getTransactionIntelligence } from '../services/mockServices'
import type { ClusterId, TransactionId } from '../types/domain'
import { ModelArchitecture } from '../components/models/ModelArchitecture'
import { ModelBranchCard } from '../components/models/ModelBranchCard'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import { StatusBadge } from '../components/ui/StatusBadge'

const clusters = getClusters()
const transactions = getTransactionIntelligence()
const firstCluster = clusters.find((cluster) => cluster.id === 'cluster_42') ?? clusters[0]
const shortHash = (hash: string) => `${hash.slice(0, 8)}...${hash.slice(-8)}`

export function ModelAnalysisPage() {
  const [clusterId, setClusterId] = useState<ClusterId>(firstCluster.id)
  const [transactionId, setTransactionId] = useState<TransactionId>(firstCluster.transactionIds[0])
  const [selectedBranch, setSelectedBranch] = useState<'ELLIPTIC++' | 'UGRANSOME'>('ELLIPTIC++')
  const context = getModelAnalysisContext(clusterId, transactionId)
  const clusterTransactions = transactions.filter((record) => record.transaction.clusterId === clusterId)
  const elliptic = context.results.find((result) => result.model === 'ELLIPTIC++')
  const ugransome = context.results.find((result) => result.model === 'UGRANSOME')

  const handleClusterChange = (nextId: ClusterId) => {
    const nextCluster = clusters.find((cluster) => cluster.id === nextId)
    setClusterId(nextId)
    if (nextCluster) setTransactionId(nextCluster.transactionIds[0])
  }

  return <div className="model-analysis-page"><PageHeader eyebrow="AI ANALYSIS" title="Multi-Source AI Analysis" description="Compare two independent prototype analysis branches operating across different feature spaces. Outputs are deterministic simulated model results." actions={<StatusBadge label="SIMULATED MODEL OUTPUT" tone="warning" />} /><section className="model-context-toolbar"><div><BrainCircuit size={17} /><span>ANALYSIS CONTEXT</span></div><label>CLUSTER<select value={clusterId} onChange={(event) => handleClusterChange(event.target.value as ClusterId)}>{clusters.map((cluster) => <option key={cluster.id} value={cluster.id}>{cluster.displayId}</option>)}</select></label><label>TRANSACTION<select value={transactionId} onChange={(event) => setTransactionId(event.target.value as TransactionId)}>{clusterTransactions.map((record) => <option key={record.transaction.id} value={record.transaction.id}>{shortHash(record.transaction.hash)} / {record.transaction.amountBtc.toFixed(3)} BTC</option>)}</select></label>{context.transaction ? <span className="model-context-toolbar__selected"><Activity size={13} /> Selected {shortHash(context.transaction.hash)}</span> : null}</section><div className="model-selected-banner"><div><p>SELECTED ANALYSIS CONTEXT</p><h2>{context.cluster?.displayId ?? 'No cluster selected'}</h2><span>{context.transaction ? `${shortHash(context.transaction.hash)} / ${context.transaction.amountBtc.toFixed(3)} BTC / ${context.transaction.riskLevel}` : 'No transaction available for this cluster'}</span></div><div><span>MODEL STATUS</span><strong>{context.results.length === 2 ? '2 BRANCHES READY' : 'NO OUTPUT AVAILABLE'}</strong></div></div><ModelArchitecture />{elliptic && ugransome ? <><div className="model-branches-heading"><div><p>INDEPENDENT MODEL BRANCHES</p><h2>Complementary anomaly signals</h2></div><span><CircleAlert size={14} /> Select a branch to inspect its interpretation</span></div><div className="model-branch-grid"><ModelBranchCard result={elliptic} selected={selectedBranch === 'ELLIPTIC++'} transactionId={context.transaction?.id} onSelect={() => setSelectedBranch('ELLIPTIC++')} /><ModelBranchCard result={ugransome} selected={selectedBranch === 'UGRANSOME'} transactionId={context.transaction?.id} onSelect={() => setSelectedBranch('UGRANSOME')} /></div><SectionCard eyebrow="BRANCH COMPARISON" title="Output comparison" className="model-comparison"><div className="model-comparison__rows"><div><span>ELLIPTIC++</span><div className="model-comparison__bar"><i style={{ width: `${elliptic.anomalyScore * 100}%` }} /></div><strong>{elliptic.anomalyScore.toFixed(2)}</strong><small>{Math.round(elliptic.confidence * 100)}% confidence</small></div><div><span>UGRANSOME</span><div className="model-comparison__bar model-comparison__bar--network"><i style={{ width: `${ugransome.anomalyScore * 100}%` }} /></div><strong>{ugransome.anomalyScore.toFixed(2)}</strong><small>{Math.round(ugransome.confidence * 100)}% confidence</small></div></div><p className="model-comparison__note"><ChevronRight size={14} /> Both outputs remain independent prototype signals. Feature fusion is intentionally deferred to the next stage.</p></SectionCard></> : <div className="model-analysis-empty"><CircleAlert size={18} /><strong>No simulated branch output for this cluster</strong><span>Select Cluster #42 to view the configured branch analysis.</span></div>}</div>
}
