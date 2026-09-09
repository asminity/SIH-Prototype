import { ShieldAlert, GitBranch, Radio, Layers, Clock, Share2 } from 'lucide-react'

interface ThreatVector {
  id: string
  title: string
  category: 'ON-CHAIN' | 'NETWORK' | 'HYBRID'
  icon: typeof GitBranch
  score: number // 0-100
  level: 'CRITICAL' | 'HIGH' | 'ELEVATED'
  description: string
  evidenceRef: string
}

export function ThreatVectorMatrix() {
  const vectors: ThreatVector[] = [
    {
      id: 'peeling',
      title: 'UTXO Velocity & Cyclic Peeling Chains',
      category: 'ON-CHAIN',
      icon: GitBranch,
      score: 94,
      level: 'CRITICAL',
      description: 'Rapid-fire sequential peel transfers with split change addresses across 27 transaction hops.',
      evidenceRef: '27 hops / 1.450 BTC volume',
    },
    {
      id: 'subgraph',
      title: 'Subgraph GCN Topology Dispersion',
      category: 'ON-CHAIN',
      icon: Layers,
      score: 88,
      level: 'HIGH',
      description: 'Graph Convolutional Network detects high-density bipartite sub-community clustering.',
      evidenceRef: 'GCN embedding distance: 0.12',
    },
    {
      id: 'tor',
      title: 'Tor Exit Relay & Darknet Co-occurrence',
      category: 'NETWORK',
      icon: Radio,
      score: 82,
      level: 'ELEVATED',
      description: 'Monitored broadcast IPs coincide with active Tor consensus relays in Amsterdam and Frankfurt.',
      evidenceRef: '6 relay matches across 14 wallets',
    },
    {
      id: 'entity',
      title: 'Multi-Wallet Entity Taint Propagation',
      category: 'HYBRID',
      icon: Share2,
      score: 91,
      level: 'CRITICAL',
      description: 'Deterministic wallet clustering algorithms link 14 active wallets to a unified control entity.',
      evidenceRef: 'Common-input ownership confirmed',
    },
    {
      id: 'temporal',
      title: 'Temporal Window Burst Co-incidence',
      category: 'HYBRID',
      icon: Clock,
      score: 86,
      level: 'HIGH',
      description: 'Sub-second transaction broadcast latency perfectly correlates with network peer connection bursts.',
      evidenceRef: 'Window latency: 340ms delta',
    },
    {
      id: 'bgp',
      title: 'BGP Autonomous System Routing Jitter',
      category: 'NETWORK',
      icon: ShieldAlert,
      score: 74,
      level: 'ELEVATED',
      description: 'Multiple AS hops across jurisdiction borders during transaction broadcasting period.',
      evidenceRef: 'AS60068 / AS49981 path divergence',
    },
  ]

  const getLevelBadgeClass = (lvl: string) => {
    switch (lvl) {
      case 'CRITICAL':
        return 'vector-badge--critical'
      case 'HIGH':
        return 'vector-badge--high'
      default:
        return 'vector-badge--elevated'
    }
  }

  const getBarColor = (score: number) => {
    if (score >= 90) return 'linear-gradient(90deg, #F59E0B, #EF4444)'
    if (score >= 80) return 'linear-gradient(90deg, #38BDF8, #F59E0B)'
    return 'linear-gradient(90deg, #10B981, #38BDF8)'
  }

  return (
    <div className="threat-vector-matrix">
      <div className="vector-matrix-header">
        <div className="vector-matrix-title">
          <Layers size={17} className="text-cyan" />
          <span>MULTI-DIMENSIONAL FORENSIC THREAT VECTORS</span>
        </div>
        <span className="vector-matrix-subtitle">
          Deconstructed anomaly vectors evaluated across on-chain graph topology and network routing behavior
        </span>
      </div>

      <div className="vector-grid">
        {vectors.map((vec) => {
          const IconComponent = vec.icon
          return (
            <div className="vector-card" key={vec.id}>
              <div className="vector-card__top">
                <div className="vector-card__icon-wrap">
                  <IconComponent size={15} />
                </div>
                <span className="vector-card__category">{vec.category}</span>
                <span className={`vector-badge ${getLevelBadgeClass(vec.level)}`}>{vec.level}</span>
                <strong className="vector-card__score">{vec.score}%</strong>
              </div>

              <div className="vector-card__name">{vec.title}</div>

              <div className="vector-card__bar-wrap">
                <div
                  className="vector-card__bar-fill"
                  style={{
                    width: `${vec.score}%`,
                    background: getBarColor(vec.score),
                  }}
                />
              </div>

              <p className="vector-card__desc">{vec.description}</p>

              <div className="vector-card__foot">
                <span>EVIDENCE:</span>
                <code>{vec.evidenceRef}</code>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
