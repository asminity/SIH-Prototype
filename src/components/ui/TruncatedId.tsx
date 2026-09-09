import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

type TruncatedIdProps = {
  value: string
  prefixLen?: number
  suffixLen?: number
  copyable?: boolean
  className?: string
  onClick?: () => void
}

export function TruncatedId({
  value,
  prefixLen = 6,
  suffixLen = 4,
  copyable = true,
  className = '',
  onClick,
}: TruncatedIdProps) {
  const [copied, setCopied] = useState(false)

  if (!value) return null

  const shouldTruncate = value.length > prefixLen + suffixLen + 3
  const display = shouldTruncate
    ? `${value.slice(0, prefixLen)}...${value.slice(-suffixLen)}`
    : value

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <span
      className={`truncated-id ${onClick ? 'truncated-id--clickable' : ''} ${className}`}
      title={value}
      onClick={onClick}
    >
      <code className="truncated-id__code">{display}</code>
      {copyable && (
        <button
          type="button"
          className="truncated-id__copy-btn"
          onClick={handleCopy}
          aria-label="Copy full identifier"
          title={copied ? 'Copied!' : `Copy: ${value}`}
        >
          {copied ? <Check size={11} className="truncated-id__copied" /> : <Copy size={11} />}
        </button>
      )}
    </span>
  )
}
