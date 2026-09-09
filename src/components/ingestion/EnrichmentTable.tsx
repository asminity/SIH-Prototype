import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import type { EnrichmentResult } from '../../types/domain'
import { SectionCard } from '../ui/SectionCard'

type EnrichmentTableProps = {
  results: EnrichmentResult[]
  selectedIpId?: string
  onSelect: (ipAddressId: string) => void
}

const formatConfidence = (confidence?: number) => confidence === undefined ? '—' : `${Math.round(confidence * 100)}%`

export function EnrichmentTable({ results, selectedIpId, onSelect }: EnrichmentTableProps) {
  return (
    <SectionCard eyebrow="NETWORK CONTEXT" title="IP enrichment results" className="enrichment-results">
      <div className="enrichment-table-wrap"><table className="enrichment-table"><thead><tr><th>IP ADDRESS</th><th>COUNTRY</th><th>ASN</th><th>PROVIDER</th><th>STATUS</th><th>CONFIDENCE</th><th /></tr></thead><tbody>{results.map((result) => <Fragment key={result.ipAddressId}><tr className={selectedIpId === result.ipAddressId ? 'enrichment-row enrichment-row--selected' : 'enrichment-row'}><td className="mono-cell"><Link to={`/network-activity?ip=${result.ipAddressId}`}>{result.ipAddress}</Link></td><td>{result.country}</td><td className="mono-cell">{result.asn}</td><td>{result.provider}</td><td><span className={`enrichment-status enrichment-status--${result.status.toLowerCase()}`}>{result.status}</span></td><td className="mono-cell">{formatConfidence(result.confidence)}</td><td><button className="row-detail-button" onClick={() => onSelect(result.ipAddressId)} type="button" aria-label={`View enrichment details for ${result.ipAddress}`}>{selectedIpId === result.ipAddressId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button></td></tr>{selectedIpId === result.ipAddressId ? <tr className="enrichment-detail-row"><td colSpan={7}><div><strong>Enrichment note</strong><p>{result.note}</p><Link to={`/network-activity?ip=${result.ipAddressId}`}>Open network context <ExternalLink size={12} /></Link></div></td></tr> : null}</Fragment>)}</tbody></table></div>
    </SectionCard>
  )
}
