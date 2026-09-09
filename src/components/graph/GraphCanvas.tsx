import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, GitBranch, Filter } from 'lucide-react'
import type { GraphData, GraphNodeType, ActivityClass } from '../../types/domain'
import { getGraphNodeDetails } from '../../services/mockServices'
import { useInvestigationState, investigationStore } from '../../state/investigationStore'
import { GraphTooltip, type TooltipData } from './GraphTooltip'

// Register fcose extension with Cytoscape
cytoscape.use(fcose)

type GraphCanvasProps = {
  graph: GraphData
  selectedNodeId?: string
  onSelectNode: (nodeId: string) => void
  onReset: () => void
  floatingHint?: React.ReactNode
}

// 2D Curated Layout Coordinates: Clearly separating Suspicious Cluster (Left) from Normal Network (Right)
const defaultNodePositions: Record<string, { x: number; y: number }> = {
  // === SUSPICIOUS INVESTIGATION CLUSTER (Left) ===
  wallet_cluster42_01: { x: 280, y: 260 },
  tx_8f42a91c: { x: 190, y: 190 },
  wallet_08: { x: 110, y: 240 },
  tx_71b9d204: { x: 80, y: 350 },
  wallet_91: { x: 130, y: 460 },

  // Suspicious IP / ASN / Country Network Infrastructure
  ip_185_220_101_42: { x: 230, y: 360 },
  asn_60729: { x: 260, y: 460 },
  country_de: { x: 300, y: 560 },

  ip_91_198_174_22: { x: 100, y: 150 },
  ip_89_248_163_78: { x: 140, y: 80 },
  asn_9009: { x: 60, y: 60 },
  country_nl: { x: 160, y: 20 },

  ip_193_233_132_47: { x: 40, y: 220 },
  ip_45_142_212_88: { x: 150, y: 260 },
  asn_49981: { x: 190, y: 200 },
  country_lu: { x: 240, y: 140 },

  ip_141_98_11_89: { x: 320, y: 260 },
  asn_51852: { x: 360, y: 190 },
  country_ch: { x: 380, y: 110 },

  ip_178_17_174_99: { x: 60, y: 420 },
  ip_194_26_29_114: { x: 180, y: 530 },

  // Multi-hop suspicious branches (Hops 1, 2, 3)
  tx_e1a472c9: { x: 210, y: 330 },
  wallet_33: { x: 160, y: 390 },
  tx_d851b3a0: { x: 80, y: 160 },
  wallet_55: { x: 40, y: 100 },
  tx_f49b1102: { x: 120, y: 470 },
  wallet_74: { x: 90, y: 540 },
  tx_c2890e41: { x: 30, y: 480 },
  wallet_03: { x: 20, y: 560 },
  tx_b7104d55: { x: 140, y: 610 },
  wallet_88: { x: 170, y: 670 },

  // === NORMAL BASELINE NETWORK (Right) ===
  tx_39ac821f: { x: 440, y: 230 },
  wallet_17: { x: 570, y: 220 },
  tx_92de441a: { x: 670, y: 270 },
  wallet_63: { x: 760, y: 230 },
  tx_64bf108e: { x: 840, y: 300 },
  wallet_24: { x: 910, y: 380 },

  // Normal IP / ASN / Country Network Infrastructure
  ip_103_72_18_91: { x: 650, y: 140 },
  asn_14061: { x: 760, y: 80 },
  country_sg: { x: 860, y: 50 },
  country_in: { x: 920, y: 90 },

  ip_34_117_59_81: { x: 820, y: 440 },
  asn_396982: { x: 870, y: 530 },
  country_us: { x: 920, y: 610 },

  ip_52_58_194_33: { x: 640, y: 420 },
  ip_198_54_130_22: { x: 740, y: 510 },

  // Multi-hop normal branches (Hops 1, 2, 3)
  tx_a33f9104: { x: 430, y: 320 },
  wallet_12: { x: 530, y: 350 },
  tx_51cc208e: { x: 640, y: 250 },
  wallet_49: { x: 730, y: 260 },
  tx_49df12bb: { x: 630, y: 390 },
  wallet_77: { x: 720, y: 410 },
  tx_77ea09c1: { x: 820, y: 220 },
  wallet_82: { x: 910, y: 230 },
  tx_18fd60aa: { x: 810, y: 320 },
  wallet_15: { x: 900, y: 330 },
}

