/** 从编辑器跳转到 Monte Carlo 时使用的 sessionStorage 键 */
export const MC_STORAGE_KEY = 'mechbox_mc_from_editor'

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
  const rings = payload.componentRings ?? []
  return {
    closedMin: payload.closedMin ?? payload.closedRing?.min ?? 0,
    closedMax: payload.closedMax ?? payload.closedRing?.max ?? 0,
    toleranceList: rings.map((r) => r.tolerance).join(','),
    sizeList: rings.map((r) => r.size).join(','),
    typeList: rings
      .map((r) => (r.type === 'increasing' ? 'inc' : 'dec'))
      .join(','),
    distribution: payload.distribution ?? 'normal',
    customK: payload.customK ?? 0,
    iterations: payload.iterations ?? 10000,
    typeId: payload.typeId,
    typeName: payload.typeName,
  }
}
