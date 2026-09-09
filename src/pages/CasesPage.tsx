import { useState, useMemo } from 'react'
import {
  FileText,
  Save,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  GitBranch,
  Layers,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronRight,
  Zap,
  Play,
  Check,
  RotateCcw,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  getAlertDetail,
  getCaseById,
  getCases,
  getFeatureFusionAnalysis,
  getGraphData,
  getRiskAssessment,
  getTransactions,
  updateAlertStatus,
  updateCaseStatus,
} from '../services/mockServices'
import { GraphCanvas } from '../components/graph/GraphCanvas'
import { PageHeader } from '../components/ui/PageHeader'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import { StatusBadge } from '../components/ui/StatusBadge'

const formatTime = (timestamp: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(timestamp))

const caseLabel = (id: string) => id.replace('case_', 'CASE-').replaceAll('_', '-')

export function CasesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [refresh, setRefresh] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_REVIEW' | 'CLOSED' | 'URGENT'>('ALL')
  const [activeTab, setActiveTab] = useState<'dossier' | 'timeline' | 'models' | 'graph' | 'disposition'>('dossier')
  const [notes, setNotes] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState('wallet_cluster42_01')

  const cases = getCases()
  const selectedId = searchParams.get('case') ?? cases[0]?.id
  const selectedCase = selectedId ? getCaseById(selectedId) : cases[0]
  const detail = selectedCase ? getAlertDetail(selectedCase.sourceAlertId) : undefined

  void refresh

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Filter cases in register
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      if (statusFilter === 'OPEN') return c.status === 'OPEN'
      if (statusFilter === 'IN_REVIEW') return c.status === 'IN_REVIEW'
      if (statusFilter === 'CLOSED') return c.status === 'CLOSED'
      if (statusFilter === 'URGENT') return c.priority === 'URGENT'
      return true
    })
  }, [cases, searchQuery, statusFilter])

  if (!selectedCase || !detail) {
    return (
      <div className="case-page">
        <PageHeader
          eyebrow="OPERATIONAL THREAT TRIAGE"
          title="Case Management"
          description="Operational case management for linked investigations and multi-hop intelligence."
        />
        <div className="case-empty-card">
          <ShieldAlert size={32} className="text-amber" />
          <h3>No cases available</h3>
          <p>Create a case from an alert or investigation to begin the analyst review lifecycle.</p>
        </div>
      </div>
    )
  }

  const cluster = detail.cluster
  const risk = getRiskAssessment(cluster.id)
  const fusion = getFeatureFusionAnalysis(cluster.id)
  const graph = getGraphData(cluster.id)
  const transactions = getTransactions().filter((tx) => cluster.transactionIds.includes(tx.id))

  const handleStartReview = () => {
    updateCaseStatus(selectedCase.id, 'IN_REVIEW')
    updateAlertStatus(selectedCase.sourceAlertId, 'REVIEWING')
    setRefresh((v) => v + 1)
    showToast(`Case ${caseLabel(selectedCase.id)} is now IN REVIEW. Review underway.`)
  }

  const handleCompleteCase = (verdict: 'CONFIRMED' | 'FALSE_POSITIVE' = 'CONFIRMED') => {
    updateCaseStatus(selectedCase.id, 'CLOSED')
    updateAlertStatus(selectedCase.sourceAlertId, verdict)
    setRefresh((v) => v + 1)
    showToast(`Case ${caseLabel(selectedCase.id)} completed & marked CLOSED (${verdict.replace('_', ' ')}).`)
  }

  const handleReopenCase = () => {
    updateCaseStatus(selectedCase.id, 'OPEN')
    updateAlertStatus(selectedCase.sourceAlertId, 'REVIEWING')
    setRefresh((v) => v + 1)
    showToast(`Case ${caseLabel(selectedCase.id)} re-opened as OPEN.`)
  }

  const updateDecision = (decision: string) => {
    if (decision === 'REVIEWING') {
      handleStartReview()
    } else if (decision === 'CONFIRMED') {
      handleCompleteCase('CONFIRMED')
    } else if (decision === 'FALSE_POSITIVE') {
      handleCompleteCase('FALSE_POSITIVE')
    } else if (decision === 'REOPEN') {
      handleReopenCase()
    }
  }

  const saveNotes = () => {
    setRefresh((v) => v + 1)
    showToast('Analyst notes saved and timestamped to case dossier')
  }

  const caseSeverity = detail.alert.severity
  const caseRiskScore = detail.alert.riskScore
  const caseConfidence = detail.alert.confidence
  const lastUpdated = detail.alert.generatedAt
  const decision =
    detail.alert.status === 'CONFIRMED'
      ? 'CONFIRMED'
      : detail.alert.status === 'FALSE_POSITIVE'
        ? 'FALSE_POSITIVE'
        : detail.alert.status === 'REVIEWING'
          ? 'REVIEWING'
          : 'PENDING'

  return (
    <div className="case-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="hud-toast" role="status">
          <CheckCircle2 size={15} className="text-cyan" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        eyebrow="OPERATIONAL THREAT TRIAGE &amp; DOSSIERS"
        title="Case Management"
        description="Collaborative blockchain intelligence dossiers, multi-hop evidence correlation, and formal disposition workbench."
        actions={
          <div className="flex-actions">
            <Link to={`/reports?case=${selectedCase.id}`} className="button button--secondary">
              <FileText size={14} />
              <span>DOSSIER REPORT</span>
            </Link>
            <StatusBadge label={`${cases.length} REGISTERED CASES`} tone="neutral" />
          </div>
        }
      />

      {/* Top Cyber Command KPI Strip */}
      <section className="case-kpi-strip" aria-label="Case Register Metrics">
        <div className="case-kpi-card">
          <div className="case-kpi-icon case-kpi-icon--cyan">
            <ShieldAlert size={18} />
          </div>
          <div className="case-kpi-content">
            <span className="case-kpi-label">ACTIVE CASES</span>
            <strong className="case-kpi-value">{cases.filter((c) => c.status !== 'CLOSED').length} OPEN</strong>
            <small className="case-kpi-sub">{cases.filter((c) => c.priority === 'URGENT').length} Urgent Priority</small>
          </div>
        </div>

        <div className="case-kpi-card">
          <div className="case-kpi-icon case-kpi-icon--red">
            <Zap size={18} />
          </div>
          <div className="case-kpi-content">
            <span className="case-kpi-label">PEAK THREAT POSTURE</span>
            <strong className="case-kpi-value">{caseRiskScore} / 100</strong>
            <small className="case-kpi-sub">{Math.round(caseConfidence * 100)}% Model Confidence</small>
          </div>
        </div>

        <div className="case-kpi-card">
          <div className="case-kpi-icon case-kpi-icon--amber">
            <Layers size={18} />
          </div>
          <div className="case-kpi-content">
            <span className="case-kpi-label">TRACKED VOL / HOPS</span>
            <strong className="case-kpi-value">{cluster.transactionIds.length} TXs</strong>
            <small className="case-kpi-sub">{cluster.walletIds.length} Implicated Wallets</small>
          </div>
        </div>

        <div className="case-kpi-card">
          <div className="case-kpi-icon case-kpi-icon--green">
            <UserCheck size={18} />
          </div>
          <div className="case-kpi-content">
            <span className="case-kpi-label">ASSIGNED INVESTIGATOR</span>
            <strong className="case-kpi-value">{selectedCase.assignedTo}</strong>
            <small className="case-kpi-sub">Updated {formatTime(lastUpdated)}</small>
          </div>
        </div>
      </section>

      {/* Main 2-Column Master-Detail Layout */}
      <div className="case-workspace">
        {/* Left: Case Register Shelf */}
        <aside className="case-shelf" aria-label="Case Register">
          <div className="case-shelf__header">
            <div className="case-shelf__title-row">
              <h3>CASE REGISTER</h3>
              <span className="case-shelf__badge">{filteredCases.length}</span>
            </div>

            {/* Search Input */}
            <div className="case-search-box">
              <Search size={14} className="case-search-icon" />
              <input
                type="text"
                placeholder="Search case ID, title, analyst..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search cases"
              />
            </div>

            {/* Filter Pills */}
            <div className="case-filter-pills">
              {(['ALL', 'OPEN', 'IN_REVIEW', 'CLOSED', 'URGENT'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`case-filter-pill ${statusFilter === filter ? 'case-filter-pill--active' : ''}`}
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Case Cards List */}
          <div className="case-cards-list">
            {filteredCases.map((item) => {
              const itemDetail = getAlertDetail(item.sourceAlertId)
              const isSelected = item.id === selectedCase.id
              const itemRisk = itemDetail?.alert.riskScore ?? 80

              return (
                <div
                  key={item.id}
                  className={`case-item-card ${isSelected ? 'case-item-card--active' : ''}`}
                  onClick={() => {
                    setNotes('')
                    setSelectedNodeId('wallet_cluster42_01')
                    setSearchParams({ case: item.id })
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSearchParams({ case: item.id })
                    }
                  }}
                >
                  <div className="case-item-card__top">
                    <span className="case-item-card__id">{caseLabel(item.id)}</span>
                    <span
                      className={`case-priority-badge case-priority-badge--${item.priority.toLowerCase()}`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <h4 className="case-item-card__title">{item.title}</h4>

                  <div className="case-item-card__meta">
                    <span className="case-meta-analyst">
                      <UserCheck size={12} />
                      {item.assignedTo}
                    </span>
                    <span className={`case-meta-risk ${itemRisk >= 85 ? 'text-red' : 'text-amber'}`}>
                      Risk {itemRisk}/100
                    </span>
                  </div>

                  <div className="case-item-card__footer">
                    <span className={`case-status-pill case-status-pill--${item.status.toLowerCase()}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <ChevronRight size={14} className="case-item-chevron" />
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* Right: Case Dossier Workbench */}
        <main className="case-workbench" aria-label="Case Dossier Details">
          {/* Dossier Header Banner */}
          <section className="case-banner">
            <div className="case-banner__main">
              <div className="case-banner__eyebrow">
                <span>CASE DOSSIER</span>
                <span className="case-banner__id">{caseLabel(selectedCase.id)}</span>
                <span className="case-banner__dot" />
                <span>{selectedCase.assignedTo}</span>
              </div>
              <h2 className="case-banner__title">{selectedCase.title}</h2>
              <p className="case-banner__summary">{detail.investigation.evidenceSummary}</p>
            </div>

            <div className="case-banner__risk-hud">
              <div className="case-risk-block">
                <SeverityBadge severity={caseSeverity} />
                <div className="case-risk-number">
                  <strong>{caseRiskScore}</strong>
                  <span>/100</span>
                </div>
                <small className="case-risk-conf">{Math.round(caseConfidence * 100)}% Confidence</small>
              </div>
              <div className="case-banner__actions-col">
                <StatusBadge
                  label={selectedCase.status.replace('_', ' ')}
                  tone={selectedCase.status === 'CLOSED' ? 'operational' : selectedCase.status === 'IN_REVIEW' ? 'warning' : 'neutral'}
                />
                {selectedCase.status === 'OPEN' && (
                  <button
                    type="button"
                    className="button button--primary button--sm"
                    onClick={handleStartReview}
                    title="Start reviewing this case"
                  >
                    <Play size={12} />
                    <span>START REVIEW</span>
                  </button>
                )}
                {selectedCase.status === 'IN_REVIEW' && (
                  <button
                    type="button"
                    className="button button--primary button--sm"
                    onClick={() => handleCompleteCase('CONFIRMED')}
                    title="Complete review and mark case closed"
                  >
                    <Check size={12} />
                    <span>COMPLETE CASE</span>
                  </button>
                )}
                {selectedCase.status === 'CLOSED' && (
                  <button
                    type="button"
                    className="button button--secondary button--sm"
                    onClick={handleReopenCase}
                    title="Re-open case for further investigation"
                  >
                    <RotateCcw size={12} />
                    <span>REOPEN CASE</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Quick Actions & Navigation Tabs */}
          <div className="case-toolbar">
            <div className="case-tabs">
              <button
                type="button"
                className={`case-tab ${activeTab === 'dossier' ? 'case-tab--active' : ''}`}
                onClick={() => setActiveTab('dossier')}
              >
                <Layers size={14} />
                <span>Dossier Scope</span>
              </button>
              <button
                type="button"
                className={`case-tab ${activeTab === 'timeline' ? 'case-tab--active' : ''}`}
                onClick={() => setActiveTab('timeline')}
              >
                <Clock size={14} />
                <span>Timeline ({detail.timeline.length})</span>
              </button>
              <button
                type="button"
                className={`case-tab ${activeTab === 'models' ? 'case-tab--active' : ''}`}
                onClick={() => setActiveTab('models')}
              >
                <Zap size={14} />
                <span>AI &amp; Fusion ({fusion.models.length + 1})</span>
              </button>
              <button
                type="button"
                className={`case-tab ${activeTab === 'graph' ? 'case-tab--active' : ''}`}
                onClick={() => setActiveTab('graph')}
              >
                <GitBranch size={14} />
                <span>Graph Context</span>
              </button>
              <button
                type="button"
                className={`case-tab ${activeTab === 'disposition' ? 'case-tab--active' : ''}`}
                onClick={() => setActiveTab('disposition')}
              >
                <ShieldCheck size={14} />
                <span>Disposition &amp; Notes</span>
              </button>
            </div>

            <div className="case-toolbar__links">
              <Link to={`/reports?case=${selectedCase.id}`} className="case-pill-link">
                <FileText size={13} />
                <span>Executive Report</span>
              </Link>
              <Link to="/entity-graph" className="case-pill-link">
                <GitBranch size={13} />
                <span>Full Graph</span>
              </Link>
              <Link to={`/transactions?tx=${transactions[0]?.id}`} className="case-pill-link">
                <ExternalLink size={13} />
                <span>Transactions</span>
              </Link>
            </div>
          </div>

          {/* TAB 1: DOSSIER & SCOPE */}
          {activeTab === 'dossier' && (
            <div className="case-tab-content case-tab-content--fade">
              {/* Evidence Scope Overview Grid */}
              <div className="case-scope-grid">
                <div className="scope-box">
                  <span className="scope-box__label">FIRST OBSERVED</span>
                  <strong className="scope-box__value">
                    {formatTime(detail.timeline[0]?.timestamp ?? selectedCase.createdAt)}
                  </strong>
                </div>
                <div className="scope-box">
                  <span className="scope-box__label">LAST OBSERVED</span>
                  <strong className="scope-box__value">
                    {formatTime(detail.timeline.at(-1)?.timestamp ?? lastUpdated)}
                  </strong>
                </div>
                <div className="scope-box">
                  <span className="scope-box__label">PRIMARY SYNDICATE</span>
                  <strong className="scope-box__value text-cyan">{cluster.displayId}</strong>
                </div>
                <div className="scope-box">
                  <span className="scope-box__label">CURRENT DECISION</span>
                  <strong
                    className={`scope-box__value ${
                      decision === 'CONFIRMED' ? 'text-red' : decision === 'FALSE_POSITIVE' ? 'text-green' : 'text-amber'
                    }`}
                  >
                    {decision === 'PENDING' ? 'PENDING DECISION' : decision}
                  </strong>
                </div>
              </div>

              {/* Related Alert Detail Card */}
              <div className="case-panel">
                <div className="case-panel__header">
                  <div>
                    <span className="case-panel__eyebrow">TRIGGERING ALERT</span>
                    <h3>{detail.alert.id.replace('alert_', 'ALERT-')} · {detail.alert.title}</h3>
                  </div>
                  <Link to={`/ai-alerts?alert=${detail.alert.id}`} className="button button--secondary button--sm">
                    <span>Inspect Alert</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
                <p className="case-panel__desc">{detail.alert.description}</p>

                <div className="alert-meta-ribbon">
                  <div className="ribbon-item">
                    <span>Severity</span>
                    <strong>{detail.alert.severity}</strong>
                  </div>
                  <div className="ribbon-item">
                    <span>Risk Points</span>
                    <strong className="text-red">{detail.alert.riskScore} / 100</strong>
                  </div>
                  <div className="ribbon-item">
                    <span>Model Confidence</span>
                    <strong>{Math.round(detail.alert.confidence * 100)}%</strong>
                  </div>
                  <div className="ribbon-item">
                    <span>Alert Status</span>
                    <strong>{detail.alert.status}</strong>
                  </div>
                </div>
              </div>

              {/* Contributing Evidence Signals */}
              <div className="case-panel">
                <div className="case-panel__header">
                  <div>
                    <span className="case-panel__eyebrow">CONTRIBUTING EVIDENCE</span>
                    <h3>Correlated Intelligence Signals ({detail.evidence.length})</h3>
                  </div>
                </div>
                <div className="evidence-signals-list">
                  {detail.evidence.map((signal, index) => (
                    <div key={index} className="evidence-signal-row">
                      <CheckCircle2 size={16} className="text-cyan evidence-signal-icon" />
                      <span>{signal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="case-tab-content case-tab-content--fade">
              <div className="case-panel">
                <div className="case-panel__header">
                  <div>
                    <span className="case-panel__eyebrow">CHRONOLOGICAL AUDIT</span>
                    <h3>Investigation Event Stream</h3>
                  </div>
                </div>

                <div className="case-timeline-v2">
                  {detail.timeline.map((event, idx) => (
                    <div key={event.id} className="timeline-node">
                      <div className="timeline-node__marker">
                        <span className="timeline-node__dot" />
                        {idx < detail.timeline.length - 1 && <span className="timeline-node__line" />}
                      </div>
                      <div className="timeline-node__body">
                        <div className="timeline-node__header">
                          <time>{formatTime(event.timestamp)}</time>
                          <span className="timeline-node__tag">OBSERVED EVENT</span>
                        </div>
                        <h4>{event.title}</h4>
                        <p>{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI & FUSION MODELS */}
          {activeTab === 'models' && (
            <div className="case-tab-content case-tab-content--fade">
              {/* Models Grid */}
              <div className="models-cards-grid">
                {fusion.models.map((model) => (
                  <div key={model.model} className="model-stat-card">
                    <div className="model-stat-card__top">
                      <span className="model-tag">{model.model}</span>
                      <span className="model-conf">{Math.round(model.confidence * 100)}% Confidence</span>
                    </div>
                    <div className="model-stat-card__score">
                      <strong>{model.anomalyScore.toFixed(2)}</strong>
                      <span className="model-class">{model.classification}</span>
                    </div>
                    <p className="model-stat-card__desc">{model.assessment}</p>
                  </div>
                ))}

                {/* Feature Fusion Card */}
                <div className="model-stat-card model-stat-card--highlight">
                  <div className="model-stat-card__top">
                    <span className="model-tag text-cyan">FEATURE FUSION ENGINE</span>
                    <span className="model-conf">
                      {Math.round((fusion.fusion?.confidence ?? 0.94) * 100)}% Confidence
                    </span>
                  </div>
                  <div className="model-stat-card__score">
                    <strong className="text-cyan">{fusion.fusion?.fusedScore.toFixed(3) ?? '0.942'}</strong>
                    <span className="model-class">{fusion.fusion?.classification ?? 'High Risk Dispersion'}</span>
                  </div>
                  <p className="model-stat-card__desc">
                    Weighted Bayesian fusion combining Elliptic graph features ({Math.round((fusion.fusion?.ellipticContribution ?? 0.6) * 100)}%) with UGRansome network telemetry ({Math.round((fusion.fusion?.ugransomeContribution ?? 0.4) * 100)}%).
                  </p>
                </div>
              </div>

              {/* Risk Engine Breakdown */}
              {risk && (
                <div className="case-panel">
                  <div className="case-panel__header">
                    <div>
                      <span className="case-panel__eyebrow">SCORING BREAKDOWN</span>
                      <h3>Risk Factor Attribution (+{risk.score} Points Total)</h3>
                    </div>
                  </div>
                  <div className="risk-factors-table">
                    {risk.breakdown.map((factor) => (
                      <div key={factor.label} className="risk-factor-row">
                        <div className="risk-factor-row__main">
                          <strong>{factor.label}</strong>
                          <p>{factor.evidence}</p>
                        </div>
                        <span className="risk-factor-pts">+{factor.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GRAPH CONTEXT */}
          {activeTab === 'graph' && (
            <div className="case-tab-content case-tab-content--fade">
              <div className="case-panel">
                <div className="case-panel__header">
                  <div>
                    <span className="case-panel__eyebrow">INTERACTIVE TOPOLOGY CONTEXT</span>
                    <h3>{cluster.displayId} Network &amp; UTXO Graph</h3>
                  </div>
                  <Link to="/entity-graph" className="button button--secondary button--sm">
                    <GitBranch size={13} />
                    <span>Expand Full Screen</span>
                  </Link>
                </div>

                <div className="case-graph-container">
                  <GraphCanvas
                    graph={graph}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={setSelectedNodeId}
                    onReset={() => setSelectedNodeId('wallet_cluster42_01')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DISPOSITION & NOTES */}
          {activeTab === 'disposition' && (
            <div className="case-tab-content case-tab-content--fade">
              {/* Disposition Action Buttons */}
              <div className="case-panel">
                <div className="case-panel__header">
                  <div>
                    <span className="case-panel__eyebrow">DISPOSITION ACTION</span>
                    <h3>Analyst Review Verdict</h3>
                  </div>
                  <span className="case-current-disposition">
                    Current: <strong>{decision}</strong>
                  </span>
                </div>

                <div className="disposition-actions-bar">
                  <button
                    type="button"
                    className={`disposition-btn disposition-btn--review ${
                      decision === 'REVIEWING' ? 'disposition-btn--active' : ''
                    }`}
                    onClick={() => updateDecision('REVIEWING')}
                  >
                    <Clock size={16} />
                    <div>
                      <strong>Mark Under Review</strong>
                      <small>Keep case open for extended telemetry collection</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`disposition-btn disposition-btn--confirm ${
                      decision === 'CONFIRMED' ? 'disposition-btn--active' : ''
                    }`}
                    onClick={() => updateDecision('CONFIRMED')}
                  >
                    <AlertTriangle size={16} />
                    <div>
                      <strong>Confirm Threat Pattern</strong>
                      <small>Validate laundering syndicate and flag addresses</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`disposition-btn disposition-btn--dismiss ${
                      decision === 'FALSE_POSITIVE' ? 'disposition-btn--active' : ''
                    }`}
                    onClick={() => updateDecision('FALSE_POSITIVE')}
                  >
                    <XCircle size={16} />
                    <div>
                      <strong>Mark False Positive &amp; Close</strong>
                      <small>Dismiss alert as legitimate exchange activity</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`disposition-btn disposition-btn--reopen ${
                      selectedCase.status === 'OPEN' ? 'disposition-btn--active' : ''
                    }`}
                    onClick={() => updateDecision('REOPEN')}
                  >
                    <RotateCcw size={16} />
                    <div>
                      <strong>Re-open / Fresh Case</strong>
                      <small>Reset case to OPEN for initial triage assignment</small>
                    </div>
                  </button>
                </div>
              </div>

              {/* Analyst Working Notes */}
              <div className="case-panel">
                <div className="case-panel__header">
                  <div>
                    <span className="case-panel__eyebrow">CASE SCRATCHPAD</span>
                    <h3>Investigator Notes &amp; Chain of Custody</h3>
                  </div>
                </div>

                <textarea
                  className="case-notes-editor"
                  placeholder="Record evidentiary findings, law enforcement referral notes, or chain-of-custody memos..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                />

                <div className="case-notes-footer">
                  <span className="case-notes-status">
                    {notes ? `${notes.length} characters recorded` : 'No unsaved notes entered.'}
                  </span>
                  <button type="button" className="button button--primary" onClick={saveNotes}>
                    <Save size={14} />
                    <span>SAVE NOTES</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
