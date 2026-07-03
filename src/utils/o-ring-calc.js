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

/**
 * 沟槽设计校核
 * @param grooveDiameter - 沟槽底径 (mm)
 * @param grooveWidth - 沟槽宽度 (mm)
 * @param crossSection - O 型圈截面直径 (mm)
 * @param stretchPercent - 安装拉伸率 (%)
 */
export function analyzeORingSeal(input) {
  const cs = input.crossSection ?? 3.53
  const grooveD = input.grooveDiameter ?? 20
  const grooveW = input.grooveWidth ?? 4.5
  const stretch = (input.stretchPercent ?? 2) / 100
  const pressure = input.pressure ?? 0 // MPa, 0 = 静密封

  // 自由内径估算（安装后）
  const installedID = grooveD * (1 + stretch)
  const freeID = installedID / (1 + stretch)

  // 沟槽深度（槽底到轴心距离的一半... 径向密封）
  // 槽深 = (O圈CS - 压缩量) / 2 对于径向密封简化
  const targetCompression = (input.compressionPercent ?? 20) / 100
  const compression = cs * targetCompression
  const grooveDepth = cs - compression // 径向槽深简化

  // 槽宽：CS * 1.3 ~ 1.5
  const recommendedWidth = cs * 1.4
  const widthOk = grooveW >= cs * 1.2 && grooveW <= cs * 1.6

  // 填充率 = CS² / (grooveW * grooveDepth) * π/4 简化
  const glandVolume = grooveW * grooveDepth
  const ringArea = (Math.PI / 4) * cs * cs
  const fillPercent = glandVolume > 0 ? (ringArea / glandVolume) * 100 : 0

  // 密封比压 (MPa) 估算 — 静密封
  const contactStress = compression > 0 ? (0.5 + 0.5 * targetCompression) * 2 : 0
  const sealingPressure = contactStress * 10 // 粗略 MPa 量级

  const minCompression = pressure > 0 ? 12 : 15 // %
  const maxCompression = 25
  const compressionPct = targetCompression * 100
  const compressionOk =
    compressionPct >= minCompression && compressionPct <= maxCompression

  const fillOk = fillPercent >= 65 && fillPercent <= 85

  return {
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
    notes:
      pressure > 0
        ? '动压密封建议压缩率 12–20%，并校核挤出间隙'
        : '静密封建议压缩率 15–25%',
  }
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
