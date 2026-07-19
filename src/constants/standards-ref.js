/**
 * 标准件速查数据（教材/手册常用档，非正式完整国标全文）
 */
import { KEY_SIZE_TABLE, lookupKeySize } from '@/utils/key-calc'
import { ORING_SECTIONS, ORING_MATERIALS } from '@/utils/o-ring-calc'

/** GB/T 1095 常用平键截面（复用计算库） */
export { KEY_SIZE_TABLE, lookupKeySize }

/** 圆柱销常用直径系列 (mm) — 选型速查 */
export const PIN_DIAMETER_SERIES = [
  1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 30, 32, 35, 40, 45, 50,
]

/** 销孔/长度经验：L ≈ (1.5~2)×d，过盈/过渡配合提示 */
export const PIN_FIT_HINTS = [
  { fit: 'm6/H7', use: '定位销（过渡）', note: '可拆定位' },
  { fit: 'p6/H7', use: '轻过盈', note: '防转轻度' },
  { fit: 'r6/H7', use: '中过盈', note: '永久定位偏多' },
  { fit: 'h8/H8', use: '间隙可拆', note: '铰制孔用螺栓场景近似' },
]

/** AS568 截面系列 + 推荐压缩率量级 */
export const ORING_SECTION_GUIDE = ORING_SECTIONS.map((s) => ({
  ...s,
  staticCompression: '15–30%',
  dynamicCompression: '10–20%',
  typicalGroove: `沟槽宽 ≈ ${s.cs.toFixed(2)} + 压缩余量`,
}))

export { ORING_MATERIALS }

/** 轴用弹性挡圈常用轴径 → 沟槽参考（简化量级） */
export const RETAINING_RING_SHAFT = [
  { shaft: 8, grooveDia: 7.6, thickness: 0.8 },
  { shaft: 10, grooveDia: 9.6, thickness: 1.0 },
  { shaft: 12, grooveDia: 11.5, thickness: 1.0 },
  { shaft: 15, grooveDia: 14.3, thickness: 1.0 },
  { shaft: 20, grooveDia: 19.0, thickness: 1.2 },
  { shaft: 25, grooveDia: 23.9, thickness: 1.2 },
  { shaft: 30, grooveDia: 28.6, thickness: 1.5 },
  { shaft: 40, grooveDia: 38.5, thickness: 1.75 },
  { shaft: 50, grooveDia: 48.0, thickness: 2.0 },
]

export function lookupPinLength(diameter) {
  const d = Math.max(0.5, Number(diameter) || 6)
  return { min: 1.5 * d, max: 2.5 * d, typical: 2 * d }
}

export function lookupRetainingRing(shaftDia) {
  const d = Number(shaftDia) || 20
  return (
    RETAINING_RING_SHAFT.find((r) => r.shaft >= d) ??
    RETAINING_RING_SHAFT[RETAINING_RING_SHAFT.length - 1]
  )
}
