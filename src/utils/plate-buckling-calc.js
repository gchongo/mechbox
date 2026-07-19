/**
 * 薄板临界屈曲 — 矩形板弹性屈曲应力
 *
 * σ_cr = k · π²E / [12(1−ν²)] · (t/b)²
 * k 取边界条件表值（SSSS 单向压缩经典下限 k=4），不随 a/b 细分半波数。
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
  const edgeKey = input.edgeCondition ?? 'ssss'
  const edge = PLATE_EDGE_CONDITIONS[edgeKey] ?? PLATE_EDGE_CONDITIONS.ssss

  const aspect = a / b
  // 表值 k（SSSS≈4）。不按 a/b 半波数放大 k——长板临界应力不因此提高。
  const kEdge = edge.k
  const imperfection = calcMode !== 'simple' ? (input.imperfectionFactor ?? 0.8) : 1
  const k = kEdge * imperfection

  const D = (E * t ** 3) / (12 * (1 - nu ** 2))
  const sigmaCr = calcCriticalStress(
    { ...input, elasticModulus: E, poisson: nu, thickness: t, width: b },
    k,
  )

  const applied = input.appliedStress ?? 0
  const appliedTransverse = calcMode !== 'simple' ? (input.appliedStressTransverse ?? 0) : 0
  const combinedApplied = applied + 0.5 * appliedTransverse

  const minSafety = input.minSafety ?? 2
  const safetyFactor =
    sigmaCr > 0 && combinedApplied > 0 ? sigmaCr / combinedApplied : Infinity

  const result = {
    calcMode,
    thickness: t,
    width: b,
    length: a,
    aspectRatio: aspect,
    edgeConditionKey: edge.id,
    edgeCondition: edge.label,
    elasticModulus: E,
    poisson: nu,
    bucklingCoeffEdge: kEdge,
    bucklingCoeff: k,
    criticalStress: sigmaCr,
    appliedStress: applied,
    safetyFactor,
    minSafety,
    pass: combinedApplied <= 0 || safetyFactor >= minSafety,
    flexuralRigidity: D,
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    result.appliedStressTransverse = appliedTransverse
    result.combinedAppliedStress = combinedApplied
    result.imperfectionFactor = imperfection
    result.utilization = sigmaCr > 0 ? combinedApplied / sigmaCr : 0
  }

  if (calcMode === 'professional') {
    // 经验后屈曲承载估算：σ_pb ≈ φ · σ_cr（默认 φ=1.5），非 (σ_ult−σ_cr)
    const postBuckling = input.postBucklingFactor ?? 1.5
    result.postBucklingFactor = postBuckling
    result.postBucklingCapacity = sigmaCr * postBuckling
    result.postBucklingReserve = result.postBucklingCapacity
    result.shearStress = input.appliedShear ?? 0
    if (result.shearStress > 0) {
      const tauCr = 0.3 * sigmaCr
      result.criticalShear = tauCr
      result.shearPass = result.shearStress <= tauCr / minSafety
      result.pass = result.pass && result.shearPass
    }
    result.cylinderBuckling = input.checkCylinder ? calcCylinderExternalPressure(input) : null
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
