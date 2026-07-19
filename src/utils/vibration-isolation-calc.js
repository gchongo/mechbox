/**
 * 单自由度隔振：位移传递率
 * TR = √(1+(2ζr)²) / √((1−r²)²+(2ζr)²)，r = f/fn
 */

const DEG = Math.PI / 180

/** 橡胶减振器示意选型库（刚度 N/m，载荷 kg） */
export const RUBBER_MOUNT_CATALOG = {
  cyl_soft: {
    id: 'cyl_soft',
    label: '圆柱软胶',
    stiffness: 12000,
    dampingRatio: 0.1,
    maxLoadKg: 25,
    style: 'cylindrical',
  },
  cyl_med: {
    id: 'cyl_med',
    label: '圆柱中硬',
    stiffness: 28000,
    dampingRatio: 0.07,
    maxLoadKg: 60,
    style: 'cylindrical',
  },
  cyl_hard: {
    id: 'cyl_hard',
    label: '圆柱硬胶',
    stiffness: 55000,
    dampingRatio: 0.05,
    maxLoadKg: 120,
    style: 'cylindrical',
  },
  shear_pad: {
    id: 'shear_pad',
    label: '剪切垫',
    stiffness: 18000,
    dampingRatio: 0.12,
    maxLoadKg: 40,
    style: 'pad',
  },
  conical: {
    id: 'conical',
    label: '锥形减振器',
    stiffness: 40000,
    dampingRatio: 0.08,
    maxLoadKg: 90,
    style: 'conical',
  },
}

export function getRubberMount(id) {
  return RUBBER_MOUNT_CATALOG[id] ?? null
}

export function naturalFreqHz(stiffnessNPerM, massKg) {
  const k = Math.max(1e-6, Number(stiffnessNPerM) || 0)
  const m = Math.max(1e-6, Number(massKg) || 0)
  return (1 / (2 * Math.PI)) * Math.sqrt(k / m)
}

export function transmissibility(r, zeta) {
  const rr = Math.max(0, Number(r) || 0)
  const z = Math.max(0.001, Number(zeta) || 0.05)
  const num = Math.sqrt(1 + (2 * z * rr) ** 2)
  const den = Math.sqrt((1 - rr ** 2) ** 2 + (2 * z * rr) ** 2)
  if (den < 1e-12) return Infinity
  return num / den
}

/**
 * @param {{
 *   calcMode?: 'simple'|'complete'|'professional',
 *   mass?: number,
 *   stiffness?: number,
 *   dampingRatio?: number,
 *   excitationFreq?: number,
 *   maxTransmissibility?: number,
 *   isolationTargetDb?: number,
 * }} input
 * mass kg，stiffness N/m，excitationFreq Hz
 */
export function analyzeVibrationIsolation(input = {}) {
  const calcMode = input.calcMode ?? 'simple'
  const mass = Math.max(0.01, Number(input.mass) || 50)
  const mountId = input.mountId || null
  const mount = mountId ? getRubberMount(mountId) : null
  const mountCount = Math.max(1, Math.round(Number(input.mountCount) || 4))
  // 预设支座：单座刚度并联 → 总刚度；手动：输入为总刚度 k
  const perMountK = mount ? mount.stiffness : null
  const k = Math.max(
    1,
    mount ? perMountK * mountCount : Number(input.stiffness) || 20000,
  )
  const zeta = Math.max(
    0.001,
    Math.min(0.5, Number(input.dampingRatio) || mount?.dampingRatio || 0.05),
  )
  const f = Math.max(0, Number(input.excitationFreq) || 20)
  const maxTR = Math.max(0.05, Number(input.maxTransmissibility) || 0.2)
  const targetDb = Number(input.isolationTargetDb) || 10

  const fn = naturalFreqHz(k, mass)
  const r = fn > 0 ? f / fn : 0
  const TR = f > 0 ? transmissibility(r, zeta) : 0
  // 隔振效率 η_iso = 1 − TR（力传递，0~1）
  const isolationEff = TR > 0 && TR < 1 ? 1 - TR : TR >= 1 ? 0 : 1
  // 隔振量：A_dB = −20 log10(TR)（位移/力传递率）
  const isolationDb = TR > 0 ? -20 * Math.log10(Math.max(TR, 1e-9)) : 0
  const staticDeflectionMm = ((mass * 9.81) / k) * 1000
  const loadPerMountKg = mass / mountCount

  const result = {
    calcMode,
    mass,
    stiffness: k,
    perMountStiffness: perMountK,
    dampingRatio: zeta,
    excitationFreq: f,
    naturalFreq: fn,
    frequencyRatio: r,
    transmissibility: TR,
    isolationEfficiency: isolationEff,
    isolationDb,
    staticDeflectionMm,
    mountId: mount?.id ?? null,
    mountStyle: mount?.style ?? null,
    mountCount,
    loadPerMountKg,
    mountLoadPass: mount ? loadPerMountKg <= mount.maxLoadKg : null,
    estimateOnly: calcMode === 'simple',
    pass: false,
  }

  if (calcMode === 'simple') return result

  // 完整：要求进入隔振区 r>√2 且 TR ≤ 目标
  result.maxTransmissibility = maxTR
  result.aboveIsolationRegion = r > Math.SQRT2 * (1 + 1e-12)
  result.trPass = TR > 0 && TR <= maxTR + 1e-9
  result.pass = result.aboveIsolationRegion && result.trPass
  if (result.mountLoadPass === false) result.pass = false

  if (calcMode === 'professional') {
    result.isolationTargetDb = targetDb
    result.dbPass = isolationDb >= targetDb - 1e-9
    // 推荐总刚度使 r≈2.5 @ 给定 f：fn = f/2.5，k = (2π fn)² m
    const fnTarget = f > 0 ? f / 2.5 : fn
    result.recommendedStiffness = mass * (2 * Math.PI * fnTarget) ** 2
    result.recommendedPerMountStiffness = result.recommendedStiffness / mountCount
    result.pass = result.aboveIsolationRegion && result.trPass && result.dbPass
    if (result.mountLoadPass === false) result.pass = false

    // 按「并联总刚度」贴近推荐总刚度选型，并优先载荷合格
    const candidates = Object.values(RUBBER_MOUNT_CATALOG).map((m) => {
      const totalK = m.stiffness * mountCount
      return {
        ...m,
        totalStiffness: totalK,
        deltaK: Math.abs(totalK - result.recommendedStiffness),
        loadOk: loadPerMountKg <= m.maxLoadKg,
      }
    })
    candidates.sort((a, b) => {
      if (a.loadOk !== b.loadOk) return a.loadOk ? -1 : 1
      return a.deltaK - b.deltaK
    })
    result.suggestedMount = candidates[0] ?? null
  }

  return result
}

export { DEG }
