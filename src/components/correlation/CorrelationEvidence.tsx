import { ArrowUpRight, CheckCircle2, CircleAlert, ExternalLink, GitBranch, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CorrelationIntelligenceRecord } from '../../types/domain'
import { SectionCard } from '../ui/SectionCard'

type CorrelationEvidenceProps = {
  record: CorrelationIntelligenceRecord
}

export function CorrelationEvidence({ record }: CorrelationEvidenceProps) {
  const { correlation, observation, ipAddress, transaction, wallet, entity, cluster, investigation } = record
  return <SectionCard eyebrow="WHY THIS ASSOCIATION EXISTS" title="Evidence panel" className="correlation-evidence"><div className="correlation-evidence__score"><div><span>CORRELATION SCORE</span><strong>{correlation.score}<small> / 100</small></strong></div><div><span>CONFIDENCE</span><strong>{Math.round(correlation.confidence * 100)}<small>%</small></strong></div><span className={`correlation-status correlation-status--${correlation.status.toLowerCase()}`}>{correlation.status}</span></div><div className="evidence-context"><p>Correlation evidence connects <Link to={`/network-activity?ip=${ipAddress.id}`}>{ipAddress.address}</Link> with <Link to={`/transactions?tx=${transaction.id}`}>{transaction.hash.slice(0, 8)}...</Link> through an observed network event. This is an observed association, not an ownership claim.</p><dl><dt>Observation</dt><dd>{observation.protocol} / {observation.direction}</dd><dt>Relationship</dt><dd>{correlation.relationship}</dd><dt>Observed note</dt><dd>{correlation.note}</dd></dl></div><div className="evidence-signals"><h3><ShieldCheck size={15} />Evidence signals</h3><ul>{correlation.evidenceSignals.map((signal) => <li key={signal}><CheckCircle2 size={14} />{signal}</li>)}</ul></div><div className="correlation-related"><div><small>WALLET</small><Link to={`/entity-explorer?wallet=${wallet.id}`}>{wallet.address}<ArrowUpRight size={12} /></Link></div><div><small>ENTITY</small><Link to={`/entity-explorer?entity=${entity.id}`}>{entity.label}<ArrowUpRight size={12} /></Link></div><div><small>CLUSTER</small>{cluster ? <Link to={`/entity-graph?cluster=${cluster.id}`}>{cluster.displayId}<GitBranch size={12} /></Link> : <span>BASELINE</span>}</div></div><div className="correlation-evidence__actions">{investigation ? <Link to={`/investigations?investigation=${investigation.id}`}><CircleAlert size={14} />Open investigation</Link> : null}<Link to={`/transactions?tx=${transaction.id}`}><ExternalLink size={14} />Open transaction</Link></div></SectionCard>
}
