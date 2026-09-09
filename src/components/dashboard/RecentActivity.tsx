import { useState } from 'react'
import { ArrowUpRight, CircleDot, Pause, Play, Copy, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { TimelineEvent } from '../../types/domain'
import { SectionCard } from '../ui/SectionCard'

type RecentActivityProps = {
  events: TimelineEvent[]
  onToast?: (msg: string) => void
}

export function RecentActivity({ events, onToast }: RecentActivityProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'TX' | 'NETWORK' | 'ALERT'>('ALL')
  const [isLiveStreaming, setIsLiveStreaming] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
    onToast?.(`Copied event hash to clipboard`)
  }

  const filteredEvents = events
    .filter((event) => {
      if (filterType === 'ALL') return true
      if (filterType === 'TX') return event.title.toLowerCase().includes('transaction') || event.title.toLowerCase().includes('tx')
      if (filterType === 'NETWORK') return event.title.toLowerCase().includes('ip') || event.title.toLowerCase().includes('relay')
      if (filterType === 'ALERT') return event.title.toLowerCase().includes('alert') || event.title.toLowerCase().includes('cluster')
      return true
    })
    .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
    .slice(0, 6)

  return (
    <SectionCard
      eyebrow="EVIDENCE STREAM"
      title="Live Audit Log"
      className="recent-activity"
      actions={
        <div className="recent-activity-actions">
          <button
            type="button"
            className={`stream-toggle-btn ${isLiveStreaming ? 'stream-toggle-btn--live' : ''}`}
            onClick={() => {
              setIsLiveStreaming(!isLiveStreaming)
              onToast?.(isLiveStreaming ? 'Evidence stream paused' : 'Evidence stream live')
            }}
            title={isLiveStreaming ? 'Pause live feed' : 'Resume live feed'}
          >
            {isLiveStreaming ? <Pause size={11} /> : <Play size={11} />}
            <span>{isLiveStreaming ? 'STREAMING' : 'PAUSED'}</span>
          </button>
        </div>
      }
    >
      <div className="activity-feed-filters">
        {(['ALL', 'TX', 'NETWORK', 'ALERT'] as const).map((type) => (
          <button
            key={type}
            type="button"
            className={`feed-filter-chip ${filterType === type ? 'feed-filter-chip--active' : ''}`}
            onClick={() => setFilterType(type)}
          >
            {type === 'ALL' ? 'All' : type === 'TX' ? 'Transactions' : type === 'NETWORK' ? 'Network' : 'Alerts'}
          </button>
        ))}
      </div>

      <div className="activity-feed">
        {filteredEvents.map((event) => (
          <div className="activity-feed__item" key={event.id}>
            <CircleDot size={12} className="activity-feed__marker" />
            <time>
              {new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }).format(new Date(event.timestamp))}
            </time>
            <div className="activity-feed__details">
              <strong>{event.title}</strong>
              <p>{event.description}</p>
            </div>
            <button
              type="button"
              className="feed-copy-btn"
              onClick={() => handleCopy(event.id, event.id)}
              title="Copy event record ID"
            >
              {copiedId === event.id ? <Check size={12} className="text-green" /> : <Copy size={12} />}
            </button>
          </div>
        ))}
      </div>

      <div className="recent-activity__footer">
        <Link className="section-link" to="/investigations">
          Open investigation timeline
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </SectionCard>
  )
}
