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

/**
 * 对接焊缝正应力简化
 * 假设：全熔透（或由熔透效率 η 折减）、纯轴向静拉伸；不含剪力/弯矩/疲劳与工艺缺陷
 */
export function analyzeButtWeld(input) {
  const calcMode = input.calcMode ?? 'complete'
  const grade = WELD_STEEL_GRADES[input.steelGrade ?? 'Q235'] ?? WELD_STEEL_GRADES['Q235']
  const t = input.thickness ?? 8
  const L = input.weldLength ?? 100
  const eff = calcMode === 'professional' ? (input.penetrationEfficiency ?? 1) : 1
  const area = t * L * eff
  const sigma = area ? input.force / area : 0
  const allowGB = grade.gbAllow * 1.1
  const betaW = input.correlationFactor ?? 0.85
  const gammaM2 = input.partialFactor ?? 1.25
  const allowEC = grade.fu / (betaW * gammaM2)
  const allowAWS = 0.6 * grade.fu

  const controlStress = sigma
  const gb = { allow: round(allowGB, 1), pass: controlStress <= allowGB }
  const eurocode = { allow: round(allowEC, 1), pass: controlStress <= allowEC }
  const aws = { allow: round(allowAWS, 1), pass: controlStress <= allowAWS }

  if (calcMode === 'simple') {
    return {
      calcMode,
      area,
      normalStress: sigma,
      gb,
      stressPass: gb.pass,
      pass: false,
      estimateOnly: true,
      axialStaticOnly: true,
      fullPenetrationAssumed: eff >= 1,
    }
  }

  const result = {
    calcMode,
    area,
    normalStress: sigma,
    gb,
    eurocode,
    aws,
    pass: gb.pass && eurocode.pass && aws.pass,
    // GB 简化值通常最严，作为默认控制准则展示
    controlStandard: 'gb',
    controlAllow: gb.allow,
    controlPass: gb.pass,
    othersPass: eurocode.pass && aws.pass,
    mixedVerdict: !gb.pass && eurocode.pass && aws.pass,
    strictest: [gb, eurocode, aws].reduce((a, b) => (a.allow < b.allow ? a : b)),
    axialStaticOnly: true,
    fullPenetrationAssumed: eff >= 1,
    penetrationEfficiency: eff,
  }

  if (calcMode === 'professional') {
    const kf = input.stressConcentration ?? 1.2
    // σ already uses A = t·L·η; apply Kf for local concentration
    result.effectiveStress = sigma * kf
    result.stressConcentration = kf
    result.gb.pass = result.effectiveStress <= allowGB
    result.eurocode.pass = result.effectiveStress <= allowEC
    result.aws.pass = result.effectiveStress <= allowAWS
    result.pass = result.gb.pass && result.eurocode.pass && result.aws.pass
    result.controlPass = result.gb.pass
    result.othersPass = result.eurocode.pass && result.aws.pass
    result.mixedVerdict = !result.gb.pass && result.eurocode.pass && result.aws.pass
  }

  return result
}

export function analyzeFilletWeld(input) {
  const calcMode = input.calcMode ?? 'simple'
  if (calcMode === 'simple') {
    const gb = analyzeFilletWeldGB(input)
    return {
      calcMode,
      ...gb,
      shearPass: gb.pass,
      pass: false,
      estimateOnly: true,
      standards: [{ id: 'gb', ...gb }],
    }
  }
  if (calcMode === 'complete') {
    const cmp = compareWeldStandards(input)
    return { calcMode, ...cmp }
  }
  return analyzeFilletWeldProfessional(input)
}

/**
 * 偏心/合成载荷角焊缝（单条直线连续角焊缝、面内偏心）
 * 喉部截面模量 W = a·L²/6（勿用 L·a²/6）
 */
export function analyzeFilletWeldCombined(input) {
  const throat = calcFilletThroat(input.legSize)
  const L = input.weldLength
  const area = throat * L
  if (!area) return { errorKey: 'weld_geometry_invalid' }

  const Fx = input.forceX ?? 0
  const Fy = input.forceY ?? 0
  const F = input.force ?? Math.sqrt(Fx ** 2 + Fy ** 2)
  const M = input.moment ?? F * (input.eccentricity ?? 0)
  // Single straight weld, throat thickness a, length L → section modulus about weld mid-length
  const W = (throat * L ** 2) / 6

  const tau = F / area
  // M is N·mm (F·e with e in mm), W is mm³ → σ in MPa; do not scale by 1000
  const sigmaB = W ? M / W : 0
  const equiv = Math.sqrt(sigmaB ** 2 + 3 * tau ** 2)

  return {
    throat,
    shearStress: tau,
    bendingStress: sigmaB,
    equivalentStress: equiv,
    sectionModulus: W,
    area,
    moment: M,
    eccentricity: input.eccentricity ?? (F ? M / F : 0),
    modelAssumption: 'single_fillet_inplane',
  }
}

/** 专业：合成应力 + 三标准 + HAZ + 可选疲劳 */
export function analyzeFilletWeldProfessional(input) {
  const combined = analyzeFilletWeldCombined(input)
  if (combined.errorKey) return { calcMode: 'professional', errorKey: combined.errorKey }

  const cmp = compareWeldStandards(input)
  // Compare σ_eq against the strictest simplified shear allowable among the three codes
  const combinedAllow = cmp.strictest?.allowableShear ?? analyzeFilletWeldEurocode(input).allowableShear
  const combinedPass = combined.equivalentStress <= combinedAllow
  const combinedUtilization = combinedAllow ? combined.equivalentStress / combinedAllow : 0

  const haz = analyzeHAZ({
    heatInput: input.heatInput ?? 1.5,
    plateThickness: input.plateThickness ?? 8,
    steelGrade: input.steelGrade,
    legSize: input.legSize,
    force: input.force ?? Math.sqrt((input.forceX ?? 0) ** 2 + (input.forceY ?? 0) ** 2),
    weldLength: input.weldLength,
  })

  let fatigue = null
  if (input.stressRange != null || input.peakStress != null) {
    fatigue = analyzeWeldFatigue({
      stressRange: input.stressRange ?? combined.shearStress,
      peakStress: input.peakStress,
      minStress: input.minStress ?? 0,
      cycles: input.cycles ?? 1e6,
      detailCategory: input.detailCategory ?? 'medium',
    })
  }

  return {
    calcMode: 'professional',
    ...cmp,
    combined,
    combinedAllow,
    combinedAllowStandard: cmp.strictest?.standard ?? null,
    combinedPass,
    combinedUtilization,
    haz,
    fatigue,
    allPass: cmp.allPass && combinedPass && haz.pass && (fatigue ? fatigue.pass : true),
  }
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
  if (deltaTau <= 0) return { errorKey: 'weld_fatigue_stress_zero' }

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
    shearScreenOnly: true,
    noteKey: heatInput > 2.5 ? 'high' : 'normal',
  }
}

function round(v, d) {
  const f = 10 ** d
  return Math.round(v * f) / f
}
