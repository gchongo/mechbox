/** ISO 286 轴孔配合 — 公差带与间隙/过盈计算（常用范围简化查表） */
import { calcDiameterExpansion } from '@/utils/thermal-expansion-calc'

/** 查表覆盖的名义尺寸上限 (mm) — 超出须人工复核或扩展全表 */
export const ISO286_NOMINAL_MAX = 500

export function validateIso286Nominal(nominalMm) {
  if (!(nominalMm > 0)) return { valid: false, errorKey: 'nominal_positive' }
  if (nominalMm > ISO286_NOMINAL_MAX) {
    return {
      valid: false,
      errorKey: 'nominal_out_of_table_range',
      maxNominal: ISO286_NOMINAL_MAX,
    }
  }
  return { valid: true }
}

/** 标准公差因子 i (μm) */
export function calcToleranceUnit(nominalMm) {
  const D = Math.max(nominalMm, 1)
  return 0.45 * D ** (1 / 3) + 0.001 * D
}

export const IT_GRADE_FACTORS = {
  5: 7,
  6: 10,
  7: 16,
  8: 25,
  9: 40,
  10: 64,
  11: 100,
}

/** IT 公差带宽度 (mm) */
export function calcITTolerance(nominalMm, grade) {
  const factor = IT_GRADE_FACTORS[grade]
  if (!factor) return null
  return (factor * calcToleranceUnit(nominalMm)) / 1000
}

/** 尺寸段 (mm) */
const SIZE_RANGES = [
  { max: 3, mid: 2 },
  { max: 6, mid: 4.5 },
  { max: 10, mid: 8 },
  { max: 18, mid: 14 },
  { max: 30, mid: 24 },
  { max: 50, mid: 40 },
  { max: 80, mid: 65 },
  { max: 120, mid: 100 },
  { max: 180, mid: 150 },
  { max: 250, mid: 215 },
  { max: 315, mid: 280 },
  { max: 400, mid: 360 },
  { max: 500, mid: 450 },
]

function sizeRangeMid(nominalMm) {
  for (const r of SIZE_RANGES) {
    if (nominalMm <= r.max) return r.mid
  }
  return 450
}

/**
 * 轴基本偏差 es (μm) — 常用字母
 * 正值表示轴大于公称，负值表示小于公称
 */
const SHAFT_ES_TABLE = {
  a: [ -270, -270, -280, -290, -300, -310, -320, -340, -360, -380, -400, -420, -440 ],
  b: [ -140, -150, -150, -150, -160, -170, -180, -190, -220, -240, -260, -280, -300 ],
  c: [ -60, -70, -80, -95, -110, -120, -130, -140, -170, -180, -200, -210, -230 ],
  d: [ -16, -20, -25, -30, -35, -40, -45, -50, -60, -70, -80, -90, -100 ],
  e: [ -10, -14, -18, -22, -26, -30, -34, -38, -45, -52, -58, -65, -72 ],
  f: [ -6, -7, -8, -9, -10, -11, -12, -14, -16, -18, -20, -22, -24 ],
  g: [ -4, -5, -6, -7, -8, -9, -10, -11, -13, -15, -17, -19, -21 ],
  h: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  j: [ 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6 ],
  js: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  k: [ 0, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 8, 9 ],
  n: [ 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 21 ],
  p: [ 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40 ],
  r: [ 10, 12, 15, 18, 21, 24, 27, 30, 36, 42, 48, 54, 60 ],
  s: [ 14, 16, 19, 23, 27, 31, 35, 39, 46, 53, 60, 67, 74 ],
}

/** 孔基本偏差 EI (μm) */
const HOLE_EI_TABLE = {
  B: [ 140, 150, 150, 150, 160, 170, 180, 190, 220, 240, 260, 280, 300 ],
  C: [ 60, 70, 80, 95, 110, 120, 130, 140, 170, 180, 200, 210, 230 ],
  D: [ 20, 25, 30, 35, 40, 45, 50, 55, 65, 75, 85, 95, 105 ],
  E: [ 14, 18, 22, 26, 30, 34, 38, 42, 50, 58, 65, 72, 80 ],
  F: [ 7, 8, 9, 10, 11, 12, 13, 15, 17, 19, 21, 23, 25 ],
  G: [ 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22 ],
  H: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  JS: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  K: [ -2, -3, -3, -4, -4, -5, -5, -6, -7, -8, -9, -10, -11 ],
  M: [ -3, -4, -4, -5, -6, -7, -8, -9, -11, -13, -15, -17, -19 ],
  N: [ -4, -5, -6, -7, -8, -10, -11, -13, -15, -17, -20, -22, -25 ],
  P: [ -6, -8, -10, -12, -14, -16, -18, -20, -24, -28, -32, -36, -40 ],
  R: [ -10, -12, -15, -18, -21, -24, -27, -30, -36, -42, -48, -54, -60 ],
  S: [ -14, -16, -19, -23, -27, -31, -35, -39, -46, -53, -60, -67, -74 ],
}

