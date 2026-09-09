import type { LucideIcon } from 'lucide-react'

export type NavigationSection =
  | 'COMMAND CENTER'
  | 'DATA INTELLIGENCE'
  | 'GRAPH INTELLIGENCE'
  | 'AI ANALYSIS'
  | 'DASHBOARD'
  | 'INVESTIGATION'
  | 'SYSTEM'

export type RouteDefinition = {
  path: string
  label: string
  section: NavigationSection
  icon: LucideIcon
  description: string
  eyebrow: string
}
