import { ArrowRight, GitBranch, Link2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCorrelationAnalysis, getGraphData } from '../../services/mockServices'
import type { GraphNode } from '../../types/domain'
import { SectionCard } from '../ui/SectionCard'

type RelationshipCompareProps = {
  sourceId?: string
  targetId?: string
  onSourceChange: (id: string) => void
  onTargetChange: (id: string) => void
}

const graph = getGraphData('cluster_42')
const correlations = getCorrelationAnalysis('cluster_42')
const labelFor = (node: GraphNode) => `${node.type.replace('_', ' ')} / ${node.label}`
const formatTime = (value: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))

export function RelationshipCompare({ sourceId = 'ip_185_220_101_14', targetId = graph.nodes.find((node) => node.type === 'TRANSACTION')?.id, onSourceChange, onTargetChange }: RelationshipCompareProps) {
  const source = graph.nodes.find((node) => node.id === sourceId)
  const target = graph.nodes.find((node) => node.id === targetId)
  const edge = graph.edges.find((item) => (item.source === sourceId && item.target === targetId) || (item.source === targetId && item.target === sourceId))
  const correlation = correlations.find((item) => (item.correlation.ipAddressId === sourceId && item.correlation.transactionId === targetId) || (item.correlation.ipAddressId === targetId && item.correlation.transactionId === sourceId))
  const relatedTransaction = correlation?.transaction
  return <SectionCard eyebrow="FOCUSED RELATIONSHIP VIEW" title="Compare two graph nodes" className="relationship-compare"><div className="relationship-compare__selectors"><label>NODE A<select value={sourceId} onChange={(event) => onSourceChange(event.target.value)}>{graph.nodes.map((node) => <option key={node.id} value={node.id}>{labelFor(node)}</option>)}</select></label><ArrowRight className="relationship-compare__arrow" size={17} /><label>NODE B<select value={targetId} onChange={(event) => onTargetChange(event.target.value)}>{graph.nodes.map((node) => <option key={node.id} value={node.id}>{labelFor(node)}</option>)}</select></label></div>{source && target ? <div className="relationship-compare__result"><div className="relationship-compare__identity"><span>{source.type.replace('_', ' ')}</span><strong>{source.label}</strong></div><Link2 size={19} className="relationship-compare__link-icon" /><div className="relationship-compare__identity"><span>{target.type.replace('_', ' ')}</span><strong>{target.label}</strong></div><div className="relationship-compare__facts"><div><small>RELATIONSHIP TYPE</small><strong>{correlation?.correlation.relationship ?? edge?.label ?? 'No direct edge'}</strong></div><div><small>CONFIDENCE</small><strong>{correlation ? `${Math.round(correlation.correlation.confidence * 100)}%` : edge ? 'Graph context' : 'Requires review'}</strong></div><div><small>TIMESTAMPS</small><strong>{correlation ? `${formatTime(correlation.observation.timestamp)} / ${formatTime(correlation.transaction.timestamp)}` : 'No paired timestamp'}</strong></div><div><small>EVIDENCE</small><p>{correlation?.correlation.evidenceSignals[0] ?? edge?.label ?? 'No direct correlation evidence is currently recorded.'}</p></div></div>{relatedTransaction ? <div className="relationship-compare__transaction"><span>RELATED TRANSACTION</span><Link to={`/transactions?tx=${relatedTransaction.id}`}>{relatedTransaction.hash.slice(0, 10)}...{relatedTransaction.hash.slice(-8)} <GitBranch size={12} /></Link></div> : null}</div> : null}</SectionCard>
}
