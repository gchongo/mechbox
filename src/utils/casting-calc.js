/**
 * 铸造拔模斜度计算
 */

export const CAST_MATERIALS = {
  sand_iron: { label: '砂型铸铁', baseDraft: 1.5, deepFactor: 0.02 },
  sand_steel: { label: '砂型铸钢', baseDraft: 2.0, deepFactor: 0.025 },
  die_aluminum: { label: '压力铸造铝', baseDraft: 0.75, deepFactor: 0.015 },
  sand_aluminum: { label: '砂型铝合金', baseDraft: 1.0, deepFactor: 0.018 },
  investment: { label: '熔模铸造', baseDraft: 0.5, deepFactor: 0.01 },
}

export const SURFACE_TYPES = {
  external: { label: '外表面', factor: 1.0 },
  internal: { label: '内腔/孔', factor: 1.5 },
  deep_core: { label: '深型芯', factor: 2.0 },
}

/** 经验“常规”上限（°）：超过则提示偏大，非国标硬性限值 */
export const TYPICAL_DRAFT_MAX_DEG = 3

/**
 * 推荐拔模角 (°)
 * depth: 拔模高度 mm
 *
 * α₀ = (a₀ + k√h) · f_surf · f_tex
 * 完整/专业再乘不完美系数 φ（默认 1.05）
 */
export function calcDraftAngle(input) {
  const calcMode = input.calcMode ?? 'simple'
  const mat = CAST_MATERIALS[input.material ?? 'sand_iron'] ?? CAST_MATERIALS.sand_iron
  const surf = SURFACE_TYPES[input.surfaceType ?? 'external'] ?? SURFACE_TYPES.external
  const depth = input.depth ?? 50
  const texture = input.roughSurface ? 1.2 : 1.0

  const baseAngle =
    (mat.baseDraft + mat.deepFactor * Math.sqrt(depth)) * surf.factor * texture

  const imperfectionFactor =
    calcMode === 'simple' ? 1 : (input.imperfectionFactor ?? 1.05)

  let angle = baseAngle * imperfectionFactor
  const minAngle = input.minDraft ?? 0.5
  const recommended = Math.max(minAngle, angle)

  const rad = (recommended * Math.PI) / 180
  const linearIncreasePerSide = depth * Math.tan(rad)

  const result = {
    calcMode,
    material: mat.label,
    surfaceType: surf.label,
    depth,
    baseDraft: mat.baseDraft,
    deepFactor: mat.deepFactor,
    surfaceFactor: surf.factor,
    textureFactor: texture,
    baseAngleDeg: baseAngle,
    imperfectionFactor,
    draftAngleDeg: recommended,
    linearIncreasePerSide,
    totalWidthIncrease: linearIncreasePerSide * 2,
    minDraftDeg: minAngle,
    noteKey: recommended > TYPICAL_DRAFT_MAX_DEG ? 'high_draft' : 'normal',
  }

  if (calcMode === 'professional') {
    result.typicalMaxDeg = TYPICAL_DRAFT_MAX_DEG
  }

  return result
}

/** 检查现有拔模角是否足够（允许 0.1° 容差） */
export function verifyDraftAngle(input) {
  const required = calcDraftAngle(input)
  const actual = input.actualDraftAngle ?? 0
  return {
    ...required,
    actualDraftAngle: actual,
    pass: actual >= required.draftAngleDeg - 0.1,
    margin: actual - required.draftAngleDeg,
  }
}
