import { useSyncExternalStore } from 'react'
import type {
  Cluster,
  Entity,
  EntityId,
  GraphNodeType,
  IpAddress,
  IpAddressId,
  Severity,
  Transaction,
  TransactionId,
  Wallet,
  WalletId,
} from '../types/domain'
import {
  clusters,
  entities,
  ipAddresses,
  transactions,
  wallets,
} from '../data/mockData'

export type InvestigationState = {
  // Selections
  selectedEntity: Entity | null
  selectedTransaction: Transaction | null
  selectedIp: IpAddress | null
  selectedWallet: Wallet | null
  selectedCluster: Cluster | null
  selectedNodeId: string | null

  // Graph state
  highlightedNodes: string[]
  highlightedEdges: string[]
  expandedNodes: string[]
  highlightedPath: string[]

  // Filters & Timeline
  riskFilter: Severity | 'ALL'
  nodeTypeFilter: GraphNodeType | 'ALL'
  entityTypeFilter: string | 'ALL'
  timeRange: {
    start: string
    end: string
  }
  selectedTimelineDate: string
  timelinePlaying: boolean

  // Modes & UI Drawers
  investigationMode: boolean
  isInvestigationPanelOpen: boolean
  isTransactionDrawerOpen: boolean
  isValidationDrawerOpen: boolean
  isGlobalSearchOpen: boolean
  isNotificationOpen: boolean
  activeEntityTab: 'overview' | 'network' | 'transactions' | 'timeline' | 'ai'
}

const canonicalSuspiciousPath = [
  'wallet_cluster42_01',
  'tx_8f42a91c',
  'wallet_08',
  'tx_71b9d204',
  'wallet_91',
  'ip_185_220_101_42',
  'asn_60729',
]

const initialInvestigationState: InvestigationState = {
  selectedEntity: entities[0] ?? null,
  selectedTransaction: null,
  selectedIp: null,
  selectedWallet: null,
  selectedCluster: clusters[0] ?? null,
  selectedNodeId: 'wallet_cluster42_01',
  highlightedNodes: ['wallet_cluster42_01'],
  highlightedEdges: [],
  expandedNodes: ['wallet_cluster42_01'],
  highlightedPath: [],
  riskFilter: 'ALL',
  nodeTypeFilter: 'ALL',
  entityTypeFilter: 'ALL',
  timeRange: {
    start: '2026-09-01',
    end: '2026-09-05',
  },
  selectedTimelineDate: '2026-09-05',
  timelinePlaying: false,
  investigationMode: false,
  isInvestigationPanelOpen: false,
  isTransactionDrawerOpen: false,
  isValidationDrawerOpen: false,
  isGlobalSearchOpen: false,
  isNotificationOpen: false,
  activeEntityTab: 'overview',
}

let currentState: InvestigationState = { ...initialInvestigationState }
const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function normalizeId(id: string): string {
  return id.replace(/^node_/, '')
}

