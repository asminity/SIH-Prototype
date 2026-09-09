import { useState, useRef } from 'react'
import type { TransactionActivityPoint } from '../../types/domain'
import { SectionCard } from '../ui/SectionCard'

type TransactionActivityChartProps = {
  activity: TransactionActivityPoint[]
  timeframe?: string
  onTimeframeChange?: (tf: string) => void
}

type Series = {
  key: keyof Omit<TransactionActivityPoint, 'timestamp'>
  label: string
  color: string
}

const series: Series[] = [
  { key: 'normal', label: 'NORMAL', color: '#10B981' },
  { key: 'elevated', label: 'ELEVATED', color: '#F59E0B' },
  { key: 'suspicious', label: 'SUSPICIOUS', color: '#EF4444' },
  { key: 'highRisk', label: 'HIGH RISK', color: '#A855F7' },
]

const chartWidth = 760
const chartHeight = 220
const padding = { top: 25, right: 20, bottom: 35, left: 42 }

export function TransactionActivityChart({
  activity,
  timeframe = '7D',
  onTimeframeChange,
}: TransactionActivityChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set())
  const svgRef = useRef<SVGSVGElement>(null)

  const activeSeries = series.filter((s) => !hiddenSeries.has(s.key))

  const maxValue = Math.max(
    ...activity.flatMap((point) => (activeSeries.length > 0 ? activeSeries.map(({ key }) => point[key]) : [1])),
    1
  )
  const yTicks = [0, Math.round(maxValue / 2), maxValue]

  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  const getX = (index: number) => {
    return activity.length <= 1 ? padding.left + innerWidth / 2 : padding.left + (index / (activity.length - 1)) * innerWidth
  }

  const getY = (val: number) => {
    return padding.top + innerHeight - (val / maxValue) * innerHeight
  }

  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        if (next.size < series.length - 1) {
          next.add(key)
        }
      }
      return next
    })
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || activity.length === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    const svgX = ((e.clientX - rect.left) / rect.width) * chartWidth
    
    // Find closest data point
    let closestIdx = 0
    let closestDist = Infinity
    activity.forEach((_, idx) => {
      const px = getX(idx)
      const dist = Math.abs(px - svgX)
      if (dist < closestDist) {
        closestDist = dist
        closestIdx = idx
      }
    })
    setHoverIndex(closestIdx)
  }

  const handleMouseLeave = () => {
    setHoverIndex(null)
  }

  const hoveredPoint = hoverIndex !== null ? activity[hoverIndex] : null
  const hoveredX = hoverIndex !== null ? getX(hoverIndex) : null

  // Find peak high-risk point for visual callout
  let peakPointIndex = 0
  let peakVal = -1
  activity.forEach((p, idx) => {
    if (p.highRisk > peakVal) {
      peakVal = p.highRisk
      peakPointIndex = idx
    }
  })

  return (
    <SectionCard
      eyebrow="TRANSACTION TELEMETRY"
      title="Volume by Classification"
      className="activity-chart"
      actions={
        <div className="chart-timeframe-pills">
          {['24H', '7D', '30D'].map((tf) => (
            <button
              key={tf}
              type="button"
              className={`chart-timeframe-btn ${timeframe === tf ? 'chart-timeframe-btn--active' : ''}`}
              onClick={() => onTimeframeChange?.(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      }
    >
      <div className="chart-legend-row">
        <div className="chart-legend">
          {series.map((item) => {
            const isHidden = hiddenSeries.has(item.key)
            return (
              <button
                key={item.key}
                type="button"
                className={`chart-legend-btn ${isHidden ? 'chart-legend-btn--dimmed' : ''}`}
                onClick={() => toggleSeries(item.key)}
                title={`Click to ${isHidden ? 'show' : 'hide'} ${item.label}`}
              >
                <i style={{ background: isHidden ? '#475569' : item.color }} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
        <span className="chart-legend-hint">Click legend to isolate metrics</span>
      </div>

      <div className="activity-chart__canvas-wrap">
        <div className="activity-chart__canvas">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            role="img"
            aria-label="Transaction volume by risk classification over time"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Grid lines */}
            {yTicks.map((tick) => {
              const y = getY(tick)
              return (
                <g key={tick}>
                  <line x1={padding.left} x2={chartWidth - padding.right} y1={y} y2={y} className="chart-grid-line" />
                  <text x={padding.left - 9} y={y + 3} textAnchor="end" className="chart-axis-label">
                    {tick}
                  </text>
                </g>
              )
            })}

            {/* Polylines for each active series */}
            {activeSeries.map((item) => {
              const points = activity.map((p, idx) => `${getX(idx)},${getY(p[item.key])}`).join(' ')
              return (
                <polyline
                  key={item.key}
                  points={points}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )
            })}

            {/* Peak Anomaly Beacon */}
            {!hiddenSeries.has('highRisk') && peakVal > 0 ? (
              <g className="chart-peak-beacon">
                <circle
                  cx={getX(peakPointIndex)}
                  cy={getY(peakVal)}
                  r="7"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
                <circle
                  cx={getX(peakPointIndex)}
                  cy={getY(peakVal)}
                  r="3.5"
                  fill="#A855F7"
                />
              </g>
            ) : null}

            {/* X-axis dates */}
            {activity.map((point, index) => {
              const x = getX(index)
              return (
                <text key={point.timestamp} x={x} y={chartHeight - 10} textAnchor="middle" className="chart-axis-label">
                  {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(new Date(point.timestamp))}
                </text>
              )
            })}

            {/* Hover guideline and dots */}
            {hoverIndex !== null && hoveredX !== null && hoveredPoint ? (
              <g className="chart-hover-overlay">
                <line
                  x1={hoveredX}
                  x2={hoveredX}
                  y1={padding.top}
                  y2={chartHeight - padding.bottom}
                  stroke="var(--cyan)"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
                {activeSeries.map((item) => (
                  <circle
                    key={item.key}
                    cx={hoveredX}
                    cy={getY(hoveredPoint[item.key])}
                    r="4.5"
                    fill={item.color}
                    stroke="#0B131E"
                    strokeWidth="2"
                  />
                ))}
              </g>
            ) : null}
          </svg>
        </div>

        {/* Dynamic HUD Tooltip */}
        {hoveredPoint && hoveredX !== null ? (
          <div
            className="chart-tooltip-hud"
            style={{
              left: `${(hoveredX / chartWidth) * 100}%`,
              top: '12px',
              transform: hoveredX > chartWidth * 0.65 ? 'translateX(-105%)' : 'translateX(12px)',
            }}
          >
            <div className="tooltip-hud__header">
              <span className="tooltip-hud__date">
                {new Intl.DateTimeFormat('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }).format(new Date(hoveredPoint.timestamp))}
              </span>
              <strong className="tooltip-hud__total">
                {(
                  hoveredPoint.normal +
                  hoveredPoint.elevated +
                  hoveredPoint.suspicious +
                  hoveredPoint.highRisk
                ).toLocaleString()}{' '}
                TXs
              </strong>
            </div>
            <div className="tooltip-hud__body">
              <div className="tooltip-hud__row">
                <span className="dot dot--green" />
                <span>Normal:</span>
                <b>{hoveredPoint.normal.toLocaleString()}</b>
              </div>
              <div className="tooltip-hud__row">
                <span className="dot dot--amber" />
                <span>Elevated:</span>
                <b>{hoveredPoint.elevated.toLocaleString()}</b>
              </div>
              <div className="tooltip-hud__row">
                <span className="dot dot--red" />
                <span>Suspicious:</span>
                <b>{hoveredPoint.suspicious.toLocaleString()}</b>
              </div>
              <div className="tooltip-hud__row">
                <span className="dot dot--purple" />
                <span>High Risk:</span>
                <b>{hoveredPoint.highRisk.toLocaleString()}</b>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </SectionCard>
  )
}
