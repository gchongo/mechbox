/** BS 84 BSW / BSF 参考系列 — 公式生成基本尺寸，非验收极限 */

import { calcWhitworthBasicDims, stripNum } from './thread-dim'

export { calcWhitworthBasicDims } from './thread-dim'

/** [label, majorIn, tpi] */
export const BSW_DEFINITIONS = [
  ['1/8', 0.125, 40],
  ['3/16', 0.1875, 24],
  ['1/4', 0.25, 20],
  ['5/16', 0.3125, 18],
  ['3/8', 0.375, 16],
  ['7/16', 0.4375, 14],
  ['1/2', 0.5, 12],
  ['9/16', 0.5625, 12],
  ['5/8', 0.625, 11],
  ['3/4', 0.75, 10],
  ['7/8', 0.875, 9],
  ['1', 1, 8],
  ['1-1/8', 1.125, 7],
  ['1-1/4', 1.25, 7],
  ['1-3/8', 1.375, 6],
  ['1-1/2', 1.5, 6],
  ['1-3/4', 1.75, 5],
  ['2', 2, 4.5],
]

export const BSF_DEFINITIONS = [
  ['3/16', 0.1875, 32],
  ['1/4', 0.25, 26],
  ['5/16', 0.3125, 22],
  ['3/8', 0.375, 20],
  ['7/16', 0.4375, 18],
  ['1/2', 0.5, 16],
  ['9/16', 0.5625, 16],
  ['5/8', 0.625, 14],
  ['3/4', 0.75, 12],
  ['7/8', 0.875, 11],
  ['1', 1, 10],
  ['1-1/8', 1.125, 9],
  ['1-1/4', 1.25, 9],
  ['1-3/8', 1.375, 8],
  ['1-1/2', 1.5, 8],
  ['1-3/4', 1.75, 7],
  ['2', 2, 7],
]

function formatDesignation(label, tpi, series) {
  const tpiLabel = Number.isInteger(tpi) ? String(tpi) : String(tpi)
  return `${label}-${tpiLabel} ${series.toUpperCase()}`
}

function buildRows(definitions, series) {
  return definitions.map(([label, major, tpi]) => {
    const dims = calcWhitworthBasicDims(major, tpi)
    const slug = label.replace(/[^\w]/g, '')
    return {
      id: `ref-${series}-${slug}-${String(tpi).replace('.', '_')}`,
      system: series,
      subSeries: series,
      designation: formatDesignation(label, tpi, series),
      priority: 1,
      standardRef: 'BS 84',
      unit: 'in',
      nominal: major,
      referenceOnly: true,
      ...dims,
      toleranceExternal: '—',
      toleranceInternal: '—',
      sealing: '—',
      taper: '—',
      compatibility: 'whitworth_legacy',
      compatibilityKey: 'whitworth_legacy',
      usageKey: 'legacy',
    }
  })
}

export const BSW_ROWS = buildRows(BSW_DEFINITIONS, 'bsw')
export const BSF_ROWS = buildRows(BSF_DEFINITIONS, 'bsf')
export const WHITWORTH_REF_ROWS = [...BSW_ROWS, ...BSF_ROWS]

/** @param {'bsw'|'bsf'|'all'} series */
export function getWhitworthReferenceRows(series = 'all') {
  if (series === 'bsw') return BSW_ROWS
  if (series === 'bsf') return BSF_ROWS
  return WHITWORTH_REF_ROWS
}

/** @param {string} taxonomyId whitworth | bsw | bsf */
export function getWhitworthRowsForTaxonomy(taxonomyId) {
  if (taxonomyId === 'bsf') return BSF_ROWS
  if (taxonomyId === 'bsw') return BSW_ROWS
  return WHITWORTH_REF_ROWS
}
