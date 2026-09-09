import { useState } from 'react'
import { ArrowDown, ArrowUp, Check, Copy, Eye, GitBranch, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { TransactionIntelligenceRecord } from '../../types/domain'
import { SeverityBadge } from '../ui/SeverityBadge'
import { SectionCard } from '../ui/SectionCard'
import { investigationStore } from '../../state/investigationStore'

type TransactionTableProps = {
  records: TransactionIntelligenceRecord[]
  selectedId?: string
  page: number
  pageSize: number
  onSelect: (id: string) => void
  onPageChange: (page: number) => void
  onInspect?: (record: TransactionIntelligenceRecord) => void
}

const shortHash = (value: string) => `${value.slice(0, 6)}...${value.slice(-6)}`
const shortAddress = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`
const formatTime = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(value))

export function TransactionTable({
  records,
  selectedId,
  page,
  pageSize,
  onSelect,
  onPageChange,
  onInspect,
}: TransactionTableProps) {
  const [copiedTx, setCopiedTx] = useState<string | null>(null)
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize))
  const visibleRecords = records.slice((page - 1) * pageSize, page * pageSize)

  const handleCopy = (hash: string, event: React.MouseEvent) => {
    event.stopPropagation()
    navigator.clipboard.writeText(hash)
    setCopiedTx(hash)
    setTimeout(() => setCopiedTx(null), 2000)
  }

  const handleInspectDrawer = (record: TransactionIntelligenceRecord, event: React.MouseEvent) => {
    event.stopPropagation()
    investigationStore.selectTransaction(record.transaction)
    if (onInspect) onInspect(record)
  }

  return (
    <SectionCard
      eyebrow="BLOCKCHAIN TELEMETRY"
      title={`Verified Transactions (${records.length.toLocaleString('en-US')})`}
      className="transaction-table-card"
    >
      <div className="transaction-table-wrap">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>TXID / HASH</th>
              <th>TRANSFER FLOW</th>
              <th>SOURCE IP & ASN</th>
              <th>BTC AMOUNT</th>
              <th>RISK TIER</th>
              <th>ACTIVITY CLASS</th>
              <th>TIMESTAMP (UTC)</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visibleRecords.map((record) => {
              const isSelected = selectedId === record.transaction.id
              const isCopied = copiedTx === record.transaction.hash

              return (
                <tr
                  className={isSelected ? 'transaction-row transaction-row--selected' : 'transaction-row'}
                  key={record.transaction.id}
                  onClick={() => onSelect(record.transaction.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') onSelect(record.transaction.id)
                  }}
                  tabIndex={0}
                >
                  <td>
                    <div className="tx-hash-cell">
                      <span className="mono-cell text-cyan font-bold">{shortHash(record.transaction.hash)}</span>
                      <button
                        type="button"
                        className="tx-copy-btn"
                        onClick={(e) => handleCopy(record.transaction.hash, e)}
                        title={isCopied ? 'Copied to clipboard' : 'Copy transaction hash'}
                        aria-label="Copy hash"
                      >
                        {isCopied ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="tx-flow-cell">
                      <span className="mono-cell" title={record.inputWallet.address}>
                        {shortAddress(record.inputWallet.address)}
                      </span>
                      <ArrowRight size={11} className="tx-flow-arrow" />
                      <span className="mono-cell" title={record.outputWallet.address}>
                        {shortAddress(record.outputWallet.address)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="tx-network-badge">
                      <span className="mono-cell">{record.sourceIp.address}</span>
                      <small className="tx-asn-sub">{record.sourceIp.country} · {record.sourceIp.asn}</small>
                    </div>
                  </td>
                  <td className="mono-cell text-cyan font-bold">
                    {record.transaction.amountBtc.toFixed(record.transaction.amountBtc < 1 ? 4 : 2)} BTC
                  </td>
                  <td>
                    <SeverityBadge severity={record.transaction.riskLevel} />
                  </td>
                  <td>
                    <span className={`anomaly-score anomaly-score--${record.transaction.riskLevel.toLowerCase()}`}>
                      {record.transaction.activityClass}
                    </span>
                  </td>
                  <td className="mono-cell text-muted">{formatTime(record.transaction.timestamp)}</td>
                  <td>
                    <span className={`transaction-status transaction-status--${record.transaction.status.toLowerCase()}`}>
                      <span className="status-indicator-dot" />
                      {record.transaction.status}
                    </span>
                  </td>
                  <td>
                    <div className="tx-actions-cell" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="tx-action-btn"
                        onClick={(e) => handleInspectDrawer(record, e)}
                        title="Open in Slide-out Investigation Drawer"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                      <Link
                        to={`/entity-graph?cluster=${record.cluster?.id ?? 'cluster_42'}`}
                        className="tx-action-btn tx-action-btn--icon"
                        title="Trace in Entity Graph"
                      >
                        <GitBranch size={13} />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {visibleRecords.length === 0 ? (
          <div className="dashboard-empty" style={{ padding: '36px', textAlign: 'center' }}>
            <p>No transactions match the selected filters or query.</p>
          </div>
        ) : null}
      </div>
      <div className="transaction-table-footer">
        <span>
          Showing {visibleRecords.length ? (page - 1) * pageSize + 1 : 0}-
          {Math.min(page * pageSize, records.length)} of {records.length} records
        </span>
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            type="button"
            aria-label="Previous page"
          >
            <ArrowDown size={13} />
          </button>
          <span>
            PAGE {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            type="button"
            aria-label="Next page"
          >
            <ArrowUp size={13} />
          </button>
        </div>
      </div>
    </SectionCard>
  )
}

