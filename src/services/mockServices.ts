import { mockData } from '../data/mockData'
import { prototypeStore } from '../state/prototypeStore'
import type { AlertDetailRecord, AlertId, AlertStatus, Case, CaseId, CaseStatus, ClusterId, CorrelationIntelligenceRecord, DashboardFilters, DashboardSnapshot, EntityId, GraphNodeDetails, InvestigationId, TransactionId, TransactionIntelligenceRecord, ValidationCategory, WalletId } from '../types/domain'

const copy = <T>(value: T): T => structuredClone(value)

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = { from: '2026-09-01', to: '2026-09-05', risk: 'ALL' }

function isWithinDate(timestamp: string, filters: DashboardFilters) {
  const time = new Date(timestamp).getTime()
  const from = new Date(`${filters.from}T00:00:00.000Z`).getTime()
  const to = new Date(`${filters.to}T23:59:59.999Z`).getTime()
  return time >= from && time <= to
}

export function getDashboardData(filters: DashboardFilters = DEFAULT_DASHBOARD_FILTERS): DashboardSnapshot {
  const activity = mockData.transactionActivity.filter((point) => isWithinDate(point.timestamp, filters)).map((point) => {
    if (filters.risk === 'ALL') return point
    return {
      ...point,
      normal: filters.risk === 'LOW' ? point.normal : 0,
      elevated: filters.risk === 'MEDIUM' ? point.elevated : 0,
      suspicious: filters.risk === 'HIGH' ? point.suspicious : 0,
      highRisk: filters.risk === 'CRITICAL' ? point.highRisk : 0,
    }
  })
  const alerts = mockData.alerts.filter((alert) => isWithinDate(alert.generatedAt, filters) && (filters.risk === 'ALL' || alert.severity === filters.risk))
  const recentActivity = mockData.timelineEvents.filter((event) => isWithinDate(event.timestamp, filters))
  const riskDistribution = mockData.dashboardRiskDistribution
  return copy({
    metrics: mockData.dashboardMetrics,
    riskDistribution,
    transactionActivity: activity,
    recentActivity,
    alerts,
    primaryCluster: mockData.clusters[0],
    systemStatus: mockData.systemStatus,
  })
}

export function getTransactions() { return copy(mockData.transactions) }
export function getTransactionById(id: TransactionId) { return copy(mockData.transactions.find((item) => item.id === id)) }

function buildTransactionIntelligence(transactionId: TransactionId): TransactionIntelligenceRecord | undefined {
  const transaction = mockData.transactions.find((item) => item.id === transactionId)
  if (!transaction) return undefined
  const inputWallet = mockData.wallets.find((wallet) => wallet.id === transaction.inputWalletId)
  const outputWallet = mockData.wallets.find((wallet) => wallet.id === transaction.outputWalletId)
  const entity = mockData.entities.find((item) => item.id === transaction.entityId)
  if (!inputWallet || !outputWallet || !entity) return undefined
  const observation = mockData.networkObservations.find((item) => item.transactionId === transaction.id)
  const sourceIpId = observation?.ipAddressId ?? inputWallet.associatedIpIds[0]
  const sourceIp = mockData.ipAddresses.find((ip) => ip.id === sourceIpId)
  if (!sourceIp) return undefined
  const cluster = transaction.clusterId ? mockData.clusters.find((item) => item.id === transaction.clusterId) : undefined
  const correlation = mockData.correlations.find((item) => item.transactionId === transaction.id)
  const investigation = cluster ? mockData.investigations.find((item) => item.clusterId === cluster.id) : undefined
  const relatedWalletIds = cluster?.walletIds ?? [inputWallet.id, outputWallet.id]
  const relatedTransactionIds = cluster?.transactionIds ?? [transaction.id]
  const relatedIpIds = cluster?.ipAddressIds ?? [sourceIp.id]
  return {
    transaction,
    sourceIp,
    country: sourceIp.country,
    asn: sourceIp.asn,
    provider: sourceIp.provider,
    entity,
    cluster,
    inputWallet,
    outputWallet,
    relatedWallets: mockData.wallets.filter((wallet) => relatedWalletIds.includes(wallet.id)).slice(0, 6),
    relatedTransactions: mockData.transactions.filter((item) => relatedTransactionIds.includes(item.id)).slice(0, 6),
    relatedIps: mockData.ipAddresses.filter((ip) => relatedIpIds.includes(ip.id)),
    correlation,
    investigation,
    riskFactors: cluster?.patternSignals ?? ['Transaction behavior within the observed baseline', 'No elevated cluster association recorded'],
  }
}

