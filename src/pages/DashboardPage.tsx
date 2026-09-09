import { useState, useEffect } from 'react'
import {
  RefreshCw,
  Calendar,
  Download,
  Search,
  CheckCircle2,
  X,
  Radio,
} from 'lucide-react'
import { getDashboardData, DEFAULT_DASHBOARD_FILTERS, getCases } from '../services/mockServices'
import type { DashboardFilters, DashboardRiskFilter } from '../types/domain'
import { AlertQueue } from '../components/dashboard/AlertQueue'
import { KpiStrip, type KpiCategory } from '../components/dashboard/KpiStrip'
import { SuspiciousActivityPanel } from '../components/dashboard/NetworkEntitySummary'
import { HighPriorityCases } from '../components/dashboard/HighPriorityCases'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { RiskOverview } from '../components/dashboard/RiskOverview'
import { TransactionActivityChart } from '../components/dashboard/TransactionActivityChart'

export function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_DASHBOARD_FILTERS)
  const [activeKpi, setActiveKpi] = useState<KpiCategory>('ALL')
  const [timeframePreset, setTimeframePreset] = useState<'24H' | '7D' | '30D' | 'CUSTOM'>('7D')
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false)
  const [isLiveIngesting, setIsLiveIngesting] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dashboardSearch, setDashboardSearch] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
  }

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 3200)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const snapshot = getDashboardData(filters)

  const handleSelectKpi = (kpi: KpiCategory) => {
    setActiveKpi(kpi)
    if (kpi === 'ALL' || kpi === 'TRANSACTIONS') {
      setFilters((prev) => ({ ...prev, risk: 'ALL' }))
      showToast('Displaying all transactions & volume')
    } else if (kpi === 'ENTITIES') {
      setFilters((prev) => ({ ...prev, risk: 'ALL' }))
      showToast('Focused on 1.1K tracked entities and 84 active clusters')
    } else if (kpi === 'SUSPICIOUS') {
      setFilters((prev) => ({ ...prev, risk: 'MEDIUM' }))
      showToast('Filtered dashboard to Suspicious / Elevated anomalies')
    } else if (kpi === 'HIGH_RISK') {
      setFilters((prev) => ({ ...prev, risk: 'HIGH' }))
      showToast('Filtered dashboard to High Risk priority alerts')
    } else if (kpi === 'CRITICAL') {
      setFilters((prev) => ({ ...prev, risk: 'CRITICAL' }))
      showToast('Filtered dashboard to Critical active intrusions')
    }
  }

  const handleSelectRisk = (risk: DashboardRiskFilter) => {
    setFilters((prev) => ({ ...prev, risk }))
    if (risk === 'ALL') setActiveKpi('ALL')
    else if (risk === 'MEDIUM') setActiveKpi('SUSPICIOUS')
    else if (risk === 'HIGH') setActiveKpi('HIGH_RISK')
    else if (risk === 'CRITICAL') setActiveKpi('CRITICAL')
    else setActiveKpi('ALL')
    showToast(risk === 'ALL' ? 'Showing all risk tiers' : `Filtered dashboard to ${risk} severity`)
  }

  const handleTimeframeSelect = (preset: '24H' | '7D' | '30D' | 'CUSTOM') => {
    setTimeframePreset(preset)
    if (preset === '24H') {
      setIsCustomDateOpen(false)
      setFilters((prev) => ({ ...prev, from: '2026-09-04', to: '2026-09-05' }))
      showToast('Set window to past 24 Hours')
    } else if (preset === '7D') {
      setIsCustomDateOpen(false)
      setFilters((prev) => ({ ...prev, from: '2026-09-01', to: '2026-09-05' }))
      showToast('Set window to past 7 Days')
    } else if (preset === '30D') {
      setIsCustomDateOpen(false)
      setFilters((prev) => ({ ...prev, from: '2026-08-06', to: '2026-09-05' }))
      showToast('Set window to past 30 Days')
    } else {
      setIsCustomDateOpen(true)
    }
  }

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      showToast('Telemetry and network graph synchronized')
    }, 600)
  }

  const isFilterActive =
    filters.risk !== 'ALL' ||
    filters.from !== DEFAULT_DASHBOARD_FILTERS.from ||
    filters.to !== DEFAULT_DASHBOARD_FILTERS.to

  const resetAllFilters = () => {
    setFilters(DEFAULT_DASHBOARD_FILTERS)
    setTimeframePreset('7D')
    setIsCustomDateOpen(false)
    setDashboardSearch('')
    setActiveKpi('ALL')
    showToast('Filters reset to default')
  }

  // Filter alerts by search term if provided
  const searchedAlerts = dashboardSearch.trim()
    ? snapshot.alerts.filter(
        (a) =>
          a.title.toLowerCase().includes(dashboardSearch.toLowerCase()) ||
          a.description.toLowerCase().includes(dashboardSearch.toLowerCase()) ||
          a.entityId.toLowerCase().includes(dashboardSearch.toLowerCase())
      )
    : snapshot.alerts

  return (
    <div className="dashboard-page">
      {/* Toast Notification HUD */}
      {toastMessage ? (
        <div className="hud-toast" role="status">
          <CheckCircle2 size={15} className="text-cyan" />
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} aria-label="Dismiss toast">
            <X size={13} />
          </button>
        </div>
      ) : null}

      {/* Clean, high-impact Header without cluttered redundant badges */}
      <header className="dashboard-header">
        <div className="dashboard-header__left">
          <p className="dashboard-header__eyebrow">WORKSPACE / THREAT SURVEILLANCE</p>
          <h1>Intelligence Dashboard</h1>
          <p className="dashboard-header__sub">
            Real-time Bitcoin multi-hop flow surveillance, heuristics clustering, and anomaly correlation.
          </p>
        </div>

        <div className="dashboard-header__actions">
          <button
            type="button"
            className={`dashboard-action-btn ${isLiveIngesting ? 'dashboard-action-btn--live' : ''}`}
            onClick={() => {
              setIsLiveIngesting(!isLiveIngesting)
              showToast(isLiveIngesting ? 'Live ingestion feed paused' : 'Live ingestion feed active')
            }}
            title="Toggle live telemetry stream"
          >
            <Radio size={13} className={isLiveIngesting ? 'telemetry-pulsing' : ''} />
            <span>{isLiveIngesting ? 'LIVE INGESTION' : 'FEED PAUSED'}</span>
          </button>

          <button
            type="button"
            className="dashboard-action-btn"
            onClick={handleManualRefresh}
            title="Synchronize intelligence stream"
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin' : ''} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            className="dashboard-action-btn dashboard-action-btn--primary"
            onClick={() => showToast('Exporting executive intelligence report (PDF)...')}
            title="Export analytical brief"
          >
            <Download size={13} />
            <span>Export Brief</span>
          </button>
        </div>
      </header>

      {/* Interactive Command & Filter Toolbar */}
      <section className="dashboard-command-bar" aria-label="Dashboard controls">
        <div className="command-bar__group command-bar__timeframes">
          <span className="command-bar__label">WINDOW:</span>
          {(['24H', '7D', '30D', 'CUSTOM'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              className={`timeframe-pill ${timeframePreset === tf ? 'timeframe-pill--active' : ''}`}
              onClick={() => handleTimeframeSelect(tf)}
            >
              {tf === 'CUSTOM' ? <Calendar size={12} /> : null}
              <span>{tf === 'CUSTOM' ? 'Custom' : tf}</span>
            </button>
          ))}
        </div>

        <div className="command-bar__divider" aria-hidden="true" />

        <div className="command-bar__group command-bar__risks">
          <span className="command-bar__label">SEVERITY:</span>
          {(
            [
              { key: 'ALL', label: 'All', count: snapshot.alerts.length, tone: null },
              { key: 'CRITICAL', label: 'Critical', count: 5, tone: 'red' },
              { key: 'HIGH', label: 'High', count: 18, tone: 'amber' },
              { key: 'MEDIUM', label: 'Medium', count: 24, tone: 'amber' },
              { key: 'LOW', label: 'Low', count: snapshot.metrics.transactions, tone: 'green' },
            ] as const
          ).map((tier) => {
            const isActive = filters.risk === tier.key
            return (
              <button
                key={tier.key}
                type="button"
                className={`risk-pill risk-pill--${tier.key.toLowerCase()} ${isActive ? 'risk-pill--active' : ''}`}
                onClick={() => handleSelectRisk(tier.key as DashboardRiskFilter)}
              >
                {tier.tone ? <span className={`risk-pill__dot risk-pill__dot--${tier.tone}`} /> : null}
                <span>{tier.label}</span>
              </button>
            )
          })}
        </div>

        <div className="command-bar__search">
          <Search size={13} />
          <input
            type="text"
            placeholder="Search active view..."
            value={dashboardSearch}
            onChange={(e) => setDashboardSearch(e.target.value)}
          />
          {dashboardSearch ? (
            <button
              type="button"
              className="command-bar__clear"
              onClick={() => setDashboardSearch('')}
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          ) : null}
        </div>

        {isFilterActive ? (
          <button
            className="command-bar__reset-btn"
            type="button"
            onClick={resetAllFilters}
            title="Reset filters to default"
          >
            <RefreshCw size={12} />
            <span>Reset</span>
          </button>
        ) : null}
      </section>

      {/* Expandable Custom Date Range Drawer */}
      {isCustomDateOpen ? (
        <div className="custom-date-drawer">
          <div className="custom-date-drawer__content">
            <span className="custom-date-drawer__title">Specify Custom Observation Range:</span>
            <label>
              FROM
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
              />
            </label>
            <label>
              TO
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
              />
            </label>
            <button
              type="button"
              className="button button--secondary button--small"
              onClick={() => setIsCustomDateOpen(false)}
            >
              Apply Range
            </button>
          </div>
        </div>
      ) : null}

      {/* Interactive KPI Cards with Click-to-filter */}
      <KpiStrip
        metrics={snapshot.metrics}
        activeKpi={activeKpi}
        onSelectKpi={handleSelectKpi}
      />

      {/* Interactive Priority Surveillance Panel with expandable evidence */}
      <SuspiciousActivityPanel
        primaryCluster={snapshot.primaryCluster}
        onToast={showToast}
      />

      {/* Active High-Priority Escalated Cases (2 Active below Cluster #42) */}
      <HighPriorityCases cases={getCases()} onToast={showToast} />

      {/* Interactive Overview Grid: Risk Distribution & Activity Chart with series toggles */}
      <div className="dashboard-grid dashboard-grid--overview">
        <RiskOverview
          distribution={snapshot.riskDistribution}
          activeRisk={filters.risk}
          onSelectRisk={handleSelectRisk}
        />
        <TransactionActivityChart
          activity={snapshot.transactionActivity}
          timeframe={timeframePreset === 'CUSTOM' ? '7D' : timeframePreset}
          onTimeframeChange={(tf) => handleTimeframeSelect(tf as '24H' | '7D' | '30D')}
        />
      </div>

      {/* Interactive Evidence Grid: Triage Queue & Live Evidence Log */}
      <div className="dashboard-grid dashboard-grid--evidence">
        <AlertQueue alerts={searchedAlerts} onToast={showToast} />
        <RecentActivity events={snapshot.recentActivity} onToast={showToast} />
      </div>
    </div>
  )
}
