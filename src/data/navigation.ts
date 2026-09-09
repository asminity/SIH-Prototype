import {
  Activity,
  BellRing,
  BrainCircuit,
  CircleGauge,
  Database,
  FileText,
  GitBranch,
  ShieldCheck,
  Table2,
  UsersRound,
} from 'lucide-react'
import type { NavigationSection, RouteDefinition } from '../types/navigation'

export const navigationSections: NavigationSection[] = [
  'DASHBOARD',
  'INVESTIGATION',
  'SYSTEM',
]

export const routes: RouteDefinition[] = [
  {
    path: '/',
    label: 'Dashboard',
    section: 'DASHBOARD',
    icon: CircleGauge,
    eyebrow: 'WORKSPACE',
    description: 'The central operating surface for Bitcoin transaction intelligence.',
  },
  {
    path: '/data-ingestion',
    label: 'Data Ingestion',
    section: 'SYSTEM',
    icon: Database,
    eyebrow: 'DATA INTELLIGENCE',
    description: 'Monitor the intake boundary for transaction and network telemetry.',
  },
  {
    path: '/entity-graph',
    label: 'Entity Graph',
    section: 'INVESTIGATION',
    icon: GitBranch,
    eyebrow: 'GRAPH INTELLIGENCE',
    description: 'Map relationships between wallets, entities, and observed activity.',
  },
  {
    path: '/transactions',
    label: 'Transactions',
    section: 'INVESTIGATION',
    icon: Table2,
    eyebrow: 'DATA INTELLIGENCE',
    description: 'Review normalized transaction records and their provenance.',
  },
  {
    path: '/network-activity',
    label: 'Network Activity',
    section: 'INVESTIGATION',
    icon: Activity,
    eyebrow: 'DATA INTELLIGENCE',
    description: 'Trace network observations associated with monitored Bitcoin traffic.',
  },
  {
    path: '/entity-explorer',
    label: 'Entities',
    section: 'INVESTIGATION',
    icon: UsersRound,
    eyebrow: 'DATA INTELLIGENCE',
    description: 'Prepare an analyst view of known entities and linked activity.',
  },
  {
    path: '/fusion-analysis',
    label: 'Fusion Analysis',
    section: 'INVESTIGATION',
    icon: BrainCircuit,
    eyebrow: 'AI FUSION',
    description: 'Unified multi-model threat scoring combining Elliptic++ and UGRansome models.',
  },
  {
    path: '/ai-alerts',
    label: 'Threat Alerts',
    section: 'INVESTIGATION',
    icon: BellRing,
    eyebrow: 'AI ANALYSIS',
    description: 'Surface prioritized signals that require analyst attention.',
  },
  {
    path: '/cases',
    label: 'Cases',
    section: 'INVESTIGATION',
    icon: ShieldCheck,
    eyebrow: 'INVESTIGATION',
    description: 'Manage operational cases and their review lifecycle.',
  },
  {
    path: '/reports',
    label: 'Reports',
    section: 'INVESTIGATION',
    icon: FileText,
    eyebrow: 'INVESTIGATION',
    description: 'Prepare structured reporting for completed investigative work.',
  },
]

export function getRouteDefinition(pathname: string) {
  return routes.find((route) => route.path === pathname) ?? routes[0]
}
