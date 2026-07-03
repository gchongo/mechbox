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

/**
 * 推荐拔模角 (°)
 * depth: 拔模高度 mm
 */
export function calcDraftAngle(input) {
  const mat = CAST_MATERIALS[input.material ?? 'sand_iron'] ?? CAST_MATERIALS.sand_iron
  const surf = SURFACE_TYPES[input.surfaceType ?? 'external'] ?? SURFACE_TYPES.external
  const depth = input.depth ?? 50
  const texture = input.roughSurface ? 1.2 : 1.0

  const angle = (mat.baseDraft + mat.deepFactor * Math.sqrt(depth)) * surf.factor * texture
  const minAngle = input.minDraft ?? 0.5
  const recommended = Math.max(minAngle, angle)

  // 线性拔模：顶部与底部尺寸差 Δ = 2 · h · tan(α)
  const rad = (recommended * Math.PI) / 180
  const linearIncrease = 2 * depth * Math.tan(rad)

  return {
    material: mat.label,
    surfaceType: surf.label,
    depth,
    draftAngleDeg: recommended,
    linearIncreasePerSide: depth * Math.tan(rad),
    totalWidthIncrease: linearIncrease,
    pass: recommended >= minAngle,
    note:
      recommended > 3
        ? '拔模角偏大，建议优化分型或采用滑块'
        : '拔模角在常规范围内',
  }
}

/** 检查现有拔模角是否足够 */
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
