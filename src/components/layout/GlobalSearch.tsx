import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search,
  X,
  Wallet as WalletIcon,
  Globe,
  ArrowRightLeft,
  Users,
  AlertTriangle,
} from 'lucide-react'
import { entities, wallets, ipAddresses, transactions, alerts } from '../../data/mockData'
import { investigationStore } from '../../state/investigationStore'
import { TruncatedId } from '../ui/TruncatedId'
import './GlobalSearch.css'

type GlobalSearchProps = {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setQuery('')
    onClose()
  }, [onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) handleClose()
        else investigationStore.setGlobalSearchOpen(true)
      }
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  const trimmed = query.trim().toLowerCase()

  const matchedEntities = trimmed
    ? entities.filter(
        (e) =>
          e.id.toLowerCase().includes(trimmed) ||
          e.label.toLowerCase().includes(trimmed) ||
          e.entityType.toLowerCase().includes(trimmed)
      )
    : entities.slice(0, 3)

  const matchedWallets = trimmed
    ? wallets.filter(
        (w) =>
          w.id.toLowerCase().includes(trimmed) ||
          w.address.toLowerCase().includes(trimmed)
      )
    : wallets.slice(0, 3)

  const matchedIps = trimmed
    ? ipAddresses.filter(
        (i) =>
          i.id.toLowerCase().includes(trimmed) ||
          i.address.toLowerCase().includes(trimmed) ||
          i.provider.toLowerCase().includes(trimmed) ||
          i.asn.toLowerCase().includes(trimmed)
      )
    : ipAddresses.slice(0, 3)

  const matchedTransactions = trimmed
    ? transactions.filter(
        (t) =>
          t.id.toLowerCase().includes(trimmed) ||
          t.hash.toLowerCase().includes(trimmed)
      )
    : transactions.slice(0, 3)

  const matchedAlerts = trimmed
    ? alerts.filter(
        (a) =>
          a.id.toLowerCase().includes(trimmed) ||
          a.title.toLowerCase().includes(trimmed) ||
          a.description.toLowerCase().includes(trimmed)
      )
    : alerts.slice(0, 2)

  const handleSelectEntity = (entity: (typeof entities)[0]) => {
    investigationStore.selectEntity(entity)
    handleClose()
  }

  const handleSelectTransaction = (tx: (typeof transactions)[0]) => {
    investigationStore.selectTransaction(tx)
    handleClose()
  }

  const handleSelectIp = (ip: (typeof ipAddresses)[0]) => {
    investigationStore.selectIp(ip)
    handleClose()
  }

  const handleSelectWallet = (w: (typeof wallets)[0]) => {
    investigationStore.selectWallet(w)
    handleClose()
  }

  const handleSelectAlert = (a: (typeof alerts)[0]) => {
    const entity = entities.find((e) => e.id === a.entityId) ?? null
    investigationStore.selectEntity(entity)
    handleClose()
  }

  return (
    <div className="global-search-backdrop" onClick={handleClose}>
      <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="global-search-input-wrap">
          <Search size={18} className="global-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="global-search-input"
            placeholder="Search wallet address, IP, TX hash, entity, or alert..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="global-search-clear"
              onClick={() => setQuery('')}
            >
              <X size={15} />
            </button>
          )}
          <span className="global-search-shortcut">ESC to close</span>
        </div>

        <div className="global-search-results">
          {/* ENTITIES */}
          {matchedEntities.length > 0 && (
            <div className="search-result-group">
              <div className="search-result-group__label">
                <Users size={13} />
                <span>ENTITIES</span>
              </div>
              {matchedEntities.map((entity) => (
                <div
                  key={entity.id}
                  className="search-result-item"
                  onClick={() => handleSelectEntity(entity)}
                >
                  <div className="search-result-item__main">
                    <strong className="search-result-item__title">{entity.label}</strong>
                    <span className="search-result-item__sub">{entity.id}</span>
                  </div>
                  <span className="search-result-item__badge">{entity.entityType}</span>
                  <span className="search-result-item__action">Inspect</span>
                </div>
              ))}
            </div>
          )}

          {/* TRANSACTIONS */}
          {matchedTransactions.length > 0 && (
            <div className="search-result-group">
              <div className="search-result-group__label">
                <ArrowRightLeft size={13} />
                <span>TRANSACTIONS</span>
              </div>
              {matchedTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="search-result-item"
                  onClick={() => handleSelectTransaction(tx)}
                >
                  <div className="search-result-item__main">
                    <TruncatedId value={tx.hash} prefixLen={8} suffixLen={6} copyable={false} />
                    <span className="search-result-item__sub">
                      {tx.amountBtc} BTC &middot; {tx.riskLevel} RISK
                    </span>
                  </div>
                  <span
                    className={`search-result-item__badge search-result-item__badge--${tx.riskLevel.toLowerCase()}`}
                  >
                    {tx.riskLevel}
                  </span>
                  <span className="search-result-item__action">Open Drawer</span>
                </div>
              ))}
            </div>
          )}

          {/* WALLETS */}
          {matchedWallets.length > 0 && (
            <div className="search-result-group">
              <div className="search-result-group__label">
                <WalletIcon size={13} />
                <span>WALLETS</span>
              </div>
              {matchedWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="search-result-item"
                  onClick={() => handleSelectWallet(wallet)}
                >
                  <div className="search-result-item__main">
                    <TruncatedId value={wallet.address} prefixLen={10} suffixLen={6} copyable={false} />
                    <span className="search-result-item__sub">{wallet.id}</span>
                  </div>
                  <span className="search-result-item__badge">{wallet.riskSignal}</span>
                  <span className="search-result-item__action">Focus</span>
                </div>
              ))}
            </div>
          )}

          {/* IP ADDRESSES */}
          {matchedIps.length > 0 && (
            <div className="search-result-group">
              <div className="search-result-group__label">
                <Globe size={13} />
                <span>IP ADDRESSES</span>
              </div>
              {matchedIps.map((ip) => (
                <div
                  key={ip.id}
                  className="search-result-item"
                  onClick={() => handleSelectIp(ip)}
                >
                  <div className="search-result-item__main">
                    <code className="search-result-item__code">{ip.address}</code>
                    <span className="search-result-item__sub">
                      {ip.provider} &middot; {ip.country} ({ip.asn})
                    </span>
                  </div>
                  <span className="search-result-item__badge">{ip.riskSignal}</span>
                  <span className="search-result-item__action">Focus</span>
                </div>
              ))}
            </div>
          )}

          {/* ALERTS */}
          {matchedAlerts.length > 0 && (
            <div className="search-result-group">
              <div className="search-result-group__label">
                <AlertTriangle size={13} />
                <span>AI ALERTS</span>
              </div>
              {matchedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="search-result-item"
                  onClick={() => handleSelectAlert(alert)}
                >
                  <div className="search-result-item__main">
                    <strong className="search-result-item__title">{alert.title}</strong>
                    <span className="search-result-item__sub">
                      Score {alert.riskScore}/100 &middot; {alert.severity}
                    </span>
                  </div>
                  <span className="search-result-item__badge search-result-item__badge--critical">
                    {alert.severity}
                  </span>
                  <span className="search-result-item__action">Investigate</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
