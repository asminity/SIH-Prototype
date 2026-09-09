import { Activity, AlertTriangle, Bitcoin, ShieldAlert, UsersRound } from 'lucide-react'
import type { DashboardMetrics } from '../../types/domain'
import { MetricCard } from '../ui/MetricCard'

export type KpiCategory = 'ALL' | 'TRANSACTIONS' | 'ENTITIES' | 'SUSPICIOUS' | 'HIGH_RISK' | 'CRITICAL'

type KpiStripProps = {
  metrics: DashboardMetrics
  activeKpi?: KpiCategory
  onSelectKpi?: (kpi: KpiCategory) => void
}

const formatCount = (value: number) => {
  if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
  return value.toLocaleString('en-US')
}

export function KpiStrip({ metrics, activeKpi = 'ALL', onSelectKpi }: KpiStripProps) {
  const items = [
    {
      label: 'TRANSACTIONS',
      value: formatCount(metrics.transactions),
      detail: '▲ +12.4% 24h volume',
      icon: <Bitcoin size={17} />,
      tone: 'default' as const,
      isActive: activeKpi === 'TRANSACTIONS' || activeKpi === 'ALL',
      badge: activeKpi === 'TRANSACTIONS' ? 'FILTERED' : 'TOTAL',
      onClick: () => onSelectKpi?.(activeKpi === 'TRANSACTIONS' ? 'ALL' : 'TRANSACTIONS'),
    },
    {
      label: 'ENTITIES',
      value: formatCount(metrics.entities),
      detail: '● 84 active clusters',
      icon: <UsersRound size={17} />,
      tone: 'default' as const,
      isActive: activeKpi === 'ENTITIES',
      badge: activeKpi === 'ENTITIES' ? 'FOCUSED' : 'TRACKED',
      onClick: () => onSelectKpi?.(activeKpi === 'ENTITIES' ? 'ALL' : 'ENTITIES'),
    },
    {
      label: 'SUSPICIOUS',
      value: formatCount(metrics.suspiciousEntities),
      detail: '▲ +4 anomalous nodes',
      icon: <ShieldAlert size={17} />,
      tone: 'amber' as const,
      isActive: activeKpi === 'SUSPICIOUS',
      badge: activeKpi === 'SUSPICIOUS' ? 'FILTERED' : 'ELEVATED',
      onClick: () => onSelectKpi?.(activeKpi === 'SUSPICIOUS' ? 'ALL' : 'SUSPICIOUS'),
    },
    {
      label: 'HIGH RISK',
      value: formatCount(metrics.activeAlerts),
      detail: '▲ 18 priority signals',
      icon: <AlertTriangle size={17} />,
      tone: 'red' as const,
      isActive: activeKpi === 'HIGH_RISK',
      badge: activeKpi === 'HIGH_RISK' ? 'FILTERED' : 'ACTION REQ',
      onClick: () => onSelectKpi?.(activeKpi === 'HIGH_RISK' ? 'ALL' : 'HIGH_RISK'),
    },
    {
      label: 'CRITICAL',
      value: formatCount(metrics.criticalAlerts),
      detail: '● 5 active intrusions',
      icon: <Activity size={17} />,
      tone: 'red' as const,
      isActive: activeKpi === 'CRITICAL',
      badge: activeKpi === 'CRITICAL' ? 'FILTERED' : 'CRITICAL',
      onClick: () => onSelectKpi?.(activeKpi === 'CRITICAL' ? 'ALL' : 'CRITICAL'),
    },
  ]

  return (
    <section className="dashboard-kpis" aria-label="Command center metrics">
      {items.map((item) => <MetricCard key={item.label} {...item} />)}
    </section>
  )
}

