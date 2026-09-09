import { ArrowDown, BrainCircuit, CheckCircle2, GitMerge, ShieldAlert } from 'lucide-react'
import type { FeatureFusionResult, ModelResult, RiskAssessment } from '../../types/domain'
import { SectionCard } from '../ui/SectionCard'

type FusionRiskArchitectureProps = {
  models: ModelResult[]
  fusion: FeatureFusionResult
  risk: RiskAssessment
}

export function FusionRiskArchitecture({ models, fusion, risk }: FusionRiskArchitectureProps) {
  const elliptic = models.find((model) => model.model === 'ELLIPTIC++')!
  const ugransome = models.find((model) => model.model === 'UGRANSOME')!
  return <SectionCard eyebrow="MODEL OUTPUT → RISK ENGINE" title="Feature fusion architecture" className="fusion-risk-architecture"><div className="fusion-flow"><div className="fusion-inputs"><div className="fusion-model fusion-model--elliptic"><BrainCircuit size={17} /><div><span>ELLIPTIC++ OUTPUT</span><strong>{elliptic.anomalyScore.toFixed(2)}</strong><small>{elliptic.classification} / {Math.round(elliptic.confidence * 100)}% confidence</small></div></div><div className="fusion-model fusion-model--ugransome"><BrainCircuit size={17} /><div><span>UGRANSOME OUTPUT</span><strong>{ugransome.anomalyScore.toFixed(2)}</strong><small>{ugransome.classification} / {Math.round(ugransome.confidence * 100)}% confidence</small></div></div></div><ArrowDown className="fusion-flow__arrow" size={18} /><div className="fusion-stage"><GitMerge size={18} /><span>FEATURE FUSION</span><small>Prototype configuration</small><div className="fusion-contributions"><b>ELLIPTIC++ 55%</b><b>UGRANSOME 45%</b></div></div><ArrowDown className="fusion-flow__arrow" size={18} /><div className="fusion-score"><span>FUSED SCORE</span><strong>{fusion.fusedScore.toFixed(3)}</strong><small>{fusion.classification}</small></div><ArrowDown className="fusion-flow__arrow" size={18} /><div className="fusion-final-risk"><ShieldAlert size={20} /><div><span>FINAL RISK ASSESSMENT</span><strong>{risk.severity} / {risk.score} <small>/ 100</small></strong><em>{Math.round(risk.confidence * 100)}% confidence</em></div><CheckCircle2 className="fusion-final-risk__status" size={17} /></div></div><p className="fusion-disclaimer">This is a deterministic prototype fusion configuration. It represents complementary simulated model outputs, not live model inference.</p></SectionCard>
}
