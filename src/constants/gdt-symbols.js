/**
 * ASME Y14.5 / ISO 1101 形位公差符号速查（教学图解，非正式标准全文）
 */

export const GDT_CATEGORIES = [
  {
    id: 'form',
    labelZh: '形状公差',
    labelEn: 'Form',
    symbols: [
      { id: 'straightness', glyph: '⏤', nameZh: '直线度', nameEn: 'Straightness', noteZh: '要素自身直线偏离' },
      { id: 'flatness', glyph: '⏥', nameZh: '平面度', nameEn: 'Flatness', noteZh: '平面自身偏离' },
      { id: 'circularity', glyph: '○', nameZh: '圆度', nameEn: 'Circularity', noteZh: '任一正截面圆轮廓' },
      { id: 'cylindricity', glyph: '⌭', nameZh: '圆柱度', nameEn: 'Cylindricity', noteZh: '整圆柱面综合' },
    ],
  },
  {
    id: 'profile',
    labelZh: '轮廓公差',
    labelEn: 'Profile',
    symbols: [
      { id: 'profile_line', glyph: '⌒', nameZh: '线轮廓度', nameEn: 'Profile of a line', noteZh: '截面线轮廓' },
      { id: 'profile_surface', glyph: '⌓', nameZh: '面轮廓度', nameEn: 'Profile of a surface', noteZh: '三维面轮廓' },
    ],
  },
  {
    id: 'orientation',
    labelZh: '方向公差',
    labelEn: 'Orientation',
    symbols: [
      { id: 'parallelism', glyph: '∥', nameZh: '平行度', nameEn: 'Parallelism', noteZh: '相对基准平行' },
      { id: 'perpendicularity', glyph: '⟂', nameZh: '垂直度', nameEn: 'Perpendicularity', noteZh: '相对基准垂直' },
      { id: 'angularity', glyph: '∠', nameZh: '倾斜度', nameEn: 'Angularity', noteZh: '相对基准倾斜角' },
    ],
  },
  {
    id: 'location',
    labelZh: '位置公差',
    labelEn: 'Location',
    symbols: [
      { id: 'position', glyph: '⌖', nameZh: '位置度', nameEn: 'Position', noteZh: '相对基准位置（常用）' },
      { id: 'concentricity', glyph: '◎', nameZh: '同轴度', nameEn: 'Concentricity / Coaxiality', noteZh: 'ISO 同轴；ASME 同轴度慎用' },
      { id: 'symmetry', glyph: '⌯', nameZh: '对称度', nameEn: 'Symmetry', noteZh: '相对中心平面对称' },
    ],
  },
  {
    id: 'runout',
    labelZh: '跳动公差',
    labelEn: 'Runout',
    symbols: [
      { id: 'circular_runout', glyph: '↗', nameZh: '圆跳动', nameEn: 'Circular runout', noteZh: '单截面径向/端面' },
      { id: 'total_runout', glyph: '↗↗', nameZh: '全跳动', nameEn: 'Total runout', noteZh: '全表面综合跳动' },
    ],
  },
]

export const GDT_MODIFIERS = [
  { id: 'mmc', glyph: 'Ⓜ', nameZh: '最大实体要求 MMC', nameEn: 'MMC' },
  { id: 'lmc', glyph: 'Ⓛ', nameZh: '最小实体要求 LMC', nameEn: 'LMC' },
  { id: 'rfs', glyph: 'Ⓢ', nameZh: '与尺寸无关 RFS', nameEn: 'RFS' },
  { id: 'projected', glyph: 'Ⓟ', nameZh: '延伸公差带', nameEn: 'Projected tolerance zone' },
  { id: 'free_state', glyph: 'Ⓕ', nameZh: '自由状态', nameEn: 'Free state' },
  { id: 'tangent', glyph: 'Ⓣ', nameZh: '切面', nameEn: 'Tangent plane' },
]

export const GDT_DATUM = [
  { id: 'datum_feature', glyph: 'Ａ', nameZh: '基准要素字母', nameEn: 'Datum feature' },
  { id: 'datum_target', glyph: '⊕', nameZh: '基准目标', nameEn: 'Datum target' },
]