function rangeIndex(nominalMm) {
  for (let i = 0; i < SIZE_RANGES.length; i++) {
    if (nominalMm <= SIZE_RANGES[i].max) return i
  }
  return SIZE_RANGES.length - 1
}

function lookupDeviation(table, letter, nominalMm) {
  const idx = rangeIndex(nominalMm)
  const row = table[letter]
  if (!row) return null
  return row[idx] / 1000
}

export function parseToleranceDesignation(code) {
  const m = String(code).trim().match(/^([A-Za-z]+)(\d{1,2})$/)
  if (!m) return { errorKey: 'bad_tolerance_format' }
  const letter = m[1]
  const isHole = letter[0] === letter[0].toUpperCase()
  return { letter, grade: Number(m[2]), isHole }
}

/** 计算孔或轴的极限尺寸 (mm) */
export function calcToleranceLimits(nominalMm, designation, kind) {
  const rangeCheck = validateIso286Nominal(nominalMm)
  if (!rangeCheck.valid) return rangeCheck

  const parsed = typeof designation === 'string' ? parseToleranceDesignation(designation) : designation
  if (parsed.errorKey) return parsed

  const { letter, grade } = parsed
  const IT = calcITTolerance(nominalMm, grade)
  if (IT == null) return { errorKey: 'unsupported_it', errorParams: { grade } }

  const upperLetter = letter.toUpperCase()
  const lowerLetter = letter.toLowerCase()

  if (kind === 'hole' || parsed.isHole) {
    let EI
    if (upperLetter === 'JS') {
      EI = -IT / 2
      const ES = IT / 2
      return buildLimits(nominalMm, designation, 'hole', EI, ES, IT)
    }
    EI = lookupDeviation(HOLE_EI_TABLE, upperLetter, nominalMm)
    if (EI == null) return { errorKey: 'hole_code_unknown', errorParams: { letter } }
    const ES = EI + IT
    return buildLimits(nominalMm, designation, 'hole', EI, ES, IT)
  }

  let es
  if (lowerLetter === 'js') {
    es = IT / 2
    const ei = -IT / 2
    return buildLimits(nominalMm, designation, 'shaft', ei, es, IT)
  }
  es = lookupDeviation(SHAFT_ES_TABLE, lowerLetter, nominalMm)
  if (es == null) return { errorKey: 'shaft_code_unknown', errorParams: { letter } }
  const ei = es - IT
  return buildLimits(nominalMm, designation, 'shaft', ei, es, IT)
}

function buildLimits(nominal, designation, kind, lowerDev, upperDev, IT) {
  return {
    designation: typeof designation === 'string' ? designation : `${designation.letter}${designation.grade}`,
    kind,
    nominal: nominal,
    lowerDeviation: round(lowerDev, 5),
    upperDeviation: round(upperDev, 5),
    tolerance: round(IT, 5),
    minSize: round(nominal + lowerDev, 5),
    maxSize: round(nominal + upperDev, 5),
  }
}

/** 分析配合 */
export function analyzeFit(nominalMm, holeCode, shaftCode, calcModeOrOpts = 'simple') {
  const calcMode =
    typeof calcModeOrOpts === 'object' && calcModeOrOpts !== null
      ? calcModeOrOpts.calcMode ?? 'simple'
      : calcModeOrOpts ?? 'simple'

  const hole = calcToleranceLimits(nominalMm, holeCode, 'hole')
  if (hole.errorKey) return hole
  const shaft = calcToleranceLimits(nominalMm, shaftCode, 'shaft')
  if (shaft.errorKey) return shaft

  const maxClearance = hole.maxSize - shaft.minSize
  const minClearance = hole.minSize - shaft.maxSize
  const fitType = classifyFit(minClearance, maxClearance)

  const result = {
    calcMode,
    nominal: nominalMm,
    hole,
    shaft,
    maxClearance: round(maxClearance, 5),
    minClearance: round(minClearance, 5),
    fitType,
    fitLabelKey: fitType,
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    result.meanClearance = round((maxClearance + minClearance) / 2, 5)
    result.toleranceSpan = round(maxClearance - minClearance, 5)
    result.holeIT = hole.tolerance
    result.shaftIT = shaft.tolerance
    result.fitQuality = result.toleranceSpan > 0 ? round(result.meanClearance / result.toleranceSpan, 2) : 0
    result.pass = evaluateFitGeometry(minClearance, maxClearance)
  }

  if (calcMode === 'professional') {
    const deltaT = typeof calcModeOrOpts === 'object' ? calcModeOrOpts.deltaT ?? 0 : 0
    const alphaHole = typeof calcModeOrOpts === 'object' ? calcModeOrOpts.alphaHole ?? 11.5e-6 : 11.5e-6
    const alphaShaft = typeof calcModeOrOpts === 'object' ? calcModeOrOpts.alphaShaft ?? 11.5e-6 : 11.5e-6
    const useAlphaT =
      typeof calcModeOrOpts === 'object'
        ? calcModeOrOpts.useAlphaTemperature ?? Math.abs(deltaT) >= 100
        : Math.abs(deltaT) >= 100
    const thermalOpts = {
      referenceTemp: 20,
      alphaTempCoeff: 2.4e-5,
      useAlphaTemperature: useAlphaT,
    }
    const thermalShaft = calcDiameterExpansion(nominalMm, alphaShaft, deltaT, thermalOpts)
    const thermalHole = calcDiameterExpansion(nominalMm, alphaHole, deltaT, thermalOpts)
    const clearanceShift = thermalHole - thermalShaft
    result.thermalShift = round(clearanceShift, 5)
    result.alphaTemperatureUsed = useAlphaT
    result.minClearanceHot = round(minClearance + clearanceShift, 5)
    result.maxClearanceHot = round(maxClearance + clearanceShift, 5)
    const thermal = evaluateFitThermal(fitType, result.minClearanceHot, result.maxClearanceHot, deltaT)
    result.thermalRiskKey = thermal.thermalRiskKey
    result.pass = result.pass !== false && thermal.pass
  }

  return result
}

