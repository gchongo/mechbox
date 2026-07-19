/**
 * 螺栓组受力 — 简化 / 矢量分解 / 专业（逐栓表格 + 许用校核 + 摩擦抗滑 + 撬力）
 */

/** 圆周均布螺栓坐标 (相对形心) */
export function generateCircleBoltPositions(count, radius) {
  const positions = []
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count
    positions.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      angleDeg: (angle * 180) / Math.PI,
    })
  }
  return positions
}

/** 摩擦抗滑承载力 μ·ΣF_clamp */
export function calcSlipResistance(frictionCoeff, clampForcePerBolt, boltCount) {
  const mu = frictionCoeff ?? 0
  const n = boltCount ?? 1
  const clampTotal = (clampForcePerBolt ?? 0) * n
  return {
    frictionCoeff: mu,
    clampForcePerBolt: clampForcePerBolt ?? 0,
    clampForceTotal: clampTotal,
    slipCapacity: mu * clampTotal,
  }
}

/** 撬力引起的附加栓拉力（简化杠杆模型；pryingArm≤0 时不启用撬力） */
export function calcPryingTension(input) {
  const n = input.boltCount ?? 4
  const M = input.moment ?? 0
  const axialGroup = input.axialTension ?? 0
  const pryingArm = input.pryingArm ?? 0
  const directTension = axialGroup / n
  const pryingTension = M > 0 && pryingArm > 0 ? M / (n * pryingArm) : 0
  return {
    directTension,
    pryingTension,
    totalTension: directTension + pryingTension,
  }
}

/** 剪拉合成栓力 */
export function calcCombinedBoltForce(shearForce, tensionForce) {
  const v = shearForce ?? 0
  const t = tensionForce ?? 0
  return Math.sqrt(v ** 2 + t ** 2)
}

/** 剪拉交互 (von Mises 简化) */
export function assessBoltInteraction(shearForce, tensionForce, allowShear, allowTension) {
  const vs = allowShear > 0 ? shearForce / allowShear : 0
  const ts = allowTension > 0 ? tensionForce / allowTension : 0
  const utilization = Math.sqrt(vs ** 2 + ts ** 2)
  return {
    utilization,
    pass: utilization <= 1,
  }
}

/** 简化：均匀分配 + 极惯性矩近似 */
export function analyzeBoltGroupSimple(input) {
  const n = input.boltCount ?? 4
  const radius = input.boltCircleRadius ?? 50
  const Fx = input.shearX ?? 0
  const Fy = input.shearY ?? 0
  const M = input.moment ?? 0
  const rMax = radius
  const J = n * rMax ** 2
  const direct = Math.sqrt(Fx ** 2 + Fy ** 2) / n
  const torsion = (M * rMax) / J
  const maxForce = direct + torsion
  const allow = input.allowPerBolt ?? 8000
  const forcePass = maxForce <= allow
  return {
    calcMode: 'simple',
    directPerBolt: direct,
    torsionPerBolt: torsion,
    maxBoltForce: maxForce,
    forcePass,
    pass: false,
    estimateOnly: true,
    allowPerBolt: allow,
    boltCount: n,
  }
}

/** 完整/专业：逐栓矢量叠加 F_i = F/n + M×r/I_p
 * - complete：矢量合成 + 剪力许用
 * - professional：另含撬力附加拉力、摩擦抗滑、剪拉交互
 */
export function analyzeBoltGroupComplete(input) {
  const isPro = input.calcMode === 'professional'
  const n = input.boltCount ?? 4
  const radius = input.boltCircleRadius ?? 50
  const Fx = input.shearX ?? 0
  const Fy = input.shearY ?? 0
  const M = input.moment ?? 0
  const allowShear = input.allowPerBolt ?? 8000
  const allowTension = input.allowTensionPerBolt ?? allowShear

  const positions = input.boltPositions ?? generateCircleBoltPositions(n, radius)
  const Ip = positions.reduce((s, p) => s + p.x ** 2 + p.y ** 2, 0)
  if (!Ip) return { errorKey: 'bolt_group_invalid_positions' }

  const rMax = Math.max(...positions.map((p) => Math.hypot(p.x, p.y)))
  /** 最大半径处扭剪幅值 M·r_max/I_p（圆周均布时各栓相同） */
  const torsionPerBolt = (M * rMax) / Ip

  const prying = calcPryingTension({
    ...input,
    boltCount: n,
    pryingArm: isPro ? input.pryingArm : 0,
    axialTension: isPro ? input.axialTension : 0,
  })
  const tensionPerBolt = prying.totalTension

  const bolts = positions.map((p, i) => {
    const fx = Fx / n - (M * p.y) / Ip
    const fy = Fy / n + (M * p.x) / Ip
    const shear = Math.sqrt(fx ** 2 + fy ** 2)
    const combined = calcCombinedBoltForce(shear, tensionPerBolt)
    const interaction = assessBoltInteraction(shear, tensionPerBolt, allowShear, allowTension)
    return {
      index: i + 1,
      x: round(p.x, 2),
      y: round(p.y, 2),
      fx: round(fx, 1),
      fy: round(fy, 1),
      force: round(shear, 1),
      shearForce: round(shear, 1),
      tensionForce: round(tensionPerBolt, 1),
      combinedForce: round(combined, 1),
      pass: interaction.pass,
    }
  })

  const maxBolt = bolts.reduce((a, b) => (b.combinedForce > a.combinedForce ? b : a), bolts[0])
  const directPerBolt = Math.sqrt(Fx ** 2 + Fy ** 2) / n

  const shearResultant = Math.sqrt(Fx ** 2 + Fy ** 2)
  let friction = null
  if (isPro && input.frictionCoeff > 0 && input.clampForcePerBolt > 0) {
    friction = calcSlipResistance(input.frictionCoeff, input.clampForcePerBolt, n)
    friction.shearResultant = shearResultant
    friction.slipPass = shearResultant <= friction.slipCapacity
    friction.slipUtilization = friction.slipCapacity
      ? shearResultant / friction.slipCapacity
      : 0
  }

  const shearPass = bolts.every((b) => b.shearForce <= allowShear)
  const interactionPass = bolts.every((b) => b.pass)
  const slipPass = friction ? friction.slipPass : true
  const forcePass = interactionPass && shearPass

  return {
    calcMode: isPro ? 'professional' : 'complete',
    bolts,
    maxBoltForce: maxBolt.combinedForce,
    maxShearForce: maxBolt.shearForce,
    hasTension: tensionPerBolt > 0,
    criticalBoltIndex: maxBolt.index,
    directPerBolt,
    torsionPerBolt,
    prying,
    friction,
    pass: forcePass && slipPass,
    forcePass,
    shearPass,
    interactionPass,
    slipPass,
    allowPerBolt: allowShear,
    allowTensionPerBolt: allowTension,
    polarInertia: Ip,
    boltCount: bolts.length,
  }
}

export function analyzeBoltGroup(input) {
  const mode = input.calcMode ?? 'simple'
  if (mode === 'simple') return analyzeBoltGroupSimple(input)
  return analyzeBoltGroupComplete(input)
}

function round(v, d) {
  const f = 10 ** d
  return Math.round(v * f) / f
}