export function getTransactionIntelligence() {
  return copy(mockData.transactions.map((transaction) => buildTransactionIntelligence(transaction.id)).filter((item): item is TransactionIntelligenceRecord => Boolean(item)))
}
export function getTransactionIntelligenceById(id: TransactionId) { return copy(buildTransactionIntelligence(id)) }
export function getWallets() { return copy(mockData.wallets) }
export function getWalletById(id: WalletId) { return copy(mockData.wallets.find((item) => item.id === id)) }
export function getIpAddresses() { return copy(mockData.ipAddresses) }
export function getNetworkObservations() { return copy(mockData.networkObservations) }
export function getEntities() { return copy(mockData.entities) }
export function getEntityById(id: EntityId) { return copy(mockData.entities.find((item) => item.id === id)) }
export function getClusters() { return copy(mockData.clusters) }
export function getClusterById(id: ClusterId) { return copy(mockData.clusters.find((item) => item.id === id)) }
export function getCorrelations() { return copy(mockData.correlations) }

function buildCorrelationIntelligence(correlationId: string): CorrelationIntelligenceRecord | undefined {
  const correlation = mockData.correlations.find((item) => item.id === correlationId)
  if (!correlation) return undefined
  const observation = mockData.networkObservations.find((item) => item.id === correlation.networkObservationId)
  const ipAddress = mockData.ipAddresses.find((item) => item.id === correlation.ipAddressId)
  const transaction = mockData.transactions.find((item) => item.id === correlation.transactionId)
  const wallet = mockData.wallets.find((item) => item.id === correlation.walletId)
  const entity = transaction ? mockData.entities.find((item) => item.id === transaction.entityId) : undefined
  if (!observation || !ipAddress || !transaction || !wallet || !entity) return undefined
  const cluster = transaction.clusterId ? mockData.clusters.find((item) => item.id === transaction.clusterId) : undefined
  const investigation = cluster ? mockData.investigations.find((item) => item.clusterId === cluster.id) : undefined
  return { correlation, observation, ipAddress, transaction, wallet, entity, cluster, investigation }
}

export function getCorrelationAnalysis(clusterId?: ClusterId) {
  const records = mockData.correlations.map((correlation) => buildCorrelationIntelligence(correlation.id)).filter((item): item is CorrelationIntelligenceRecord => Boolean(item))
  return copy(clusterId ? records.filter((record) => record.cluster?.id === clusterId) : records)
}
export function getCorrelationAnalysisById(id: string) { return copy(buildCorrelationIntelligence(id)) }

export function getGraphData(id: ClusterId = 'cluster_42') {
  return copy(mockData.graphData.clusterId === id ? mockData.graphData : { clusterId: id, nodes: [], edges: [] })
}

