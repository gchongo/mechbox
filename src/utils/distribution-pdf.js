import { DISTRIBUTIONS } from './size-chain'

const SQRT2PI = Math.sqrt(2 * Math.PI)

/** 正态 PDF */
export function normalPdf(x, mu = 0, sigma = 1) {
  if (sigma <= 0) return 0
  return (1 / (sigma * SQRT2PI)) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2)
}

/** 均匀 PDF */
export function uniformPdf(x, a, b) {
  if (x < a || x > b) return 0
  return 1 / (b - a)
}

/** 对称三角 PDF，峰值在 mu */
export function triangularPdf(x, mu, halfWidth) {
  if (halfWidth <= 0) return 0
  const a = mu - halfWidth
  const b = mu + halfWidth
  if (x < a || x > b) return 0
  const peak = 1 / halfWidth
  if (x <= mu) return peak * (x - a) / halfWidth
  return peak * (b - x) / halfWidth
}

/** 偏态 PDF（简化：对数正态近似） */
export function skewedPdf(x, mu = 0, sigma = 1) {
  const shifted = x - mu + sigma
  if (shifted <= 0) return 0
  const s = sigma * 0.6 || 0.1
  const m = Math.log(shifted)
  return (1 / (shifted * s * SQRT2PI)) * Math.exp(-((m - Math.log(sigma)) ** 2) / (2 * s * s))
}

/** 矩形分布 PDF（与均匀相同，半宽 T/2） */
export function rectangularPdf(x, mu, halfWidth) {
  return uniformPdf(x, mu - halfWidth, mu + halfWidth)
}

/** 生成 Plotly 曲线数据 */
export function buildDistributionCurve(type, tolerance = 1) {
  const dist = DISTRIBUTIONS[type] ?? DISTRIBUTIONS.normal
  const half = tolerance / 2
  const sigma = tolerance / dist.k
  const points = 120
  const span = type === 'normal' ? tolerance * 2 : tolerance * 1.2
  const x = []
  const y = []

  for (let i = 0; i <= points; i++) {
    const xi = -span / 2 + (span * i) / points
    let yi = 0
    switch (type) {
      case 'uniform':
      case 'rectangular':
        yi = rectangularPdf(xi, 0, half)
        break
      case 'triangular':
        yi = triangularPdf(xi, 0, half)
        break
      case 'skewed':
        yi = skewedPdf(xi, 0, sigma)
        break
      default:
        yi = normalPdf(xi, 0, sigma)
    }
    x.push(Number(xi.toFixed(4)))
    y.push(yi)
  }

  return {
    x,
    y,
    title: dist.name,
    tolerance,
  }
}

/** 样本偏度 */
export function calcSkewness(nums) {
  if (nums.length < 3) return null
  const n = nums.length
  const mean = nums.reduce((a, b) => a + b, 0) / n
  const variance = nums.reduce((s, x) => s + (x - mean) ** 2, 0) / n
  const std = Math.sqrt(variance)
  if (!std) return 0
  return nums.reduce((s, x) => s + ((x - mean) / std) ** 3, 0) / n
}

/** 样本峰度（超额） */
export function calcKurtosis(nums) {
  if (nums.length < 4) return null
  const n = nums.length
  const mean = nums.reduce((a, b) => a + b, 0) / n
  const variance = nums.reduce((s, x) => s + (x - mean) ** 2, 0) / n
  const std = Math.sqrt(variance)
  if (!std) return 0
  return nums.reduce((s, x) => s + ((x - mean) / std) ** 4, 0) / n - 3
}

/** 加权 RSS */
export function weightedRss(tolerances, factors) {
  const sum = tolerances.reduce((s, t, i) => {
    const f = factors[i] ?? 1
    return s + (t * f) ** 2
  }, 0)
  return Math.sqrt(sum)
}