function classifyFit(minC, maxC) {
  if (minC >= 0) return 'clearance'
  if (maxC <= 0) return 'interference'
  return 'transition'
}

/** 几何配合是否自洽（与 fitType 分类一致） */
export function evaluateFitGeometry(minClearance, maxClearance) {
  const fitType = classifyFit(minClearance, maxClearance)
  if (fitType === 'clearance') return minClearance >= 0
  if (fitType === 'interference') return maxClearance <= 0
  return minClearance <= 0 && maxClearance >= 0
}

/** 热膨胀后配合是否仍满足设计意图 */
export function evaluateFitThermal(fitType, minClearanceHot, maxClearanceHot, deltaT = 0) {
  if (!deltaT) {
    return { pass: true, thermalRiskKey: null }
  }
  if (fitType === 'clearance' && minClearanceHot < 0) {
    return { pass: false, thermalRiskKey: 'thermal_interference_risk' }
  }
  if (fitType === 'interference' && maxClearanceHot > 0) {
    return { pass: false, thermalRiskKey: 'thermal_clearance_risk' }
  }
  if (fitType === 'transition' && minClearanceHot < 0 && maxClearanceHot < 0) {
    return { pass: false, thermalRiskKey: 'thermal_interference_risk' }
  }
  if (fitType === 'transition' && minClearanceHot > 0 && maxClearanceHot > 0) {
    return { pass: false, thermalRiskKey: 'thermal_clearance_risk' }
  }
  return { pass: true, thermalRiskKey: null }
}

const FIT_TYPE_LABELS = {
  clearance: '间隙配合',
  interference: '过盈配合',
  transition: '过渡配合',
}

export const COMMON_FITS = [
  { hole: 'H7', shaft: 'g6', label: 'H7/g6 精密间隙', use: '精密滑动轴承' },
  { hole: 'H7', shaft: 'h6', label: 'H7/h6 精密滑配', use: '定位配合' },
  { hole: 'H7', shaft: 'k6', label: 'H7/k6 过渡', use: '定位/轻压入' },
  { hole: 'H7', shaft: 'p6', label: 'H7/p6 轻过盈', use: '无键连接' },
  { hole: 'H8', shaft: 'f7', label: 'H8/f7 一般间隙', use: '一般滑动' },
  { hole: 'H8', shaft: 'h7', label: 'H8/h7 一般滑配', use: '可拆卸定位' },
  { hole: 'H9', shaft: 'd9', label: 'H9/d9 粗间隙', use: '粗糙配合' },
]

export function analyzeFitPreset(nominalMm, presetIndex) {
  const p = COMMON_FITS[presetIndex]
  if (!p) return { errorKey: 'unknown_preset' }
  return { ...analyzeFit(nominalMm, p.hole, p.shaft), preset: p }
}

export const SUPPORTED_HOLE_LETTERS = Object.keys(HOLE_EI_TABLE).concat(['JS'])
export const SUPPORTED_SHAFT_LETTERS = Object.keys(SHAFT_ES_TABLE)

/** 公差带图数据（相对公称尺寸偏移 mm） */
export function generateToleranceBandData(nominalMm, holeCode, shaftCode) {
  const fit = analyzeFit(nominalMm, holeCode, shaftCode)
  if (fit.errorKey) return fit

  const scale = 1000
  return {
    nominal: nominalMm,
    hole: {
      code: fit.hole.designation,
      yMin: fit.hole.lowerDeviation * scale,
      yMax: fit.hole.upperDeviation * scale,
      minSize: fit.hole.minSize,
      maxSize: fit.hole.maxSize,
    },
    shaft: {
      code: fit.shaft.designation,
      yMin: fit.shaft.lowerDeviation * scale,
      yMax: fit.shaft.upperDeviation * scale,
      minSize: fit.shaft.minSize,
      maxSize: fit.shaft.maxSize,
    },
    fit,
  }
}

function round(v, d) {
  const f = 10 ** d
  return Math.round(v * f) / f
}

export { FIT_TYPE_LABELS }
