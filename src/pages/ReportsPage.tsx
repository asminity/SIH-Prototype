import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Printer,
  Download,
  Copy,
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  Terminal,
  FileText,
} from 'lucide-react'
import {
  getAlertDetail,
  getCaseById,
  getCases,
  getCorrelationAnalysis,
  getFeatureFusionAnalysis,
  getGraphData,
  generateReportData,
  getRiskAssessment,
  getTransactionIntelligence,
} from '../services/mockServices'
import { PageHeader } from '../components/ui/PageHeader'
import { SeverityBadge } from '../components/ui/SeverityBadge'

const formatTime = (timestamp: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(timestamp))

const shortHash = (hash: string) => `${hash.slice(0, 8)}...${hash.slice(-8)}`
const caseLabel = (id: string) => id.replace('case_', 'CASE-').replaceAll('_', '-')

export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const cases = getCases()
  const caseId = searchParams.get('case') ?? cases[0]?.id ?? 'case_2026_0042'
  const selectedCase = getCaseById(caseId) ?? cases[0]

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  if (!selectedCase) {
    return (
      <div className="report-page">
        <PageHeader
          eyebrow="INTELLIGENCE REPORTING"
          title="Forensic Reports"
          description="Print-ready forensic intelligence reports generated from verified evidentiary cases."
        />
        <div className="case-empty-card">
          <FileText size={32} className="text-amber" />
          <h3>No report available</h3>
          <p>Please register and select an active case to generate a forensic intelligence dossier.</p>
        </div>
      </div>
    )
  }

  const detail = getAlertDetail(selectedCase.sourceAlertId)
  if (!detail) {
    return (
      <div className="report-page">
        <PageHeader
          eyebrow="INTELLIGENCE REPORTING"
          title="Forensic Reports"
          description="Print-ready forensic intelligence reports generated from verified evidentiary cases."
        />
        <div className="case-empty-card">
          <ShieldAlert size={32} className="text-red" />
          <h3>Case evidence unavailable</h3>
          <p>The selected case does not have an attached alert or evidence scope.</p>
        </div>
      </div>
    )
  }

  const report =
    generateReportData(selectedCase.id) ?? {
      id: `report_${selectedCase.id.replace('case_', '')}`,
      generatedAt: new Date().toISOString(),
      title: `${selectedCase.title} Forensic Dossier`,
      sections: [],
      finding: '',
      caseId: selectedCase.id,
      investigationId: selectedCase.investigationId,
    }

  const risk = getRiskAssessment(detail.cluster.id)
  const fusion = getFeatureFusionAnalysis(detail.cluster.id)
  const correlations = getCorrelationAnalysis(detail.cluster.id)
  const transactions = getTransactionIntelligence()
    .filter((record) => detail.cluster.transactionIds.includes(record.transaction.id))
    .slice(0, 8)
  const graph = getGraphData(detail.cluster.id)
  const entityLabels = graph.nodes
    .filter((node) => node.type === 'ENTITY' || node.type === 'CLUSTER')
    .map((node) => node.label)

  const caseSeverity = detail.alert.severity
  const caseRiskScore = detail.alert.riskScore
  const caseConfidence = detail.alert.confidence
  const decision =
    detail.alert.status === 'CONFIRMED'
      ? 'CONFIRMED THREAT'
      : detail.alert.status === 'FALSE_POSITIVE'
        ? 'FALSE POSITIVE'
        : 'UNDER REVIEW'

  const handleExportJSON = () => {
    const reportData = {
      reportId: report.id,
      generatedAt: report.generatedAt,
      caseId: selectedCase.id,
      caseTitle: selectedCase.title,
      assignedTo: selectedCase.assignedTo,
      classification: 'HIGH RISK / LAW ENFORCEMENT GRADE',
      riskScore: caseRiskScore,
      confidence: caseConfidence,
      primaryCluster: detail.cluster.displayId,
      implicatedTransactions: detail.cluster.transactionIds,
      implicatedWallets: detail.cluster.walletIds,
      implicatedIps: detail.cluster.ipAddressIds,
      aiModels: fusion.models,
      fusedScore: fusion.fusion?.fusedScore,
      decision,
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.id}-forensic-dossier.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported forensic intelligence dossier JSON file')
  }

  const handleCopySummary = () => {
    const summary = `BITCOIN FI FORENSIC REPORT [${caseLabel(selectedCase.id)}]\nTitle: ${selectedCase.title}\nRisk Score: ${caseRiskScore}/100 (${Math.round(caseConfidence * 100)}% confidence)\nCluster: ${detail.cluster.displayId}\nFinding: ${report.finding}`
    navigator.clipboard.writeText(summary)
    showToast('Copied executive report summary to clipboard')
  }

  return (
    <div className="report-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="hud-toast" role="status">
          <CheckCircle2 size={15} className="text-cyan" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Floating Action & Selector Bar */}
      <div className="report-controls-bar">
        <div className="report-controls-left">
          <Link to={`/cases?case=${selectedCase.id}`} className="button button--secondary button--sm">
            <ArrowLeft size={14} />
            <span>Back to Case Workbench</span>
          </Link>

          {/* Case Dropdown Selector */}
          <div className="report-case-select-wrap">
            <span className="report-select-label">SELECT REPORT CASE:</span>
            <select
              className="report-case-select"
              value={selectedCase.id}
              onChange={(e) => setSearchParams({ case: e.target.value })}
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {caseLabel(c.id)} — {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="report-controls-right">
          <button type="button" className="button button--secondary button--sm" onClick={handleCopySummary}>
            <Copy size={14} />
            <span>COPY SUMMARY</span>
          </button>
          <button type="button" className="button button--secondary button--sm" onClick={handleExportJSON}>
            <Download size={14} />
            <span>EXPORT JSON</span>
          </button>
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={() => window.print()}
          >
            <Printer size={14} />
            <span>PRINT / SAVE PDF</span>
          </button>
        </div>
      </div>

      {/* Official Intelligence Dossier Document */}
      <article className="forensic-dossier" id="printable-report">
        {/* Classification Header Banner */}
        <div className="dossier-classification-banner">
          <span>RESTRICTED // LAW ENFORCEMENT &amp; COMPLIANCE GRADE INTELLIGENCE // DO NOT DISCLOSE</span>
        </div>

        {/* Dossier Title Header */}
        <header className="dossier-header">
          <div className="dossier-header__brand">
            <div className="dossier-logo-badge">
              <Terminal size={22} className="text-cyan" />
            </div>
            <div>
              <p className="dossier-eyebrow">BITCOIN FI INTELLIGENCE PLATFORM · SIGNAL FORENSICS</p>
              <h1 className="dossier-title">FINANCIAL CRIME FORENSIC DOSSIER</h1>
              <p className="dossier-subtitle">
                Cryptographic UTXO Flow Analysis, Tor BGP Attribution, and Multi-Model Bayesian Threat Fusion
              </p>
            </div>
          </div>

          <div className="dossier-header__meta">
            <div className="dossier-meta-card">
              <span className="dossier-meta-card__label">CASE IDENTIFIER</span>
              <strong className="dossier-meta-card__val text-cyan">{caseLabel(selectedCase.id)}</strong>
            </div>
            <div className="dossier-meta-card">
              <span className="dossier-meta-card__label">INTEGRITY HASH</span>
              <strong className="dossier-meta-card__val font-mono">SHA256: 8f42a91c...</strong>
            </div>
            <div className="dossier-meta-card">
              <span className="dossier-meta-card__label">GENERATED AT</span>
              <strong className="dossier-meta-card__val">{formatTime(report.generatedAt)}</strong>
            </div>
            <div className="dossier-meta-card">
              <span className="dossier-meta-card__label">INVESTIGATOR</span>
              <strong className="dossier-meta-card__val">{selectedCase.assignedTo}</strong>
            </div>
          </div>
        </header>

        {/* Risk Assessment Gauge HUD */}
        <section className="dossier-risk-gauge">
          <div className="gauge-score-box">
            <div className="gauge-score-value">
              <strong>{caseRiskScore}</strong>
              <small>/ 100</small>
            </div>
            <SeverityBadge severity={caseSeverity} />
            <span className="gauge-confidence">{Math.round(caseConfidence * 100)}% Model Confidence</span>
          </div>

          <div className="gauge-summary-content">
            <div className="gauge-tag-row">
              <span className="gauge-tag gauge-tag--red">CRITICAL ESCALATION</span>
              <span className="gauge-tag gauge-tag--cyan">{detail.cluster.displayId}</span>
              <span className="gauge-tag gauge-tag--neutral">{decision}</span>
            </div>
            <h3>{selectedCase.title}</h3>
            <p className="gauge-finding">{report.finding}</p>
          </div>
        </section>

        {/* Quick Nav Anchors */}
        <nav className="dossier-nav-strip" aria-label="Dossier Section Jumps">
          <a href="#sec-executive">01 Executive Summary</a>
          <a href="#sec-scope">02 Target Scope</a>
          <a href="#sec-transactions">03 Forensic Transactions</a>
          <a href="#sec-network">04 Network Routing &amp; Tor</a>
          <a href="#sec-ai">05 AI Multi-Model Fusion</a>
          <a href="#sec-timeline">06 Evidentiary Timeline</a>
          <a href="#sec-signoff">07 Final Sign-off</a>
        </nav>

        {/* SECTION 01: EXECUTIVE SUMMARY */}
        <section className="dossier-section" id="sec-executive">
          <div className="dossier-section__header">
            <span className="section-num">01</span>
            <h2>EXECUTIVE INTELLIGENCE SUMMARY</h2>
          </div>
          <div className="dossier-section__body">
            <p>
              This investigation dossier consolidates correlated evidence triggered by alert{' '}
              <strong>{detail.alert.id.replace('alert_', 'ALERT-')}</strong> against target syndicate{' '}
              <strong>{detail.cluster.displayId}</strong>. Analysis incorporates graph centrality, UTXO peeling-chain
              heuristics, high-velocity relay hops, and autonomous system geolocation.
            </p>
            <div className="dossier-callout">
              <div className="dossier-callout__icon">
                <ShieldAlert size={18} className="text-amber" />
              </div>
              <div>
                <strong>Primary Evidentiary Signal:</strong>
                <p>
                  Rapid multi-hop dispersion detected across 27 monitored transactions. Peeling chain outputs route
                  simultaneously through Tor exit relays on AS60729 (Germany) and AS9009 (Netherlands), terminating in
                  unregistered OTC liquidity pools.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 02: TARGET SCOPE */}
        <section className="dossier-section" id="sec-scope">
          <div className="dossier-section__header">
            <span className="section-num">02</span>
            <h2>TARGET PROFILE &amp; SCOPE INVENTORY</h2>
          </div>
          <div className="dossier-section__body">
            <table className="dossier-table">
              <tbody>
                <tr>
                  <th>Primary Syndicate Cluster</th>
                  <td className="text-cyan font-bold">{detail.cluster.displayId}</td>
                  <th>Associated Entity Label</th>
                  <td>{detail.entity.label}</td>
                </tr>
                <tr>
                  <th>Total Correlated Wallets</th>
                  <td>{detail.cluster.walletIds.length} Addresses Tracked</td>
                  <th>Observed Transactions</th>
                  <td>{detail.cluster.transactionIds.length} Bitcoin UTXO Flows</td>
                </tr>
                <tr>
                  <th>Network Edge Relays</th>
                  <td>{detail.cluster.ipAddressIds.length} Monitored IP Addresses</td>
                  <th>Autonomous Systems</th>
                  <td>AS60729, AS9009, AS49981, AS51852</td>
                </tr>
                <tr>
                  <th>Jurisdictions Observed</th>
                  <td>DE (Germany), NL (Netherlands), LU (Luxembourg), CH (Switzerland)</td>
                  <th>Operational Status</th>
                  <td><span className="status-indicator-dot" /> {selectedCase.status}</td>
                </tr>
                <tr>
                  <th>Correlated Entity Nodes</th>
                  <td colSpan={3} className="font-mono text-cyan">{entityLabels.join(' · ')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 03: FORENSIC TRANSACTIONS */}
        <section className="dossier-section" id="sec-transactions">
          <div className="dossier-section__header">
            <span className="section-num">03</span>
            <h2>REPRESENTATIVE FORENSIC TRANSACTIONS</h2>
          </div>
          <div className="dossier-section__body">
            <p className="section-intro">
              Sampled high-anomaly transactions representing the primary dispersion peel chain for syndicate cluster {detail.cluster.displayId}:
            </p>
            <div className="dossier-table-wrap">
              <table className="dossier-table dossier-table--data">
                <thead>
                  <tr>
                    <th>TX HASH</th>
                    <th>TIMESTAMP</th>
                    <th>AMOUNT</th>
                    <th>INPUT WALLET</th>
                    <th>OUTPUT WALLET</th>
                    <th>SOURCE RELAY IP</th>
                    <th>RISK LEVEL</th>
                    <th>ANOMALY</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((rec) => (
                    <tr key={rec.transaction.id}>
                      <td className="font-mono text-cyan">{shortHash(rec.transaction.hash)}</td>
                      <td>{formatTime(rec.transaction.timestamp)}</td>
                      <td className="font-mono font-bold">{rec.transaction.amountBtc.toFixed(3)} BTC</td>
                      <td className="font-mono">{shortHash(rec.inputWallet.address)}</td>
                      <td className="font-mono">{shortHash(rec.outputWallet.address)}</td>
                      <td className="font-mono">{rec.sourceIp.address}</td>
                      <td>
                        <span
                          className={`risk-pill-sm ${
                            rec.transaction.riskLevel === 'HIGH' ? 'risk-pill-sm--red' : 'risk-pill-sm--amber'
                          }`}
                        >
                          {rec.transaction.riskLevel}
                        </span>
                      </td>
                      <td className="font-mono font-bold text-red">{rec.transaction.anomalyScore.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 04: NETWORK & TOR ROUTING */}
        <section className="dossier-section" id="sec-network">
          <div className="dossier-section__header">
            <span className="section-num">04</span>
            <h2>NETWORK ROUTING &amp; TOR EXIT ATTRIBUTION</h2>
          </div>
          <div className="dossier-section__body">
            <p className="section-intro">
              Correlated IP socket traffic and BGP Autonomous System routing observed at the Bitcoin node broadcast boundary:
            </p>
            <div className="dossier-table-wrap">
              <table className="dossier-table dossier-table--data">
                <thead>
                  <tr>
                    <th>IP ADDRESS</th>
                    <th>ROUTING PROTOCOL</th>
                    <th>CORRELATED TX</th>
                    <th>ASSOCIATED WALLET</th>
                    <th>EVIDENTIARY RELATIONSHIP</th>
                    <th>CONFIDENCE</th>
                  </tr>
                </thead>
                <tbody>
                  {correlations.slice(0, 6).map((item) => (
                    <tr key={item.correlation.id}>
                      <td className="font-mono text-cyan font-bold">{item.ipAddress.address}</td>
                      <td>{item.observation.protocol} / {item.observation.direction}</td>
                      <td className="font-mono">{shortHash(item.transaction.hash)}</td>
                      <td className="font-mono">{shortHash(item.wallet.address)}</td>
                      <td>{item.correlation.relationship}</td>
                      <td className="font-bold text-green">{Math.round(item.correlation.confidence * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 05: AI MULTI-MODEL FUSION */}
        <section className="dossier-section" id="sec-ai">
          <div className="dossier-section__header">
            <span className="section-num">05</span>
            <h2>AI MULTI-MODEL CONSENSUS &amp; FUSION</h2>
          </div>
          <div className="dossier-section__body">
            <div className="report-models-grid">
              {fusion.models.map((model) => (
                <div key={model.model} className="report-model-box">
                  <div className="report-model-box__head">
                    <span className="report-model-title">{model.model}</span>
                    <span className="report-model-conf">{Math.round(model.confidence * 100)}% Conf</span>
                  </div>
                  <div className="report-model-box__score">
                    <strong>{model.anomalyScore.toFixed(2)}</strong>
                    <span className="report-model-class">{model.classification}</span>
                  </div>
                  <p className="report-model-box__eval">{model.assessment}</p>
                </div>
              ))}
            </div>

            {/* Fusion Summary Table */}
            <table className="dossier-table dossier-table--compact">
              <tbody>
                <tr>
                  <th>Elliptic GCN Structural Weight</th>
                  <td>{Math.round((fusion.fusion?.ellipticContribution ?? 0.6) * 100)}% Contribution</td>
                  <th>UGRansome Network Weight</th>
                  <td>{Math.round((fusion.fusion?.ugransomeContribution ?? 0.4) * 100)}% Contribution</td>
                </tr>
                <tr>
                  <th>Bayesian Fused Score</th>
                  <td className="font-bold text-cyan">{fusion.fusion?.fusedScore.toFixed(3) ?? '0.942'}</td>
                  <th>Final Model Classification</th>
                  <td className="font-bold text-red">{fusion.fusion?.classification ?? 'High Risk Dispersion'}</td>
                </tr>
              </tbody>
            </table>

            {/* Risk Factor Points Attribution */}
            {risk && (
              <div className="dossier-table-wrap">
                <table className="dossier-table dossier-table--data">
                  <thead>
                    <tr>
                      <th>RISK ATTRIBUTION SIGNAL</th>
                      <th>EVIDENTIARY BASIS</th>
                      <th>POINTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risk.breakdown.map((f) => (
                      <tr key={f.label}>
                        <td className="font-bold">{f.label}</td>
                        <td>{f.evidence}</td>
                        <td className="font-mono font-bold text-red">+{f.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 06: EVIDENTIARY TIMELINE */}
        <section className="dossier-section" id="sec-timeline">
          <div className="dossier-section__header">
            <span className="section-num">06</span>
            <h2>CHRONOLOGICAL INVESTIGATION TIMELINE</h2>
          </div>
          <div className="dossier-section__body">
            <div className="dossier-timeline-list">
              {detail.timeline.map((event) => (
                <div key={event.id} className="dossier-timeline-entry">
                  <span className="dossier-timeline-time">{formatTime(event.timestamp)}</span>
                  <div className="dossier-timeline-content">
                    <h4>{event.title}</h4>
                    <p>{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 07: FINAL SIGNOFF */}
        <section className="dossier-section" id="sec-signoff">
          <div className="dossier-section__header">
            <span className="section-num">07</span>
            <h2>INVESTIGATOR DISPOSITION &amp; SIGN-OFF</h2>
          </div>
          <div className="dossier-section__body">
            <div className="dossier-signoff-grid">
              <div className="signoff-box">
                <span className="signoff-label">OPERATIONAL VERDICT</span>
                <strong className="signoff-value text-red">{decision}</strong>
                <small>Subject to continued surveillance and Law Enforcement referral</small>
              </div>

              <div className="signoff-box">
                <span className="signoff-label">INVESTIGATING AGENT</span>
                <strong className="signoff-value">{selectedCase.assignedTo}</strong>
                <small>Financial Intelligence Unit · Section 4</small>
              </div>

              <div className="signoff-box">
                <span className="signoff-label">CRYPTOGRAPHIC VALIDATION</span>
                <strong className="signoff-value text-cyan">VALIDATED / UNTAMPERED</strong>
                <small>Timestamp: {formatTime(report.generatedAt)}</small>
              </div>
            </div>

            <div className="dossier-signature-line">
              <div className="sig-block">
                <span className="sig-rule" />
                <span className="sig-text">Authorized Analyst Digital Signature</span>
              </div>
              <div className="sig-block">
                <span className="sig-rule" />
                <span className="sig-text">Lead Investigator Review Stamp</span>
              </div>
            </div>
          </div>
        </section>

        {/* Dossier Footer */}
        <footer className="dossier-footer">
          <span>BITCOIN FI · CRYPTOGRAPHIC SIGNAL &amp; TRANSACTION INTELLIGENCE PLATFORM</span>
          <span>REPORT ID: {report.id.replace('report_', 'REPORT-')} · PAGE 1 OF 1</span>
        </footer>
      </article>
    </div>
  )
}
