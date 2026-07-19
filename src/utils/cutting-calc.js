/**
 * 切削参数估算（车削为主，教材/手册量级）
 * P ≈ F·vc / (60×10³ η)，F ≈ kc · ap · f
 */

export const CUTTING_MATERIALS = {
  steel_soft: { id: 'steel_soft', kc: 1800, label: '软钢 / 低碳钢' },
  steel_hard: { id: 'steel_hard', kc: 2500, label: '调质钢' },
  cast_iron: { id: 'cast_iron', kc: 1500, label: '灰铸铁' },
  aluminum: { id: 'aluminum', kc: 700, label: '铝合金' },
  stainless: { id: 'stainless', kc: 2800, label: '不锈钢' },
}

/**
 * @param {{
 *   calcMode?: 'simple'|'complete'|'professional',
 *   materialId?: string,
 *   specificCuttingForce?: number,
 *   cuttingSpeed?: number,
 *   feed?: number,
 *   depthOfCut?: number,
 *   diameter?: number,
 *   efficiency?: number,
 *   length?: number,
 *   allowPower?: number,
 * }} input
 */
export function analyzeCutting(input = {}) {
  const calcMode = input.calcMode ?? 'simple'
  const mat = CUTTING_MATERIALS[input.materialId] ?? CUTTING_MATERIALS.steel_soft
  const kc = Math.max(100, Number(input.specificCuttingForce) || mat.kc)
  const vc = Math.max(1, Number(input.cuttingSpeed) || 120) // m/min
  const f = Math.max(0.01, Number(input.feed) || 0.2) // mm/r
  const ap = Math.max(0.05, Number(input.depthOfCut) || 1.5) // mm
  const d = Math.max(1, Number(input.diameter) || 40) // mm
  const eta = Math.max(0.3, Math.min(1, Number(input.efficiency) || 0.8))
  const L = Math.max(1, Number(input.length) || 100) // mm
  const allowP = Math.max(0.1, Number(input.allowPower) || 5) // kW

  // 主切削力 F_c (N)：kc (N/mm²) · ap · f
  const Fc = kc * ap * f
  // 切削功率 P_c (kW)：F_c · vc / (60·1000)
  const Pc = (Fc * vc) / (60 * 1000)
  const Pmotor = Pc / eta
  // 转速 n (rpm)：vc = π d n / 1000 → n = 1000 vc / (π d)
  const rpm = (1000 * vc) / (Math.PI * d)
  // 进给速度 vf (mm/min)
  const vf = f * rpm
  // 机动时间 (min)：L / vf
  const timeMin = vf > 0 ? L / vf : 0
  // 金属切除率 MRR (cm³/min)：ap·f·vc（mm²·m/min → /1000 = cm³/min）
  const mrr = (ap * f * vc) / 1000

  const result = {
    calcMode,
    materialId: mat.id,
    specificCuttingForce: kc,
    cuttingSpeed: vc,
    feed: f,
    depthOfCut: ap,
    diameter: d,
    efficiency: eta,
    length: L,
    cuttingForce: Fc,
    cuttingPower: Pc,
    motorPower: Pmotor,
    rpm,
    feedSpeed: vf,
    machiningTimeMin: timeMin,
    materialRemovalRate: mrr,
    estimateOnly: calcMode === 'simple',
    pass: false,
  }

  if (calcMode === 'simple') return result

  result.allowPower = allowP
  result.powerPass = Pmotor <= allowP + 1e-9
  result.pass = result.powerPass

  if (calcMode === 'professional') {
    // 粗略刀具寿命 Taylor：T = C / v^n
    // 默认 C 使 vc=100 m/min、n=4 时 T≈15 min（教材量级，非正式刀库）
    const C = Number(input.taylorC) || 1.5e9
    const nExp = Number(input.taylorN) || 4
    const toolLifeMin = C / vc ** nExp
    result.taylorC = C
    result.taylorN = nExp
    result.toolLifeMin = toolLifeMin
    result.lifePass = toolLifeMin >= (Number(input.minToolLife) || 15)
    result.pass = result.powerPass && result.lifePass
  }

  return result
}
