/** 焊缝强度 — GB/T、Eurocode 3、AWS D1.1 对照 */

export const WELD_STEEL_GRADES = {
  'Q235': { label: 'Q235 (GB)', fu: 370, fy: 235, gbAllow: 160 },
  'Q345': { label: 'Q345 (GB)', fu: 470, fy: 345, gbAllow: 200 },
  'S235': { label: 'S235 (EN)', fu: 360, fy: 235, gbAllow: 160 },
  'S355': { label: 'S355 (EN)', fu: 470, fy: 355, gbAllow: 200 },
  'A36': { label: 'A36 (AWS)', fu: 400, fy: 250, gbAllow: 165 },
}

/** 角焊缝有效厚度 */
export function calcFilletThroat(weldLeg) {
  return 0.7 * weldLeg
}

export function calcWeldShearStress(force, throat, weldLength) {
  const area = throat * weldLength
  if (!area) return 0
  return force / area
}

/** GB/T 985 简化 */
export function analyzeFilletWeldGB(input) {
  const grade = WELD_STEEL_GRADES[input.steelGrade ?? 'Q235'] ?? WELD_STEEL_GRADES['Q235']
  const throat = calcFilletThroat(input.legSize)
  const tau = calcWeldShearStress(input.force, throat, input.weldLength)
  const allow = input.allowShear ?? grade.gbAllow
  return {
    standard: 'GB/T 985 (简化)',
    throat,
    shearStress: tau,
    allowableShear: allow,
    pass: tau <= allow,
    utilization: allow ? tau / allow : 0,
  }
}

/** Eurocode 3 EN 1993-1-8 角焊缝简化 */
export function analyzeFilletWeldEurocode(input) {
  const grade = WELD_STEEL_GRADES[input.steelGrade ?? 'S235'] ?? WELD_STEEL_GRADES['S235']
  const throat = calcFilletThroat(input.legSize)
  const tau = calcWeldShearStress(input.force, throat, input.weldLength)
  const betaW = input.correlationFactor ?? 0.85
  const gammaM2 = input.partialFactor ?? 1.25
  const allow = (grade.fu / (Math.sqrt(3) * betaW)) / gammaM2
  return {
    standard: 'EN 1993-1-8 (简化)',
    throat,
    shearStress: tau,
    allowableShear: round(allow, 1),
    pass: tau <= allow,
    utilization: allow ? tau / allow : 0,
    betaW,
    gammaM2,
  }
}

/** AWS D1.1 角焊缝简化 */
export function analyzeFilletWeldAWS(input) {
  const grade = WELD_STEEL_GRADES[input.steelGrade ?? 'A36'] ?? WELD_STEEL_GRADES['A36']
  const throat = calcFilletThroat(input.legSize)
  const tau = calcWeldShearStress(input.force, throat, input.weldLength)
  const allow = 0.3 * grade.fu
  return {
    standard: 'AWS D1.1 (简化)',
    throat,
    shearStress: tau,
    allowableShear: round(allow, 1),
    pass: tau <= allow,
    utilization: allow ? tau / allow : 0,
  }
}

/** 对接焊缝正应力简化 */
export function analyzeButtWeld(input) {
  const grade = WELD_STEEL_GRADES[input.steelGrade ?? 'Q235'] ?? WELD_STEEL_GRADES['Q235']
  const area = (input.thickness ?? 8) * (input.weldLength ?? 100)
  const sigma = area ? input.force / area : 0
  const allowGB = grade.gbAllow * 1.1
  const allowEC = grade.fu / (1.25 * 1.0)
  const allowAWS = 0.6 * grade.fu
  return {
    area,
    normalStress: sigma,
    gb: { allow: round(allowGB, 1), pass: sigma <= allowGB },
    eurocode: { allow: round(allowEC, 1), pass: sigma <= allowEC },
    aws: { allow: round(allowAWS, 1), pass: sigma <= allowAWS },
  }
}

export function analyzeFilletWeld(input) {
  return analyzeFilletWeldGB(input)
}

/** 三标准对照 */
export function compareWeldStandards(input) {
  const gb = analyzeFilletWeldGB(input)
  const ec = analyzeFilletWeldEurocode(input)
  const aws = analyzeFilletWeldAWS(input)
  const tau = gb.shearStress

  return {
    input: { ...input },
    shearStress: tau,
    throat: gb.throat,
    standards: [
      { id: 'gb', ...gb },
      { id: 'eurocode', ...ec },
      { id: 'aws', ...aws },
    ],
    allPass: gb.pass && ec.pass && aws.pass,
    strictest: [gb, ec, aws].reduce((a, b) => (a.allowableShear < b.allowableShear ? a : b)),
  }
}

export const WELD_DETAIL_CATEGORIES = {
  high: { label: '精细加工对接 (高)', enduranceMPa: 90 },
  medium: { label: '角焊/横向载荷 (中)', enduranceMPa: 71 },
  low: { label: '粗焊/附件 (低)', enduranceMPa: 50 },
}

/** 焊缝疲劳 — 简化 S-N */
export function analyzeWeldFatigue(input) {
  const deltaTau = input.stressRange ?? (input.peakStress ?? 0) - (input.minStress ?? 0)
  if (deltaTau <= 0) return { error: '应力幅须大于 0' }

  const detail = WELD_DETAIL_CATEGORIES[input.detailCategory ?? 'medium'] ?? WELD_DETAIL_CATEGORIES.medium
  const endurance = detail.enduranceMPa
  const cycles = input.cycles ?? 1e6
  const exponent = 3
  const refCycles = 2e6
  const allowableAtCycles = endurance * (refCycles / cycles) ** (1 / exponent)
  const lifeEstimate = refCycles * (endurance / deltaTau) ** exponent

  return {
    stressRange: deltaTau,
    detailCategory: detail.label,
    enduranceLimit: endurance,
    allowableAtCycles: round(allowableAtCycles, 1),
    estimatedLife: round(Math.max(lifeEstimate, 1), 0),
    cycles,
    pass: deltaTau <= allowableAtCycles,
    utilization: allowableAtCycles ? deltaTau / allowableAtCycles : 0,
  }
}

/** 热影响区 (HAZ) 简化评估 */
export function analyzeHAZ(input) {
  const grade = WELD_STEEL_GRADES[input.steelGrade ?? 'Q235'] ?? WELD_STEEL_GRADES['Q235']
  const heatInput = input.heatInput ?? 1.5
  const plateThickness = input.plateThickness ?? 8

  const hazWidth = round(0.8 * Math.sqrt(heatInput * plateThickness), 2)
  const strengthReduction = heatInput > 2.5 ? 0.82 : 0.88
  const hazAllowShear = grade.gbAllow * strengthReduction
  const hazAllowNormal = grade.fy * strengthReduction

  const throat = calcFilletThroat(input.legSize ?? 6)
  const tau = input.force ? calcWeldShearStress(input.force, throat, input.weldLength ?? 80) : 0

  return {
    heatInput,
    plateThickness,
    hazWidthMm: hazWidth,
    strengthReduction,
    baseAllowShear: grade.gbAllow,
    hazAllowShear: round(hazAllowShear, 1),
    hazAllowNormal: round(hazAllowNormal, 1),
    weldStress: round(tau, 1),
    pass: !tau || tau <= hazAllowShear,
    note:
      heatInput > 2.5
        ? '热输入偏高，HAZ 软化与脆化风险增加'
        : '热输入在常规范围',
  }
}

function round(v, d) {
  const f = 10 ** d
  return Math.round(v * f) / f
}
