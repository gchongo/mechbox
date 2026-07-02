/** 2D/GD&T 分析类型推荐组成环结构 */
export const GDT_RING_TEMPLATES = {
  parallelism: {
    closedRing: { name: '平行度 L0', min: 0, max: 0.05, direction: 'up' },
    rings: [
      { name: '基准面 flatness', size: 0.02, tolerance: 0.01, factor: 1, direction: 'up' },
      { name: '上表面 flatness', size: 0.02, tolerance: 0.012, factor: 1, direction: 'down' },
      { name: '厚度', size: 25, tolerance: 0.03, factor: 0.5, direction: 'up' },
    ],
  },
  perpendicularity: {
    closedRing: { name: '垂直度 L0', min: 0, max: 0.08, direction: 'up' },
    rings: [
      { name: '基准面 flatness', size: 0.015, tolerance: 0.008, factor: 1, direction: 'up' },
      { name: '侧壁 flatness', size: 0.02, tolerance: 0.01, factor: 1, direction: 'right' },
      { name: '定位尺寸', size: 30, tolerance: 0.05, factor: 0.7, direction: 'right' },
    ],
  },
  flatness: {
    closedRing: { name: '平面度 L0', min: 0, max: 0.03, direction: 'up' },
    rings: [
      { name: '面 A flatness', size: 0.01, tolerance: 0.008, factor: 1, direction: 'up' },
      { name: '面 B flatness', size: 0.012, tolerance: 0.01, factor: 1, direction: 'down' },
    ],
  },
  'profile-2d': {
    closedRing: { name: '轮廓度 L0', min: 0, max: 0.06, direction: 'right' },
    rings: [
      { name: '段1 轮廓', size: 0.02, tolerance: 0.015, factor: 1, direction: 'right' },
      { name: '段2 轮廓', size: 0.018, tolerance: 0.012, factor: 1, direction: 'right' },
    ],
  },
  position: {
    closedRing: { name: '位置度 L0', min: 0, max: 0.1, direction: 'right' },
    rings: [
      { name: 'X 向定位', size: 50, tolerance: 0.05, factor: 1, direction: 'right' },
      { name: 'Y 向定位', size: 30, tolerance: 0.04, factor: 1, direction: 'up' },
      { name: '孔径', size: 10, tolerance: 0.02, factor: 0.5, direction: 'right' },
    ],
  },
  coaxiality: {
    closedRing: { name: '同轴度 L0', min: 0, max: 0.05, direction: 'right' },
    rings: [
      { name: '轴径 A', size: 20, tolerance: 0.02, factor: 1, direction: 'right' },
      { name: '轴径 B', size: 25, tolerance: 0.025, factor: 1, direction: 'right' },
      { name: '径向跳动', size: 0.01, tolerance: 0.008, factor: 1, direction: 'up' },
    ],
  },
  'profile-gdt': {
    closedRing: { name: 'GD&T 轮廓 L0', min: 0, max: 0.08, direction: 'up' },
    rings: [
      { name: '曲面段1', size: 0.02, tolerance: 0.015, factor: 1, direction: 'up' },
      { name: '曲面段2', size: 0.018, tolerance: 0.012, factor: 0.8, direction: 'up' },
    ],
  },
  runout: {
    closedRing: { name: '跳动 L0', min: 0, max: 0.04, direction: 'right' },
    rings: [
      { name: '圆度', size: 0.008, tolerance: 0.006, factor: 1, direction: 'right' },
      { name: '偏心', size: 0.01, tolerance: 0.008, factor: 1, direction: 'up' },
      { name: '轴径', size: 30, tolerance: 0.02, factor: 0.5, direction: 'right' },
    ],
  },
  straightness: {
    closedRing: { name: '直线度 L0', min: 0, max: 0.04, direction: 'right' },
    rings: [
      { name: '段1 直线', size: 0.01, tolerance: 0.008, factor: 1, direction: 'right' },
      { name: '段2 直线', size: 0.012, tolerance: 0.01, factor: 1, direction: 'right' },
      { name: '段3 直线', size: 0.009, tolerance: 0.007, factor: 0.8, direction: 'right' },
    ],
  },
  roundness: {
    closedRing: { name: '圆度 L0', min: 0, max: 0.025, direction: 'right' },
    rings: [
      { name: '截面 A 圆度', size: 0.008, tolerance: 0.006, factor: 1, direction: 'right' },
      { name: '截面 B 圆度', size: 0.007, tolerance: 0.005, factor: 1, direction: 'right' },
      { name: '径向尺寸', size: 25, tolerance: 0.015, factor: 0.5, direction: 'up' },
    ],
  },
}

export function getRingTemplate(typeId) {
  return GDT_RING_TEMPLATES[typeId] ?? null
}

export function applyRingTemplate(typeId, closedDirection) {
  const tpl = getRingTemplate(typeId)
  if (!tpl) return null
  const direction = tpl.closedRing.direction ?? closedDirection
  const componentRings = tpl.rings.map((ring) => ({
    ...ring,
    uid: crypto.randomUUID(),
    type: ring.direction === direction ? 'increasing' : 'decreasing',
  }))
  return {
    closedRing: { ...tpl.closedRing, unit: 'mm' },
    componentRings,
  }
}
