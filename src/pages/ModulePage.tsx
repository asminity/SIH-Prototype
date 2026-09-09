import { LockKeyhole, RadioTower } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { getRouteDefinition } from '../data/navigation'
import { EmptyState } from '../components/ui/EmptyState'
import { MetricCard } from '../components/ui/MetricCard'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import { StatusBadge } from '../components/ui/StatusBadge'

export function ModulePage() {
  const { pathname } = useLocation()
  const route = getRouteDefinition(pathname)
  const Icon = route.icon

  return (
    <div className="module-page">
      <PageHeader
        eyebrow={route.eyebrow}
        title={route.label}
        description={route.description}
        actions={<StatusBadge label="FOUNDATION READY" tone="neutral" />}
      />

      <section className="module-banner">
        <div className="module-banner__icon"><Icon size={22} strokeWidth={1.6} /></div>
        <div>
          <p className="module-banner__eyebrow">STAGE 1 / APPLICATION SHELL</p>
          <h2>{route.label} module boundary established</h2>
          <p>The navigation, layout, and interaction surface are ready for a future implementation stage.</p>
        </div>
        <div className="module-banner__meta">
          <span>ACCESS</span>
          <strong>ANALYST</strong>
        </div>
      </section>

      <div className="metric-grid">
        <MetricCard icon={<RadioTower size={17} />} label="CONNECTIVITY" value="OFFLINE" detail="Demonstration data boundary" />
        <MetricCard icon={<LockKeyhole size={17} />} label="ACCESS SCOPE" value="READ ONLY" detail="Prototype analyst permissions" />
        <MetricCard icon={<Icon size={17} />} label="MODULE STATUS" value="STAGED" detail="Awaiting domain implementation" />
      </div>

      <SectionCard eyebrow="WORKSPACE" title="Module workspace">
        <EmptyState title="Module under implementation" description="This structured placeholder reserves the working surface for the next delivery stage while keeping the platform shell operational." />
      </SectionCard>
    </div>
  )
}
