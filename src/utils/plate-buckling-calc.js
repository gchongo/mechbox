/**
 * 薄板临界屈曲 — 矩形板弹性屈曲应力
 */

export const PLATE_EDGE_CONDITIONS = {
  ssss: { id: 'ssss', label: '四边简支', k: 4 },
  cccc: { id: 'cccc', label: '四边固支', k: 6.97 },
  scsc: { id: 'scsc', label: '对边简支/对边固支', k: 6.74 },
  sscc: { id: 'sscc', label: '长边简支/短边固支', k: 5.74 },
}

/** 单轴压缩临界应力 σ_cr = k · π² · E / (12(1-ν²)) · (t/b)² */
export function calcPlateBucklingStress(input) {
  const E = input.elasticModulus ?? 210000
  const nu = input.poisson ?? 0.3
  const t = input.thickness ?? 2
  const b = input.width ?? 200
  const a = input.length ?? 400
  const edge = PLATE_EDGE_CONDITIONS[input.edgeCondition ?? 'ssss'] ?? PLATE_EDGE_CONDITIONS.ssss

  // 宽高比修正 k
  const aspect = a / b
  let k = edge.k
  if (aspect > 1) {
    k *= 1 + 0.1 * Math.min(aspect - 1, 2)
  }

  const D = (E * t ** 3) / (12 * (1 - nu ** 2))
  const sigmaCr = (k * Math.PI ** 2 * D) / (t ** 2 * b ** 2) * (12 * (1 - nu ** 2)) / E
  // Simplified: σ_cr = k * π² * E / (12(1-ν²)) * (t/b)²
  const sigmaCrSimple = (k * Math.PI ** 2 * E) / (12 * (1 - nu ** 2)) * (t / b) ** 2

  const applied = input.appliedStress ?? 0
  const safetyFactor = sigmaCrSimple > 0 && applied > 0 ? sigmaCrSimple / applied : Infinity

  return {
    thickness: t,
    width: b,
    length: a,
    aspectRatio: aspect,
    edgeCondition: edge.label,
    bucklingCoeff: k,
    criticalStress: sigmaCrSimple,
    appliedStress: applied,
    safetyFactor,
    pass: applied <= 0 || safetyFactor >= (input.minSafety ?? 2),
    flexuralRigidity: D,
  }
}

/** 圆筒壳外压屈曲（简化） */
export function calcCylinderExternalPressure(input) {
  const E = input.elasticModulus ?? 210000
  const nu = input.poisson ?? 0.3
  const t = input.thickness ?? 3
  const R = (input.radius ?? 100)
  const L = input.length ?? 500

  const sigmaCr = (E / Math.sqrt(3 * (1 - nu ** 2))) * (t / R)
  const pCr = (sigmaCr * t) / R // MPa·mm/mm → N/mm² 量级

  return {
    criticalStress: sigmaCr,
    criticalPressure: pCr,
    radius: R,
    thickness: t,
    length: L,
  }
}
