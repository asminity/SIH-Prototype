import { Construction } from 'lucide-react'

type EmptyStateProps = {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        <Construction size={20} strokeWidth={1.5} />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <span className="empty-state__status">MODULE UNDER IMPLEMENTATION</span>
    </div>
  )
}
