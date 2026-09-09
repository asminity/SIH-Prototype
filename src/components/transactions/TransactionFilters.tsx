import { Search, SlidersHorizontal } from 'lucide-react'
import type { ActivityClass, Severity } from '../../types/domain'

type TransactionFiltersProps = {
  search: string
  entity: string
  risk: 'ALL' | Severity
  severity: 'ALL' | ActivityClass
  status: string
  sort: string
  onSearchChange: (value: string) => void
  onEntityChange: (value: string) => void
  onRiskChange: (value: 'ALL' | Severity) => void
  onSeverityChange: (value: 'ALL' | ActivityClass) => void
  onStatusChange: (value: string) => void
  onSortChange: (value: string) => void
}

export function TransactionFilters({
  search,
  entity,
  risk,
  severity,
  status,
  sort,
  onSearchChange,
  onEntityChange,
  onRiskChange,
  onSeverityChange,
  onStatusChange,
  onSortChange,
}: TransactionFiltersProps) {
  return (
    <section className="transaction-filters" aria-label="Transaction filters">
      <div className="transaction-filter__search">
        <Search size={15} />
        <input
          aria-label="Search transaction records"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search TXID, wallet, IP, entity..."
        />
      </div>

      <label>
        ENTITY
        <select value={entity} onChange={(event) => onEntityChange(event.target.value)}>
          <option value="ALL">ALL ENTITIES</option>
          <option value="entity_042">ENTITY-042 (Cluster #42)</option>
          <option value="entity_017">ENTITY-017 (Northstar Exchange)</option>
          <option value="entity_088">ENTITY-088 (ShadowMix Protocol)</option>
          <option value="entity_033">ENTITY-033 (Aegis Merchant)</option>
          <option value="entity_055">ENTITY-055 (Helios OTC)</option>
        </select>
      </label>

      <label>
        RISK
        <select value={risk} onChange={(event) => onRiskChange(event.target.value as 'ALL' | Severity)}>
          <option value="ALL">ALL RISK</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
      </label>

      <label>
        SEVERITY
        <select value={severity} onChange={(event) => onSeverityChange(event.target.value as 'ALL' | ActivityClass)}>
          <option value="ALL">ALL ACTIVITY</option>
          <option value="NORMAL">NORMAL</option>
          <option value="ELEVATED">ELEVATED</option>
          <option value="SUSPICIOUS">SUSPICIOUS</option>
          <option value="HIGH_RISK">HIGH RISK</option>
        </select>
      </label>

      <label>
        STATUS
        <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
          <option value="ALL">ALL STATUS</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PENDING">PENDING</option>
        </select>
      </label>

      <label>
        SORT
        <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
          <option value="timestamp-desc">LATEST FIRST</option>
          <option value="timestamp-asc">OLDEST FIRST</option>
          <option value="risk-desc">RISK SCORE</option>
          <option value="amount-desc">BTC AMOUNT</option>
        </select>
      </label>

      <span className="transaction-filter__icon">
        <SlidersHorizontal size={14} />
      </span>
    </section>
  )
}