export function getGraphNodeDetails(nodeId: string): GraphNodeDetails | undefined {
  const node = mockData.graphData.nodes.find((item) => item.id === nodeId)
  if (!node) return undefined
  const transaction = mockData.transactions.find((item) => item.id === nodeId)
  const wallet = mockData.wallets.find((item) => item.id === nodeId)
  const ip = mockData.ipAddresses.find((item) => item.id === nodeId)
  const entity = mockData.entities.find((item) => item.id === nodeId)
  const cluster = mockData.clusters.find((item) => item.id === nodeId)

  let relatedIps = cluster
    ? mockData.ipAddresses.filter((item) => cluster.ipAddressIds.includes(item.id))
    : node.type === 'ASN'
      ? mockData.ipAddresses.filter((item) => item.asn === node.label || node.id.includes(item.asn.replace('AS', '')))
      : node.type === 'COUNTRY'
        ? mockData.ipAddresses.filter((item) => node.label.toLowerCase().includes(item.country.toLowerCase()))
        : mockData.ipAddresses.filter((item) => item.id === nodeId || mockData.networkObservations.some((obs) => obs.ipAddressId === item.id && (obs.transactionId === nodeId || obs.walletId === nodeId))).slice(0, 6)

  const relatedTransactions = cluster
    ? mockData.transactions.filter((item) => cluster.transactionIds.includes(item.id))
    : mockData.transactions.filter((item) => item.inputWalletId === nodeId || item.outputWalletId === nodeId || item.id === nodeId || relatedIps.some((relIp) => mockData.networkObservations.some((obs) => obs.ipAddressId === relIp.id && obs.transactionId === item.id))).slice(0, 27)

  const relatedWallets = cluster
    ? mockData.wallets.filter((item) => cluster.walletIds.includes(item.id))
    : mockData.wallets.filter((item) => item.id === nodeId || relatedTransactions.some((related) => related.inputWalletId === item.id || related.outputWalletId === item.id) || relatedIps.some((relIp) => item.associatedIpIds.includes(relIp.id))).slice(0, 14)

  if (relatedIps.length === 0 && (wallet || transaction)) {
    relatedIps = mockData.ipAddresses.filter((item) => wallet?.associatedIpIds.includes(item.id)).slice(0, 6)
  }

  const relatedEntities = cluster
    ? mockData.entities.filter((item) => item.id === cluster.entityId)
    : mockData.entities.filter((item) => item.id === nodeId || item.walletIds.some((id) => relatedWallets.some((walletItem) => walletItem.id === id)) || item.ipAddressIds.some((id) => relatedIps.some((ipItem) => ipItem.id === id))).slice(0, 3)

  const clusterForNode = transaction?.clusterId ?? wallet?.clusterId ?? entity?.clusterId ?? cluster?.id
  const clusterRecord = clusterForNode ? mockData.clusters.find((item) => item.id === clusterForNode) : undefined

  const calculatedRiskScore = node.riskScore ?? clusterRecord?.riskScore ?? (transaction ? Math.round(transaction.anomalyScore * 100) : ip?.riskSignal === 'HIGH_RISK' || wallet?.riskSignal === 'HIGH_RISK' ? 80 : 28)
  const confidence = clusterRecord?.confidence ?? entity?.confidence ?? (ip ? 0.86 : 0.74)

  const evidenceItems: string[] = []
  if (node.metadata) {
    Object.entries(node.metadata).forEach(([k, v]) => {
      evidenceItems.push(`${k}: ${v}`)
    })
  }
  if (clusterRecord?.patternSignals) {
    evidenceItems.push(...clusterRecord.patternSignals)
  }
  if (evidenceItems.length === 0) {
    evidenceItems.push('Observed relationship within the simulated demonstration investigation network.', 'Synthetic intelligence pattern; verify associated entity hops.')
  }

  return copy({
    node,
    riskScore: calculatedRiskScore,
    confidence,
    firstSeen: wallet?.firstSeen ?? ip?.firstObserved,
    lastSeen: wallet?.lastSeen ?? ip?.lastObserved,
    relatedEntities,
    relatedTransactions,
    relatedWallets,
    relatedIps,
    evidence: evidenceItems,
  })
}

