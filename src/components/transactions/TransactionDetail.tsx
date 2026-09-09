import { ArrowUpRight, CircleAlert, GitBranch, Network, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { TransactionIntelligenceRecord } from '../../types/domain'
import { SeverityBadge } from '../ui/SeverityBadge'
import { SectionCard } from '../ui/SectionCard'

type TransactionDetailProps = {
  record: TransactionIntelligenceRecord
  onClose: () => void
}

const shortHash = (value: string) => `${value.slice(0, 10)}...${value.slice(-8)}`
const formatTime = (value: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))

export function TransactionDetail({ record, onClose }: TransactionDetailProps) {
  const { transaction } = record
  return (
    <SectionCard eyebrow="SELECTED EVIDENCE" title="Transaction detail" className="transaction-detail">
      <div className="transaction-detail__header"><div><span className="transaction-detail__hash">{shortHash(transaction.hash)}</span><p>Selected transaction intelligence record</p></div><button className="detail-close" onClick={onClose} type="button">Close detail</button></div>
      <div className="transaction-detail__grid">
        <div className="detail-column"><h3>Transaction identity</h3><dl><dt>TXID</dt><dd className="mono-cell">{transaction.hash}</dd><dt>Timestamp</dt><dd>{formatTime(transaction.timestamp)}</dd><dt>Block reference</dt><dd className="mono-cell">{transaction.blockReference} / {transaction.blockHeight.toLocaleString('en-US')}</dd><dt>BTC amount</dt><dd className="mono-cell">{transaction.amountBtc.toFixed(3)} BTC</dd></dl></div>
        <div className="detail-column"><h3>Network context</h3><dl><dt>Source IP</dt><dd className="mono-cell"><Link to={`/network-activity?ip=${record.sourceIp.id}`}>{record.sourceIp.address}</Link></dd><dt>Country / ASN</dt><dd>{record.country} / <span className="mono-cell">{record.asn}</span></dd><dt>Provider</dt><dd>{record.provider}</dd><dt>Correlation</dt><dd>{record.correlation ? <Link to={`/network-activity?ip=${record.sourceIp.id}`}>{record.correlation.relationship} / {Math.round(record.correlation.confidence * 100)}% confidence <ArrowUpRight size={12} /></Link> : 'No direct correlation record'}</dd></dl></div>
        <div className="detail-column"><h3>Wallet movement</h3><dl><dt>Input wallet</dt><dd><Link to={`/entity-explorer?wallet=${record.inputWallet.id}`}>{record.inputWallet.address} <ArrowUpRight size={12} /></Link></dd><dt>Output wallet</dt><dd><Link to={`/entity-explorer?wallet=${record.outputWallet.id}`}>{record.outputWallet.address} <ArrowUpRight size={12} /></Link></dd><dt>Entity</dt><dd><Link to={`/entity-explorer?entity=${record.entity.id}`}>{record.entity.label}</Link></dd><dt>Cluster</dt><dd>{record.cluster ? <Link to={`/entity-graph?cluster=${record.cluster.id}`}>{record.cluster.displayId}</Link> : 'Baseline activity'}</dd></dl></div>
      </div>
      <div className="transaction-detail__risk"><div className="risk-detail-score"><CircleAlert size={18} /><span>RISK SCORE</span><strong>{record.cluster?.riskScore ?? Math.round(transaction.anomalyScore * 100)}<small> / 100</small></strong><SeverityBadge severity={record.cluster?.severity ?? transaction.riskLevel} /><em>{Math.round((record.cluster?.confidence ?? (1 - transaction.anomalyScore / 4)) * 100)}% confidence</em></div><div className="risk-detail-factors"><div className="risk-detail-factors__title"><ShieldCheck size={15} />Contributing factors</div><ul>{record.riskFactors.slice(0, 5).map((factor) => <li key={factor}>{factor}</li>)}</ul></div></div>
      <div className="transaction-detail__links"><Link to={`/entity-graph?cluster=${record.cluster?.id ?? 'cluster_17'}`}><GitBranch size={14} />Open graph context</Link>{record.correlation ? <Link to={`/network-activity?ip=${record.sourceIp.id}`}><Network size={14} />Open network telemetry</Link> : null}{record.investigation ? <Link to={`/investigations?investigation=${record.investigation.id}`}><ShieldCheck size={14} />Open investigation</Link> : null}</div>
    </SectionCard>
  )
}
