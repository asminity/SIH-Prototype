import { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'
import type { GraphData } from '../../types/domain'
import { useInvestigationState, investigationStore } from '../../state/investigationStore'
import { ZoomIn, ZoomOut, RotateCcw, GitBranch } from 'lucide-react'

cytoscape.use(fcose)

type GraphCanvasNewProps = {
  graph: GraphData
  width?: number
  height?: number
}

export function GraphCanvasNew({ graph, width: _width = 1600, height: _height = 900 }: GraphCanvasNewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const { highlightedNodes, highlightedPath } = useInvestigationState()

  useEffect(() => {
    if (!containerRef.current) return

    // Transform mock data into Cytoscape format
    const elements = [
      ...graph.nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          risk: node.riskSignal,
        },
      })),
      ...graph.edges.map((edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
        },
      })),
    ]

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            width: (ele: any) => {
              const type = ele.data('type')
              const isSel = ele.id() === selectedNode || ele.id() === hoveredNode
              const base = type === 'CLUSTER' ? 36 : type === 'ENTITY' ? 30 : type === 'IP_ADDRESS' ? 24 : type === 'WALLET' ? 20 : 16
              return isSel ? base + 8 : base
            },
            height: (ele: any) => {
              const type = ele.data('type')
              const isSel = ele.id() === selectedNode || ele.id() === hoveredNode
              const base = type === 'CLUSTER' ? 36 : type === 'ENTITY' ? 30 : type === 'IP_ADDRESS' ? 24 : type === 'WALLET' ? 20 : 16
              return isSel ? base + 8 : base
            },
            'background-color': (ele: any) => {
              const risk = ele.data('risk')
              const type = ele.data('type')
              if (risk === 'HIGH_RISK') return '#e97171'
              if (risk === 'SUSPICIOUS') return '#f4a460'
              if (risk === 'ELEVATED') return '#d9a844'
              if (type === 'CLUSTER') return '#4dd0d9'
              if (type === 'ENTITY') return '#d9a844'
              if (type === 'IP_ADDRESS') return '#4dd0d9'
              if (type === 'WALLET') return '#6dd989'
              return '#78909c'
            },
            'border-width': (ele: any) => {
              const id = ele.id()
              if (id === selectedNode || id === hoveredNode) return 3
              if (highlightedPath.includes(id) || highlightedNodes.includes(id)) return 2
              return 1
            },
            'border-color': (ele: any) => {
              const id = ele.id()
              if (id === selectedNode) return '#ffffff'
              if (id === hoveredNode) return '#4dd0d9'
              if (highlightedPath.includes(id)) return '#e97171'
              if (highlightedNodes.includes(id)) return '#4dd0d9'
              return '#10222e'
            },
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'font-family': 'IBM Plex Mono, monospace',
            'font-size': 10,
            'font-weight': 600,
            'color': '#dce5ed',
            'text-background-color': '#071217',
            'text-background-opacity': 0.85,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            label: (ele: any) => {
              const id = ele.id()
              const isHovered = id === hoveredNode
              const isSel = id === selectedNode
              const isPath = highlightedPath.includes(id)
              const isCore = ele.data('type') === 'CLUSTER' || ele.data('type') === 'ENTITY'
              if (isHovered || isSel || isPath || isCore) {
                return ele.data('label') || id
              }
              return ''
            },
            opacity: (ele: any) => {
              const id = ele.id()
              if (highlightedPath.length > 0) {
                return highlightedPath.includes(id) ? 1 : 0.2
              }
              if (selectedNode) {
                if (id === selectedNode || highlightedNodes.includes(id)) return 1
                return 0.15
              }
              return 0.95
            },
          },
        },
        {
          selector: 'edge',
          style: {
            'line-color': (ele: any) => {
              const src = ele.source().id()
              const tgt = ele.target().id()
              if (highlightedPath.length > 0 && highlightedPath.includes(src) && highlightedPath.includes(tgt)) {
                return '#e97171'
              }
              if (highlightedNodes.includes(src) || highlightedNodes.includes(tgt)) {
                return '#4dd0d9'
              }
              return '#183242'
            },
            'width': (ele: any) => {
              const src = ele.source().id()
              const tgt = ele.target().id()
              if (highlightedPath.length > 0 && highlightedPath.includes(src) && highlightedPath.includes(tgt)) {
                return 3.5
              }
              if (highlightedNodes.includes(src) || highlightedNodes.includes(tgt)) {
                return 2.5
              }
              return 1.2
            },
            'opacity': (ele: any) => {
              const src = ele.source().id()
              const tgt = ele.target().id()
              if (highlightedPath.length > 0) {
                return highlightedPath.includes(src) && highlightedPath.includes(tgt) ? 1 : 0.1
              }
              if (selectedNode) {
                return src === selectedNode || tgt === selectedNode || (highlightedNodes.includes(src) && highlightedNodes.includes(tgt)) ? 1 : 0.12
              }
              return 0.4
            },
            'target-arrow-color': (ele: any) => {
              const src = ele.source().id()
              const tgt = ele.target().id()
              if (highlightedPath.length > 0 && highlightedPath.includes(src) && highlightedPath.includes(tgt)) {
                return '#e97171'
              }
              return highlightedNodes.includes(src) ? '#4dd0d9' : '#183242'
            },
            'target-arrow-shape': (ele: any) => {
              const type = ele.data('type')
              return type === 'TRANSACTION' || type === 'OBSERVED_FROM' ? 'triangle' : 'none'
            },
            'curve-style': 'bezier',
          },
        },
      ],
      layout: {
        name: 'fcose',
        animate: false,
        nodeSeparation: 40,
        edgeElasticity: 100,
        nestingFactor: 1.2,
        gravityRange: 240,
        gravity: 0.25,
        friction: 0.95,
        randomize: false,
        componentSpacing: 100,
        tile: true,
      } as any,
      pixelRatio: window.devicePixelRatio,
    })

    cyRef.current = cy

    // Fit to screen
    cy.fit()
    cy.zoom(0.9)

    // Event handlers
    cy.on('mouseover', 'node', (evt) => {
      setHoveredNode(evt.target.id())
    })

    cy.on('mouseout', 'node', () => {
      setHoveredNode(null)
    })

    cy.on('tap', 'node', (evt) => {
      const nodeId = evt.target.id()
      setSelectedNode(nodeId)
      investigationStore.selectNode(nodeId)
      investigationStore.setInvestigationPanelOpen(true)
    })

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null)
        investigationStore.selectNode(null)
      }
    })

    return () => {
      cy.destroy()
    }
  }, [graph, highlightedNodes, highlightedPath, selectedNode, hoveredNode])

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cyRef.current) return
    const cy = cyRef.current
    const zoom = cy.zoom()
    cy.zoom(direction === 'in' ? zoom * 1.2 : zoom / 1.2)
  }

  const handleFit = () => {
    if (!cyRef.current) return
    cyRef.current.fit()
    cyRef.current.zoom(0.9)
  }

  const handleTogglePath = () => {
    if (highlightedPath.length > 0) {
      investigationStore.clearHighlightedPath()
    } else {
      investigationStore.highlightSuspiciousPath()
    }
  }

  return (
    <div className="graph-canvas-new-shell">
      <div className="graph-controls">
        <button onClick={() => handleZoom('in')} title="Zoom in" className="graph-ctrl-btn">
          <ZoomIn size={16} />
        </button>
        <button onClick={() => handleZoom('out')} title="Zoom out" className="graph-ctrl-btn">
          <ZoomOut size={16} />
        </button>
        <button onClick={handleFit} title="Fit to screen" className="graph-ctrl-btn">
          <RotateCcw size={16} />
        </button>
        <button
          onClick={handleTogglePath}
          title={highlightedPath.length > 0 ? "Clear Path" : "Highlight Suspicious Path"}
          className={`graph-ctrl-btn${highlightedPath.length > 0 ? ' graph-ctrl-btn--active' : ''}`}
        >
          <GitBranch size={16} />
        </button>
      </div>

      <div className="graph-canvas-legend-strip">
        <span className="legend-item"><i className="legend-dot legend-dot--cluster" /> Cluster</span>
        <span className="legend-item"><i className="legend-dot legend-dot--entity" /> Entity</span>
        <span className="legend-item"><i className="legend-dot legend-dot--ip" /> IP</span>
        <span className="legend-item"><i className="legend-dot legend-dot--wallet" /> Wallet</span>
        <span className="legend-item"><i className="legend-dot legend-dot--tx" /> Transaction</span>
        <span className="legend-item"><i className="legend-dot legend-dot--risk" /> High Risk</span>
      </div>

      <div ref={containerRef} className="graph-canvas-new" />
    </div>
  )
}
