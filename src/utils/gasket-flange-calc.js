/**
 * 垫片 / 法兰密封简化校核
 * 预紧坐落应力 + 工况密封比压（ASME 垫片系数 m,y 量级）
 */

/** 常用垫片材料系数（简化查表，非正式 ASME 放行） */
export const GASKET_MATERIALS = {
  elastomer: { id: 'elastomer', label: '橡胶/弹性体', m: 0.5, y: 0 },
  compressed_fiber: { id: 'compressed_fiber', label: '压缩纤维板', m: 2.0, y: 11 },
  ptfe: { id: 'ptfe', label: 'PTFE 包覆', m: 2.0, y: 11 },
  spiral_wound: { id: 'spiral_wound', label: '缠绕垫', m: 3.0, y: 69 },
  metal_ring: { id: 'metal_ring', label: '金属环垫', m: 5.5, y: 126 },
}

/** 垫片环形面积 Ag (mm²) */
export function calcGasketArea(innerDiameter, outerDiameter) {
  const di = Math.max(0, Number(innerDiameter) || 0)
  const dout = Math.max(di, Number(outerDiameter) || 0)
  return (Math.PI / 4) * (dout * dout - di * di)
}

/** 内压作用面积 Ai ≈ π/4 · Di² (mm²) */
export function calcPressureArea(innerDiameter) {
  const di = Math.max(0, Number(innerDiameter) || 0)
  return (Math.PI / 4) * di * di
}

/**
 * 坐落预紧总力建议 Wm1 = π·b·G·y（简化：用 Ag·y）
 * 工况密封力建议 Wm2 = π·b·G·m·p + π/4·G²·p ≈ Ag·m·p + Ai·p
 */
export function calcRequiredBoltLoads({ gasketArea, pressureArea, seatingStressY, factorM, pressureMPa }) {
  const Ag = Math.max(0, gasketArea)
  const Ai = Math.max(0, pressureArea)
  const y = Math.max(0, seatingStressY)
  const m = Math.max(0, factorM)
  const p = Math.max(0, pressureMPa)
  const seatingLoad = Ag * y // N（Ag mm² · y MPa = N）
  const operatingLoad = Ag * m * p + Ai * p
  return {
    seatingLoad,
    operatingLoad,
    requiredTotalLoad: Math.max(seatingLoad, operatingLoad),
  }
}

/**
 * @param {{
 *   calcMode?: 'simple'|'complete'|'professional',
 *   boltCount?: number,
 *   preloadPerBolt?: number,
 *   gasketInner?: number,
 *   gasketOuter?: number,
 *   pressure?: number,
 *   gasketMaterial?: string,
 *   seatingStressY?: number,
 *   factorM?: number,
 *   minSafety?: number,
 * }} input
 */
export function analyzeGasketFlange(input = {}) {
  const calcMode = input.calcMode ?? 'simple'
  const boltCount = Math.max(2, Math.round(input.boltCount ?? 8))
  const preloadPerBolt = Math.max(0, input.preloadPerBolt ?? 25000)
  const di = input.gasketInner ?? 80
  const dout = input.gasketOuter ?? 110
  const pressure = Math.max(0, input.pressure ?? 1.6)
  const mat = GASKET_MATERIALS[input.gasketMaterial] ?? GASKET_MATERIALS.compressed_fiber
  const y = input.seatingStressY ?? mat.y
  const m = input.factorM ?? mat.m
  const minSafety = calcMode === 'simple' ? 1 : (input.minSafety ?? 1.2)

  const gasketArea = calcGasketArea(di, dout)
  const pressureArea = calcPressureArea(di)
  const totalPreload = boltCount * preloadPerBolt
  const seatingStress = gasketArea > 0 ? totalPreload / gasketArea : 0

  const pressureUnload = pressure * pressureArea
  const residualClamp = Math.max(0, totalPreload - pressureUnload)
  const operatingStress = gasketArea > 0 ? residualClamp / gasketArea : 0
  const requiredOpStress = m * pressure

  const required = calcRequiredBoltLoads({
    gasketArea,
    pressureArea,
    seatingStressY: y,
    factorM: m,
    pressureMPa: pressure,
  })
  const sf = calcMode === 'simple' ? 1 : minSafety
  const seatingRequired = y * sf
  const operatingRequired = requiredOpStress * sf
  const capacityRequired = required.requiredTotalLoad * sf
  const requiredPerBolt = capacityRequired / boltCount

  const seatingOk = seatingStress + 1e-9 >= seatingRequired
  const operatingOk = operatingStress + 1e-9 >= operatingRequired
  const capacityOk = totalPreload + 1e-9 >= capacityRequired

  const result = {
    calcMode,
    boltCount,
    preloadPerBolt,
    totalPreload,
    gasketInner: di,
    gasketOuter: dout,
    gasketArea,
    pressureArea,
    pressure,
    gasketMaterial: mat.id,
    gasketLabel: mat.label,
    factorM: m,
    seatingStressY: y,
    seatingStress,
    seatingRequired,
    operatingStress,
    requiredOpStress,
    operatingRequired,
    residualClamp,
    pressureUnload,
    requiredSeatingLoad: required.seatingLoad,
    requiredOperatingLoad: required.operatingLoad,
    requiredTotalLoad: required.requiredTotalLoad,
    capacityRequired,
    requiredPerBolt,
    seatingPass: seatingOk,
    operatingPass: operatingOk,
    capacityPass: capacityOk,
    estimateOnly: calcMode === 'simple',
    pass: false,
  }

  if (calcMode === 'simple') {
    return result
  }

  result.minSafety = minSafety
  result.pass = seatingOk && operatingOk && capacityOk

  if (calcMode === 'professional') {
    result.meanGasketDiameter = (dout + di) / 2
    result.uniformityHint = boltCount < 4 ? 'low' : boltCount < 8 ? 'medium' : 'high'
  }

  return result
}
