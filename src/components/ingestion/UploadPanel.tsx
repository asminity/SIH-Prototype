import { FileJson, FileUp, Play, RotateCcw } from 'lucide-react'
import type { IngestionDataset, IngestionPhase } from '../../types/domain'
import { StatusBadge } from '../ui/StatusBadge'

type UploadPanelProps = {
  dataset: IngestionDataset
  currentPhase: IngestionPhase
  isProcessing: boolean
  onFileSelected: (file: File) => void
  onDemoSelected: () => void
  onRerun: () => void
}

const formatBytes = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`
const formatTimestamp = (timestamp: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(timestamp))

export function UploadPanel({ dataset, currentPhase, isProcessing, onFileSelected, onDemoSelected, onRerun }: UploadPanelProps) {
  return (
    <section className="ingestion-upload-panel">
      <div className="ingestion-upload-panel__intro">
        <div className="ingestion-upload-panel__icon"><FileUp size={23} strokeWidth={1.6} /></div>
        <div><p className="section-card__eyebrow">DATA INGESTION BOUNDARY</p><h2>Upload Network + Blockchain Dataset</h2><p>Select a CSV or JSON dataset to start the controlled processing simulation.</p></div>
      </div>
      <div className="ingestion-upload-panel__actions">
        <label className="upload-button"><FileUp size={15} />Choose CSV / JSON<input type="file" accept=".csv,.json,application/json,text/csv" onChange={(event) => { const file = event.target.files?.[0]; if (file) onFileSelected(file) }} /></label>
        <button className="demo-button" type="button" onClick={onDemoSelected} disabled={isProcessing}><Play size={14} />{isProcessing ? 'Processing...' : 'Load demo dataset'}</button>
        {currentPhase === 'READY' && !isProcessing ? <button className="icon-action" type="button" onClick={onRerun} title="Rerun processing"><RotateCcw size={15} />Rerun</button> : null}
      </div>
      <div className="ingestion-upload-panel__meta">
        <div className="dataset-file"><FileJson size={18} /><div><strong>{dataset.filename}</strong><span>{dataset.format} / {formatBytes(dataset.sizeBytes)}</span></div></div>
        <div className="dataset-meta-item"><span>RECORD COUNT</span><strong>{dataset.recordCount.toLocaleString('en-US')}</strong></div>
        <div className="dataset-meta-item"><span>UPLOADED</span><strong>{formatTimestamp(dataset.uploadTimestamp)}</strong></div>
        <StatusBadge label={currentPhase} tone={currentPhase === 'READY' ? 'operational' : 'warning'} />
      </div>
    </section>
  )
}
