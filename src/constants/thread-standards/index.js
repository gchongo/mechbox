import { METRIC_COARSE_ROWS, METRIC_FINE_ROWS } from './metric-data'
import { UNC_ROWS, UNF_ROWS } from './unified-data'
import { NPT_ROWS, G_ROWS, R_ROWS } from './pipe-data'

export { calcMetricBasicDims } from './metric-data'

/** @typedef {import('@/utils/thread-standards').ThreadRow} ThreadRow */

export const THREAD_SYSTEMS = [
  {
    id: 'metric',
    standardRef: 'ISO 724',
    angle: 60,
    unit: 'mm',
    subTabs: [
      { id: 'coarse', rows: METRIC_COARSE_ROWS },
      { id: 'fine', rows: METRIC_FINE_ROWS },
    ],
  },
  {
    id: 'unc',
    standardRef: 'ASME B1.1',
    angle: 60,
    unit: 'in',
    subTabs: [{ id: 'unc', rows: UNC_ROWS }],
  },
  {
    id: 'unf',
    standardRef: 'ASME B1.1',
    angle: 60,
    unit: 'in',
    subTabs: [{ id: 'unf', rows: UNF_ROWS }],
  },
  {
    id: 'npt',
    standardRef: 'ASME B1.20.1',
    angle: 60,
    unit: 'in',
    subTabs: [{ id: 'npt', rows: NPT_ROWS }],
  },
  {
    id: 'g',
    standardRef: 'ISO 228-1',
    angle: 55,
    unit: 'in',
    subTabs: [{ id: 'g', rows: G_ROWS }],
  },
  {
    id: 'r',
    standardRef: 'ISO 7-1',
    angle: 55,
    unit: 'in',
    subTabs: [{ id: 'r', rows: R_ROWS }],
  },
]

export function getAllThreadRows() {
  return THREAD_SYSTEMS.flatMap((sys) => sys.subTabs.flatMap((t) => t.rows))
}

export function getThreadRows(systemId, subTabId) {
  const sys = THREAD_SYSTEMS.find((s) => s.id === systemId)
  if (!sys) return []
  if (systemId === 'metric') {
    const tab = sys.subTabs.find((t) => t.id === subTabId) ?? sys.subTabs[0]
    return tab.rows
  }
  return sys.subTabs[0]?.rows ?? []
}
