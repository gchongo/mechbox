/**
 * GB/T 1800 附表 D3-1（基孔制）、D3-2（基轴制）优先与常用配合
 * preferred: true = 标准附表中带 ◢ 标记的优先配合
 */

/** @typedef {'clearance'|'transition'|'interference'} FitCategory */

/**
 * @typedef {Object} FitRecommendation
 * @property {string} hole
 * @property {string} shaft
 * @property {FitCategory} category
 * @property {boolean} [preferred]
 * @property {number} [sizeNoteMax] 脚注①：公称尺寸 ≤ 此值时类别按 transition 理解
 */

/**
 * @typedef {Object} FitRecommendationRow
 * @property {string} reference 基准孔 H6… 或基准轴 h5…
 * @property {FitRecommendation[]} fits
 */

/** @type {FitRecommendationRow[]} */
export const HOLE_BASIS_ROWS = [
  {
    reference: 'H6',
    fits: [
      { hole: 'H6', shaft: 'f5', category: 'clearance', preferred: true },
      { hole: 'H6', shaft: 'g5', category: 'clearance', preferred: true },
      { hole: 'H6', shaft: 'h5', category: 'clearance', preferred: true },
      { hole: 'H6', shaft: 'js5', category: 'transition', preferred: true },
      { hole: 'H6', shaft: 'k5', category: 'transition', preferred: true },
      { hole: 'H6', shaft: 'm5', category: 'transition', preferred: true },
      { hole: 'H6', shaft: 'n5', category: 'interference', preferred: true, sizeNoteMax: 3 },
      { hole: 'H6', shaft: 'p5', category: 'interference', preferred: true },
      { hole: 'H6', shaft: 'r5', category: 'interference', preferred: true },
      { hole: 'H6', shaft: 's5', category: 'interference', preferred: true },
      { hole: 'H6', shaft: 't5', category: 'interference', preferred: true },
    ],
  },
  {
    reference: 'H7',
    fits: [
      { hole: 'H7', shaft: 'f6', category: 'clearance', preferred: true },
      { hole: 'H7', shaft: 'g6', category: 'clearance', preferred: true },
      { hole: 'H7', shaft: 'h6', category: 'clearance', preferred: true },
      { hole: 'H7', shaft: 'js6', category: 'transition', preferred: true },
      { hole: 'H7', shaft: 'k6', category: 'transition', preferred: true },
      { hole: 'H7', shaft: 'm6', category: 'transition' },
      { hole: 'H7', shaft: 'n6', category: 'interference', preferred: true },
      { hole: 'H7', shaft: 'p6', category: 'interference', preferred: true, sizeNoteMax: 3 },
      { hole: 'H7', shaft: 'r6', category: 'interference' },
      { hole: 'H7', shaft: 's6', category: 'interference', preferred: true },
      { hole: 'H7', shaft: 't6', category: 'interference' },
      { hole: 'H7', shaft: 'u6', category: 'interference', preferred: true },
      { hole: 'H7', shaft: 'v6', category: 'interference' },
      { hole: 'H7', shaft: 'x6', category: 'interference' },
      { hole: 'H7', shaft: 'y6', category: 'interference' },
      { hole: 'H7', shaft: 'z6', category: 'interference' },
    ],
  },
  {
    reference: 'H8',
    fits: [
      { hole: 'H8', shaft: 'e7', category: 'clearance' },
      { hole: 'H8', shaft: 'f7', category: 'clearance', preferred: true },
      { hole: 'H8', shaft: 'g7', category: 'clearance' },
      { hole: 'H8', shaft: 'h7', category: 'clearance', preferred: true },
      { hole: 'H8', shaft: 'd8', category: 'clearance' },
      { hole: 'H8', shaft: 'e8', category: 'clearance' },
      { hole: 'H8', shaft: 'f8', category: 'clearance' },
      { hole: 'H8', shaft: 'h8', category: 'clearance' },
      { hole: 'H8', shaft: 'js7', category: 'transition', preferred: true },
      { hole: 'H8', shaft: 'k7', category: 'transition', preferred: true },
      { hole: 'H8', shaft: 'm7', category: 'transition' },
      { hole: 'H8', shaft: 'n7', category: 'interference' },
      { hole: 'H8', shaft: 'p7', category: 'interference' },
      { hole: 'H8', shaft: 'r7', category: 'interference', sizeNoteMax: 100 },
      { hole: 'H8', shaft: 's7', category: 'interference' },
      { hole: 'H8', shaft: 't7', category: 'interference' },
      { hole: 'H8', shaft: 'u7', category: 'interference', preferred: true },
    ],
  },
  {
    reference: 'H9',
    fits: [
      { hole: 'H9', shaft: 'c9', category: 'clearance' },
      { hole: 'H9', shaft: 'd9', category: 'clearance', preferred: true },
      { hole: 'H9', shaft: 'e9', category: 'clearance', preferred: true },
      { hole: 'H9', shaft: 'f9', category: 'clearance' },
      { hole: 'H9', shaft: 'h9', category: 'clearance', preferred: true },
    ],
  },
  {
    reference: 'H10',
    fits: [
      { hole: 'H10', shaft: 'c10', category: 'clearance' },
      { hole: 'H10', shaft: 'd10', category: 'clearance', preferred: true },
      { hole: 'H10', shaft: 'h10', category: 'clearance', preferred: true },
    ],
  },
  {
    reference: 'H11',
    fits: [
      { hole: 'H11', shaft: 'a11', category: 'clearance', preferred: true },
      { hole: 'H11', shaft: 'b11', category: 'clearance', preferred: true },
      { hole: 'H11', shaft: 'c11', category: 'clearance', preferred: true },
      { hole: 'H11', shaft: 'd11', category: 'clearance' },
      { hole: 'H11', shaft: 'h11', category: 'clearance', preferred: true },
    ],
  },
  {
    reference: 'H12',
    fits: [
      { hole: 'H12', shaft: 'b12', category: 'clearance', preferred: true },
      { hole: 'H12', shaft: 'h12', category: 'clearance' },
    ],
  },
]

