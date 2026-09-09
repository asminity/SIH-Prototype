import { useState } from 'react'
import { AlertTriangle, Filter, Search, ShieldAlert } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { getAlertDetail, getAlerts, updateAlertStatus } from '../services/mockServices'
import type { AlertId, AlertStatus, Severity } from '../types/domain'
import { AlertDetail } from '../components/alerts/AlertDetail'
import { AlertTable } from '../components/alerts/AlertTable'
import { MetricCard } from '../components/ui/MetricCard'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'

const severityWeight: Record<Severity, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
const defaultFrom = '2026-09-01'
const defaultTo = '2026-09-05'

function inDateRange(timestamp: string, from: string, to: string) {
  const time = new Date(timestamp).getTime()
  return time >= new Date(`${from}T00:00:00.000Z`).getTime() && time <= new Date(`${to}T23:59:59.999Z`).getTime()
}

export function AlertsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [refresh, setRefresh] = useState(0)
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState<'ALL' | Severity>('ALL')
  const [status, setStatus] = useState<'ALL' | AlertStatus>('ALL')
  const [riskMin, setRiskMin] = useState(0)
  const [riskMax, setRiskMax] = useState(100)
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [sort, setSort] = useState('priority')
  void refresh
  const alerts = getAlerts()
  const query = search.trim().toLowerCase()
  const visibleAlerts = alerts.filter((alert) => {
    const matchesSearch = !query || [alert.id, alert.title, alert.entityId, alert.clusterId, ...alert.transactionIds].some((value) => value.toLowerCase().includes(query))
    return matchesSearch && (severity === 'ALL' || alert.severity === severity) && (status === 'ALL' || alert.status === status) && alert.riskScore >= riskMin && alert.riskScore <= riskMax && inDateRange(alert.generatedAt, from, to)
  }).sort((left, right) => {
    if (sort === 'risk') return right.riskScore - left.riskScore
    if (sort === 'confidence') return right.confidence - left.confidence
    if (sort === 'latest') return right.generatedAt.localeCompare(left.generatedAt)
    return severityWeight[right.severity] - severityWeight[left.severity] || right.riskScore - left.riskScore || right.confidence - left.confidence
  })
  const selectedId = searchParams.get('alert') ?? 'alert_0042'
  const selectedDetail = getAlertDetail(selectedId as AlertId) ?? getAlertDetail('alert_0042')
  const updateStatus = (nextStatus: AlertStatus) => { updateAlertStatus(selectedId as AlertId, nextStatus); setRefresh((value) => value + 1) }

  return <div className="alerts-page"><PageHeader eyebrow="AI ANALYSIS" title="AI Alerts" description="Prioritize deterministic risk signals and move from alert review into the connected evidence and investigation context." actions={<StatusBadge label="ANALYST QUEUE / SIMULATED" tone="warning" />} /><div className="alert-metrics"><MetricCard icon={<AlertTriangle size={17} />} label="VISIBLE ALERTS" value={visibleAlerts.length.toLocaleString('en-US')} detail="Current filter result" /><MetricCard icon={<ShieldAlert size={17} />} label="HIGH / CRITICAL" value={visibleAlerts.filter((alert) => alert.severity === 'HIGH' || alert.severity === 'CRITICAL').length.toLocaleString('en-US')} detail="Priority review queue" /><MetricCard icon={<Filter size={17} />} label="REQUIRES REVIEW" value={visibleAlerts.filter((alert) => alert.status === 'NEW' || alert.status === 'REVIEWING').length.toLocaleString('en-US')} detail="Open analyst actions" /></div><section className="alert-filters"><div className="alert-filters__label"><Search size={14} />FILTER REGISTER</div><div className="alert-search"><Search size={14} /><input aria-label="Search alerts" placeholder="Search alert, entity, cluster, transaction..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><label>SEVERITY<select value={severity} onChange={(event) => setSeverity(event.target.value as 'ALL' | Severity)}><option value="ALL">ALL</option><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="CRITICAL">CRITICAL</option></select></label><label>STATUS<select value={status} onChange={(event) => setStatus(event.target.value as 'ALL' | AlertStatus)}><option value="ALL">ALL</option><option value="NEW">NEW</option><option value="REVIEWING">REVIEWING</option><option value="CONFIRMED">CONFIRMED</option><option value="FALSE_POSITIVE">FALSE POSITIVE</option></select></label><label>RISK MIN<input type="number" min="0" max="100" value={riskMin} onChange={(event) => setRiskMin(Number(event.target.value))} /></label><label>RISK MAX<input type="number" min="0" max="100" value={riskMax} onChange={(event) => setRiskMax(Number(event.target.value))} /></label><label>FROM<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label>TO<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label><label>SORT<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="priority">INVESTIGATIVE PRIORITY</option><option value="risk">RISK SCORE</option><option value="confidence">CONFIDENCE</option><option value="latest">LATEST FIRST</option></select></label></section><AlertTable alerts={visibleAlerts} selectedId={selectedId} onSelect={(id) => setSearchParams({ alert: id })} />{selectedDetail ? <AlertDetail detail={selectedDetail} onStatusChange={updateStatus} /> : null}</div>
}
