/**
 * 注塑 DFM 速查规则（checklist，非正式模具规范）
 */

export const INJECTION_DFM_RULES = [
  {
    id: 'wall',
    check: (p) => p.wallThickness >= p.minWall && p.wallThickness <= p.maxWall,
    zh: '壁厚在推荐范围内',
    en: 'Wall thickness in recommended range',
  },
  {
    id: 'uniform',
    check: (p) => p.wallVariationPct <= 25,
    zh: '壁厚变化 ≤ 25%（减缩痕/翘曲）',
    en: 'Wall variation ≤ 25%',
  },
  {
    id: 'draft',
    check: (p) => p.draftAngle >= p.minDraft,
    zh: '拔模角 ≥ 推荐最小值',
    en: 'Draft ≥ recommended minimum',
  },
  {
    id: 'radius',
    check: (p) => p.filletRadius >= 0.5 * p.wallThickness,
    zh: '内圆角 ≥ 0.5×壁厚',
    en: 'Internal fillet ≥ 0.5× wall',
  },
  {
    id: 'rib',
    check: (p) => !p.hasRibs || p.ribThickness <= 0.6 * p.wallThickness,
    zh: '加强筋厚度 ≤ 0.6×壁厚',
    en: 'Rib thickness ≤ 0.6× wall',
  },
]

/** 材料族推荐壁厚 / 拔模 (mm, °) */
export const INJECTION_MATERIALS = {
  abs: { id: 'abs', minWall: 1.2, maxWall: 3.5, minDraft: 0.5, label: 'ABS' },
  pp: { id: 'pp', minWall: 0.9, maxWall: 3.0, minDraft: 1.0, label: 'PP' },
  pa: { id: 'pa', minWall: 0.8, maxWall: 3.0, minDraft: 0.5, label: 'PA6/66' },
  pc: { id: 'pc', minWall: 1.0, maxWall: 3.5, minDraft: 1.0, label: 'PC' },
  pom: { id: 'pom', minWall: 0.8, maxWall: 3.0, minDraft: 0.5, label: 'POM' },
}

/**
 * @param {{
 *   calcMode?: string,
 *   materialId?: string,
 *   wallThickness?: number,
 *   wallVariationPct?: number,
 *   draftAngle?: number,
 *   filletRadius?: number,
 *   hasRibs?: boolean,
 *   ribThickness?: number,
 * }} input
 */
export function analyzeInjectionDfm(input = {}) {
  const calcMode = input.calcMode ?? 'simple'
  const mat = INJECTION_MATERIALS[input.materialId] ?? INJECTION_MATERIALS.abs
  const params = {
    wallThickness: Math.max(0.1, Number(input.wallThickness) || 2),
    wallVariationPct: Math.max(0, Number(input.wallVariationPct) || 10),
    draftAngle: Math.max(0, Number(input.draftAngle) || 1),
    filletRadius: Math.max(0, Number(input.filletRadius) || 1),
    hasRibs: !!input.hasRibs,
    ribThickness: Math.max(0, Number(input.ribThickness) || 1),
    minWall: mat.minWall,
    maxWall: mat.maxWall,
    minDraft: mat.minDraft,
  }

  const checks = INJECTION_DFM_RULES.map((r) => ({
    id: r.id,
    pass: r.check(params),
    labelKey: r.id,
    labelZh: r.zh,
    labelEn: r.en,
  }))

  const failCount = checks.filter((c) => !c.pass).length
  const allPass = failCount === 0

  return {
    calcMode,
    materialId: mat.id,
    material: mat,
    ...params,
    checks,
    failCount,
    pass: calcMode === 'simple' ? false : allPass,
    estimateOnly: calcMode === 'simple',
    tip:
      calcMode === 'professional'
        ? '专业：结合浇口位置、冷却与翘曲仿真再定型；本页仅为几何 DFM 清单。'
        : '完整：清单项全部通过则综合通过；简化仅提示不放行。',
  }
}
