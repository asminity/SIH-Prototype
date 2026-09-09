import { useState, useMemo, useEffect } from 'react'
import {
  Activity,
  Globe2,
  RadioTower,
  Search,
  Download,
  RefreshCw,
  Play,
  Pause,
  Copy,
  Check,
  ShieldAlert,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  GitBranch,
  MapPin,
  Server,
  CheckCircle2,
  X,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  getIpAddresses,
  getNetworkObservations,
  getTransactions,
  getWallets,
} from '../services/mockServices'
import type { ActivityClass, NetworkObservation, IpAddress } from '../types/domain'
import { MetricCard } from '../components/ui/MetricCard'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import { investigationStore } from '../state/investigationStore'

const pageSize = 10

const formatTime = (timestamp: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(timestamp))

export function NetworkActivityPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedIpParam = searchParams.get('ip')
  const [search, setSearch] = useState('')
  const [protocolFilter, setProtocolFilter] = useState<string>('ALL')
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'INBOUND' | 'OUTBOUND'>('ALL')
  const [riskFilter, setRiskFilter] = useState<'ALL' | ActivityClass>('ALL')
  const [countryFilter, setCountryFilter] = useState<string>('ALL')
  const [page, setPage] = useState(1)
  const [isLiveStreaming, setIsLiveStreaming] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [inspectedObs, setInspectedObs] = useState<NetworkObservation | null>(null)

  const showToast = (msg: string) => setToastMessage(msg)

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const observations = useMemo(() => getNetworkObservations(), [])
  const ips = useMemo(() => getIpAddresses(), [])
  const transactions = useMemo(() => getTransactions(), [])
  const wallets = useMemo(() => getWallets(), [])

  const ipMap = useMemo(() => {
    const map = new Map<string, IpAddress>()
    ips.forEach((ip) => map.set(ip.id, ip))
    return map
  }, [ips])

  // Aggregate country statistics
  const countryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    observations.forEach((obs) => {
      const ip = ipMap.get(obs.ipAddressId)
      if (ip?.country) {
        counts.set(ip.country, (counts.get(ip.country) ?? 0) + 1)
      }
    })
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [observations, ipMap])

  // Filter observations
  const filteredObservations = useMemo(() => {
    const query = search.trim().toLowerCase()

    return observations.filter((obs) => {
      const ip = ipMap.get(obs.ipAddressId)
      if (selectedIpParam && obs.ipAddressId !== selectedIpParam) return false
      if (countryFilter !== 'ALL' && ip?.country !== countryFilter) return false
      if (protocolFilter !== 'ALL' && obs.protocol !== protocolFilter) return false
      if (directionFilter !== 'ALL' && obs.direction !== directionFilter) return false
      if (riskFilter !== 'ALL' && ip?.riskSignal !== riskFilter) return false

      if (query) {
        const matchesQuery = [
          obs.id,
          obs.protocol,
          obs.note,
          obs.transactionId,
          obs.walletId,
          ip?.address,
          ip?.asn,
          ip?.provider,
          ip?.country,
        ]
          .filter(Boolean)
          .some((val) => val!.toLowerCase().includes(query))

        if (!matchesQuery) return false
      }

      return true
    })
  }, [observations, ipMap, selectedIpParam, countryFilter, protocolFilter, directionFilter, riskFilter, search])

  // Summary telemetry stats
  const totalObs = observations.length
  const uniqueIps = useMemo(() => new Set(observations.map((o) => o.ipAddressId)).size, [observations])
  const torRelays = useMemo(
    () =>
      observations.filter(
        (o) => o.protocol === 'TOR_EXIT' || ipMap.get(o.ipAddressId)?.riskSignal === 'HIGH_RISK'
      ).length,
    [observations, ipMap]
  )
  const uniqueAsns = useMemo(
    () => new Set(ips.map((ip) => ip.asn)).size,
    [ips]
  )
  const meanConfidence = useMemo(() => {
    if (!observations.length) return 0
    const sum = observations.reduce((acc, o) => acc + o.confidence, 0)
    return Math.round((sum / observations.length) * 1000) / 10
  }, [observations])

  const totalPages = Math.max(1, Math.ceil(filteredObservations.length / pageSize))
  const visibleObservations = filteredObservations.slice((page - 1) * pageSize, page * pageSize)

  const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    showToast(`Copied ${label} to clipboard`)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const handleInspect = (obs: NetworkObservation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setInspectedObs(obs)
  }

  const handleTraceInGraph = (ipId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    investigationStore.selectNode(`node_${ipId}`)
    showToast(`Selected node ${ipId} in entity graph`)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      showToast('Network telemetry buffer refreshed from edge relays')
    }, 600)
  }

  const handleExportCsv = () => {
    const headers = [
      'Observation_ID',
      'Timestamp_UTC',
      'IP_Address',
      'Country',
      'ASN',
      'Provider',
      'Protocol',
      'Direction',
      'Confidence',
      'Linked_Tx',
      'Linked_Wallet',
      'Note',
    ]

    const rows = filteredObservations.map((obs) => {
      const ip = ipMap.get(obs.ipAddressId)
      return [
        obs.id,
        obs.timestamp,
        ip?.address ?? '',
        ip?.country ?? '',
        ip?.asn ?? '',
        ip?.provider ?? '',
        obs.protocol,
        obs.direction,
        (obs.confidence * 100).toFixed(1) + '%',
        obs.transactionId ?? '',
        obs.walletId ?? '',
        obs.note,
      ]
    })

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `network-telemetry-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast(`Exported ${filteredObservations.length} telemetry logs to CSV`)
  }

  const resetAllFilters = () => {
    setSearch('')
    setProtocolFilter('ALL')
    setDirectionFilter('ALL')
    setRiskFilter('ALL')
    setCountryFilter('ALL')
    setSearchParams({})
    setPage(1)
    showToast('Network filters reset to default')
  }

  const selectedAddress = selectedIpParam ? ipMap.get(selectedIpParam) : null
  const inspectedIp = inspectedObs ? ipMap.get(inspectedObs.ipAddressId) : null
  const inspectedTx = inspectedObs?.transactionId
    ? transactions.find((t) => t.id === inspectedObs.transactionId)
    : null
  const inspectedWallet = inspectedObs?.walletId
    ? wallets.find((w) => w.id === inspectedObs.walletId)
    : null

  return (
    <div className="network-activity-page">
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

      {/* Page Header with Real-time Stream Control */}
      <PageHeader
        eyebrow="SIGNAL INTELLIGENCE / NETWORK OPERATIONS"
        title="Network Telemetry & Edge Relays"
        description="Trace observed P2P propagation, Tor exit relays, and autonomous system correlation across the demonstration cluster."
        actions={
          <div className="flex-actions">
            <button
              type="button"
              className={`button ${isLiveStreaming ? 'button--live' : 'button--secondary'}`}
              onClick={() => {
                setIsLiveStreaming(!isLiveStreaming)
                showToast(isLiveStreaming ? 'Live packet stream paused' : 'Live packet stream resumed')
              }}
              title="Toggle continuous edge telemetry ingestion"
            >
              {isLiveStreaming ? (
                <>
                  <span className="live-dot live-dot--pulsing" />
                  <Pause size={13} />
                  <span>PAUSE STREAM</span>
                </>
              ) : (
                <>
                  <Play size={13} />
                  <span>RESUME STREAM</span>
                </>
              )}
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={handleRefresh}
              title="Poll edge relays for new observations"
            >
              <RefreshCw size={13} className={isRefreshing ? 'spin-animation' : ''} />
              <span>SYNC</span>
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={handleExportCsv}
              title="Download telemetry records as CSV"
            >
              <Download size={13} />
              <span>EXPORT CSV</span>
            </button>
            <StatusBadge label="HIGH SENSITIVITY" tone="neutral" />
          </div>
        }
      />

      {/* Active Filter Focus Banner if IP selected */}
      {selectedAddress ? (
        <div className="network-focus-banner">
          <div className="network-focus-info">
            <MapPin size={16} className="text-cyan" />
            <div>
              <span className="network-focus-tag">FOCUS IP NODE</span>
              <strong>{selectedAddress.address}</strong>
              <small>
                {selectedAddress.provider} · {selectedAddress.country} · {selectedAddress.asn} ·{' '}
                {selectedAddress.observationCount} observations recorded
              </small>
            </div>
          </div>
          <button
            type="button"
            className="button button--secondary button--small"
            onClick={() => setSearchParams({})}
          >
            <X size={12} />
            <span>Clear Focus IP</span>
          </button>
        </div>
      ) : null}

      {/* Network Telemetry KPI Strip */}
      <div className="network-metrics-strip">
        <MetricCard
          icon={<RadioTower size={17} />}
          label="OBSERVATIONS"
          value={totalObs.toString()}
          detail="Packets captured in window"
          tone="default"
        />
        <MetricCard
          icon={<Globe2 size={17} />}
          label="ACTIVE IP NODES"
          value={uniqueIps.toString()}
          detail="Distinct source addresses"
          tone="cyan"
        />
        <MetricCard
          icon={<ShieldAlert size={17} />}
          label="TOR / ANOMALY RELAYS"
          value={torRelays.toString()}
          detail="High risk / exit nodes"
          tone={torRelays > 0 ? 'red' : 'default'}
        />
        <MetricCard
          icon={<Server size={17} />}
          label="AUTONOMOUS SYSTEMS"
          value={uniqueAsns.toString()}
          detail="BGP routing origins"
          tone="default"
        />
        <MetricCard
          icon={<Activity size={17} />}
          label="CORRELATION CONF."
          value={`${meanConfidence}%`}
          detail="Mean correlation accuracy"
          tone="green"
        />
      </div>

      {/* Geolocation Quick-Filter Strip */}
      <div className="network-geo-strip">
        <div className="network-geo-label">
          <MapPin size={13} />
          <span>ORIGIN GEO:</span>
        </div>
        <div className="network-geo-pills">
          <button
            type="button"
            className={`geo-pill ${countryFilter === 'ALL' ? 'geo-pill--active' : ''}`}
            onClick={() => {
              setCountryFilter('ALL')
              setPage(1)
            }}
          >
            <span>All Regions</span>
            <span className="geo-pill__count">{observations.length}</span>
          </button>
          {countryCounts.map(([country, count]) => {
            const isActive = countryFilter === country
            return (
              <button
                key={country}
                type="button"
                className={`geo-pill ${isActive ? 'geo-pill--active' : ''}`}
                onClick={() => {
                  setCountryFilter(isActive ? 'ALL' : country)
                  setPage(1)
                  showToast(isActive ? 'Showing all regions' : `Filtered to ${country} origins`)
                }}
              >
                <span>{country}</span>
                <span className="geo-pill__count">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Comprehensive Filtering Toolbar */}
      <section className="network-filter-toolbar" aria-label="Network activity filters">
        <div className="network-search-box">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search IP, ASN, provider, transaction, protocol, or note..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          {search ? (
            <button
              type="button"
              className="command-bar__clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          ) : null}
        </div>

        <div className="network-filter-group">
          <label>
            PROTOCOL
            <select
              value={protocolFilter}
              onChange={(e) => {
                setProtocolFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="ALL">ALL PROTOCOLS</option>
              <option value="BITCOIN_P2P">BITCOIN P2P (8333)</option>
              <option value="TOR_EXIT">TOR EXIT NODE</option>
              <option value="RPC">BITCOIND RPC (8332)</option>
              <option value="EXCHANGE_API">EXCHANGE API</option>
            </select>
          </label>

          <label>
            DIRECTION
            <select
              value={directionFilter}
              onChange={(e) => {
                setDirectionFilter(e.target.value as 'ALL' | 'INBOUND' | 'OUTBOUND')
                setPage(1)
              }}
            >
              <option value="ALL">ALL DIRECTIONS</option>
              <option value="INBOUND">INBOUND (INGRESS)</option>
              <option value="OUTBOUND">OUTBOUND (EGRESS)</option>
            </select>
          </label>

          <label>
            RISK SIGNAL
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value as 'ALL' | ActivityClass)
                setPage(1)
              }}
            >
              <option value="ALL">ALL SIGNALS</option>
              <option value="HIGH_RISK">HIGH RISK</option>
              <option value="SUSPICIOUS">SUSPICIOUS</option>
              <option value="ELEVATED">ELEVATED</option>
              <option value="NORMAL">NORMAL</option>
            </select>
          </label>
        </div>

        {(search ||
          protocolFilter !== 'ALL' ||
          directionFilter !== 'ALL' ||
          riskFilter !== 'ALL' ||
          countryFilter !== 'ALL' ||
          selectedIpParam) && (
          <button
            type="button"
            className="command-bar__reset-btn"
            onClick={resetAllFilters}
            style={{ marginLeft: 'auto' }}
          >
            <RefreshCw size={12} />
            <span>Reset</span>
          </button>
        )}
      </section>

      {/* Main Observations Table */}
      <SectionCard
        eyebrow="OBSERVED TELEMETRY"
        title={`Network Packet Observations (${filteredObservations.length.toLocaleString('en-US')})`}
        className="network-table-card"
      >
        <div className="network-table-wrap">
          <table className="network-table">
            <thead>
              <tr>
                <th>OBSERVATION ID</th>
                <th>SOURCE IP & ASN</th>
                <th>PROTOCOL</th>
                <th>DIRECTION</th>
                <th>LINKED TXID</th>
                <th>LINKED WALLET</th>
                <th>CONFIDENCE</th>
                <th>TIMESTAMP (UTC)</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {visibleObservations.map((observation) => {
                const ip = ipMap.get(observation.ipAddressId)
                const isCopied = copiedText === ip?.address
                const isSelected = inspectedObs?.id === observation.id
                const confidencePct = Math.round(observation.confidence * 100)

                return (
                  <tr
                    key={observation.id}
                    className={`network-row ${isSelected ? 'network-row--selected' : ''}`}
                    onClick={() => handleInspect(observation)}
                  >
                    <td>
                      <span className="mono-cell text-cyan font-bold">
                        {observation.id.replace('net_', 'NET-')}
                      </span>
                    </td>
                    <td>
                      <div className="network-ip-cell">
                        <div className="network-ip-header">
                          <span className="mono-cell">{ip?.address ?? 'Unavailable'}</span>
                          {ip?.address && (
                            <button
                              type="button"
                              className="tx-copy-btn"
                              onClick={(e) => handleCopy(ip.address, 'IP address', e)}
                              title={isCopied ? 'Copied IP' : 'Copy IP address'}
                              aria-label="Copy IP"
                            >
                              {isCopied ? <Check size={11} className="text-green" /> : <Copy size={11} />}
                            </button>
                          )}
                        </div>
                        <small className="network-ip-asn">
                          {ip?.country} · {ip?.asn} ({ip?.provider})
                        </small>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`protocol-badge protocol-badge--${observation.protocol.toLowerCase()}`}
                      >
                        {observation.protocol.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`direction-badge direction-badge--${observation.direction.toLowerCase()}`}
                      >
                        {observation.direction === 'INBOUND' ? (
                          <ArrowDownRight size={12} />
                        ) : (
                          <ArrowUpRight size={12} />
                        )}
                        <span>{observation.direction}</span>
                      </span>
                    </td>
                    <td>
                      {observation.transactionId ? (
                        <Link
                          to={`/transactions?tx=${observation.transactionId}`}
                          className="network-link network-link--tx"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>{observation.transactionId.replace('tx_', 'TX-')}</span>
                        </Link>
                      ) : (
                        <span className="text-muted text-xs">Unlinked</span>
                      )}
                    </td>
                    <td>
                      {observation.walletId ? (
                        <Link
                          to={`/entity-explorer?wallet=${observation.walletId}`}
                          className="network-link network-link--wallet"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>{observation.walletId.replace('wallet_', 'WAL-')}</span>
                        </Link>
                      ) : (
                        <span className="text-muted text-xs">Unlinked</span>
                      )}
                    </td>
                    <td>
                      <div className="confidence-cell">
                        <span className="mono-cell text-xs">{confidencePct}%</span>
                        <div className="confidence-meter">
                          <div
                            className="confidence-meter__fill"
                            style={{
                              width: `${confidencePct}%`,
                              backgroundColor:
                                confidencePct > 90
                                  ? 'var(--cyan)'
                                  : confidencePct > 75
                                  ? 'var(--green)'
                                  : 'var(--amber)',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="mono-cell text-muted text-xs">{formatTime(observation.timestamp)}</td>
                    <td>
                      <div className="network-actions-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="tx-action-btn"
                          onClick={(e) => handleInspect(observation, e)}
                          title="Inspect Telemetry Details"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                        {ip && (
                          <Link
                            to={`/entity-graph?cluster=cluster_42`}
                            className="tx-action-btn tx-action-btn--icon"
                            onClick={(e) => handleTraceInGraph(ip.id, e)}
                            title="Trace IP in Entity Graph"
                          >
                            <GitBranch size={12} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {visibleObservations.length === 0 ? (
            <div className="network-empty" style={{ padding: '36px', textAlign: 'center' }}>
              <Activity size={18} />
              <p>No network observations match the active filter criteria.</p>
            </div>
          ) : null}
        </div>

        {/* Table Pagination Footer */}
        <div className="transaction-table-footer">
          <span>
            Showing {visibleObservations.length ? (page - 1) * pageSize + 1 : 0}-
            {Math.min(page * pageSize, filteredObservations.length)} of {filteredObservations.length} observations
          </span>
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              type="button"
              aria-label="Previous page"
            >
              <span>PREV</span>
            </button>
            <span>
              PAGE {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              type="button"
              aria-label="Next page"
            >
              <span>NEXT</span>
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Slide-out Telemetry Inspection Drawer */}
      {inspectedObs && inspectedIp && (
        <>
          <div className="investigation-drawer-backdrop" onClick={() => setInspectedObs(null)} />
          <aside className="investigation-drawer" aria-label="Network observation telemetry detail">
            <div className="investigation-drawer__header">
              <div className="investigation-drawer__identity">
                <span className="investigation-drawer__tag">EDGE TELEMETRY INSPECTOR</span>
                <h2 className="investigation-drawer__title">
                  {inspectedObs.id.replace('net_', 'NET-')}
                </h2>
                <div className="investigation-drawer__hash-row">
                  <span className="mono-cell text-cyan font-bold">{inspectedIp.address}</span>
                  <button
                    type="button"
                    className="tx-copy-btn"
                    onClick={(e) => handleCopy(inspectedIp.address, 'IP address', e)}
                    title="Copy IP"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="icon-button icon-button--close"
                onClick={() => setInspectedObs(null)}
                aria-label="Close telemetry drawer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="investigation-drawer__risk-banner">
              <div className="risk-score-display">
                <div
                  className={`risk-score-badge ${
                    inspectedIp.riskSignal === 'HIGH_RISK'
                      ? 'risk-score-badge--high'
                      : 'risk-score-badge--normal'
                  }`}
                >
                  <ShieldAlert size={15} />
                  <span>{inspectedIp.riskSignal.replace('_', ' ')} SIGNAL</span>
                </div>
                <div className="risk-score-value">
                  <span className="risk-score-number">{Math.round(inspectedObs.confidence * 100)}</span>
                  <span className="risk-score-max">/ 100 CONFIDENCE</span>
                </div>
              </div>
            </div>

            {/* IP Node Intelligence */}
            <div className="investigation-drawer__section">
              <h3 className="investigation-drawer__section-title">IP NODE & ROUTING PROFILE</h3>
              <dl className="property-list">
                <div className="property-row">
                  <dt>IP Address</dt>
                  <dd className="mono-cell text-cyan">{inspectedIp.address}</dd>
                </div>
                <div className="property-row">
                  <dt>Country / Region</dt>
                  <dd>
                    {inspectedIp.country} <span className="text-muted">(Observed Geolocation)</span>
                  </dd>
                </div>
                <div className="property-row">
                  <dt>Autonomous System</dt>
                  <dd className="mono-cell font-bold">{inspectedIp.asn}</dd>
                </div>
                <div className="property-row">
                  <dt>ISP / Provider</dt>
                  <dd>{inspectedIp.provider}</dd>
                </div>
                <div className="property-row">
                  <dt>Observation Count</dt>
                  <dd className="mono-cell">{inspectedIp.observationCount} occurrences</dd>
                </div>
                <div className="property-row">
                  <dt>First Observed</dt>
                  <dd className="mono-cell text-muted">{formatTime(inspectedIp.firstObserved)}</dd>
                </div>
                <div className="property-row">
                  <dt>Last Observed</dt>
                  <dd className="mono-cell text-muted">{formatTime(inspectedIp.lastObserved)}</dd>
                </div>
              </dl>
            </div>

            {/* Packet Observation Signature */}
            <div className="investigation-drawer__section">
              <h3 className="investigation-drawer__section-title">PACKET TELEMETRY & SIGNATURE</h3>
              <dl className="property-list">
                <div className="property-row">
                  <dt>Protocol</dt>
                  <dd>
                    <span
                      className={`protocol-badge protocol-badge--${inspectedObs.protocol.toLowerCase()}`}
                    >
                      {inspectedObs.protocol.replace('_', ' ')}
                    </span>
                  </dd>
                </div>
                <div className="property-row">
                  <dt>Direction</dt>
                  <dd>
                    <span
                      className={`direction-badge direction-badge--${inspectedObs.direction.toLowerCase()}`}
                    >
                      {inspectedObs.direction}
                    </span>
                  </dd>
                </div>
                <div className="property-row">
                  <dt>Packet Timestamp</dt>
                  <dd className="mono-cell">{formatTime(inspectedObs.timestamp)}</dd>
                </div>
                <div className="property-row">
                  <dt>Heuristic Note</dt>
                  <dd className="text-muted">{inspectedObs.note}</dd>
                </div>
              </dl>
            </div>

            {/* Linked Blockchain Identifiers */}
            <div className="investigation-drawer__section">
              <h3 className="investigation-drawer__section-title">ASSOCIATED BLOCKCHAIN EVIDENCE</h3>
              {inspectedTx ? (
                <div className="drawer-evidence-card">
                  <div className="drawer-evidence-title">
                    <span>TRANSACTION HASH</span>
                    <Link to={`/transactions?tx=${inspectedTx.id}`} className="mono-cell text-cyan">
                      {inspectedTx.hash.slice(0, 16)}...
                    </Link>
                  </div>
                  <div className="drawer-evidence-meta">
                    <span>{inspectedTx.amountBtc.toFixed(2)} BTC</span>
                    <span>{inspectedTx.riskLevel} Risk</span>
                    <span>{inspectedTx.status}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted text-xs">No direct single-tx link recorded on this packet.</p>
              )}

              {inspectedWallet ? (
                <div className="drawer-evidence-card" style={{ marginTop: '8px' }}>
                  <div className="drawer-evidence-title">
                    <span>OBSERVED WALLET</span>
                    <Link
                      to={`/entity-explorer?wallet=${inspectedWallet.id}`}
                      className="mono-cell text-cyan"
                    >
                      {inspectedWallet.address.slice(0, 14)}...
                    </Link>
                  </div>
                  <div className="drawer-evidence-meta">
                    <span>{inspectedWallet.totalVolumeBtc.toFixed(2)} BTC Vol</span>
                    <span>{inspectedWallet.transactionCount} TXs</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Drawer Actions */}
            <div className="investigation-drawer__actions">
              <button
                type="button"
                className="button button--primary"
                onClick={(e) => {
                  handleTraceInGraph(inspectedIp.id, e)
                  setInspectedObs(null)
                }}
              >
                <GitBranch size={14} />
                <span>Investigate in Graph</span>
              </button>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => {
                  setSearchParams({ ip: inspectedIp.id })
                  setInspectedObs(null)
                  showToast(`Filtered network view to IP ${inspectedIp.address}`)
                }}
              >
                <Filter size={14} />
                <span>Focus View to this IP</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
