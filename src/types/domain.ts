export type TransactionId = `tx_${string}`
export type WalletId = `wallet_${string}`
export type IpAddressId = `ip_${string}`
export type NetworkObservationId = `net_${string}`
export type EntityId = `entity_${string}`
export type ClusterId = `cluster_${number}`
export type CorrelationId = `corr_${string}`
export type AlertId = `alert_${string}`
export type InvestigationId = `investigation_${string}`
export type CaseId = `case_${string}`
export type ReportId = `report_${string}`

export type ActivityClass = 'NORMAL' | 'ELEVATED' | 'SUSPICIOUS' | 'HIGH_RISK'
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type AlertStatus = 'NEW' | 'REVIEWING' | 'CONFIRMED' | 'FALSE_POSITIVE'
export type CaseStatus = 'OPEN' | 'IN_REVIEW' | 'CLOSED'
export type ModelClassification = 'NORMAL' | 'SUSPICIOUS'
export type GraphNodeType = 'WALLET' | 'ENTITY' | 'CLUSTER' | 'IP_ADDRESS' | 'TRANSACTION' | 'ASN' | 'COUNTRY'
export type GraphRelationshipType = 'TRANSACTION' | 'OBSERVED_FROM' | 'BELONGS_TO' | 'RELATED_TO' | 'ROUTED_THROUGH' | 'LOCATED_IN'
export type IngestionPhase = 'UPLOADED' | 'PARSING' | 'VALIDATING' | 'NORMALIZING' | 'ENRICHING' | 'CORRELATING' | 'READY'
export type ValidationCategory = 'VALID' | 'WARNING' | 'INVALID' | 'DUPLICATE'
export type ValidationSeverity = 'INFO' | 'MEDIUM' | 'HIGH'
export type EnrichmentStatus = 'ENRICHED' | 'UNKNOWN' | 'SKIPPED'
export type CorrelationStatus = 'SUPPORTED' | 'REVIEW' | 'UNRESOLVED'

export interface Transaction {
  id: TransactionId
  hash: string
  timestamp: string
  amountBtc: number
  feeBtc: number
  blockHeight: number
  blockReference: string
  inputWalletId: WalletId
  outputWalletId: WalletId
  inputCount: number
  outputCount: number
  activityClass: ActivityClass
  anomalyScore: number
  riskLevel: Severity
  entityId: EntityId
  clusterId?: ClusterId
  confirmationCount: number
  status: 'CONFIRMED' | 'PENDING'
}

export interface Wallet {
  id: WalletId
  address: string
  firstSeen: string
  lastSeen: string
  transactionCount: number
  totalVolumeBtc: number
  entityId: EntityId
  clusterId?: ClusterId
  riskSignal: ActivityClass
  associatedIpIds: IpAddressId[]
}

export interface IpAddress {
  id: IpAddressId
  address: string
  asn: string
  provider: string
  country: string
  firstObserved: string
  lastObserved: string
  observationCount: number
  riskSignal: ActivityClass
}

export interface NetworkObservation {
  id: NetworkObservationId
  timestamp: string
  ipAddressId: IpAddressId
  transactionId?: TransactionId
  walletId?: WalletId
  protocol: 'BITCOIN_P2P' | 'TOR_EXIT' | 'RPC' | 'EXCHANGE_API'
  direction: 'INBOUND' | 'OUTBOUND'
  confidence: number
  note: string
}

export interface Entity {
  id: EntityId
  label: string
  entityType: 'CLUSTER' | 'SERVICE' | 'EXCHANGE' | 'UNCLASSIFIED' | 'MIXER' | 'MERCHANT' | 'OTC'
  clusterId?: ClusterId
  walletIds: WalletId[]
  ipAddressIds: IpAddressId[]
  transactionIds: TransactionId[]
  confidence: number
  requiresReview: boolean
}

export interface Cluster {
  id: ClusterId
  displayId: string
  entityId: EntityId
  riskScore: number
  confidence: number
  severity: Severity
  status: 'NEW' | 'REVIEWING' | 'RESOLVED'
  transactionIds: TransactionId[]
  walletIds: WalletId[]
  ipAddressIds: IpAddressId[]
  patternSignals: string[]
  analystCaveat: string
}

export interface Correlation {
  id: CorrelationId
  transactionId: TransactionId
  networkObservationId: NetworkObservationId
  walletId: WalletId
  ipAddressId: IpAddressId
  confidence: number
  score: number
  timestamp: string
  status: CorrelationStatus
  evidenceSignals: string[]
  relationship: 'DIRECT' | 'TEMPORAL' | 'REPEATED'
  note: string
}

export interface ModelResult {
  model: 'ELLIPTIC++' | 'UGRANSOME'
  clusterId: ClusterId
  anomalyScore: number
  classification: ModelClassification
  confidence: number
  features: string[]
  assessment: string
}

export interface FeatureFusionResult {
  clusterId: ClusterId
  ellipticContribution: number
  ugransomeContribution: number
  fusedScore: number
  classification: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK'
  confidence: number
  contributingSignals: string[]
}

export interface RiskAssessment {
  clusterId: ClusterId
  score: number
  confidence: number
  severity: Severity
  breakdown: RiskFactor[]
  rationale: string[]
  recommendation: string
}

export interface RiskFactor {
  label: string
  points: number
  evidence: string
  evidencePath: string
}

export interface RiskLevelDefinition {
  level: Severity
  range: string
  description: string
}

export interface Alert {
  id: AlertId
  entityId: EntityId
  clusterId: ClusterId
  investigationId: InvestigationId
  riskScore: number
  confidence: number
  severity: Severity
  status: AlertStatus
  title: string
  description: string
  transactionIds: TransactionId[]
  generatedAt: string
}