export function GraphCanvas({ graph, selectedNodeId, onSelectNode, onReset, floatingHint }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)
  const [typeFilter, setTypeFilter] = useState<GraphNodeType | 'ALL'>('ALL')
  const [riskFilter, setRiskFilter] = useState<ActivityClass | 'ALL'>('ALL')

  const { highlightedPath } = useInvestigationState()
  const onSelectNodeRef = useRef(onSelectNode)
  useEffect(() => {
    onSelectNodeRef.current = onSelectNode
  }, [onSelectNode])

  // Filter nodes & edges
  const filteredElements = useMemo(() => {
    let visibleNodes = graph.nodes
    if (typeFilter === 'WALLET') {
      visibleNodes = visibleNodes.filter((n) => n.type === 'WALLET' || n.type === 'TRANSACTION')
    } else if (typeFilter === 'IP_ADDRESS') {
      visibleNodes = visibleNodes.filter((n) => n.type === 'IP_ADDRESS' || n.type === 'ASN' || n.type === 'COUNTRY')
    }
    if (riskFilter !== 'ALL') {
      visibleNodes = visibleNodes.filter((n) => n.riskSignal === riskFilter || n.type === 'CLUSTER')
    }

    const visibleNodeIds = new Set(visibleNodes.map((n) => n.id))
    const visibleEdges = graph.edges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    )

    return [
      ...visibleNodes.map((node, index) => ({
        group: 'nodes' as const,
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          risk: node.riskSignal || 'NORMAL',
        },
        position: defaultNodePositions[node.id] || {
          x: 500 + (index % 5) * 110 - 220,
          y: 350 + Math.floor(index / 5) * 110 - 220,
        },
      })),
      ...visibleEdges.map((edge) => ({
        group: 'edges' as const,
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          label: edge.label || '',
        },
      })),
    ]
  }, [graph, typeFilter, riskFilter])

  // Initialize and update Cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return

    const cy = cytoscape({
      container: containerRef.current,
      elements: filteredElements,
      boxSelectionEnabled: false,
      autounselectify: false,
      pixelRatio: window.devicePixelRatio || 1,
      style: [
        // BASE NODE STYLE (Nodes + Edges, No Permanent Labels)
        {
          selector: 'node',
          style: {
            'width': (ele: cytoscape.NodeSingular) => {
              const type = ele.data('type')
              if (type === 'CLUSTER') return 34
              if (type === 'ENTITY') return 26
              if (type === 'IP_ADDRESS') return 20
              if (type === 'WALLET') return 22
              if (type === 'ASN') return 22
              if (type === 'COUNTRY') return 24
              return 14 // TRANSACTION
            },
            'height': (ele: cytoscape.NodeSingular) => {
              const type = ele.data('type')
              if (type === 'CLUSTER') return 34
              if (type === 'ENTITY') return 26
              if (type === 'IP_ADDRESS') return 20
              if (type === 'WALLET') return 22
              if (type === 'ASN') return 22
              if (type === 'COUNTRY') return 24
              return 14 // TRANSACTION
            },
            'shape': (ele: cytoscape.NodeSingular) => {
              const type = ele.data('type')
              if (type === 'IP_ADDRESS') return 'diamond'
              if (type === 'ENTITY') return 'hexagon'
              if (type === 'ASN') return 'round-rectangle'
              if (type === 'COUNTRY') return 'round-rectangle'
              return 'ellipse'
            },
            'background-color': (ele: cytoscape.NodeSingular) => {
              const risk = ele.data('risk')
              const type = ele.data('type')
              if (risk === 'HIGH_RISK') return '#EF4444' // Red
              if (risk === 'SUSPICIOUS') return '#F59E0B' // Amber
              if (risk === 'ELEVATED') return '#F97316' // Orange
              if (type === 'CLUSTER') return '#D97706' // Warm Amber
              if (type === 'ENTITY') return '#8B5CF6' // Purple
              if (type === 'IP_ADDRESS') return '#0284C7' // Slate Cyan
              if (type === 'WALLET') return '#10B981' // Green
              if (type === 'ASN') return '#6366F1' // Indigo
              if (type === 'COUNTRY') return '#0EA5E9' // Sky Blue
              return '#64748B' // Slate for regular transactions
            },
            'border-width': 1.5,
            'border-color': '#0B0F19',
            'border-opacity': 0.9,
            'transition-property': 'background-color, border-color, border-width, width, height, opacity',
            'transition-duration': 180,
          },
        },

        // WALLET 42 / CLUSTER 42 HIGHLIGHT (Focal Node)
        {
          selector: 'node[id = "wallet_cluster42_01"], node[id = "cluster_42"]',
          style: {
            'border-width': 3,
            'border-color': '#F59E0B',
            'border-opacity': 0.95,
          },
        },

        // HOVERED NODE (Label appears on hover)
        {
          selector: 'node.hovered',
          style: {
            'border-width': 3,
            'border-color': '#38BDF8',
            'border-opacity': 1,
            'label': 'data(label)',
            'font-family': 'JetBrains Mono, IBM Plex Mono, monospace',
            'font-size': '11px',
            'color': '#F1F5F9',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-background-color': '#111827',
            'text-background-opacity': 0.95,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'text-border-color': '#38BDF8',
            'text-border-width': 1,
            'text-border-opacity': 0.8,
            'z-index': 999,
          },
        },

        // SELECTED NODE (Ring, Accent & Persistent Label on Click)
        {
          selector: 'node.selected',
          style: {
            'border-width': 3.5,
            'border-color': '#38BDF8',
            'border-opacity': 1,
            'label': 'data(label)',
            'font-family': 'JetBrains Mono, IBM Plex Mono, monospace',
            'font-size': '11px',
            'color': '#F1F5F9',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-background-color': '#111827',
            'text-background-opacity': 0.98,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'text-border-color': '#38BDF8',
            'text-border-width': 1.5,
            'text-border-opacity': 0.9,
            'z-index': 1000,
          },
        },

        // HOP 1 NEIGHBORS (Immediate direct connections)
        {
          selector: 'node.hop-1',
          style: {
            'opacity': 1,
            'border-width': 2.5,
            'border-color': '#38BDF8',
            'label': 'data(label)',
            'font-family': 'JetBrains Mono, IBM Plex Mono, monospace',
            'font-size': '10px',
            'color': '#F1F5F9',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-background-color': '#0B0F19',
            'text-background-opacity': 0.95,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'text-border-color': '#38BDF8',
            'text-border-width': 1,
            'text-border-opacity': 0.8,
            'z-index': 900,
          },
        },
        {
          selector: 'edge.hop-1-edge',
          style: {
            'width': 2.5,
            'line-color': '#38BDF8',
            'target-arrow-color': '#38BDF8',
            'opacity': 1,
            'z-index': 95,
          },
        },

        // HOP 2 NEIGHBORS (2 steps away - Intermediary)
        {
          selector: 'node.hop-2',
          style: {
            'opacity': 0.9,
            'border-width': 2,
            'border-color': '#818CF8',
            'label': 'data(label)',
            'font-family': 'JetBrains Mono, IBM Plex Mono, monospace',
            'font-size': '9px',
            'color': '#E2E8F0',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'text-background-color': '#0B0F19',
            'text-background-opacity': 0.88,
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
            'text-border-color': '#818CF8',
            'text-border-width': 1,
            'text-border-opacity': 0.6,
            'z-index': 800,
          },
        },
        {
          selector: 'edge.hop-2-edge',
          style: {
            'width': 1.8,
            'line-color': '#818CF8',
            'target-arrow-color': '#818CF8',
            'opacity': 0.85,
            'z-index': 85,
          },
        },

        // HOP 3 NEIGHBORS (3 steps away - Extended)
        {
          selector: 'node.hop-3',
          style: {
            'opacity': 0.75,
            'border-width': 1.5,
            'border-color': '#94A3B8',
            'label': 'data(label)',
            'font-family': 'JetBrains Mono, IBM Plex Mono, monospace',
            'font-size': '9px',
            'color': '#94A3B8',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'text-background-color': '#0B0F19',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
            'z-index': 700,
          },
        },
        {
          selector: 'edge.hop-3-edge',
          style: {
            'width': 1.3,
            'line-color': '#64748B',
            'target-arrow-color': '#64748B',
            'line-style': 'dashed',
            'opacity': 0.7,
            'z-index': 75,
          },
        },

        // CONNECTED NEIGHBORS (Fallback)
        {
          selector: 'node.neighbor',
          style: {
            'opacity': 1,
            'border-width': 2,
            'border-color': '#0284C7',
          },
        },

        // DIMMED NODES (When a node is selected)
        {
          selector: 'node.dimmed',
          style: {
            'opacity': 0.15,
          },
        },

        // SUSPICIOUS PATH NODES
        {
          selector: 'node.path-node',
          style: {
            'border-width': 3,
            'border-color': '#EF4444',
            'opacity': 1,
          },
        },

        // BASE EDGE STYLE (Curved, Subtle, Directional)
        {
          selector: 'edge',
          style: {
            'width': 1.2,
            'line-color': '#334155',
            'curve-style': 'bezier',
            'opacity': 0.55,
            'target-arrow-shape': (ele: cytoscape.EdgeSingular) => {
              const type = ele.data('type')
              return type === 'TRANSACTION' || type === 'OBSERVED_FROM' || type === 'ROUTED_THROUGH' || type === 'LOCATED_IN' ? 'triangle' : 'none'
            },
            'target-arrow-color': '#64748B',
            'arrow-scale': 0.7,
            'transition-property': 'line-color, width, opacity, target-arrow-color',
            'transition-duration': 180,
          },
        },

        // HIGHLIGHTED EDGES (Connected to Selected/Hovered)
        {
          selector: 'edge.highlighted',
          style: {
            'width': 2.5,
            'line-color': '#38BDF8',
            'target-arrow-color': '#38BDF8',
            'opacity': 1,
            'z-index': 99,
          },
        },

        // SUSPICIOUS PATH EDGES
        {
          selector: 'edge.path-edge',
          style: {
            'width': 3,
            'line-color': '#EF4444',
            'target-arrow-color': '#EF4444',
            'opacity': 1,
            'z-index': 100,
          },
        },

        // DIMMED EDGES
        {
          selector: 'edge.dimmed',
          style: {
            'opacity': 0.07,
          },
        },

        // IP ADDRESS MODE: Display clean legible labels on IP, ASN, and Country nodes
        ...(typeFilter === 'IP_ADDRESS'
          ? [
              {
                selector: 'node',
                style: {
                  'label': 'data(label)',
                  'font-family': 'JetBrains Mono, IBM Plex Mono, monospace',
                  'font-size': '10px',
                  'color': '#F1F5F9',
                  'text-valign': 'bottom' as const,
                  'text-margin-y': 6,
                  'text-background-color': '#0B0F19',
                  'text-background-opacity': 0.9,
                  'text-background-padding': '2.5px',
                  'text-background-shape': 'roundrectangle' as const,
                  'text-border-color': '#334155',
                  'text-border-width': 0.75,
                  'text-border-opacity': 0.8,
                },
              },
            ]
          : []),
      ],
      layout: {
        name: 'preset',
        fit: true,
        padding: 50,
      } as any,
    })

    cyRef.current = cy

    // Event: Node Hover (Tooltip)
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target
      const id = node.id()
      node.addClass('hovered')

      const details = getGraphNodeDetails(id)
      const renderedPos = node.renderedPosition()
      const containerRect = containerRef.current?.getBoundingClientRect()

      if (containerRect) {
        setTooltipData({
          id,
          label: node.data('label') || id,
          type: node.data('type'),
          riskScore: details?.riskScore ?? (node.data('risk') === 'HIGH_RISK' ? 87 : node.data('risk') === 'SUSPICIOUS' ? 64 : 20),
          status: node.data('risk') as ActivityClass,
          detailText:
            details?.relatedTransactions.length
              ? `${details.relatedTransactions.length} Transactions`
              : details?.relatedWallets.length
                ? `${details.relatedWallets.length} Wallets`
                : undefined,
          x: renderedPos.x,
          y: renderedPos.y,
        })
      }
    })

    cy.on('mouseout', 'node', (evt) => {
      evt.target.removeClass('hovered')
      setTooltipData(null)
    })

    // Event: Node Selection
    cy.on('tap', 'node', (evt) => {
      const node = evt.target
      const nodeId = node.id()
      onSelectNodeRef.current(nodeId)
    })

    // Event: Tap Background (Deselect)
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        onSelectNodeRef.current('')
      }
    })

    // Initial fit with frame delay so DOM dimensions are accurate
    const fitTimer = setTimeout(() => {
      if (cyRef.current) {
        cyRef.current.resize()
        cyRef.current.fit(undefined, 50)
      }
    }, 60)

    // ResizeObserver to ensure Cytoscape resizes when workspace expands/contracts
    const resizeObserver = new ResizeObserver(() => {
      if (cyRef.current) {
        cyRef.current.resize()
      }
    })
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      clearTimeout(fitTimer)
      resizeObserver.disconnect()
      cy.destroy()
      cyRef.current = null
    }
  }, [filteredElements]) // Re-run when filtered elements change

  // Update visual selection & dimming whenever selectedNodeId or highlightedPath changes
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    cy.batch(() => {
      // Clear previous states
      cy.elements().removeClass(
        'selected neighbor dimmed highlighted path-node path-edge hop-1 hop-1-edge hop-2 hop-2-edge hop-3 hop-3-edge'
      )

      // 1. Highlight Suspicious Path if active
      if (highlightedPath.length > 0) {
        highlightedPath.forEach((id) => {
          cy.getElementById(id).addClass('path-node')
        })
        for (let i = 0; i < highlightedPath.length - 1; i++) {
          const u = highlightedPath[i]
          const v = highlightedPath[i + 1]
          cy.edges(`[source = "${u}"][target = "${v}"], [source = "${v}"][target = "${u}"]`).addClass('path-edge')
        }
      }

      // 2. Multi-Hop Traversal: Highlight Selected Node and 1-hop, 2-hop, 3-hop neighbors
      if (selectedNodeId) {
        const selectedEle = cy.getElementById(selectedNodeId)
        if (selectedEle.length > 0) {
          selectedEle.addClass('selected')

          // 1-Hop Neighbors (Directly connected)
          const hop1Edges = selectedEle.connectedEdges()
          const hop1Nodes = hop1Edges.connectedNodes().difference(selectedEle)
          hop1Nodes.addClass('hop-1')
          hop1Edges.addClass('hop-1-edge')

          // 2-Hop Neighbors (2 steps away)
          const hop2Edges = hop1Nodes.connectedEdges().difference(hop1Edges)
          const hop2Nodes = hop2Edges.connectedNodes().difference(selectedEle).difference(hop1Nodes)
          hop2Nodes.addClass('hop-2')
          hop2Edges.addClass('hop-2-edge')

          // 3-Hop Neighbors (3 steps away)
          const hop3Edges = hop2Nodes.connectedEdges().difference(hop1Edges).difference(hop2Edges)
          const hop3Nodes = hop3Edges.connectedNodes().difference(selectedEle).difference(hop1Nodes).difference(hop2Nodes)
          hop3Nodes.addClass('hop-3')
          hop3Edges.addClass('hop-3-edge')

          // Active cluster union up to 3 hops
          const activeEles = selectedEle
            .union(hop1Nodes).union(hop1Edges)
            .union(hop2Nodes).union(hop2Edges)
            .union(hop3Nodes).union(hop3Edges)

          // Dim all unreached nodes & edges outside the 3-hop boundary
          cy.elements().not(activeEles).addClass('dimmed')
        }
      }
    })
  }, [selectedNodeId, highlightedPath])

  // Controls
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const cy = cyRef.current
    if (!cy) return
    const current = cy.zoom()
    cy.zoom({
      level: direction === 'in' ? current * 1.25 : current / 1.25,
      renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
    })
  }, [])

  const handleFit = useCallback(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.fit(undefined, 40)
  }, [])

  const handleResetLayout = useCallback(() => {
    const cy = cyRef.current
    if (!cy) return
    const layout = cy.layout({
      name: 'preset',
      positions: (node: cytoscape.NodeSingular) =>
        defaultNodePositions[node.id()] || { x: 500, y: 350 },
      animate: true,
      animationDuration: 500,
      fit: true,
      padding: 50,
    } as any)
    layout.run()
    onReset()
  }, [onReset])

  const handleTogglePath = useCallback(() => {
    if (highlightedPath.length > 0) {
      investigationStore.clearHighlightedPath()
    } else {
      investigationStore.highlightSuspiciousPath()
    }
  }, [highlightedPath])

  return (
    <div className="graph-canvas-shell">
      {/* FLOATING CONTROL TOOLBAR */}
      <div className="graph-floating-controls">
        <div className="graph-controls-group">
          <button
            type="button"
            className="graph-ctrl-btn"
            onClick={() => handleZoom('in')}
            title="Zoom in (+)"
            aria-label="Zoom in"
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            className="graph-ctrl-btn"
            onClick={() => handleZoom('out')}
            title="Zoom out (-)"
            aria-label="Zoom out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            type="button"
            className="graph-ctrl-btn"
            onClick={handleFit}
            title="Fit to view"
            aria-label="Fit to view"
          >
            <Maximize2 size={15} />
          </button>
          <button
            type="button"
            className="graph-ctrl-btn"
            onClick={handleResetLayout}
            title="Reset layout physics"
            aria-label="Reset layout"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            className={`graph-ctrl-btn${highlightedPath.length > 0 ? ' graph-ctrl-btn--active' : ''}`}
            onClick={handleTogglePath}
            title={highlightedPath.length > 0 ? 'Clear Threat Path' : 'Highlight Threat Flow Path'}
            aria-label="Toggle Threat Path"
          >
            <GitBranch size={15} />
          </button>
        </div>

        {/* GRAPH FILTERS */}
        <div className="graph-filters-group">
          <Filter size={13} className="graph-filter-icon" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as GraphNodeType | 'ALL')}
            className="graph-filter-select"
            aria-label="Filter by entity type"
          >
            <option value="ALL">All Entities</option>
            <option value="WALLET">Wallets Only</option>
            <option value="IP_ADDRESS">IP Addresses Only</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as ActivityClass | 'ALL')}
            className="graph-filter-select"
            aria-label="Filter by risk severity"
          >
            <option value="ALL">All Risk</option>
            <option value="HIGH_RISK">High Risk</option>
            <option value="SUSPICIOUS">Suspicious</option>
            <option value="ELEVATED">Elevated</option>
          </select>
        </div>
      </div>

      {/* MULTI-HOP INSPECTION INDICATOR */}
      {selectedNodeId && (
        <div className="graph-hop-indicator">
          <span className="hop-pill hop-pill--1">● 1-Hop Direct</span>
          <span className="hop-pill hop-pill--2">● 2-Hop Intermediary</span>
          <span className="hop-pill hop-pill--3">● 3-Hop Extended</span>
        </div>
      )}

      {/* FLOATING LEGEND */}
      <div className="graph-floating-legend">
        <div className="legend-item"><span className="legend-shape legend-shape--wallet" /> Wallet</div>
        <div className="legend-item"><span className="legend-shape legend-shape--tx" /> Transaction</div>
        <div className="legend-item"><span className="legend-shape legend-shape--ip" /> IP Address</div>
        <div className="legend-item"><span className="legend-shape legend-shape--asn" /> ASN</div>
        <div className="legend-item"><span className="legend-shape legend-shape--country" /> Country</div>
        <span className="legend-divider" />
        <div className="legend-item"><span className="legend-dot legend-dot--critical" /> High Risk</div>
        <div className="legend-item"><span className="legend-dot legend-dot--warning" /> Suspicious</div>
        <div className="legend-item"><span className="legend-dot legend-dot--normal" /> Normal</div>
      </div>

      {/* SIMULATED DEMO DATA BADGE */}
      <div className="graph-demo-badge">
        <span className="demo-dot" />
        SIMULATED INTELLIGENCE / DEMO DATA
      </div>

      {/* FLOATING GUIDANCE HINT */}
      {floatingHint}

      {/* CYTOSCAPE CANVAS */}
      <div ref={containerRef} className="graph-cytoscape-container" />

      {/* HOVER TOOLTIP */}
      <GraphTooltip data={tooltipData} />
    </div>
  )
}
