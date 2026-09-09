import { Sliders, Sparkles, RotateCcw } from 'lucide-react'

interface ThreatWeightTuningProps {
  ellipticWeight: number
  ugransomeWeight: number
  onWeightChange: (elliptic: number, ugransome: number) => void
  onReset: () => void
  fusedScore: number
  riskScore: number
  severity: string
}

export function ThreatWeightTuning({
  ellipticWeight,
  ugransomeWeight,
  onWeightChange,
  onReset,
  fusedScore,
  riskScore,
  severity,
}: ThreatWeightTuningProps) {
  const presets = [
    { label: 'Balanced Bayesian', e: 0.55, u: 0.45, desc: 'Default statistical equilibrium' },
    { label: 'Graph Topology Heavy', e: 0.80, u: 0.20, desc: 'Prioritizes UTXO & GCN features' },
    { label: 'Network Telemetry Heavy', e: 0.25, u: 0.75, desc: 'Prioritizes BGP & Tor exit relays' },
    { label: 'Parity Consensus', e: 0.50, u: 0.50, desc: 'Equal 50/50 dual-branch weighting' },
  ]

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) / 100
    onWeightChange(val, +(1 - val).toFixed(2))
  }

  const isPresetActive = (e: number, u: number) =>
    Math.abs(ellipticWeight - e) < 0.02 && Math.abs(ugransomeWeight - u) < 0.02

  const severityTone =
    severity === 'CRITICAL' || riskScore >= 80
      ? 'var(--red)'
      : severity === 'HIGH' || riskScore >= 50
      ? 'var(--amber)'
      : 'var(--green)'

  return (
    <div className="threat-tuning-panel">
      <div className="threat-tuning-header">
        <div className="threat-tuning-title">
          <Sliders size={16} className="text-cyan" />
          <span>LIVE NEURAL ENSEMBLE SENSITIVITY & WEIGHT TUNING</span>
        </div>
        <div className="threat-tuning-actions">
          <span className="threat-tuning-tag">
            <Sparkles size={12} /> DYNAMIC RE-SCORING
          </span>
          <button
            type="button"
            className="threat-tuning-reset-btn"
            onClick={onReset}
            title="Reset to default Bayesian weights"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      <div className="threat-tuning-body">
        {/* Preset Selector */}
        <div className="threat-tuning-presets">
          <span className="preset-label">ENSEMBLE PRESETS:</span>
          <div className="preset-buttons">
            {presets.map((p) => {
              const active = isPresetActive(p.e, p.u)
              return (
                <button
                  key={p.label}
                  type="button"
                  className={`preset-btn ${active ? 'preset-btn--active' : ''}`}
                  onClick={() => onWeightChange(p.e, p.u)}
                >
                  <span className="preset-btn__name">{p.label}</span>
                  <span className="preset-btn__weights">
                    {Math.round(p.e * 100)}% / {Math.round(p.u * 100)}%
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dual Weight Slider */}
        <div className="threat-slider-row">
          <div className="threat-branch-metric threat-branch-metric--elliptic">
            <span className="branch-label">ELLIPTIC++ WEIGHT</span>
            <strong className="branch-val">{Math.round(ellipticWeight * 100)}%</strong>
            <small>Transaction Graph GCN</small>
          </div>

          <div className="threat-slider-container">
            <div className="threat-slider-track-labels">
              <span className="text-amber">← More On-Chain Graph Bias</span>
              <span className="text-purple">More Network Telemetry Bias →</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="1"
              value={Math.round(ellipticWeight * 100)}
              onChange={handleSliderChange}
              className="threat-slider-input"
            />
            <div className="threat-slider-ticks">
              <span>10%</span>
              <span>25%</span>
              <span>50% (Parity)</span>
              <span>75%</span>
              <span>90%</span>
            </div>
          </div>

          <div className="threat-branch-metric threat-branch-metric--ugransome">
            <span className="branch-label">UGRANSOME WEIGHT</span>
            <strong className="branch-val">{Math.round(ugransomeWeight * 100)}%</strong>
            <small>Tor & BGP Telemetry</small>
          </div>
        </div>

        {/* Live Formula & Result Callout */}
        <div className="threat-tuning-footer">
          <div className="threat-formula">
            <span className="formula-label">BAYESIAN FUSION FORMULA:</span>
            <code>
              FusedScore = ({ellipticWeight.toFixed(2)} × Score_Elliptic) + (
              {ugransomeWeight.toFixed(2)} × Score_UGRansome)
            </code>
          </div>
          <div className="threat-live-result">
            <div className="live-stat">
              <span>SYNTHESIZED SCORE</span>
              <strong className="text-cyan">{fusedScore.toFixed(3)}</strong>
            </div>
            <div className="live-stat">
              <span>DYNAMIC RISK</span>
              <strong style={{ color: severityTone }}>
                {riskScore} <small>/ 100</small>
              </strong>
            </div>
            <div className="live-badge" style={{ borderColor: severityTone, color: severityTone }}>
              {severity}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
