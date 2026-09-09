import { useState } from 'react'
import { Activity, Link2, ShieldAlert } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { getCorrelationAnalysis, getCorrelationAnalysisById } from '../services/mockServices'
import { CorrelationEvidence } from '../components/correlation/CorrelationEvidence'
import { CorrelationFlow } from '../components/correlation/CorrelationFlow'
import { CorrelationTable } from '../components/correlation/CorrelationTable'
import { RelationshipCompare } from '../components/correlation/RelationshipCompare'
import { MetricCard } from '../components/ui/MetricCard'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'

export function CorrelationPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const records = getCorrelationAnalysis('cluster_42')
  const defaultId = records[0]?.correlation.id ?? 'corr_cluster42_01'
  const selectedId = searchParams.get('correlation') ?? defaultId
  const selectedRecord = getCorrelationAnalysisById(selectedId) ?? records[0]
  const [showAll, setShowAll] = useState(false)
  const [sourceNodeId, setSourceNodeId] = useState('ip_185_220_101_14')
  const [targetNodeId, setTargetNodeId] = useState<string>(records[0]?.transaction.id ?? '')
  const visibleRecords = showAll ? getCorrelationAnalysis() : records

  return <div className="correlation-page"><PageHeader eyebrow="GRAPH INTELLIGENCE" title="Relationship Analysis" description="Examine correlation evidence between network observations and blockchain activity without asserting ownership or attribution." actions={<StatusBadge label="CORRELATION EVIDENCE" tone="neutral" />} /><div className="correlation-metrics"><MetricCard icon={<Link2 size={17} />} label="CLUSTER #42 CORRELATIONS" value={records.length.toLocaleString('en-US')} detail="Observed association records" /><MetricCard icon={<ShieldAlert size={17} />} label="PRIMARY SCORE" value={`${selectedRecord.correlation.score} / 100`} detail="Selected evidence score" /><MetricCard icon={<Activity size={17} />} label="CONFIDENCE" value={`${Math.round(selectedRecord.correlation.confidence * 100)}%`} detail="Evidence confidence" /></div><div className="correlation-view-toggle"><span>FOCUS: CLUSTER #42</span><button onClick={() => setShowAll((current) => !current)} type="button">{showAll ? 'Show Cluster #42' : 'Show all correlations'}</button></div><CorrelationFlow record={selectedRecord} /><RelationshipCompare sourceId={sourceNodeId} targetId={targetNodeId} onSourceChange={setSourceNodeId} onTargetChange={setTargetNodeId} /><CorrelationTable records={visibleRecords} selectedId={selectedRecord.correlation.id} onSelect={(id) => setSearchParams({ correlation: id })} /><CorrelationEvidence record={selectedRecord} /></div>
}
