import { Check, Circle, LoaderCircle } from 'lucide-react'
import type { IngestionPhase } from '../../types/domain'

type ProcessingPipelineProps = {
  phases: IngestionPhase[]
  currentPhase: IngestionPhase
}

const phaseLabels: Record<IngestionPhase, string> = {
  UPLOADED: 'UPLOADED', PARSING: 'PARSING', VALIDATING: 'VALIDATING', NORMALIZING: 'NORMALIZING', ENRICHING: 'ENRICHING', CORRELATING: 'CORRELATING', READY: 'READY',
}

export function ProcessingPipeline({ phases, currentPhase }: ProcessingPipelineProps) {
  const currentIndex = phases.indexOf(currentPhase)
  return (
    <div className="ingestion-pipeline" aria-label="Dataset processing workflow">
      {phases.map((phase, index) => {
        const complete = currentPhase === 'READY' || index < currentIndex
        const active = phase === currentPhase && currentPhase !== 'READY'
        return <div className={`pipeline-step${complete ? ' pipeline-step--complete' : ''}${active ? ' pipeline-step--active' : ''}`} key={phase}>
          <div className="pipeline-step__marker">{complete ? <Check size={14} /> : active ? <LoaderCircle className="pipeline-spin" size={14} /> : <Circle size={10} />}</div>
          <span>{phaseLabels[phase]}</span>
          {index < phases.length - 1 ? <i className={complete ? 'pipeline-connector pipeline-connector--complete' : 'pipeline-connector'} /> : null}
        </div>
      })}
    </div>
  )
}
