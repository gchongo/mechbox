/**
 * AQL 抽样检验 — GB/T 2828.1 / ISO 2859-1 简化查表
 */

/** 检验水平 II 样本量字码（批量 → 字码） */
const SAMPLE_SIZE_CODE = [
  { max: 8, code: 'A' },
  { max: 15, code: 'B' },
  { max: 25, code: 'C' },
  { max: 50, code: 'D' },
  { max: 90, code: 'E' },
  { max: 150, code: 'F' },
  { max: 280, code: 'G' },
  { max: 500, code: 'H' },
  { max: 1200, code: 'J' },
  { max: 3200, code: 'K' },
  { max: 10000, code: 'L' },
  { max: 35000, code: 'M' },
  { max: 150000, code: 'N' },
  { max: 500000, code: 'P' },
  { max: Infinity, code: 'Q' },
]

/** 字码 → 样本量 n（检验水平 II） */
const CODE_TO_N = {
  A: 2, B: 3, C: 5, D: 8, E: 13, F: 20, G: 32, H: 50,
  J: 80, K: 125, L: 200, M: 315, N: 500, P: 800, Q: 1250,
}

/**
 * Ac/Re 表简化（AQL 1.0, 1.5, 2.5, 4.0 — 正常检验）
 * key: `${code}-${aql}`
 */
const ACCEPT_REJECT = {
  'A-1.0': [0, 1], 'A-1.5': [0, 1], 'A-2.5': [0, 1], 'A-4.0': [0, 1],
  'B-1.0': [0, 1], 'B-1.5': [0, 1], 'B-2.5': [0, 1], 'B-4.0': [0, 1],
  'C-1.0': [0, 1], 'C-1.5': [0, 1], 'C-2.5': [0, 1], 'C-4.0': [1, 2],
  'D-1.0': [0, 1], 'D-1.5': [0, 1], 'D-2.5': [1, 2], 'D-4.0': [1, 2],
  'E-1.0': [0, 1], 'E-1.5': [1, 2], 'E-2.5': [1, 2], 'E-4.0': [2, 3],
  'F-1.0': [1, 2], 'F-1.5': [1, 2], 'F-2.5': [2, 3], 'F-4.0': [3, 4],
  'G-1.0': [1, 2], 'G-1.5': [2, 3], 'G-2.5': [3, 4], 'G-4.0': [5, 6],
  'H-1.0': [2, 3], 'H-1.5': [3, 4], 'H-2.5': [5, 6], 'H-4.0': [7, 8],
  'J-1.0': [3, 4], 'J-1.5': [5, 6], 'J-2.5': [7, 8], 'J-4.0': [10, 11],
  'K-1.0': [5, 6], 'K-1.5': [7, 8], 'K-2.5': [10, 11], 'K-4.0': [14, 15],
  'L-1.0': [7, 8], 'L-1.5': [10, 11], 'L-2.5': [14, 15], 'L-4.0': [21, 22],
  'M-1.0': [10, 11], 'M-1.5': [14, 15], 'M-2.5': [21, 22], 'M-4.0': [21, 22],
  'N-1.0': [14, 15], 'N-1.5': [21, 22], 'N-2.5': [21, 22], 'N-4.0': [21, 22],
  'P-1.0': [21, 22], 'P-1.5': [21, 22], 'P-2.5': [21, 22], 'P-4.0': [21, 22],
  'Q-1.0': [21, 22], 'Q-1.5': [21, 22], 'Q-2.5': [21, 22], 'Q-4.0': [21, 22],
}

export const AQL_LEVELS = [1.0, 1.5, 2.5, 4.0]

export function getSampleSizeCode(lotSize) {
  const lot = Math.max(lotSize, 1)
  for (const row of SAMPLE_SIZE_CODE) {
    if (lot <= row.max) return row.code
  }
  return 'Q'
}

export function designAQLPlan({ lotSize, aql = 2.5, defectCount = 0 }) {
  const code = getSampleSizeCode(lotSize)
  const sampleSize = CODE_TO_N[code] ?? 125
  const key = `${code}-${aql}`
  const [Ac, Re] = ACCEPT_REJECT[key] ?? [0, 1]

  let decisionKey = 'pending'
  if (defectCount <= Ac) decisionKey = 'accept'
  else if (defectCount >= Re) decisionKey = 'reject'

  return {
    lotSize,
    aql,
    sampleSizeCode: code,
    sampleSize: Math.min(sampleSize, lotSize),
    acceptNumber: Ac,
    rejectNumber: Re,
    defectCount,
    decisionKey,
    pass: defectCount <= Ac,
    inspectionLevelKey: 'level_ii_normal',
  }
}

/** OC 曲线点 — 二项分布近似 P(accept) */
export function calcOCCurve(lotSize, aql, sampleSize, acceptNumber, points = 20) {
  const n = sampleSize
  const Ac = acceptNumber
  const curve = []
  for (let i = 0; i <= points; i++) {
    const p = (i / points) * 0.2 // 0–20% 不合格率
    let pa = 0
    for (let d = 0; d <= Ac; d++) {
      pa += binomialPMF(n, d, p)
    }
    curve.push({ defectRate: p, acceptProb: pa })
  }
  return curve
}

function binomialPMF(n, k, p) {
  return combination(n, k) * p ** k * (1 - p) ** (n - k)
}

function combination(n, k) {
  if (k > n || k < 0) return 0
  let r = 1
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1)
  return r
}
