type StatusBadgeProps = {
  label: string
  tone?: 'operational' | 'neutral' | 'warning'
}

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${tone}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {label}
    </span>
  )
}
