import { useState } from 'react'
import { Check, CircleAlert, FilePlus2, ShieldAlert, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { createCaseFromAlert, getAlertDetail, getGraphData, getInvestigation, getRiskAssessment, getTransactions, updateAlertStatus } from '../services/mockServices'
import type { AlertId, AlertStatus, InvestigationId } from '../types/domain'
import { GraphCanvas } from '../components/graph/GraphCanvas'
import { InvestigationEvidence } from '../components/investigation/InvestigationEvidence'
import { PageHeader } from '../components/ui/PageHeader'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import { StatusBadge } from '../components/ui/StatusBadge'

const formatTime = (timestamp?: string) => timestamp ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(timestamp)) : 'Not available'

export function InvestigationPage() {
  const [searchParams] = useSearchParams()
  const [refresh, setRefresh] = useState(0)
  const [selectedNodeId, setSelectedNodeId] = useState<string>('cluster_42')
  const [caseId, setCaseId] = useState<string>()
  void refresh
  const requestedInvestigationId = (searchParams.get('investigation') ?? 'investigation_2026_0042') as InvestigationId
  const investigation = getInvestigation(requestedInvestigationId) ?? getInvestigation('investigation_2026_0042')!
  const alertId = (searchParams.get('alert') as AlertId | null) ?? investigation.primaryAlertId
  const detail = getAlertDetail(alertId) ?? getAlertDetail('alert_0042')!
  const cluster = detail.cluster
  const risk = getRiskAssessment(cluster.id)!
  const graph = getGraphData(cluster.id)
  const transactions = getTransactions().filter((transaction) => cluster.transactionIds.includes(transaction.id))
  const timestamps = [...transactions.map((transaction) => transaction.timestamp), ...detail.timeline.map((event) => event.timestamp)].sort()
  const alert = detail.alert
  const updateStatus = (status: AlertStatus) => { updateAlertStatus(alert.id, status); setRefresh((value) => value + 1) }
  const createCase = () => { const created = createCaseFromAlert(alert.id); if (created) setCaseId(created.id) }

  return <div className="investigation-page"><PageHeader eyebrow="INVESTIGATION" title={`Investigation / ${cluster.displayId}`} description="Review the connected evidence, graph context, and analyst explanation for the selected alert." actions={<StatusBadge label="ANALYST WORKSPACE" tone="neutral" />} /><div className="investigation-actions"><span><CircleAlert size={14} /> ALERT-{alert.id.replace('alert_', '')} / {alert.status}</span><div><button disabled={alert.status === 'CONFIRMED' || alert.status === 'FALSE_POSITIVE'} onClick={() => updateStatus('CONFIRMED')} type="button"><Check size={14} />Confirm</button><button className="investigation-action--danger" disabled={alert.status === 'CONFIRMED' || alert.status === 'FALSE_POSITIVE'} onClick={() => updateStatus('FALSE_POSITIVE')} type="button"><X size={14} />False positive</button><button onClick={createCase} type="button"><FilePlus2 size={14} />Create case</button></div></div>{caseId ? <div className="investigation-case-toast"><Check size={14} /> Case {caseId.replace('case_', 'CASE-')} prepared for Stage 12 <Link to={`/cases?case=${caseId}`}>Open case route</Link></div> : null}<div className="investigation-workspace"><aside className="investigation-summary"><div className="investigation-summary__heading"><ShieldAlert size={17} /><div><p>INVESTIGATION SUMMARY</p><h2>{cluster.displayId}</h2></div></div><div className="investigation-summary__risk"><SeverityBadge severity={cluster.severity} /><strong>{cluster.riskScore}<small> / 100</small></strong><span>{Math.round(cluster.confidence * 100)}% confidence</span></div><dl><dt>First observed</dt><dd>{formatTime(timestamps[0])}</dd><dt>Last observed</dt><dd>{formatTime(timestamps[timestamps.length - 1])}</dd><dt>Transactions</dt><dd>{cluster.transactionIds.length}</dd><dt>Wallets</dt><dd>{cluster.walletIds.length}</dd><dt>IPs</dt><dd>{cluster.ipAddressIds.length}</dd></dl><div className="investigation-summary__links"><Link to={`/entity-explorer?entity=${cluster.entityId}`}>Open entity context</Link><Link to={`/entity-graph?cluster=${cluster.id}`}>Open full graph</Link><Link to={`/transactions?tx=${cluster.transactionIds[0]}`}>Open transaction evidence</Link></div></aside><section className="investigation-graph"><div className="investigation-panel-heading"><div><p>ENTITY GRAPH</p><h2>Observed relationship structure</h2></div><span>Select a node to highlight relationships</span></div><GraphCanvas graph={graph} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} onReset={() => setSelectedNodeId('cluster_42')} /></section><aside className="investigation-right"><div className="investigation-panel-heading"><div><p>EVIDENCE / AI EXPLANATION</p><h2>Why was this alert generated?</h2></div></div><InvestigationEvidence factors={risk.breakdown} clusterTransactionCount={cluster.transactionIds.length} walletCount={cluster.walletIds.length} ipCount={cluster.ipAddressIds.length} /><div className="investigation-ai-explanation"><h3>AI explanation</h3><ul>{risk.rationale.map((reason) => <li key={reason}>{reason}</li>)}</ul><div><span>FINAL ASSESSMENT</span><strong>{risk.severity}</strong><p>Combined evidence indicates activity requiring analyst review.</p></div></div></aside></div><section className="investigation-timeline"><div className="investigation-panel-heading"><div><p>CHRONOLOGY</p><h2>Investigation timeline</h2></div><span>{detail.timeline.length} events / chronological evidence</span></div><div className="investigation-timeline__track">{[...detail.timeline].sort((left, right) => left.timestamp.localeCompare(right.timestamp)).map((event) => <div className="investigation-timeline__event" key={event.id}><span className="investigation-timeline__dot" /><time>{formatTime(event.timestamp)}</time><div><strong>{event.title}</strong><p>{event.description}</p></div></div>)}</div></section></div>
}
