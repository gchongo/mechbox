/** 过程能力指数 — 基于规格限与过程均值/标准差 */

function cdfNormalZ(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp((-z * z) / 2)
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z > 0 ? 1 - p : p
}

export function cdfNormalAt(x, mean, sigma) {
  if (sigma <= 0) return x >= mean ? 1 : 0
  return cdfNormalZ((x - mean) / sigma)
}

/**
 * @param {{ lsl: number, usl: number, mean: number, sigma: number }} params
 */
export function calcProcessCapability({ lsl, usl, mean, sigma }) {
  const processSigma = sigma > 0 ? sigma : 0
  const targetTolerance = usl - lsl
  const c = targetTolerance / (6 * processSigma || 1)
  const cpu = (usl - mean) / (3 * processSigma || 1)
  const cpl = (mean - lsl) / (3 * processSigma || 1)
  const cpk = Math.min(cpu, cpl)
  const passRateRaw =
    cdfNormalAt(usl, mean, processSigma) - cdfNormalAt(lsl, mean, processSigma)
  const passRate = Math.max(0, Math.min(1, passRateRaw))
  const sigmaLevel = Math.max(0, cpk) * 3

  return {
    c,
    cpk,
    sigmaLevel,
    passRate,
    dppm: Math.round((1 - passRate) * 1_000_000),
    cpu,
    cpl,
  }
}

export function formatCapabilitySummary(cap) {
  return {
    c: cap.c.toFixed(2),
    cpk: cap.cpk.toFixed(2),
    sigmaLevel: cap.sigmaLevel.toFixed(2),
    passRate: `${(cap.passRate * 100).toFixed(2)}%`,
    dppm: cap.dppm,
  }
}
