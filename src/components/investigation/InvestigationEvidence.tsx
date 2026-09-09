import { CheckCircle2, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { RiskFactor } from '../../types/domain'

type InvestigationEvidenceProps = {
  factors: RiskFactor[]
  clusterTransactionCount: number
  walletCount: number
  ipCount: number
}

export function InvestigationEvidence({ factors, clusterTransactionCount, walletCount, ipCount }: InvestigationEvidenceProps) {
  const cards = [
    { label: 'Evidence 01', title: factors[1]?.label ?? 'Repeated IP-Wallet Association', confidence: '91%', observed: `${ipCount} associated addresses`, summary: factors[1]?.evidence ?? 'Repeated network and wallet observations were retained as correlation evidence.', path: factors[1]?.evidencePath ?? '/relationship-analysis' },
    { label: 'Evidence 02', title: factors[0]?.label ?? 'Elevated Transaction Velocity', confidence: '94%', observed: `${clusterTransactionCount} related transactions`, summary: 'Related transaction activity is concentrated within the investigation window.', path: factors[0]?.evidencePath ?? '/transactions' },
    { label: 'Evidence 03', title: factors[3]?.label ?? 'Potential Peeling-Chain Behavior', confidence: '88%', observed: 'Multiple transaction hops', summary: factors[3]?.evidence ?? 'Multiple transaction hops indicate repeated value movement requiring review.', path: factors[3]?.evidencePath ?? '/transactions' },
    { label: 'Evidence 04', title: factors[2]?.label ?? 'High Graph Connectivity', confidence: '94%', observed: `${walletCount} wallets / ${ipCount} IPs`, summary: factors[2]?.evidence ?? 'Wallet and IP relationships create a connected observed graph.', path: factors[2]?.evidencePath ?? '/entity-graph' },
  ]
  return <div className="investigation-evidence-list">{cards.map((card) => <details className="investigation-evidence-card" key={card.label}><summary><span className="investigation-evidence-card__icon"><CheckCircle2 size={14} /></span><div><small>{card.label}</small><strong>{card.title}</strong></div><ChevronDown className="investigation-evidence-card__chevron" size={15} /></summary><div className="investigation-evidence-card__body"><div><span>CONFIDENCE</span><strong>{card.confidence}</strong></div><div><span>OBSERVED</span><strong>{card.observed}</strong></div><p>{card.summary}</p><Link to={card.path}>Open supporting evidence</Link></div></details>)}</div>
}
