/**
 * O 型圈密封设计（快速估算，非完整 ISO 3601 / AS568 标准槽表）
 *
 * 填充率：拉伸后截面积 / 矩形沟槽名义容积
 * 推荐槽宽（经验）：w ≈ d + Δd + d·ε_stretch（非标准设计值）
 */

export const ORING_SECTIONS = [
  { id: '1.78', label: 'AS568-0xx (1.78 mm)', cs: 1.78 },
  { id: '2.62', label: 'AS568-1xx (2.62 mm)', cs: 2.62 },
  { id: '3.53', label: 'AS568-2xx (3.53 mm)', cs: 3.53 },
  { id: '5.33', label: 'AS568-3xx (5.33 mm)', cs: 5.33 },
  { id: '6.99', label: 'AS568-4xx (6.99 mm)', cs: 6.99 },
]

export const ORING_MATERIALS = {
  nbr: { label: 'NBR (丁腈)', swell: 1.0, maxTemp: 100, hardness: 70 },
  fkm: { label: 'FKM (氟橡胶)', swell: 1.02, maxTemp: 200, hardness: 75 },
  epdm: { label: 'EPDM', swell: 1.05, maxTemp: 120, hardness: 70 },
}

/** 自由态圆截面面积 */
export function oringFreeArea(cs) {
  return (Math.PI / 4) * cs * cs
}

/**
 * 安装拉伸后有效截面积（体积近似守恒：周长↑ → 截面↓）
 * A' = A0 / (1 + ε)
 */
export function oringStretchedArea(cs, stretchRatio) {
  const s = 1 + Math.max(0, stretchRatio)
  return oringFreeArea(cs) / s
}

/**
 * 经验推荐沟槽宽：截面 + 压缩量 + 拉伸余量
 * w ≈ d + Δd + d·ε
 */
export function suggestGrooveWidth(cs, compressionRatio, stretchRatio) {
  return cs + cs * compressionRatio + cs * stretchRatio
}

/**
 * 沟槽设计校核
 */
export function analyzeORingSeal(input) {
  const calcMode = input.calcMode ?? 'simple'
  const cs = input.crossSection ?? 3.53
  const grooveD = input.grooveDiameter ?? 20
  const grooveW = input.grooveWidth ?? 4.5
  const stretchPct = input.stretchPercent ?? 2
  if (!Number.isFinite(stretchPct) || stretchPct < 0 || stretchPct > 8) {
    return { errorKey: 'invalid_stretch', calcMode }
  }
  const stretch = stretchPct / 100
  const pressure = input.pressure ?? 0

  // grooveDiameter is the installed/gland diameter; free catalog ID is smaller by stretch
  const installedID = grooveD
  const freeID = grooveD / (1 + stretch)
  const targetCompression = (input.compressionPercent ?? 20) / 100
  const compression = cs * targetCompression
  const grooveDepth = cs - compression
  const recommendedWidth = suggestGrooveWidth(cs, targetCompression, stretch)
  // Empirical band around the stretch-aware suggestion (not a catalog table)
  const widthOk = grooveW >= recommendedWidth * 0.9 && grooveW <= recommendedWidth * 1.25
  const freeArea = oringFreeArea(cs)
  const installedArea = oringStretchedArea(cs, stretch)
  const glandVolume = grooveW * grooveDepth
  const fillPercent = glandVolume > 0 ? (installedArea / glandVolume) * 100 : 0
  const contactStress = compression > 0 ? (0.5 + 0.5 * targetCompression) * 2 : 0
  const sealingPressure = contactStress * 10

  const minCompression = pressure > 0 ? 12 : 15
  const maxCompression = calcMode === 'simple' ? 25 : pressure > 0 ? 20 : 25
  const compressionPct = targetCompression * 100
  const compressionOk = compressionPct >= minCompression && compressionPct <= maxCompression
  const fillOk = fillPercent >= 65 && fillPercent <= 85

  const result = {
    calcMode,
    crossSection: cs,
    grooveDiameter: grooveD,
    grooveWidth: grooveW,
    grooveDepth,
    compression,
    compressionPercent: compressionPct,
    compressionOk,
    recommendedWidth,
    widthOk,
    freeArea,
    installedArea,
    glandVolume,
    fillPercent,
    fillOk,
    freeID,
    installedID,
    stretchPercent: stretch * 100,
    sealingPressureEstimate: sealingPressure,
    contactStressEstimate: contactStress,
    estimateOnly: true,
    recommendedWidthEstimateOnly: true,
    pass: compressionOk && widthOk && fillOk,
    notesKey: pressure > 0 ? 'dynamic' : 'static',
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    const extrusionGap = input.extrusionGap ?? 0.15
    const maxGap = pressure > 0 ? Math.max(0.05, 0.25 - pressure * 0.008) : 0.3
    result.extrusionGap = extrusionGap
    result.maxExtrusionGap = maxGap
    result.extrusionPass = extrusionGap <= maxGap
    result.extrusionScreenOnly = pressure <= 0
    // Zero-pressure gap check is a preliminary screen — do not drive overall pass alone.
    if (pressure > 0) {
      result.pass = result.pass && result.extrusionPass
    }

    const mat = ORING_MATERIALS[input.material ?? 'nbr'] ?? ORING_MATERIALS.nbr
    result.material = mat.label
    result.effectiveCrossSection = cs * (mat.swell ?? 1)
    const temp = input.operatingTemp ?? 25
    result.tempPass = temp <= mat.maxTemp
    result.pass = result.pass && result.tempPass
  }

  if (calcMode === 'professional') {
    const strokeSpeed = input.strokeSpeed ?? 0
    result.strokeSpeed = strokeSpeed
    result.speedPass = pressure === 0 || strokeSpeed <= 0.5
    const maxPressure = input.extrusionGap
      ? 35 * (0.25 / Math.max(input.extrusionGap, 0.05))
      : 10
    result.maxAllowPressure = maxPressure
    result.pressurePass = pressure <= maxPressure
    result.pass = result.pass && result.speedPass && result.pressurePass
    if (input.thermalExpansion != null) {
      const delta = input.thermalExpansion * cs
      result.thermalCompressionChange = delta
      result.thermalPass = compression + delta > cs * 0.1
      result.pass = result.pass && result.thermalPass
    }
  }

  return result
}

/** 由轴径/孔径推荐沟槽尺寸（径向静密封快速估算） */
export function recommendGroove(boreDiameter, crossSection, opts = {}) {
  const cs = crossSection ?? 3.53
  const compressionPercent = opts.compressionPercent ?? 20
  const stretchPercent = opts.stretchPercent ?? 2
  const c = compressionPercent / 100
  const s = stretchPercent / 100
  return {
    grooveDiameter: boreDiameter - 2 * cs * 0.75,
    grooveWidth: suggestGrooveWidth(cs, c, s),
    grooveDepth: cs * (1 - c),
    compressionPercent,
    stretchPercent,
    estimateOnly: true,
  }
}
