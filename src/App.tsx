import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { routes } from './data/navigation'
import { DashboardPage } from './pages/DashboardPage'
import { DataIngestionPage } from './pages/DataIngestionPage'
import { AlertsPage } from './pages/AlertsPage'
import { EntityExplorerPage } from './pages/EntityExplorerPage'
import { EntityGraphPage } from './pages/EntityGraphPage'
import { FusionAnalysisPage } from './pages/FusionAnalysisPage'
import { InvestigationPage } from './pages/InvestigationPage'
import { ModulePage } from './pages/ModulePage'
import { TransactionExplorerPage } from './pages/TransactionExplorerPage'
import { NetworkActivityPage } from './pages/NetworkActivityPage'
import { CasesPage } from './pages/CasesPage'
import { ReportsPage } from './pages/ReportsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/investigations" element={<Navigate to="/cases" replace />} />
          <Route path="/system-status" element={<Navigate to="/" replace />} />
          <Route path="/settings" element={<Navigate to="/" replace />} />
          <Route path="/model-analysis" element={<Navigate to="/fusion-analysis" replace />} />
          <Route path="/feature-fusion" element={<Navigate to="/fusion-analysis" replace />} />
          <Route path="/threat-fusion" element={<Navigate to="/fusion-analysis" replace />} />
          <Route path="/relationship-analysis" element={<Navigate to="/entity-graph" replace />} />
          {routes.map((route) => {
            let element = <ModulePage />
            if (route.path === '/') element = <DashboardPage />
            else if (route.path === '/data-ingestion') element = <DataIngestionPage />
            else if (route.path === '/transactions') element = <TransactionExplorerPage />
            else if (route.path === '/network-activity') element = <NetworkActivityPage />
            else if (route.path === '/entity-explorer') element = <EntityExplorerPage />
            else if (route.path === '/entity-graph') element = <EntityGraphPage />
            else if (route.path === '/fusion-analysis') element = <FusionAnalysisPage />
            else if (route.path === '/ai-alerts') element = <AlertsPage />
            else if (route.path === '/investigations') element = <InvestigationPage />
            else if (route.path === '/cases') element = <CasesPage />
            else if (route.path === '/reports') element = <ReportsPage />

            return <Route key={route.path} path={route.path} element={element} />
          })}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
