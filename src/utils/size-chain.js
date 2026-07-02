/** 分布类型 K 值（标准差系数） */
export const DISTRIBUTIONS = {
  normal: { k: 6.0, cv: 1.0, coverage: 0.9973, name: '正态分布' },
  uniform: { k: 3.46, cv: 0.577, coverage: 1.0, name: '均匀分布' },
  rectangular: { k: 3.46, cv: 0.577, coverage: 1.0, name: '矩形分布' },
  triangular: { k: 4.24, cv: 0.707, coverage: 0.95, name: '三角分布' },
  skewed: { k: 5.0, cv: 0.8, coverage: 0.98, name: '偏态分布' },
}

export function toleranceToSigma(tolerance, distribution = 'normal') {
  return tolerance / DISTRIBUTIONS[distribution].k
}

export function sigmaToTolerance(sigma, distribution = 'normal') {
  return sigma * DISTRIBUTIONS[distribution].k
}

function cdfNormal(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989423 * Math.exp((-x * x) / 2)
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return x > 0 ? 1 - p : p
}

export function calculateSigmaLevel(tolerance, sigma) {
  if (!sigma) return 0
  return tolerance / (6 * sigma)
}

export function calculateCpk(upperSpec, lowerSpec, mean, sigma) {
  if (!sigma) return 0
  const cpu = (upperSpec - mean) / (3 * sigma)
  const cpl = (mean - lowerSpec) / (3 * sigma)
  return Math.min(cpu, cpl)
}

export function calculatePassRate(sigmaLevel) {
  return 2 * cdfNormal(sigmaLevel) - 1
}

export function calculateDPPM(passRate) {
  return (1 - passRate) * 1_000_000
}

export {
  worstCaseMethod,
  rssMethod,
  calculateWorstCaseLimits,
  calculateRssLimits,
  calculateModifiedRssLimits,
  modifiedRssMethod,
  RSS_CORRECTION,
  calculateSizeChain,
  buildFormulaLines,
  buildFormulaLatex,
  buildSigmaSummary,
} from './size-chain-math'
