/**
 * O 型圈密封设计（ Parker / ISO 3601 简化）
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

/**
 * 沟槽设计校核
 */
export function analyzeORingSeal(input) {
  const calcMode = input.calcMode ?? 'simple'
  const cs = input.crossSection ?? 3.53
  const grooveD = input.grooveDiameter ?? 20
  const grooveW = input.grooveWidth ?? 4.5
  const stretch = (input.stretchPercent ?? 2) / 100
  const pressure = input.pressure ?? 0

  const installedID = grooveD * (1 + stretch)
  const freeID = installedID / (1 + stretch)
  const targetCompression = (input.compressionPercent ?? 20) / 100
  const compression = cs * targetCompression
  const grooveDepth = cs - compression
  const recommendedWidth = cs * 1.4
  const widthOk = grooveW >= cs * 1.2 && grooveW <= cs * 1.6
  const glandVolume = grooveW * grooveDepth
  const ringArea = (Math.PI / 4) * cs * cs
  const fillPercent = glandVolume > 0 ? (ringArea / glandVolume) * 100 : 0
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
    fillPercent,
    fillOk,
    freeID,
    installedID,
    stretchPercent: stretch * 100,
    sealingPressureEstimate: sealingPressure,
    contactStressEstimate: contactStress,
    pass: compressionOk && widthOk && fillOk,
    notesKey: pressure > 0 ? 'dynamic' : 'static',
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    const extrusionGap = input.extrusionGap ?? 0.15
    const maxGap = pressure > 0 ? Math.max(0.05, 0.25 - pressure * 0.008) : 0.3
    result.extrusionGap = extrusionGap
    result.maxExtrusionGap = maxGap
    result.extrusionPass = extrusionGap <= maxGap
    result.pass = result.pass && result.extrusionPass

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

/** 由轴径/孔径推荐沟槽尺寸（径向静密封简化） */
export function recommendGroove(boreDiameter, crossSection) {
  const cs = crossSection ?? 3.53
  return {
    grooveDiameter: boreDiameter - 2 * cs * 0.75,
    grooveWidth: cs * 1.4,
    grooveDepth: cs * 0.8,
    compressionPercent: 20,
  }
}
