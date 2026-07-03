/**
 * 螺栓组受力 — 简化 / 矢量分解 / 专业（逐栓表格 + 许用校核）
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
  return {
    calcMode: 'simple',
    directPerBolt: direct,
    torsionPerBolt: torsion,
    maxBoltForce: maxForce,
    pass: maxForce <= allow,
    allowPerBolt: allow,
    boltCount: n,
  }
}

/** 完整：逐栓矢量叠加 F_i = F_direct + F_M */
export function analyzeBoltGroupComplete(input) {
  const n = input.boltCount ?? 4
  const radius = input.boltCircleRadius ?? 50
  const Fx = input.shearX ?? 0
  const Fy = input.shearY ?? 0
  const M = input.moment ?? 0
  const allow = input.allowPerBolt ?? 8000

  const positions = input.boltPositions ?? generateCircleBoltPositions(n, radius)
  const Ip = positions.reduce((s, p) => s + p.x ** 2 + p.y ** 2, 0)
  if (!Ip) return { error: '螺栓位置无效' }

  const bolts = positions.map((p, i) => {
    const fx = Fx / n - (M * p.y) / Ip
    const fy = Fy / n + (M * p.x) / Ip
    const force = Math.sqrt(fx ** 2 + fy ** 2)
    return {
      index: i + 1,
      x: round(p.x, 2),
      y: round(p.y, 2),
      fx: round(fx, 1),
      fy: round(fy, 1),
      force: round(force, 1),
      pass: force <= allow,
    }
  })

  const maxBolt = bolts.reduce((a, b) => (b.force > a.force ? b : a), bolts[0])
  const directPerBolt = Math.sqrt(Fx ** 2 + Fy ** 2) / n
  const torsionPerBolt = maxBolt.force - directPerBolt

  return {
    calcMode: input.calcMode === 'professional' ? 'professional' : 'complete',
    bolts,
    maxBoltForce: maxBolt.force,
    criticalBoltIndex: maxBolt.index,
    directPerBolt,
    torsionPerBolt: Math.max(0, torsionPerBolt),
    pass: bolts.every((b) => b.pass),
    allowPerBolt: allow,
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