export interface AlertDetailRecord {
  alert: Alert
  entity: Entity
  cluster: Cluster
  investigation: Investigation
  transactions: Transaction[]
  wallets: Wallet[]
  ips: IpAddress[]
  timeline: TimelineEvent[]
  evidence: string[]
}

export interface TimelineEvent {
  id: string
  investigationId: InvestigationId
  timestamp: string
  type: 'NETWORK_OBSERVATION' | 'TRANSACTION_OBSERVED' | 'WALLET_RELATIONSHIP' | 'REPEATED_ASSOCIATION' | 'BEHAVIORAL_ANOMALY' | 'MODEL_ANALYSIS' | 'FEATURE_FUSION' | 'RISK_CALCULATION' | 'ALERT_GENERATED'
  title: string
  description: string
  evidenceIds: string[]
}

export interface Investigation {
  id: InvestigationId
  clusterId: ClusterId
  primaryAlertId: AlertId
  title: string
  status: 'NEW' | 'ACTIVE' | 'CLOSED'
  priority: 'STANDARD' | 'ELEVATED' | 'URGENT'
  assignedTo: string
  openedAt: string
  transactionIds: TransactionId[]
  walletIds: WalletId[]
  ipAddressIds: IpAddressId[]
  timelineEventIds: string[]
  evidenceSummary: string
}

export interface Case {
  id: CaseId
  investigationId: InvestigationId
  sourceAlertId: AlertId
  title: string
  status: CaseStatus
  priority: 'STANDARD' | 'ELEVATED' | 'URGENT'
  createdAt: string
  assignedTo: string
  evidenceIds: string[]
}

export interface Report {
  id: ReportId
  caseId: CaseId
  investigationId: InvestigationId
  title: string
  generatedAt: string
  sections: string[]
  finding: string
}

export interface GraphNode {
  id: string
  label: string
  type: GraphNodeType
  riskSignal?: ActivityClass
  riskScore?: number
  degree?: number
  hopLevel?: number
  isSeed?: boolean
  anomalyFlag?: boolean
  metadata?: Record<string, string | number | boolean>
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type: GraphRelationshipType
  weight: number
  label: string
}

export interface GraphData {
  clusterId: ClusterId
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface GraphNodeDetails {
  node: GraphNode
  riskScore: number
  confidence: number
  firstSeen?: string
  lastSeen?: string
  relatedEntities: Entity[]
  relatedTransactions: Transaction[]
  relatedWallets: Wallet[]
  relatedIps: IpAddress[]
  evidence: string[]
}

export interface SystemStatus {
  mode: 'OFFLINE / DEMONSTRATION'
  overall: 'OPERATIONAL' | 'DEGRADED'
  lastRefresh: string
  services: Array<{ name: string; status: 'OPERATIONAL' | 'STAGED'; latencyMs: number }>
}

export interface DashboardMetrics {
  totalRecords: number
  transactions: number
  wallets: number
  ipAddresses: number
  entities: number
  suspiciousEntities: number
  activeAlerts: number
  criticalAlerts: number
  monitoredTransactions: number
  activeEntities: number
  openAlerts: number
  highRiskClusters: number
  networkObservations: number
  modelCoverage: number
}

export interface RiskDistribution {
  level: Severity
  count: number
  percentage: number
}

export interface TransactionActivityPoint {
  timestamp: string
  normal: number
  elevated: number
  suspicious: number
  highRisk: number
}

export type DashboardRiskFilter = 'ALL' | Severity

export interface DashboardFilters {
  from: string
  to: string
  risk: DashboardRiskFilter
}

export interface DashboardSnapshot {
  metrics: DashboardMetrics
  riskDistribution: RiskDistribution[]
  transactionActivity: TransactionActivityPoint[]
  recentActivity: TimelineEvent[]
  alerts: Alert[]
  primaryCluster: Cluster
  systemStatus: SystemStatus
}

export interface IngestionDataset {
  filename: string
  format: 'CSV' | 'JSON'
  sizeBytes: number
  recordCount: number
  uploadTimestamp: string
  processingTimeSeconds: number
  status: IngestionPhase
}

export interface ValidationRecord {
  id: string
  recordId: string
  field: string
  errorType: string
  category: ValidationCategory
  severity: ValidationSeverity
  message: string
  transactionId?: TransactionId
  ipAddressId?: IpAddressId
}

export interface EnrichmentResult {
  ipAddressId: IpAddressId
  ipAddress: string
  country: string
  asn: string
  provider: string
  status: EnrichmentStatus
  confidence?: number
  note: string
}

export interface IngestionSnapshot {
  dataset: IngestionDataset
  phases: IngestionPhase[]
  validationSummary: { valid: number; warnings: number; invalid: number; duplicates: number }
  validationRecords: ValidationRecord[]
  enrichmentResults: EnrichmentResult[]
}

export interface TransactionIntelligenceRecord {
  transaction: Transaction
  sourceIp: IpAddress
  country: string
  asn: string
  provider: string
  entity: Entity
  cluster?: Cluster
  inputWallet: Wallet
  outputWallet: Wallet
  relatedWallets: Wallet[]
  relatedTransactions: Transaction[]
  relatedIps: IpAddress[]
  correlation?: Correlation
  investigation?: Investigation
  riskFactors: string[]
}

export interface CorrelationIntelligenceRecord {
  correlation: Correlation
  observation: NetworkObservation
  ipAddress: IpAddress
  transaction: Transaction
  wallet: Wallet
  entity: Entity
  cluster?: Cluster
  investigation?: Investigation
}
