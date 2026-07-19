/**
 * 简单传热估算
 * 导热：Q = k A ΔT / L
 * 对流：Q = h A ΔT
 * 综合热阻串联
 */

export function conductionPower({ k, area, deltaT, thickness }) {
  const kk = Math.max(1e-6, Number(k) || 0)
  const A = Math.max(1e-9, Number(area) || 0)
  const dT = Number(deltaT) || 0
  const L = Math.max(1e-6, Number(thickness) || 0)
  return (kk * A * dT) / L
}

export function convectionPower({ h, area, deltaT }) {
  const hh = Math.max(0, Number(h) || 0)
  const A = Math.max(1e-9, Number(area) || 0)
  const dT = Number(deltaT) || 0
  return hh * A * dT
}

/**
 * @param {{
 *   calcMode?: 'simple'|'complete'|'professional',
 *   mode?: 'conduction'|'convection'|'series',
 *   conductivity?: number,
 *   thickness?: number,
 *   area?: number,
 *   deltaT?: number,
 *   hConv?: number,
 *   allowPower?: number,
 *   ambientTemp?: number,
 *   surfaceTemp?: number,
 * }} input
 * k W/(m·K)，A m²，L m，ΔT K，h W/(m²·K)，Q W
 */
export function analyzeHeatTransfer(input = {}) {
  const calcMode = input.calcMode ?? 'simple'
  const mode = input.mode ?? 'conduction'
  const k = Math.max(0.01, Number(input.conductivity) || 50)
  const L = Math.max(1e-4, Number(input.thickness) || 0.005)
  const A = Math.max(1e-6, Number(input.area) || 0.01)
  const h = Math.max(1, Number(input.hConv) || 10)
  let dT = Number(input.deltaT)
  if (!Number.isFinite(dT)) {
    const Ts = Number(input.surfaceTemp)
    const Ta = Number(input.ambientTemp)
    dT = Number.isFinite(Ts) && Number.isFinite(Ta) ? Ts - Ta : 40
  }
  const allowQ = Math.max(1, Number(input.allowPower) || 100)

  let Q = 0
  let Rth = 0
  if (mode === 'convection') {
    Q = convectionPower({ h, area: A, deltaT: dT })
    Rth = A > 0 ? 1 / (h * A) : Infinity
  } else if (mode === 'series') {
    const Rc = L / (k * A)
    const Rh = 1 / (h * A)
    Rth = Rc + Rh
    Q = Rth > 0 ? dT / Rth : 0
  } else {
    Q = conductionPower({ k, area: A, deltaT: dT, thickness: L })
    Rth = A > 0 ? L / (k * A) : Infinity
  }

  const heatFlux = A > 0 ? Q / A : 0

  const result = {
    calcMode,
    mode,
    conductivity: k,
    thickness: L,
    area: A,
    hConv: h,
    deltaT: dT,
    power: Q,
    thermalResistance: Rth,
    heatFlux,
    estimateOnly: calcMode === 'simple',
    pass: false,
  }

  if (calcMode === 'simple') return result

  result.allowPower = allowQ
  // 完整：散热能力 Q ≥ 允许负荷（设备发热需带走）
  result.capacityPass = Q >= allowQ - 1e-9
  result.pass = result.capacityPass

  if (calcMode === 'professional') {
    // 表面过热粗判：等效 ΔT_eq = Q_allow · Rth
    result.equivDeltaT = allowQ * Rth
    result.maxSurfaceRise = Number(input.maxSurfaceRise) || 60
    result.tempPass = result.equivDeltaT <= result.maxSurfaceRise + 1e-9
    result.pass = result.capacityPass && result.tempPass
  }

  return result
}
