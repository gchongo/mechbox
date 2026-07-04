/** 从编辑器跳转到 Monte Carlo 时使用的 sessionStorage 键 */
export const MC_STORAGE_KEY = 'mechbox_mc_from_editor'

/** 从编辑器跳转到 GD&T 公差栈 */
export const GDT_STACK_STORAGE_KEY = 'mechbox_gdt_from_editor'

/** 将编辑器状态序列化为 MC 页面可读的参数 */
export function serializeEditorForMonteCarlo({
  closedRing,
  componentRings,
  method,
  rssDistribution,
  selectedType,
}) {
  return {
    closedMin: closedRing.min,
    closedMax: closedRing.max,
    componentRings,
    distribution: method === 'modified-rss' || method === 'sigma6-rss' ? rssDistribution : 'normal',
    rssDistribution,
    method,
    typeId: selectedType?.id,
    typeName: selectedType?.name,
  }
}

/** 将 MC 参数还原为表单字段 */
export function deserializeMonteCarloPayload(payload) {
  const rings = (payload.componentRings ?? []).map((r) => ({
    ...r,
    es: r.es ?? (r.tolerance != null ? r.tolerance / 2 : undefined),
    ei: r.ei ?? (r.tolerance != null ? -r.tolerance / 2 : undefined),
  }))
  return {
    closedMin: payload.closedMin ?? payload.closedRing?.min ?? 0,
    closedMax: payload.closedMax ?? payload.closedRing?.max ?? 0,
    componentRings: rings.length ? rings : null,
    toleranceList: rings.map((r) => r.tolerance).join(','),
    sizeList: rings.map((r) => r.size).join(','),
    typeList: rings
      .map((r) => (r.type === 'increasing' ? 'inc' : r.type === 'decreasing' ? 'dec' : 'unknown'))
      .join(','),
    esList: rings.map((r) => r.es).join(','),
    eiList: rings.map((r) => r.ei).join(','),
    distribution: payload.distribution ?? 'normal',
    customK: payload.customK ?? 0,
    iterations: payload.iterations ?? 10000,
    typeId: payload.typeId,
    typeName: payload.typeName,
  }
}

/** 编辑器 → GD&T 公差栈 */
export function serializeEditorForGdtStack({
  closedRing,
  componentRings,
  method,
  selectedType,
  gdtModifier,
  gdtAutoBonus,
  bonusTolerance,
}) {
  return {
    typeId: selectedType?.id ?? 'position',
    closedMax: closedRing?.max ?? 0.1,
    method: method ?? 'rss',
    toleranceModifier: gdtModifier ?? 'RFS',
    autoBonus: gdtAutoBonus ?? true,
    bonusTolerance: bonusTolerance ?? 0,
    typeName: selectedType?.name,
    rings: (componentRings ?? []).map((r) => ({
      name: r.name ?? '环',
      tolerance: r.tolerance ?? 0,
      factor: r.factor ?? 1,
      direction: r.direction ?? 'right',
      type: r.type ?? 'increasing',
      featureKind: r.featureKind ?? '',
      sizeTolerance: r.sizeTolerance ?? 0,
      es: r.es,
      ei: r.ei,
    })),
    datums: [],
  }
}

export function deserializeGdtStackPayload(payload) {
  if (!payload) return null
  return {
    typeId: payload.typeId ?? 'position',
    closedMax: payload.closedMax ?? 0.1,
    method: payload.method ?? 'rss',
    toleranceModifier: payload.toleranceModifier ?? 'RFS',
    autoBonus: payload.autoBonus ?? !(payload.bonusTolerance > 0),
    bonusTolerance: payload.bonusTolerance ?? 0,
    rings: (payload.rings ?? []).map((r) => ({ ...r })),
    datums: (payload.datums ?? []).map((d) => ({ ...d })),
    typeName: payload.typeName,
  }
}
