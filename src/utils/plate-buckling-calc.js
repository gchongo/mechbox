/**
 * 薄板临界屈曲 — 矩形板弹性屈曲应力
 */

export const PLATE_EDGE_CONDITIONS = {
  ssss: { id: 'ssss', label: '四边简支', k: 4 },
  cccc: { id: 'cccc', label: '四边固支', k: 6.97 },
  scsc: { id: 'scsc', label: '对边简支/对边固支', k: 6.74 },
  sscc: { id: 'sscc', label: '长边简支/短边固支', k: 5.74 },
}

function calcCriticalStress(input, k) {
  const E = input.elasticModulus ?? 210000
  const nu = input.poisson ?? 0.3
  const t = input.thickness ?? 2
  const b = input.width ?? 200
  return (k * Math.PI ** 2 * E) / (12 * (1 - nu ** 2)) * (t / b) ** 2
}

/** 单轴压缩临界应力 */
export function calcPlateBucklingStress(input) {
  const calcMode = input.calcMode ?? 'simple'
  const E = input.elasticModulus ?? 210000
  const nu = input.poisson ?? 0.3
  const t = input.thickness ?? 2
  const b = input.width ?? 200
  const a = input.length ?? 400
  const edge = PLATE_EDGE_CONDITIONS[input.edgeCondition ?? 'ssss'] ?? PLATE_EDGE_CONDITIONS.ssss

  const aspect = a / b
  let k = edge.k
  if (aspect > 1) {
    k *= 1 + 0.1 * Math.min(aspect - 1, 2)
  }

  if (calcMode !== 'simple') {
    const imperfection = input.imperfectionFactor ?? 0.8
    k *= imperfection
  }

  const D = (E * t ** 3) / (12 * (1 - nu ** 2))
  let sigmaCrSimple = calcCriticalStress({ ...input, elasticModulus: E, poisson: nu, thickness: t, width: b }, k)

  const applied = input.appliedStress ?? 0
  const appliedTransverse = calcMode !== 'simple' ? input.appliedStressTransverse ?? 0 : 0
  const combinedApplied = applied + 0.5 * appliedTransverse

  let safetyFactor = sigmaCrSimple > 0 && combinedApplied > 0 ? sigmaCrSimple / combinedApplied : Infinity
  const minSafety = input.minSafety ?? 2

  const result = {
    calcMode,
    thickness: t,
    width: b,
    length: a,
    aspectRatio: aspect,
    edgeCondition: edge.label,
    bucklingCoeff: k,
    criticalStress: sigmaCrSimple,
    appliedStress: applied,
    safetyFactor,
    pass: combinedApplied <= 0 || safetyFactor >= minSafety,
    flexuralRigidity: D,
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    result.appliedStressTransverse = appliedTransverse
    result.combinedAppliedStress = combinedApplied
    result.imperfectionFactor = input.imperfectionFactor ?? 0.8
    result.minSafety = minSafety
    result.utilization = sigmaCrSimple ? combinedApplied / sigmaCrSimple : 0
  }

  if (calcMode === 'professional') {
    const postBuckling = input.postBucklingFactor ?? 1.5
    result.postBucklingReserve = sigmaCrSimple * postBuckling
    result.postBucklingFactor = postBuckling
    result.shearStress = input.appliedShear ?? 0
    if (result.shearStress > 0) {
      const tauCr = 0.3 * sigmaCrSimple
      result.criticalShear = tauCr
      result.shearPass = result.shearStress <= tauCr / minSafety
      result.pass = result.pass && result.shearPass
    }
    const cylinder = input.checkCylinder ? calcCylinderExternalPressure(input) : null
    result.cylinderBuckling = cylinder
  }

  return result
}

/** 圆筒壳外压屈曲（Donnell 长筒简化） */
export function calcCylinderExternalPressure(input) {
  const E = input.elasticModulus ?? 210000
  const nu = input.poisson ?? 0.3
  const t = input.thickness ?? 3
  const R = input.radius ?? 100
  const L = input.length ?? 500

  const denom = Math.sqrt(3 * (1 - nu ** 2)) * R ** 3
  const pCr = denom > 0 ? (2 * E * t ** 3) / denom : 0
  const sigmaCr = t > 0 ? (pCr * R) / t : 0

  return {
    criticalStress: sigmaCr,
    criticalPressure: pCr,
    radius: R,
    thickness: t,
    length: L,
    estimateOnly: true,
  }
}
