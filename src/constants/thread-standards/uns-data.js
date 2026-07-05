/** ASME B1.1 UNS 特殊螺距参考系列 — 非 UNC/UNF/UNEF 标准系列的统一螺纹 */

import { calcUnifiedBasicDims } from './thread-dim'

/** [label, majorIn, tpi] — 常用 UNS 特殊螺距（工程参考） */
export const UNS_DEFINITIONS = [
  ['#4', 0.112, 48],
  ['#6', 0.138, 40],
  ['#8', 0.164, 36],
  ['#10', 0.19, 32],
  ['1/4', 0.25, 28],
  ['5/16', 0.3125, 27],
  ['3/8', 0.375, 24],
  ['7/16', 0.4375, 24],
  ['1/2', 0.5, 20],
  ['9/16', 0.5625, 18],
  ['5/8', 0.625, 18],
  ['3/4', 0.75, 16],
  ['7/8', 0.875, 14],
  ['1', 1, 12],
  ['1-1/8', 1.125, 12],
  ['1-1/4', 1.25, 12],
  ['1-3/8', 1.375, 12],
  ['1-1/2', 1.5, 12],
  ['1-3/4', 1.75, 10],
  ['2', 2, 10],
  ['2-1/4', 2.25, 8],
  ['2-1/2', 2.5, 8],
  ['2-3/4', 2.75, 8],
  ['3', 3, 8],
]

function formatDesignation(label, tpi) {
  if (label.startsWith('#')) return `${label}-${tpi} UNS`
  return `${label}-${tpi} UNS`
}

function buildRows() {
  return UNS_DEFINITIONS.map(([label, major, tpi]) => {
    const dims = calcUnifiedBasicDims(major, tpi)
    const slug = label.replace(/[^\w]/g, '')
    return {
      id: `ref-uns-${slug}-${tpi}`,
      system: 'uns',
      subSeries: 'uns',
      designation: formatDesignation(label, tpi),
      priority: 1,
      standardRef: 'ASME B1.1',
      unit: 'in',
      nominal: major,
      referenceOnly: true,
      ...dims,
      toleranceExternal: '2A',
      toleranceInternal: '2B',
      sealing: '—',
      taper: '—',
      compatibility: 'uns_special',
      compatibilityKey: 'uns_special',
      usageKey: 'fastener',
    }
  })
}

export const UNS_REF_ROWS = buildRows()

export function getUnsReferenceRows() {
  return UNS_REF_ROWS
}
