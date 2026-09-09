import { useEffect, useState } from 'react'
import { Clock3, Database, FileCheck2, FileWarning, ShieldCheck } from 'lucide-react'
import { getEnrichmentResults, getIngestionData, getValidationRecords } from '../services/mockServices'
import type { IngestionDataset, IngestionPhase, ValidationCategory } from '../types/domain'
import { EnrichmentTable } from '../components/ingestion/EnrichmentTable'
import { ProcessingPipeline } from '../components/ingestion/ProcessingPipeline'
import { UploadPanel } from '../components/ingestion/UploadPanel'
import { ValidationTable } from '../components/ingestion/ValidationTable'
import { MetricCard } from '../components/ui/MetricCard'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'

const ingestionData = getIngestionData()
const processingPhases = ingestionData.phases

function formatFileType(fileName: string): 'CSV' | 'JSON' {
  return fileName.toLowerCase().endsWith('.csv') ? 'CSV' : 'JSON'
}

export function DataIngestionPage() {
  const [dataset, setDataset] = useState<IngestionDataset>(ingestionData.dataset)
  const [currentPhase, setCurrentPhase] = useState<IngestionPhase>('READY')
  const [runToken, setRunToken] = useState(0)
  const [validationCategory, setValidationCategory] = useState<ValidationCategory | 'ALL'>('ALL')
  const [selectedIpId, setSelectedIpId] = useState<string>()

  useEffect(() => {
    if (runToken === 0) return undefined
    const timers = processingPhases.map((phase, index) => window.setTimeout(() => {
      setCurrentPhase(phase)
      setDataset((current) => ({ ...current, status: phase }))
    }, index * 560))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [runToken])

  const startProcessing = (nextDataset: IngestionDataset) => {
    setDataset({ ...nextDataset, status: 'UPLOADED' })
    setCurrentPhase('UPLOADED')
    setRunToken((token) => token + 1)
  }

  const handleFileSelected = (file: File) => startProcessing({ ...ingestionData.dataset, filename: file.name, format: formatFileType(file.name), sizeBytes: file.size, uploadTimestamp: new Date().toISOString() })
  const handleDemoSelected = () => startProcessing(ingestionData.dataset)
  const isProcessing = currentPhase !== 'READY'
  const validationRecords = getValidationRecords(validationCategory)
  const enrichmentResults = getEnrichmentResults()

  return (
    <div className="ingestion-page">
      <PageHeader eyebrow="DATA INTELLIGENCE" title="Data Ingestion" description="Move a controlled network and blockchain dataset through the platform's validation boundary before downstream correlation." actions={<StatusBadge label={isProcessing ? 'PROCESSING BATCH' : 'INGESTION READY'} tone={isProcessing ? 'warning' : 'operational'} />} />

      <UploadPanel dataset={dataset} currentPhase={currentPhase} isProcessing={isProcessing} onFileSelected={handleFileSelected} onDemoSelected={handleDemoSelected} onRerun={() => startProcessing(dataset)} />
      <ProcessingPipeline phases={processingPhases} currentPhase={currentPhase} />

      <div className="ingestion-results-heading"><div><p className="page-header__eyebrow">PROCESSING OUTPUT</p><h2>Batch validation summary</h2></div><span><Clock3 size={13} /> {dataset.processingTimeSeconds.toFixed(1)}s simulated processing time</span></div>
      <div className="ingestion-summary-grid">
        <MetricCard icon={<Database size={17} />} label="TOTAL RECORDS" value={dataset.recordCount.toLocaleString('en-US')} detail="Dataset records received" />
        <MetricCard icon={<FileCheck2 size={17} />} label="VALID" value={ingestionData.validationSummary.valid.toLocaleString('en-US')} detail="Passed validation" />
        <MetricCard icon={<FileWarning size={17} />} label="WARNINGS" value={ingestionData.validationSummary.warnings.toLocaleString('en-US')} detail="Retained with review flags" />
        <MetricCard icon={<ShieldCheck size={17} />} label="INVALID / DUPLICATES" value={`${ingestionData.validationSummary.invalid} / ${ingestionData.validationSummary.duplicates}`} detail="Quarantined / de-duplicated" />
      </div>

      <ValidationTable records={validationRecords} selectedCategory={validationCategory} onCategoryChange={setValidationCategory} summary={ingestionData.validationSummary} />
      <EnrichmentTable results={enrichmentResults} selectedIpId={selectedIpId} onSelect={(ipAddressId) => setSelectedIpId((current) => current === ipAddressId ? undefined : ipAddressId)} />
    </div>
  )
}
