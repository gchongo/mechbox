import { METRIC_ALL_ROWS, METRIC_COARSE_ROWS, METRIC_FINE_ROWS } from './metric-data'
import { UNC_ROWS, UNF_ROWS, UNEF_ROWS } from './unified-data'
import { TR_ROWS } from './tr-data'
import { ACME_ROWS } from './acme-data'
import { NPT_ROWS, NPTF_ROWS, G_ROWS, R_ROWS } from './pipe-data'
import { WHITWORTH_REF_ROWS } from './whitworth-data'
import { UNS_REF_ROWS } from './uns-data'

export { calcMetricBasicDims } from './metric-data'
export { calcTrapezoidalBasicDims } from './tr-data'
export { calcAcmeBasicDims } from './acme-data'
export { calcWhitworthBasicDims, getWhitworthReferenceRows } from './whitworth-data'
export { getUnsReferenceRows } from './uns-data'

/** @typedef {import('@/utils/thread-standards').ThreadRow} ThreadRow */

export const THREAD_SYSTEMS = [
  {
    id: 'metric',
    standardRef: 'ISO 724',
    angle: 60,
    unit: 'mm',
    /** Single catalog: coarse + fine (Excel 牙型 is a column, not a tab) */
    subTabs: [
      { id: 'all', rows: METRIC_ALL_ROWS },
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
    id: 'unef',
    standardRef: 'ASME B1.1',
    angle: 60,
    unit: 'in',
    subTabs: [{ id: 'unef', rows: UNEF_ROWS }],
  },
  {
    id: 'tr',
    standardRef: 'ISO 290',
    angle: 30,
    unit: 'mm',
    subTabs: [{ id: 'tr', rows: TR_ROWS }],
  },
  {
    id: 'acme',
    standardRef: 'ASME B1.5',
    angle: 29,
    unit: 'in',
    subTabs: [{ id: 'acme', rows: ACME_ROWS }],
  },
  {
    id: 'npt',
    standardRef: 'ASME B1.20.1',
    angle: 60,
    unit: 'in',
    subTabs: [{ id: 'npt', rows: NPT_ROWS }],
  },
  {
    id: 'nptf',
    standardRef: 'SAE J476',
    angle: 60,
    unit: 'in',
    subTabs: [{ id: 'nptf', rows: NPTF_ROWS }],
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
  const catalog = THREAD_SYSTEMS.flatMap((sys) => {
    // metric exposes all/coarse/fine — only count `all` once
    if (sys.id === 'metric') {
      const all = sys.subTabs.find((t) => t.id === 'all')
      return all ? all.rows : sys.subTabs[0]?.rows ?? []
    }
    return sys.subTabs.flatMap((t) => t.rows)
  })
  return [...catalog, ...WHITWORTH_REF_ROWS, ...UNS_REF_ROWS]
}

export function getThreadRows(systemId, subTabId) {
  const sys = THREAD_SYSTEMS.find((s) => s.id === systemId)
  if (!sys) return []
  if (systemId === 'metric') {
    const id = subTabId === 'coarse' || subTabId === 'fine' ? subTabId : 'all'
    const tab = sys.subTabs.find((t) => t.id === id) ?? sys.subTabs[0]
    return tab.rows
  }
  return sys.subTabs[0]?.rows ?? []
}

export {
  THREAD_PURPOSE_ORDER,
  PURPOSE_SYSTEM_IDS,
  THREAD_SYSTEM_REGISTRY,
  getSystemsForPurpose,
  getThreadSystemDef,
  resolveTaxonomyFromCatalog,
  countImplementedInPurpose,
  getAllRegisteredSystems,
} from './taxonomy'