/** @type {FitRecommendationRow[]} */
export const SHAFT_BASIS_ROWS = [
  {
    reference: 'h5',
    fits: [
      { hole: 'F6', shaft: 'h5', category: 'clearance' },
      { hole: 'G6', shaft: 'h5', category: 'clearance', preferred: true },
      { hole: 'H6', shaft: 'h5', category: 'clearance', preferred: true },
      { hole: 'JS6', shaft: 'h5', category: 'transition' },
      { hole: 'K6', shaft: 'h5', category: 'transition' },
      { hole: 'M6', shaft: 'h5', category: 'transition' },
      { hole: 'N6', shaft: 'h5', category: 'interference' },
      { hole: 'P6', shaft: 'h5', category: 'interference', preferred: true },
      { hole: 'R6', shaft: 'h5', category: 'interference' },
      { hole: 'S6', shaft: 'h5', category: 'interference', preferred: true },
      { hole: 'T6', shaft: 'h5', category: 'interference' },
    ],
  },
  {
    reference: 'h6',
    fits: [
      { hole: 'F7', shaft: 'h6', category: 'clearance' },
      { hole: 'G7', shaft: 'h6', category: 'clearance' },
      { hole: 'H7', shaft: 'h6', category: 'clearance', preferred: true },
      { hole: 'JS7', shaft: 'h6', category: 'transition' },
      { hole: 'K7', shaft: 'h6', category: 'transition' },
      { hole: 'M7', shaft: 'h6', category: 'transition' },
      { hole: 'N7', shaft: 'h6', category: 'interference' },
      { hole: 'P7', shaft: 'h6', category: 'interference', preferred: true },
      { hole: 'R7', shaft: 'h6', category: 'interference' },
      { hole: 'S7', shaft: 'h6', category: 'interference', preferred: true },
      { hole: 'T7', shaft: 'h6', category: 'interference' },
      { hole: 'U7', shaft: 'h6', category: 'interference', preferred: true },
    ],
  },
  {
    reference: 'h7',
    fits: [
      { hole: 'E8', shaft: 'h7', category: 'clearance' },
      { hole: 'F8', shaft: 'h7', category: 'clearance', preferred: true },
      { hole: 'H8', shaft: 'h7', category: 'clearance', preferred: true },
      { hole: 'JS8', shaft: 'h7', category: 'transition' },
      { hole: 'K8', shaft: 'h7', category: 'transition' },
      { hole: 'M8', shaft: 'h7', category: 'transition' },
      { hole: 'N8', shaft: 'h7', category: 'interference' },
    ],
  },
  {
    reference: 'h8',
    fits: [
      { hole: 'D8', shaft: 'h8', category: 'clearance' },
      { hole: 'E8', shaft: 'h8', category: 'clearance' },
      { hole: 'F8', shaft: 'h8', category: 'clearance', preferred: true },
      { hole: 'H8', shaft: 'h8', category: 'clearance', preferred: true },
    ],
  },
  {
    reference: 'h9',
    fits: [
      { hole: 'D9', shaft: 'h9', category: 'clearance', preferred: true },
      { hole: 'E9', shaft: 'h9', category: 'clearance' },
      { hole: 'F9', shaft: 'h9', category: 'clearance' },
      { hole: 'H9', shaft: 'h9', category: 'clearance', preferred: true },
    ],
  },
  {
    reference: 'h10',
    fits: [
      { hole: 'D10', shaft: 'h10', category: 'clearance' },
      { hole: 'H10', shaft: 'h10', category: 'clearance' },
    ],
  },
  {
    reference: 'h11',
    fits: [
      { hole: 'A11', shaft: 'h11', category: 'clearance' },
      { hole: 'B11', shaft: 'h11', category: 'clearance' },
      { hole: 'C11', shaft: 'h11', category: 'clearance', preferred: true },
      { hole: 'D11', shaft: 'h11', category: 'clearance', preferred: true },
      { hole: 'H11', shaft: 'h11', category: 'clearance', preferred: true },
    ],
  },
  {
    reference: 'h12',
    fits: [
      { hole: 'B12', shaft: 'h12', category: 'clearance' },
      { hole: 'H12', shaft: 'h12', category: 'clearance' },
    ],
  },
]

export const FIT_CATEGORY_ORDER = ['clearance', 'transition', 'interference']

export const HOLE_BASIS_META = {
  id: 'hole-basis',
  appendix: 'D3-1',
  referenceColumnKey: 'referenceHole',
}

export const SHAFT_BASIS_META = {
  id: 'shaft-basis',
  appendix: 'D3-2',
  referenceColumnKey: 'referenceShaft',
}

/** @param {FitRecommendation} fit @param {number} nominalMm */
export function effectiveFitCategory(fit, nominalMm) {
  if (fit.sizeNoteMax != null && nominalMm <= fit.sizeNoteMax) return 'transition'
  return fit.category
}

/** @param {string} hole @param {string} shaft */
export function fitPairKey(hole, shaft) {
  return `${String(hole).toUpperCase()}/${String(shaft).toLowerCase()}`
}

/** @param {FitRecommendationRow[]} rows */
export function fitsForCategory(row, category) {
  return row.fits.filter((f) => f.category === category)
}
