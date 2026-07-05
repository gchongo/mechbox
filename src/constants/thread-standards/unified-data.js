/** ASME B1.1 UNC / UNF 标准系列 — 基本尺寸由公式生成 */

import { UNC_DEFINITIONS, UNF_DEFINITIONS } from './unified-definitions'
import { calcUnifiedBasicDims } from './thread-dim'

function formatLabel(label, tpi, series) {
  if (label.startsWith('#')) return `${label}-${tpi} ${series.toUpperCase()}`
  return `${label}-${tpi} ${series.toUpperCase()}`
}

function buildUnifiedRows(definitions, series) {
  return definitions.map(([label, major, tpi]) => {
    const dims = calcUnifiedBasicDims(major, tpi)
    const designation = formatLabel(label, tpi, series)
    return {
      id: `un-${series}-${label.replace(/[^\w]/g, '')}-${tpi}`,
      system: series,
      subSeries: series,
      designation,
      priority: 1,
      standardRef: 'ASME B1.1',
      unit: 'in',
      nominal: major,
      ...dims,
      toleranceExternal: '2A',
      toleranceInternal: '2B',
      sealing: '—',
      taper: '—',
      compatibility: '—',
      usageKey: 'fastener',
    }
  })
}

export const UNC_ROWS = buildUnifiedRows(UNC_DEFINITIONS, 'unc')
export const UNF_ROWS = buildUnifiedRows(UNF_DEFINITIONS, 'unf')

/** @deprecated */
export function buildUnifiedRowsLegacy(seriesFilter) {
  return seriesFilter === 'unc' ? UNC_ROWS : UNF_ROWS
}
