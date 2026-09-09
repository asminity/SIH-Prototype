import { X, Bell, AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react'
import { alerts } from '../../data/mockData'
import { investigationStore } from '../../state/investigationStore'
import './NotificationCenter.css'

type NotificationCenterProps = {
  isOpen: boolean
  onClose: () => void
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  if (!isOpen) return null

  const handleInvestigateAlert = (alert: (typeof alerts)[0]) => {
    investigationStore.selectEntity(alert.entityId)
    investigationStore.toggleInvestigationMode(true)
    onClose()
  }

  return (
    <>
      <div className="notification-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="notification-popover" onClick={(e) => e.stopPropagation()}>
        <div className="notification-popover__header">
        <div className="notification-popover__title">
          <Bell size={15} />
          <span>SECURITY & ANOMALY ALERTS</span>
        </div>
        <button
          type="button"
          className="icon-button icon-button--small"
          onClick={onClose}
          aria-label="Close notifications"
        >
          <X size={14} />
        </button>
      </div>

      <div className="notification-popover__list">
        {alerts.map((alert) => (
          <div key={alert.id} className="notification-item">
            <div className="notification-item__icon">
              {alert.severity === 'CRITICAL' ? (
                <ShieldAlert size={16} className="text-red" />
              ) : (
                <AlertCircle size={16} className="text-amber" />
              )}
            </div>
            <div className="notification-item__content">
              <div className="notification-item__top">
                <span className="notification-item__badge">{alert.severity}</span>
                <span className="notification-item__time">Just now</span>
              </div>
              <strong className="notification-item__title">{alert.title}</strong>
              <p className="notification-item__desc">{alert.description}</p>
              <button
                type="button"
                className="notification-item__btn"
                onClick={() => handleInvestigateAlert(alert)}
              >
                <span>Investigate</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
)
}
