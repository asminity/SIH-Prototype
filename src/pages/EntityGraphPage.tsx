import { useState, useEffect } from 'react'
import {
  GitBranch,
  Activity,
  ShieldAlert,
  RadioTower,
  Download,
  RefreshCw,
  CheckCircle2,
  X,
  Compass,
  Zap,
} from 'lucide-react'
import { getGraphData, getGraphNodeDetails } from '../services/mockServices'
import { GraphCanvas } from '../components/graph/GraphCanvas'
import { GraphDetailsPanel } from '../components/graph/GraphDetailsPanel'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'
import { investigationStore } from '../state/investigationStore'

type GraphMode = 'SURVEILLANCE' | 'THREAT_FLOW' | 'EDGE_RELAYS' | 'BASELINE'

const graph = getGraphData('cluster_42')

export function EntityGraphPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined)
  const [activeMode, setActiveMode] = useState<GraphMode>('SURVEILLANCE')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const selectedDetails = selectedNodeId ? getGraphNodeDetails(selectedNodeId) : undefined

  const showToast = (msg: string) => setToastMessage(msg)

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const handleSelectMode = (mode: GraphMode) => {
    setActiveMode(mode)
    if (mode === 'SURVEILLANCE') {
      setSelectedNodeId('wallet_cluster42_01')
      investigationStore.clearHighlightedPath()
      showToast('Switched to Cluster #42 Surveillance Mode')
    } else if (mode === 'THREAT_FLOW') {
      setSelectedNodeId('wallet_cluster42_01')
      investigationStore.highlightSuspiciousPath()
      showToast('Tracing Multi-Hop Laundering Flow Path (27 TXs)')
    } else if (mode === 'EDGE_RELAYS') {
      setSelectedNodeId('ip_185_220_101_42')
      investigationStore.clearHighlightedPath()
      showToast('Focusing Edge Tor Relays & BGP ASNs')
    } else if (mode === 'BASELINE') {
      setSelectedNodeId('wallet_17')
      investigationStore.clearHighlightedPath()
      showToast('Comparing Baseline Benchmark (Northstar Exchange)')
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      showToast('Graph topology synced with real-time mempool telemetry')
    }, 600)
  }

  const handleExportTopology = () => {
    const dataStr = JSON.stringify(graph, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `graph-topology-${activeMode.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported graph topology JSON file')
  }

  return (
    <div className="entity-graph-page">
      {/* Toast Notification HUD */}
      {toastMessage ? (
        <div className="hud-toast" role="status">
          <CheckCircle2 size={15} className="text-cyan" />
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} aria-label="Dismiss toast">
            <X size={13} />
          </button>
        </div>
      ) : null}

      {/* Modern High-Tech Header */}
      <PageHeader
        eyebrow="SIGNAL &amp; BLOCKCHAIN GRAPH INTELLIGENCE"
        title="Entity Relationship Graph"
        description="Multi-layered topological graph correlating Bitcoin UTXO movements, Tor exit relays, and autonomous systems."
        actions={
          <div className="flex-actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={handleRefresh}
              title="Resynchronize graph topology with live telemetry"
            >
              <RefreshCw size={13} className={isRefreshing ? 'spin-animation' : ''} />
              <span>SYNC GRAPH</span>
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={handleExportTopology}
              title="Download full topology graph structure as JSON"
            >
              <Download size={13} />
              <span>EXPORT JSON</span>
            </button>
            <StatusBadge label="INVESTIGATION ACTIVE" tone="warning" />
          </div>
        }
      />

      {/* Realistic Investigation Modes Switcher */}
      <section className="graph-modes-bar" aria-label="Investigation Modes">
        <div className="modes-bar-label">
          <Compass size={14} />
          <span>INVESTIGATION MODES:</span>
        </div>

        <div className="modes-bar-pills">
          <button
            type="button"
            className={`mode-pill ${activeMode === 'SURVEILLANCE' ? 'mode-pill--active' : ''}`}
            onClick={() => handleSelectMode('SURVEILLANCE')}
          >
            <ShieldAlert size={13} className="mode-pill-icon text-red" />
            <div className="mode-pill-text">
              <strong>Cluster #42 Surveillance</strong>
              <small>Primary Syndicate Focus</small>
            </div>
          </button>

          <button
            type="button"
            className={`mode-pill ${activeMode === 'THREAT_FLOW' ? 'mode-pill--active' : ''}`}
            onClick={() => handleSelectMode('THREAT_FLOW')}
          >
            <Zap size={13} className="mode-pill-icon text-amber" />
            <div className="mode-pill-text">
              <strong>Multi-Hop Threat Flow</strong>
              <small>Laundering Dispersion Path</small>
            </div>
          </button>

          <button
            type="button"
            className={`mode-pill ${activeMode === 'EDGE_RELAYS' ? 'mode-pill--active' : ''}`}
            onClick={() => handleSelectMode('EDGE_RELAYS')}
          >
            <RadioTower size={13} className="mode-pill-icon text-cyan" />
            <div className="mode-pill-text">
              <strong>Edge Relays &amp; Tor</strong>
              <small>Network BGP Attribution</small>
            </div>
          </button>

          <button
            type="button"
            className={`mode-pill ${activeMode === 'BASELINE' ? 'mode-pill--active' : ''}`}
            onClick={() => handleSelectMode('BASELINE')}
          >
            <Activity size={13} className="mode-pill-icon text-green" />
            <div className="mode-pill-text">
              <strong>Baseline Comparison</strong>
              <small>Northstar Exchange Normal</small>
            </div>
          </button>
        </div>
      </section>

      {/* Main Graph Interactive Workspace */}
      <div className={`graph-workspace ${selectedDetails ? 'graph-workspace--with-sidebar' : 'graph-workspace--full'}`}>
        <GraphCanvas
          graph={graph}
          selectedNodeId={selectedNodeId}
          onSelectNode={(id) => setSelectedNodeId(id || undefined)}
          onReset={() => {
            setSelectedNodeId(undefined)
            investigationStore.clearHighlightedPath()
            showToast('Reset graph viewport and selection')
          }}
          floatingHint={
            !selectedDetails ? (
              <div className="graph-floating-hint" role="status">
                <GitBranch size={14} className="graph-hint-icon" />
                <div className="graph-hint-content">
                  <span className="graph-hint-title">SELECT A GRAPH ENTITY</span>
                  <span className="graph-hint-desc">
                    Click any node on the canvas to inspect its blockchain identity, IP routing, and risk dossier.
                  </span>
                </div>
              </div>
            ) : null
          }
        />

        {/* Right Pane: Appears ONLY when an entity is clicked on the graph */}
        {selectedDetails && (
          <GraphDetailsPanel
            details={selectedDetails}
            onClose={() => setSelectedNodeId(undefined)}
          />
        )}
      </div>
    </div>
  )
}
