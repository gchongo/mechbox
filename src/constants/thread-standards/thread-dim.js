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
 * BS 84 Whitworth 55° 平行螺纹基本尺寸（外螺纹参考）
 * d2 = d - 0.6403P, d1 = d - 1.2806P
 */
export function calcWhitworthBasicDims(majorIn, tpi) {
  const pitch = 1 / tpi
  const pdCoef = 0.6403
  const minorCoef = 1.2806
  return {
    major: round(majorIn, 4),
    pitchDiameter: round(majorIn - pdCoef * pitch, 4),
    minor: round(majorIn - minorCoef * pitch, 4),
    pitch,
    tpi,
    threadAngle: 55,
    tapDrill: round(majorIn - minorCoef * pitch, 3),
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

/**
 * ISO 290 / DIN 103 公制梯形 Tr — 30° 牙型基本尺寸（外螺纹参考）
 * d2 = d - 0.5P, d3 = d - P
 */
export function calcTrapezoidalBasicDims(nominal, pitch) {
  return {
    major: round(nominal, 3),
    pitchDiameter: round(nominal - 0.5 * pitch, 3),
    minor: round(nominal - pitch, 3),
    pitch: round(pitch, 3),
    threadAngle: 30,
    tapDrill: round(nominal - pitch, 2),
  }
}

/**
 * ASME B1.5 通用 Acme — 29° 牙型基本尺寸（简化参考）
 */
export function calcAcmeBasicDims(majorIn, tpi) {
  const pitch = 1 / tpi
  return {
    major: round(majorIn, 4),
    pitchDiameter: round(majorIn - 0.5 * pitch, 4),
    minor: round(majorIn - pitch, 4),
    pitch,
    tpi,
    threadAngle: 29,
    tapDrill: round(majorIn - pitch, 3),
  }
}

export function stripNum(n) {
  return Number.isInteger(n) ? String(n) : String(n).replace(/\.0$/, '')
}