export function getModelAnalysis(id: ClusterId = 'cluster_42') { return copy(mockData.modelResults.filter((item) => item.clusterId === id)) }
export function getModelAnalysisContext(clusterId: ClusterId = 'cluster_42', transactionId?: TransactionId) {
  const cluster = mockData.clusters.find((item) => item.id === clusterId)
  const transaction = transactionId ? mockData.transactions.find((item) => item.id === transactionId && item.clusterId === clusterId) : cluster ? mockData.transactions.find((item) => item.id === cluster.transactionIds[0]) : undefined
  return copy({ cluster, transaction, results: mockData.modelResults.filter((item) => item.clusterId === clusterId) })
}
export function getFusionResult(id: ClusterId = 'cluster_42') { return copy(mockData.featureFusion.clusterId === id ? mockData.featureFusion : undefined) }
export function getRiskAssessment(id: ClusterId = 'cluster_42') { return copy(mockData.riskAssessments.find((item) => item.clusterId === id)) }
export function getFeatureFusionAnalysis(id: ClusterId = 'cluster_42') {
  const cluster = mockData.clusters.find((item) => item.id === id) ?? mockData.clusters[0]
  let models = mockData.modelResults.filter((item) => item.clusterId === id)
  let fusion = mockData.featureFusion.clusterId === id ? mockData.featureFusion : undefined
  let risk = mockData.riskAssessments.find((item) => item.clusterId === id)

  if (models.length === 0) {
    const isHigh = cluster.riskScore >= 70
    const isMed = cluster.riskScore >= 40 && cluster.riskScore < 70
    const scoreBase = cluster.riskScore / 100
    models = [
      {
        model: 'ELLIPTIC++',
        clusterId: id,
        anomalyScore: Math.min(0.98, Math.max(0.12, +(scoreBase + 0.03).toFixed(2))),
        classification: isHigh || isMed ? 'SUSPICIOUS' : 'NORMAL',
        confidence: isHigh ? 0.93 : 0.88,
        features: ['Transaction behavior', 'Wallet interaction', 'Graph structure', 'Transaction frequency', 'Counterparty behavior'],
        assessment: isHigh ? 'High connectivity and cyclic peel patterns detected across graph subtrees.' : 'Standard transaction graph topology without abnormal variance.',
      },
      {
        model: 'UGRANSOME',
        clusterId: id,
        anomalyScore: Math.min(0.98, Math.max(0.10, +(scoreBase - 0.04).toFixed(2))),
        classification: isHigh || isMed ? 'SUSPICIOUS' : 'NORMAL',
        confidence: isHigh ? 0.90 : 0.85,
        features: ['Network activity', 'IP behavior', 'Communication frequency', 'Temporal patterns', 'Network relationships'],
        assessment: isHigh ? 'Temporal clustering and Tor proxy co-occurrences indicate elevated risk.' : 'Normal network propagation and autonomous system routing.',
      },
    ]
  }

  if (!fusion) {
    const m1 = models[0]?.anomalyScore ?? 0.5
    const m2 = models[1]?.anomalyScore ?? 0.5
    const fused = +(m1 * 0.55 + m2 * 0.45).toFixed(3)
    fusion = {
      clusterId: id,
      ellipticContribution: 0.55,
      ugransomeContribution: 0.45,
      fusedScore: fused,
      classification: fused >= 0.75 ? 'HIGH RISK' : fused >= 0.4 ? 'MEDIUM RISK' : 'LOW RISK',
      confidence: 0.92,
      contributingSignals: [`${m1.toFixed(2)} Elliptic++ anomaly score`, `${m2.toFixed(2)} UGRansome anomaly score`, 'Graph topology consensus', 'Network temporal correlation'],
    }
  }

  if (!risk) {
    const isHigh = cluster.riskScore >= 70
    risk = {
      clusterId: id,
      score: cluster.riskScore,
      confidence: cluster.confidence,
      severity: cluster.severity,
      breakdown: [
        { label: 'Anomaly Consensus', points: Math.round(cluster.riskScore * 0.28), evidence: 'Converging multi-model neural outputs across graph and network vectors.', evidencePath: '/threat-fusion' },
        { label: 'Network Attribution', points: Math.round(cluster.riskScore * 0.24), evidence: `${cluster.ipAddressIds.length} IP relays monitored across observation window.`, evidencePath: '/network-activity' },
        { label: 'Graph Connectivity', points: Math.round(cluster.riskScore * 0.26), evidence: `${cluster.walletIds.length} wallets linked in entity cluster topology.`, evidencePath: `/entity-graph?cluster=${cluster.id}` },
        { label: 'Peeling & Velocity', points: Math.round(cluster.riskScore * 0.22), evidence: `${cluster.transactionIds.length} transactions exhibiting rapid temporal dispersion.`, evidencePath: '/transactions' },
      ],
      rationale: [
        `Observed ${cluster.transactionIds.length} transactions across ${cluster.walletIds.length} wallets`,
        `Telemetry shows ${cluster.patternSignals.join(', ')}`,
        'Dual-model Bayesian ensemble establishes robust statistical agreement',
        cluster.analystCaveat,
      ],
      recommendation: isHigh ? 'Immediate escalation to active case docket and freeze monitoring.' : 'Maintain standard periodic threshold monitoring.',
    }
  }

  return copy({ cluster, models, fusion, risk, riskLevels: mockData.riskLevelDefinitions })
}

