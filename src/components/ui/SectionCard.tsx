import type { ReactNode } from 'react'

type SectionCardProps = {
  title: string
  eyebrow?: string
  children: ReactNode
  className?: string
  actions?: ReactNode
}

export function SectionCard({ title, eyebrow, children, className = '', actions }: SectionCardProps) {
  return (
    <section className={`section-card ${className}`.trim()}>
      <div className="section-card__header">
        <div>
          {eyebrow ? <p className="section-card__eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
        </div>
        <span className="section-card__rule" aria-hidden="true" />
        {actions ? <div className="section-card__actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}