export const investigationStore = {
  getState(): InvestigationState {
    return currentState
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  selectEntity(entity: Entity | EntityId | string | null) {
    if (!entity) {
      currentState = {
        ...currentState,
        selectedEntity: null,
        selectedNodeId: null,
        isInvestigationPanelOpen: false,
      }
      emitChange()
      return
    }

    const entityId = typeof entity === 'string' ? normalizeId(entity) : entity.id
    const resolvedEntity =
      typeof entity === 'string'
        ? entities.find((e) => e.id === entityId || normalizeId(e.id) === entityId) ?? null
        : entity

    const cluster = resolvedEntity?.clusterId
      ? clusters.find((c) => c.id === resolvedEntity.clusterId) ?? null
      : clusters[0] ?? null

    currentState = {
      ...currentState,
      selectedEntity: resolvedEntity,
      selectedCluster: cluster,
      selectedNodeId: resolvedEntity ? resolvedEntity.id : currentState.selectedNodeId,
      highlightedNodes: resolvedEntity ? [resolvedEntity.id] : [],
      isInvestigationPanelOpen: true,
      activeEntityTab: 'overview',
    }
    emitChange()
  },

  selectTransaction(tx: Transaction | TransactionId | string | null) {
    if (!tx) {
      currentState = {
        ...currentState,
        selectedTransaction: null,
        isTransactionDrawerOpen: false,
      }
      emitChange()
      return
    }

    const txId = typeof tx === 'string' ? normalizeId(tx) : tx.id
    const resolvedTx =
      typeof tx === 'string'
        ? transactions.find((t) => t.id === txId || t.hash.startsWith(txId) || t.hash === txId) ?? null
        : tx

    currentState = {
      ...currentState,
      selectedTransaction: resolvedTx,
      isTransactionDrawerOpen: Boolean(resolvedTx),
      selectedNodeId: resolvedTx ? resolvedTx.id : currentState.selectedNodeId,
      highlightedNodes: resolvedTx ? [resolvedTx.id] : currentState.highlightedNodes,
    }
    emitChange()
  },

  selectIp(ip: IpAddress | IpAddressId | string | null) {
    if (!ip) {
      currentState = { ...currentState, selectedIp: null }
      emitChange()
      return
    }

    const ipId = typeof ip === 'string' ? normalizeId(ip) : ip.id
    const resolvedIp =
      typeof ip === 'string'
        ? ipAddresses.find((i) => i.id === ipId || i.address === ipId) ?? null
        : ip

    currentState = {
      ...currentState,
      selectedIp: resolvedIp,
      selectedNodeId: resolvedIp ? resolvedIp.id : currentState.selectedNodeId,
      highlightedNodes: resolvedIp ? [resolvedIp.id] : currentState.highlightedNodes,
      isInvestigationPanelOpen: true,
    }
    emitChange()
  },

  selectWallet(wallet: Wallet | WalletId | string | null) {
    if (!wallet) {
      currentState = { ...currentState, selectedWallet: null }
      emitChange()
      return
    }

    const walletId = typeof wallet === 'string' ? normalizeId(wallet) : wallet.id
    const resolvedWallet =
      typeof wallet === 'string'
        ? wallets.find((w) => w.id === walletId || w.address === walletId) ?? null
        : wallet

    currentState = {
      ...currentState,
      selectedWallet: resolvedWallet,
      selectedNodeId: resolvedWallet ? resolvedWallet.id : currentState.selectedNodeId,
      highlightedNodes: resolvedWallet ? [resolvedWallet.id] : currentState.highlightedNodes,
      isInvestigationPanelOpen: true,
    }
    emitChange()
  },

  selectNode(nodeId: string | null) {
    if (!nodeId) {
      currentState = {
        ...currentState,
        selectedNodeId: null,
        highlightedNodes: [],
        highlightedEdges: [],
      }
      emitChange()
      return
    }

    const cleanId = normalizeId(nodeId)
    const entity = entities.find((e) => e.id === cleanId || normalizeId(e.id) === cleanId)
    const tx = transactions.find((t) => t.id === cleanId || normalizeId(t.id) === cleanId)
    const ip = ipAddresses.find((i) => i.id === cleanId || normalizeId(i.id) === cleanId)
    const wallet = wallets.find((w) => w.id === cleanId || normalizeId(w.id) === cleanId)
    const cluster = clusters.find((c) => c.id === cleanId || normalizeId(c.id) === cleanId)

    currentState = {
      ...currentState,
      selectedNodeId: cleanId,
      selectedEntity: entity ?? currentState.selectedEntity,
      selectedTransaction: tx ?? null,
      selectedIp: ip ?? null,
      selectedWallet: wallet ?? null,
      selectedCluster: cluster ?? currentState.selectedCluster,
      highlightedNodes: [cleanId],
      isInvestigationPanelOpen: true,
    }
    emitChange()
  },

  highlightSuspiciousPath() {
    currentState = {
      ...currentState,
      highlightedPath: canonicalSuspiciousPath,
      highlightedNodes: canonicalSuspiciousPath,
      investigationMode: true,
      isInvestigationPanelOpen: true,
    }
    emitChange()
  },

  clearHighlightedPath() {
    currentState = {
      ...currentState,
      highlightedPath: [],
      highlightedNodes: currentState.selectedNodeId ? [currentState.selectedNodeId] : [],
      investigationMode: false,
    }
    emitChange()
  },

  highlightPath(nodeIds: string[]) {
    const clean = nodeIds.map(normalizeId)
    currentState = {
      ...currentState,
      highlightedPath: clean,
      highlightedNodes: clean,
      investigationMode: true,
    }
    emitChange()
  },

  toggleInvestigationMode(enable?: boolean) {
    const nextMode = enable !== undefined ? enable : !currentState.investigationMode
    currentState = {
      ...currentState,
      investigationMode: nextMode,
      isInvestigationPanelOpen: nextMode ? true : currentState.isInvestigationPanelOpen,
      highlightedPath: nextMode && currentState.highlightedPath.length === 0 ? canonicalSuspiciousPath : currentState.highlightedPath,
      highlightedNodes: nextMode && currentState.highlightedPath.length === 0 ? canonicalSuspiciousPath : currentState.highlightedNodes,
    }
    emitChange()
  },

  expandNeighbors(nodeId: string) {
    const cleanId = normalizeId(nodeId)
    const currentExpanded = new Set(currentState.expandedNodes)
    if (currentExpanded.has(cleanId)) {
      currentExpanded.delete(cleanId)
    } else {
      currentExpanded.add(cleanId)
    }
    currentState = {
      ...currentState,
      expandedNodes: Array.from(currentExpanded),
    }
    emitChange()
  },

  setRiskFilter(risk: Severity | 'ALL') {
    currentState = { ...currentState, riskFilter: risk }
    emitChange()
  },

  setNodeTypeFilter(nodeType: GraphNodeType | 'ALL') {
    currentState = { ...currentState, nodeTypeFilter: nodeType }
    emitChange()
  },

  setTimeRange(range: { start: string; end: string }) {
    currentState = { ...currentState, timeRange: range }
    emitChange()
  },

  setSelectedTimelineDate(date: string) {
    currentState = { ...currentState, selectedTimelineDate: date }
    emitChange()
  },

  setTimelinePlaying(playing: boolean) {
    currentState = { ...currentState, timelinePlaying: playing }
    emitChange()
  },

  setInvestigationPanelOpen(isOpen: boolean) {
    currentState = { ...currentState, isInvestigationPanelOpen: isOpen }
    emitChange()
  },

  setTransactionDrawerOpen(isOpen: boolean) {
    currentState = { ...currentState, isTransactionDrawerOpen: isOpen }
    emitChange()
  },

  setValidationDrawerOpen(isOpen: boolean) {
    currentState = { ...currentState, isValidationDrawerOpen: isOpen }
    emitChange()
  },

  setGlobalSearchOpen(isOpen: boolean) {
    currentState = { ...currentState, isGlobalSearchOpen: isOpen }
    emitChange()
  },

  setNotificationOpen(isOpen: boolean) {
    currentState = { ...currentState, isNotificationOpen: isOpen }
    emitChange()
  },

  setActiveEntityTab(tab: 'overview' | 'network' | 'transactions' | 'timeline' | 'ai') {
    currentState = { ...currentState, activeEntityTab: tab }
    emitChange()
  },

  openInvestigateEntity(entityId: EntityId | string) {
    investigationStore.selectEntity(entityId)
    investigationStore.setInvestigationPanelOpen(true)
  },

  openInvestigateTx(txId: TransactionId | string) {
    investigationStore.selectTransaction(txId)
    investigationStore.setTransactionDrawerOpen(true)
  },

  reset() {
    currentState = { ...initialInvestigationState }
    emitChange()
  },
}

export function useInvestigationState(): InvestigationState {
  return useSyncExternalStore(
    investigationStore.subscribe,
    investigationStore.getState,
    investigationStore.getState
  )
}
