/** GB/T 1800 附表 D3-3 — 优先配合特性及应用举例 */

export const PREFERRED_FIT_APPLICATIONS = [
  {
    holeBasis: 'H11/c11',
    shaftBasis: 'C11/h11',
    description:
      '间隙非常大，用于很松的、转动很慢的动配合，或要求大公差与大间隙的外露组件，或要求装配方便的、很松的配合。',
  },
  {
    holeBasis: 'H9/d9',
    shaftBasis: 'D9/h9',
    description:
      '间隙很大的自由转动配合，用于精度非主要要求时，或有大的温度变动、高转速或大的轴颈压力时。',
  },
  {
    holeBasis: 'H8/f7',
    shaftBasis: 'F8/h7',
    description:
      '间隙不大的转动配合，用于中等转速与中等轴颈压力的精确转动，也用于装配较易的中等定位配合。',
  },
  {
    holeBasis: 'H7/g6',
    shaftBasis: 'G7/h6',
    description:
      '间隙很小的滑动配合，用于不希望自由转动，但可自由移动和滑动并精密定位时，也可用于要求明确的定位配合。',
  },
  {
    holeBasis: 'H7/h6、H8/h7、H9/h9、H11/h11',
    shaftBasis: 'H7/h6、H8/h7、H9/h9、H11/h11',
    description:
      '均为间隙定位配合，零件可自由装拆，而工作时一般相对静止不动。在最大实体条件下间隙为零，在最小实体条件下间隙由公差等级决定。',
  },
  {
    holeBasis: 'H7/k6',
    shaftBasis: 'K7/h6',
    description: '过渡配合，用于精密定位。',
  },
  {
    holeBasis: 'H7/n6',
    shaftBasis: 'N7/h6',
    description: '过渡配合，允许有较大过盈的更精密定位。',
  },
  {
    holeBasis: 'H7/p6*',
    shaftBasis: 'P7/h6',
    description:
      '过盈定位配合，即小过盈配合，用于定位精度特别重要时，能最好的定位精度达到部件的刚性及对中性要求，而对内孔承受压力无特殊要求，不依靠配合的紧固性传递摩擦负荷。',
    footnote: '≤3 mm 按过渡配合',
  },
  {
    holeBasis: 'H7/s6',
    shaftBasis: 'S7/h6',
    description:
      '中等压入配合，适用于一般钢件，或用于薄壁件的冷缩配合，用于铸铁件可得到最紧的配合。',
  },
  {
    holeBasis: 'H7/u6',
    shaftBasis: 'U7/h6',
    description: '压入配合，适用于可以承受大压入力的零件或不宜承受大压入力的冷缩配合。',
  },
]

/** GB/T 1800 附表 D4-1 — 公差等级与加工方法的关系（IT 等级范围） */
export const IT_PROCESS_METHODS = [
  { method: '研磨', itFrom: 1, itTo: 5 },
  { method: '珩', itFrom: 4, itTo: 7 },
  { method: '圆磨、平磨', itFrom: 5, itTo: 8 },
  { method: '金刚石车、金刚石镗', itFrom: 5, itTo: 7 },
  { method: '拉削', itFrom: 5, itTo: 8 },
  { method: '铰孔', itFrom: 6, itTo: 10 },
  { method: '车、镗', itFrom: 6, itTo: 11 },
  { method: '铣', itFrom: 7, itTo: 11 },
  { method: '刨、插', itFrom: 8, itTo: 11 },
  { method: '钻孔', itFrom: 9, itTo: 13 },
  { method: '滚压、挤压', itFrom: 9, itTo: 12 },
  { method: '冲压', itFrom: 10, itTo: 13 },
  { method: '压铸', itFrom: 11, itTo: 14 },
  { method: '粉末冶金成形', itFrom: 11, itTo: 14 },
  { method: '粉末冶金烧结', itFrom: 6, itTo: 9 },
  { method: '砂型铸造、气割', itFrom: 13, itTo: 15 },
  { method: '锻造', itFrom: 14, itTo: 16 },
]

export const IT_GRADE_LABELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
