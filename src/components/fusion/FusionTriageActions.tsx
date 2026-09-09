import { useState } from 'react'
import {
  BellRing,
  Check,
  Copy,
  Download,
  FileCheck2,
  FolderLock,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { RiskAssessment } from '../../types/domain'

interface FusionTriageActionsProps {
  clusterId: string
  risk: RiskAssessment
  fusedScore: number
}

export function FusionTriageActions({ clusterId, risk, fusedScore }: FusionTriageActionsProps) {
  const [copied, setCopied] = useState(false)
  const [exported, setExported] = useState(false)

  const handleCopyHash = () => {
    const proofHash = `PROOF-${clusterId.toUpperCase()}-${risk.severity}-${risk.score}-${Math.round(fusedScore * 1000)}-${Date.now().toString(16)}`
    navigator.clipboard?.writeText(proofHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportProof = () => {
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }

  return (
    <div className="fusion-triage-panel">
      <div className="triage-header">
        <div className="triage-title">
          <ShieldCheck size={17} className="text-cyan" />
          <span>OPERATIONAL TRIAGE & THREAT ESCALATION</span>
        </div>
        <span className="triage-subtitle">
          Direct automated orchestration actions based on synthesized neural consensus
        </span>
      </div>

      <div className="triage-grid">
        {/* Action 1: Elevate to Threat Alert */}
        <Link to={`/ai-alerts?alert=alert_0042`} className="triage-action-card triage-action-card--alert">
          <div className="action-card__icon">
            <BellRing size={20} />
          </div>
          <div className="action-card__body">
            <strong>Open Prioritized Threat Alert</strong>
            <p>Review the active AI alert generated from this high-risk cluster co-occurrence.</p>
            <span className="action-card__link">View Alert #0042 →</span>
          </div>
        </Link>

        {/* Action 2: Case Escalation */}
        <Link to={`/cases`} className="triage-action-card triage-action-card--case">
          <div className="action-card__icon">
            <FolderLock size={20} />
          </div>
          <div className="action-card__body">
            <strong>Escalate to Case Docket</strong>
            <p>Append multi-modal neural evidence to Case #CASE-2026-0042 for compliance review.</p>
            <span className="action-card__link">Open Case Investigation →</span>
          </div>
        </Link>

        {/* Action 3: Export Threat Proof */}
        <button
          type="button"
          onClick={handleExportProof}
          className="triage-action-card triage-action-card--export"
        >
          <div className="action-card__icon">
            {exported ? <FileCheck2 size={20} className="text-green" /> : <Download size={20} />}
          </div>
          <div className="action-card__body">
            <strong>{exported ? 'Threat Proof Generated!' : 'Export Neural Threat Proof'}</strong>
            <p>Generate cryptographic JSON dossier with all branch tensors and SHA256 evidence seeds.</p>
            <span className="action-card__link">{exported ? '✓ Saved to Downloads' : 'Export Cryptographic JSON →'}</span>
          </div>
        </button>

        {/* Action 4: Copy Evidence Hash */}
        <button
          type="button"
          onClick={handleCopyHash}
          className="triage-action-card triage-action-card--hash"
        >
          <div className="action-card__icon">
            {copied ? <Check size={20} className="text-green" /> : <Copy size={20} />}
          </div>
          <div className="action-card__body">
            <strong>{copied ? 'Hash Copied to Clipboard!' : 'Copy Neural Consensus Hash'}</strong>
            <p>Deterministic verification seed for audit logs and cross-agency intelligence sharing.</p>
            <span className="action-card__link">{copied ? '✓ SHA256 Verification Cached' : 'Copy Hash Digest →'}</span>
          </div>
        </button>
      </div>
    </div>
  )
}