export function getAlerts() { return copy(prototypeStore.getState().alerts) }
export function getAlertById(id: AlertId) { return copy(prototypeStore.getAlert(id)) }
export function updateAlertStatus(id: AlertId, status: AlertStatus) { return copy(prototypeStore.updateAlertStatus(id, status)) }
export function getAlertDetail(id: AlertId): AlertDetailRecord | undefined {
  const alert = prototypeStore.getAlert(id)
  if (!alert) return undefined
  const entity = mockData.entities.find((item) => item.id === alert.entityId)
  const cluster = mockData.clusters.find((item) => item.id === alert.clusterId)
  const investigation = mockData.investigations.find((item) => item.id === alert.investigationId)
  if (!entity || !cluster || !investigation) return undefined
  const risk = mockData.riskAssessments.find((item) => item.clusterId === cluster.id)
  return copy({ alert, entity, cluster, investigation, transactions: mockData.transactions.filter((item) => alert.transactionIds.includes(item.id)), wallets: mockData.wallets.filter((item) => cluster.walletIds.includes(item.id)), ips: mockData.ipAddresses.filter((item) => cluster.ipAddressIds.includes(item.id)), timeline: mockData.timelineEvents.filter((event) => investigation.timelineEventIds.includes(event.id)), evidence: [...cluster.patternSignals, ...(risk?.breakdown.map((factor) => factor.evidence) ?? [])] })
}

export function getInvestigations() { return copy(mockData.investigations) }
export function getInvestigation(id: InvestigationId) { return copy(mockData.investigations.find((item) => item.id === id)) }
export function getTimelineEvents(investigationId?: InvestigationId) {
  return copy(investigationId ? mockData.timelineEvents.filter((event) => event.investigationId === investigationId) : mockData.timelineEvents)
}

export function getCases() { return copy(prototypeStore.getState().cases) }
export function getCaseById(id: string) { return copy(prototypeStore.getCase(id as Case['id'])) }
export function updateCaseStatus(id: string, status: CaseStatus) { return copy(prototypeStore.updateCaseStatus(id as CaseId, status)) }
export function createCaseFromAlert(alertId: AlertId) {
  const alert = prototypeStore.getAlert(alertId)
  if (!alert) return undefined
  const investigation = mockData.investigations.find((item) => item.id === alert.investigationId)
  if (!investigation) return undefined
  const caseRecord: Case = {
    id: `case_${alertId.replace('alert_', '')}`,
    investigationId: investigation.id,
    sourceAlertId: alert.id,
    title: `${investigation.title} case`,
    status: 'OPEN',
    priority: alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? 'URGENT' : 'ELEVATED',
    createdAt: new Date().toISOString(),
    assignedTo: investigation.assignedTo,
    evidenceIds: [alert.id, investigation.id, investigation.clusterId, ...investigation.timelineEventIds],
  }
  return copy(prototypeStore.addCase(caseRecord))
}

export function generateReportData(caseId: string) {
  const caseRecord = prototypeStore.getCase(caseId as Case['id'])
  if (!caseRecord) return undefined
  return copy(mockData.reports.find((report) => report.caseId === caseId) ?? {
    id: `report_${caseId.replace('case_', '')}`,
    caseId: caseRecord.id,
    investigationId: caseRecord.investigationId,
    title: `${caseRecord.title} report`,
    generatedAt: new Date().toISOString(),
    sections: ['Executive summary', 'Evidence review', 'Risk assessment'],
    finding: 'Evidence remains subject to analyst review.',
  })
}

export function getSystemStatus() { return copy(mockData.systemStatus) }
export function getDashboardMetrics() { return copy(mockData.dashboardMetrics) }
export function getIngestionData() { return copy(mockData.ingestionSnapshot) }
export function getValidationRecords(category: ValidationCategory | 'ALL' = 'ALL') {
  return copy(category === 'ALL' ? mockData.ingestionSnapshot.validationRecords : mockData.ingestionSnapshot.validationRecords.filter((record) => record.category === category))
}
export function getEnrichmentResults() { return copy(mockData.ingestionSnapshot.enrichmentResults) }
export function getEnrichmentDetails(ipAddressId: string) { return copy(mockData.ingestionSnapshot.enrichmentResults.find((item) => item.ipAddressId === ipAddressId)) }
