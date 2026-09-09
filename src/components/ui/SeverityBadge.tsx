type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

type SeverityBadgeProps = {
  severity: Severity
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return <span className={`severity-badge severity-badge--${severity.toLowerCase()}`}>{severity}</span>
}
