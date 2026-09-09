import { ArrowDown, CircleDot, Globe2, Link2, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CorrelationIntelligenceRecord } from '../../types/domain'

type CorrelationFlowProps = {
  record: CorrelationIntelligenceRecord
}

const shortHash = (value: string) => `${value.slice(0, 6)}...${value.slice(-5)}`

export function CorrelationFlow({ record }: CorrelationFlowProps) {
  const nodes = [
    { label: 'IP ADDRESS', value: record.ipAddress.address, detail: record.ipAddress.country, icon: <Globe2 size={18} />, href: `/network-activity?ip=${record.ipAddress.id}` },
    { label: 'NETWORK OBSERVATION', value: record.observation.id.replace('net_', 'OBS-'), detail: `${record.observation.protocol} / ${record.observation.direction}`, icon: <CircleDot size={18} /> },
    { label: 'CORRELATION ANALYSIS', value: record.correlation.id.replace('corr_', 'CORR-'), detail: `${record.correlation.score} / 100 evidence score`, icon: <Link2 size={18} /> },
    { label: 'BLOCKCHAIN TRANSACTION', value: shortHash(record.transaction.hash), detail: `${record.transaction.amountBtc.toFixed(3)} BTC / ${record.transaction.riskLevel}`, icon: <CircleDot size={18} />, href: `/transactions?tx=${record.transaction.id}` },
    { label: 'OBSERVED WALLET', value: shortHash(record.wallet.address), detail: record.entity.id.replace('entity_', 'ENTITY-'), icon: <WalletCards size={18} />, href: `/entity-explorer?wallet=${record.wallet.id}` },
  ]
  return <div className="correlation-flow" aria-label="Network observation to blockchain transaction correlation path">{nodes.map((node, index) => <div className="correlation-flow__step" key={node.label}><div className="correlation-flow__node"><span>{node.icon}</span><div><small>{node.label}</small>{node.href ? <Link to={node.href}>{node.value}</Link> : <strong>{node.value}</strong>}<em>{node.detail}</em></div></div>{index < nodes.length - 1 ? <ArrowDown className="correlation-flow__arrow" size={16} /> : null}</div>)}</div>
}
