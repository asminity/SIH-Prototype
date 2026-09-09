import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ValidationCategory, ValidationRecord } from '../../types/domain'
import { SectionCard } from '../ui/SectionCard'

type ValidationTableProps = {
  records: ValidationRecord[]
  selectedCategory: ValidationCategory | 'ALL'
  onCategoryChange: (category: ValidationCategory | 'ALL') => void
  summary: { valid: number; warnings: number; invalid: number; duplicates: number }
}

const tabs: Array<{ key: ValidationCategory | 'ALL'; label: string; countKey?: keyof ValidationTableProps['summary'] }> = [
  { key: 'ALL', label: 'ALL' }, { key: 'VALID', label: 'VALID', countKey: 'valid' }, { key: 'WARNING', label: 'WARNINGS', countKey: 'warnings' }, { key: 'INVALID', label: 'INVALID', countKey: 'invalid' }, { key: 'DUPLICATE', label: 'DUPLICATES', countKey: 'duplicates' },
]

export function ValidationTable({ records, selectedCategory, onCategoryChange, summary }: ValidationTableProps) {
  return (
    <SectionCard eyebrow="SCHEMA AND RECORD QUALITY" title="Validation results" className="validation-results">
      <div className="validation-tabs" role="tablist" aria-label="Validation categories">
        {tabs.map((tab) => <button className={selectedCategory === tab.key ? 'validation-tab validation-tab--active' : 'validation-tab'} key={tab.key} onClick={() => onCategoryChange(tab.key)} role="tab" type="button" aria-selected={selectedCategory === tab.key}>{tab.label}{tab.countKey ? <b>{summary[tab.countKey].toLocaleString('en-US')}</b> : <b>{(summary.valid + summary.warnings + summary.invalid + summary.duplicates).toLocaleString('en-US')}</b>}</button>)}
      </div>
      <div className="validation-table-wrap">
        <table className="validation-table"><thead><tr><th>RECORD ID</th><th>FIELD</th><th>ERROR TYPE</th><th>SEVERITY</th><th>MESSAGE</th><th>LINK</th></tr></thead><tbody>{records.map((record) => <tr key={record.id}><td className="mono-cell">{record.recordId}</td><td>{record.field}</td><td>{record.errorType}</td><td><span className={`validation-severity validation-severity--${record.severity.toLowerCase()}`}>{record.severity}</span></td><td>{record.message}</td><td>{record.transactionId ? <Link className="table-link" to={`/transactions?transaction=${record.transactionId}`} aria-label={`View ${record.recordId} transaction`}><ExternalLink size={14} /></Link> : record.ipAddressId ? <Link className="table-link" to={`/network-activity?ip=${record.ipAddressId}`} aria-label={`View ${record.recordId} IP`}><ExternalLink size={14} /></Link> : null}</td></tr>)}</tbody></table>
        {records.length === 0 ? <p className="dashboard-empty">No validation records match this category.</p> : null}
      </div>
    </SectionCard>
  )
}
