import { ArrowUpRight, CheckCircle2, CircleDot, Database, Network } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ModelResult } from '../../types/domain'

type ModelBranchCardProps = {
  result: ModelResult
  selected: boolean
  transactionId?: string
  onSelect: () => void
}

const branchCopy = {
  'ELLIPTIC++': { input: 'Blockchain transaction features', icon: Database, tone: 'elliptic' },
  UGRANSOME: { input: 'Network behavioral features', icon: Network, tone: 'ugransome' },
} as const

export function ModelBranchCard({ result, selected, transactionId, onSelect }: ModelBranchCardProps) {
  const copy = branchCopy[result.model]
  const Icon = copy.icon
  return <article className={`model-branch-card model-branch-card--${copy.tone}${selected ? ' model-branch-card--selected' : ''}`}><button className="model-branch-card__select" onClick={onSelect} type="button" aria-pressed={selected}><div className="model-branch-card__top"><div className="model-branch-card__icon"><Icon size={18} /></div><div><p>DATASET</p><h2>{result.model}</h2><span>PROTOTYPE ANALYSIS</span></div><CheckCircle2 className="model-branch-card__complete" size={18} /></div><div className="model-branch-card__input"><span>INPUT</span><strong>{copy.input}</strong></div><div className="model-branch-card__focus"><span>FOCUS FEATURES</span><ul>{result.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></div><div className="model-branch-card__output"><div><span>ANOMALY SCORE</span><strong>{result.anomalyScore.toFixed(2)}</strong></div><div><span>CLASSIFICATION</span><strong>{result.classification}</strong></div><div><span>CONFIDENCE</span><strong>{Math.round(result.confidence * 100)}%</strong></div></div><div className="model-branch-card__interpretation"><CircleDot size={14} /><div><span>INTERPRETATION</span><p>{result.assessment}</p></div></div></button>{transactionId ? <Link className="model-branch-card__transaction" to={`/transactions?tx=${transactionId}`}>View selected transaction <ArrowUpRight size={13} /></Link> : null}</article>
}
