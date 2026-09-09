import { useState, useMemo, useEffect } from 'react'
import {
  Activity,
  Database,
  ShieldAlert,
  Download,
  Coins,
  CheckCircle2,
  X,
  Filter,
  RefreshCw,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { getTransactionIntelligence, getTransactionIntelligenceById } from '../services/mockServices'
import type { ActivityClass, Severity, TransactionIntelligenceRecord } from '../types/domain'
import { TransactionDetail } from '../components/transactions/TransactionDetail'
import { TransactionFilters } from '../components/transactions/TransactionFilters'
import { TransactionTable } from '../components/transactions/TransactionTable'
import { MetricCard } from '../components/ui/MetricCard'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'
import { investigationStore } from '../state/investigationStore'

const pageSize = 8

export function TransactionExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [entity, setEntity] = useState('ALL')
  const [risk, setRisk] = useState<'ALL' | Severity>('ALL')
  const [severity, setSeverity] = useState<'ALL' | ActivityClass>('ALL')
  const [status, setStatus] = useState('ALL')
  const [sort, setSort] = useState('timestamp-desc')
  const [minBtcFilter, setMinBtcFilter] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => setToastMessage(msg)

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const records = getTransactionIntelligence()
  const selectedId = searchParams.get('tx') ?? searchParams.get('transaction') ?? undefined
  const selectedRecord = selectedId ? getTransactionIntelligenceById(selectedId as `tx_${string}`) : undefined
  const query = search.trim().toLowerCase()

  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => {
        const matchesSearch =
          !query ||
          [
            record.transaction.id,
            record.transaction.hash,
            record.inputWallet.address,
            record.outputWallet.address,
            record.inputWallet.id,
            record.outputWallet.id,
            record.sourceIp.address,
            record.sourceIp.id,
            record.entity.id,
            record.entity.label,
            record.cluster?.id,
            record.cluster?.displayId,
          ]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(query))

        const matchesEntity = entity === 'ALL' || record.entity.id === entity
        const matchesRisk = risk === 'ALL' || record.transaction.riskLevel === risk
        const matchesSeverity = severity === 'ALL' || record.transaction.activityClass === severity
        const matchesStatus = status === 'ALL' || record.transaction.status === status
        const matchesMinBtc = minBtcFilter === null || record.transaction.amountBtc >= minBtcFilter

        return matchesSearch && matchesEntity && matchesRisk && matchesSeverity && matchesStatus && matchesMinBtc
      })
      .sort((left, right) => {
        if (sort === 'amount-desc') return right.transaction.amountBtc - left.transaction.amountBtc
        if (sort === 'risk-desc') return right.transaction.anomalyScore - left.transaction.anomalyScore
        const direction = sort === 'timestamp-asc' ? 1 : -1
        return direction * (new Date(left.transaction.timestamp).getTime() - new Date(right.transaction.timestamp).getTime())
      })
  }, [records, query, entity, risk, severity, status, minBtcFilter, sort])

  // Computed summary stats
  const totalVisibleBtc = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.transaction.amountBtc, 0)
  }, [filteredRecords])

  const highRiskCount = useMemo(() => {
    return filteredRecords.filter(
      (r) => r.transaction.riskLevel === 'HIGH' || r.transaction.riskLevel === 'CRITICAL'
    ).length
  }, [filteredRecords])

  const updateSearch = (value: string) => { setSearch(value); setPage(1) }
  const updateEntity = (value: string) => { setEntity(value); setPage(1) }
  const updateRisk = (value: 'ALL' | Severity) => {
    setRisk(value)
    setPage(1)
    showToast(value === 'ALL' ? 'Showing all risk tiers' : `Filtered to ${value} risk`)
  }
  const updateSeverity = (value: 'ALL' | ActivityClass) => { setSeverity(value); setPage(1) }
  const updateStatus = (value: string) => { setStatus(value); setPage(1) }
  const updateSort = (value: string) => { setSort(value); setPage(1) }

  const handleExportCsv = () => {
    const headers = [
      'TXID',
      'Hash',
      'Input_Address',
      'Output_Address',
      'Source_IP',
      'Country',
      'ASN',
      'Amount_BTC',
      'Risk_Level',
      'Activity_Class',
      'Timestamp_UTC',
      'Status',
    ]

    const rows = filteredRecords.map((r) => [
      r.transaction.id,
      r.transaction.hash,
      r.inputWallet.address,
      r.outputWallet.address,
      r.sourceIp.address,
      r.country,
      r.asn,
      r.transaction.amountBtc.toString(),
      r.transaction.riskLevel,
      r.transaction.activityClass,
      r.transaction.timestamp,
      r.transaction.status,
    ])

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `btc-transactions-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast(`Exported ${filteredRecords.length} transactions to CSV`)
  }

  const handleInspectRow = (record: TransactionIntelligenceRecord) => {
    investigationStore.selectTransaction(record.transaction)
  }

  const resetFilters = () => {
    setSearch('')
    setEntity('ALL')
    setRisk('ALL')
    setSeverity('ALL')
    setStatus('ALL')
    setMinBtcFilter(null)
    setSort('timestamp-desc')
    setPage(1)
    showToast('Filters reset to default')
  }

  return (
    <div className="transaction-page">
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

      <PageHeader
        eyebrow="DATA INTELLIGENCE / BLOCKCHAIN TELEMETRY"
        title="Transaction Explorer"
        actions={
          <div className="flex-actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={handleExportCsv}
              title="Download CSV report of visible transactions"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <StatusBadge label="READ ONLY / ANALYST" tone="neutral" />
          </div>
        }
      />

      {/* KPI Metric Strip */}
      <div className="transaction-overview-metrics">
        <MetricCard
          icon={<Database size={17} />}
          label="MATCHED RECORDS"
          value={filteredRecords.length.toLocaleString('en-US')}
          detail={`${records.length} total monitored stream`}
          tone="default"
        />
        <MetricCard
          icon={<Coins size={17} />}
          label="FILTERED VOLUME"
          value={`${totalVisibleBtc.toFixed(2)} BTC`}
          detail="Combined flow volume"
          tone="cyan"
        />
        <MetricCard
          icon={<ShieldAlert size={17} />}
          label="PRIORITY ANOMALIES"
          value={highRiskCount.toLocaleString('en-US')}
          detail="Requires immediate review"
          tone={highRiskCount > 0 ? 'red' : 'default'}
        />
      </div>

      {/* Quick Filter Strip */}
      <div className="transaction-quick-strip">
        <div className="quick-strip__label">
          <Filter size={13} />
          <span>QUICK RISK:</span>
        </div>
        <div className="quick-strip__pills">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              className={`risk-pill risk-pill--${tier.toLowerCase()} ${risk === tier ? 'risk-pill--active' : ''}`}
              onClick={() => updateRisk(tier)}
            >
              {tier !== 'ALL' ? (
                <span
                  className={`risk-pill__dot risk-pill__dot--${
                    tier === 'CRITICAL' || tier === 'HIGH' ? 'red' : tier === 'MEDIUM' ? 'amber' : 'green'
                  }`}
                />
              ) : null}
              <span>{tier}</span>
            </button>
          ))}
        </div>

        <div className="quick-strip__divider" />

        <div className="quick-strip__pills">
          <button
            type="button"
            className={`quick-pill ${minBtcFilter === null ? 'quick-pill--active' : ''}`}
            onClick={() => {
              setMinBtcFilter(null)
              setPage(1)
            }}
          >
            All Amounts
          </button>
          <button
            type="button"
            className={`quick-pill ${minBtcFilter === 5 ? 'quick-pill--active' : ''}`}
            onClick={() => {
              setMinBtcFilter(minBtcFilter === 5 ? null : 5)
              setPage(1)
              showToast(minBtcFilter === 5 ? 'Cleared volume filter' : 'Showing transfers ≥ 5 BTC')
            }}
          >
            Whale (≥ 5 BTC)
          </button>
        </div>

        {(risk !== 'ALL' || entity !== 'ALL' || status !== 'ALL' || minBtcFilter !== null || query) && (
          <button
            type="button"
            className="command-bar__reset-btn"
            onClick={resetFilters}
            style={{ marginLeft: 'auto' }}
          >
            <RefreshCw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Detailed Filter Toolbar */}
      <TransactionFilters
        search={search}
        entity={entity}
        risk={risk}
        severity={severity}
        status={status}
        sort={sort}
        onSearchChange={updateSearch}
        onEntityChange={updateEntity}
        onRiskChange={updateRisk}
        onSeverityChange={updateSeverity}
        onStatusChange={updateStatus}
        onSortChange={updateSort}
      />

      {/* Main Transactions Table */}
      <TransactionTable
        records={filteredRecords}
        selectedId={selectedId}
        page={page}
        pageSize={pageSize}
        onSelect={(id) => setSearchParams({ tx: id })}
        onPageChange={setPage}
        onInspect={handleInspectRow}
      />

      {/* Inline Evidence Detail if row selected */}
      {selectedRecord ? (
        <TransactionDetail
          record={selectedRecord}
          onClose={() => setSearchParams({})}
        />
      ) : (
        <div className="transaction-selection-note">
          <Activity size={15} />
          <span>Click any transaction row or &quot;Inspect&quot; to open deep identity, network, wallet, and risk evidence.</span>
        </div>
      )}
    </div>
  )
}

