import { calcProcessCapability } from './process-capability'

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

/** Cp 等价：T/(6σ) — 全公差带除以 6σ 过程 spread；居中时 C = Cp，≠ 3·Cpk（除非居中） */
export function calculateToleranceOver6Sigma(tolerance, sigma) {
  if (!sigma) return 0
  return tolerance / (6 * sigma)
}

/** @alias calculateToleranceOver6Sigma — RSS 链常用 T/(6σ) 粗估过程 σ */
export function calculateSigmaLevel(tolerance, sigma) {
  return calculateToleranceOver6Sigma(tolerance, sigma)
}

export function calculateCpk(upperSpec, lowerSpec, mean, sigma) {
  if (!sigma) return 0
  const cpu = (upperSpec - mean) / (3 * sigma)
  const cpl = (mean - lowerSpec) / (3 * sigma)
  return Math.min(cpu, cpl)
}

export function calculatePassRate(sigmaLevelOrOptions, mean, sigma, lsl, usl) {
  if (typeof sigmaLevelOrOptions === 'object' && sigmaLevelOrOptions != null) {
    const { lsl: lo, usl: hi, mean: mu, sigma: s } = sigmaLevelOrOptions
    return calcProcessCapability({ lsl: lo, usl: hi, mean: mu, sigma: s }).passRate
  }
  if (mean != null && sigma != null && lsl != null && usl != null) {
    return calcProcessCapability({ lsl, usl, mean, sigma }).passRate
  }
  return 2 * cdfNormal(sigmaLevelOrOptions) - 1
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
  getModifiedRssBreakdown,
  MODIFIED_RSS_DISCLAIMER,
  RSS_CORRECTION_META,
  RSS_CORRECTION,
  calculateSizeChain,
  buildFormulaLines,
  buildFormulaLatex,
  buildSigmaSummary,
  sigma6RssMethod,
} from './size-chain-math'

export {
  calculateGdtChain,
  calculateChainResult,
  getGdtCalcMode,
  isExtendedAnalysisType,
  GDT_CALC_MODES,
} from './gdt-chain'
