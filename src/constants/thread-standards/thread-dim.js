/**
 * ISO 68-1 / ASME B1.1 60° 螺纹基本尺寸公式
 * 用于公制与统一螺纹 — 基本尺寸（非极限公差）
 */

const PITCH_DIA_COEF = 0.649519052846
const MINOR_COEF = 1.082531754877

export function round(v, d) {
  const f = 10 ** d
  return Math.round(v * f) / f
}

/** @param {number} nominal mm @param {number} pitch mm */
export function calcMetricBasicDims(nominal, pitch) {
  return {
    major: round(nominal, 3),
    pitchDiameter: round(nominal - PITCH_DIA_COEF * pitch, 3),
    minor: round(nominal - MINOR_COEF * pitch, 3),
    pitch: round(pitch, 3),
    threadAngle: 60,
    tapDrill: round(nominal - MINOR_COEF * pitch, 2),
  }
}

/** @param {number} majorIn inch @param {number} tpi */
export function calcUnifiedBasicDims(majorIn, tpi) {
  const pitch = 1 / tpi
  return {
    major: round(majorIn, 4),
    pitchDiameter: round(majorIn - PITCH_DIA_COEF * pitch, 4),
    minor: round(majorIn - MINOR_COEF * pitch, 4),
    pitch,
    tpi,
    threadAngle: 60,
    tapDrill: round(majorIn - MINOR_COEF * pitch, 3),
  }
}

/**
 * 55° 惠氏管螺纹基本小径（外螺纹参考）
 * H = 0.960491P, 外螺纹小径 ≈ 大径 - 2×(5/8)H 简化基本值
 */
export function calcWhitworthMinor(majorIn, tpi) {
  const P = 1 / tpi
  const H = 0.960491 * P
  return round(majorIn - 2 * (5 / 8) * H, 4)
}

/** NPT 60° 外螺纹参考小径（当标准表未单列时） */
export function calcNptMinorFromMajor(majorIn, tpi) {
  const P = 1 / tpi
  const h = 0.8 * P
  return round(majorIn - 2 * (5 / 8) * h, 4)
}

export function stripNum(n) {
  return Number.isInteger(n) ? String(n) : String(n).replace(/\.0$/, '')
}
