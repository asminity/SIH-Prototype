import type { Alert, AlertId, AlertStatus, Case, CaseId } from '../types/domain'
import { alerts as initialAlerts, cases as initialCases } from '../data/mockData'

type PrototypeState = {
  alerts: Alert[]
  cases: Case[]
}

const storageKey = 'bitcoin-fi-prototype-state'

function cloneState(state: PrototypeState): PrototypeState {
  return { alerts: state.alerts.map((alert) => ({ ...alert, transactionIds: [...alert.transactionIds] })), cases: state.cases.map((item) => ({ ...item, evidenceIds: [...item.evidenceIds] })) }
}

function readInitialState(): PrototypeState {
  if (typeof window === 'undefined') return { alerts: initialAlerts, cases: initialCases }
  const stored = window.localStorage.getItem(storageKey)
  if (!stored) return { alerts: initialAlerts, cases: initialCases }
  try {
    const parsed = JSON.parse(stored) as PrototypeState
    if (!parsed.alerts || !parsed.cases) return { alerts: initialAlerts, cases: initialCases }
    const alerts = initialAlerts.map((initialAlert) => {
      const storedAlert = parsed.alerts.find((alert) => alert.id === initialAlert.id)
      return storedAlert ? { ...initialAlert, status: storedAlert.status } : initialAlert
    })
    const cases = initialCases.map((initialCase) => {
      const storedCase = parsed.cases?.find((c) => c.id === initialCase.id)
      return storedCase ? { ...initialCase, status: storedCase.status } : initialCase
    })
    return { alerts, cases }
  } catch {
    return { alerts: initialAlerts, cases: initialCases }
  }
}

let state = readInitialState()

function persist() {
  if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(state))
}

export const prototypeStore = {
  getState(): PrototypeState {
    return cloneState(state)
  },
  getAlert(alertId: AlertId) {
    return state.alerts.find((alert) => alert.id === alertId)
  },
  updateAlertStatus(alertId: AlertId, status: AlertStatus) {
    const alert = state.alerts.find((item) => item.id === alertId)
    if (!alert) return undefined
    alert.status = status
    persist()
    return { ...alert, transactionIds: [...alert.transactionIds] }
  },
  getCase(caseId: CaseId) {
    return state.cases.find((item) => item.id === caseId)
  },
  addCase(caseRecord: Case) {
    const existing = state.cases.find((item) => item.id === caseRecord.id)
    if (!existing) state.cases.push({ ...caseRecord, evidenceIds: [...caseRecord.evidenceIds] })
    persist()
    return existing ?? caseRecord
  },
  reset() {
    state = { alerts: initialAlerts, cases: initialCases }
    persist()
  },
}
