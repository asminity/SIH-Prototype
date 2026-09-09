import { ChevronRight } from 'lucide-react'
import type { CorrelationIntelligenceRecord } from '../../types/domain'
import { SectionCard } from '../ui/SectionCard'

type CorrelationTableProps = {
  records: CorrelationIntelligenceRecord[]
  selectedId: string
  onSelect: (id: string) => void
}

const shortHash = (value: string) => `${value.slice(0, 6)}...${value.slice(-5)}`
const formatTime = (value: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))

export function CorrelationTable({ records, selectedId, onSelect }: CorrelationTableProps) {
  return <SectionCard eyebrow="NETWORK / BLOCKCHAIN LINKAGE" title="Correlation evidence" className="correlation-table-card"><div className="correlation-table-wrap"><table className="correlation-table"><thead><tr><th>CORRELATION ID</th><th>IP</th><th>TRANSACTION</th><th>WALLET</th><th>SCORE</th><th>CONFIDENCE</th><th>TIMESTAMP</th><th>STATUS</th><th /></tr></thead><tbody>{records.map((record) => <tr className={record.correlation.id === selectedId ? 'correlation-row correlation-row--selected' : 'correlation-row'} key={record.correlation.id} onClick={() => onSelect(record.correlation.id)} tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(record.correlation.id) }}><td className="mono-cell">{record.correlation.id.replace('corr_', 'CORR-')}</td><td><span className="correlation-ip-cell">{record.ipAddress.address}<small>{record.ipAddress.country}</small></span></td><td className="mono-cell">{shortHash(record.transaction.hash)}</td><td className="mono-cell">{shortHash(record.wallet.address)}</td><td><strong className="correlation-score">{record.correlation.score}</strong><small className="score-suffix"> / 100</small></td><td className="mono-cell">{Math.round(record.correlation.confidence * 100)}%</td><td className="mono-cell">{formatTime(record.correlation.timestamp)}</td><td><span className={`correlation-status correlation-status--${record.correlation.status.toLowerCase()}`}>{record.correlation.status}</span></td><td><ChevronRight size={14} className="correlation-row__chevron" /></td></tr>)}</tbody></table></div></SectionCard>
}
