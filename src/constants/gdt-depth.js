/**
 * GD&T 进阶：框解读、基准体系自由度、虚拟条件
 */

import { findGdtSymbol, buildFeatureControlFrame } from '@/constants/gdt-symbols'

/** 各符号检测/成本补充 */
export const GDT_SYMBOL_DEPTH = {
  straightness: {
    inspectZh: '刀口尺/平尺透光；轴线直线度常用圆度仪或三坐标拟合轴线。',
    costZh: '中',
    dofNoteZh: '形状公差，不约束刚体自由度。',
  },
  flatness: {
    inspectZh: '三点支撑平台 + 百分表扫面；或光学平晶/三坐标。',
    costZh: '低–中',
    dofNoteZh: '形状公差，不建立基准。',
  },
  circularity: {
    inspectZh: '圆度仪；也可 V 块+百分表粗测。',
    costZh: '中',
    dofNoteZh: '仅截面，不控圆柱全长。',
  },
  cylindricity: {
    inspectZh: '圆度仪全长扫描或三坐标圆柱拟合。',
    costZh: '高',
    dofNoteZh: '综合形状，检测节拍长。',
  },
  profile_line: {
    inspectZh: '投影仪/轮廓仪按截面取样；三坐标线轮廓。',
    costZh: '中–高',
    dofNoteZh: '可无基准（纯形状）或相对基准定位。',
  },
  profile_surface: {
    inspectZh: '三坐标/扫描测头按点云相对名义面。',
    costZh: '高',
    dofNoteZh: '复杂曲面常用；基准决定定位还是仅形状。',
  },
  parallelism: {
    inspectZh: '平板+等高块+百分表；孔轴用三坐标方向矢量。',
    costZh: '低–中',
    dofNoteZh: '相对基准约束方向（旋转自由度）。',
  },
  perpendicularity: {
    inspectZh: '直角尺/圆柱角尺；三坐标方向夹角。',
    costZh: '低–中',
    dofNoteZh: '相对基准 90° 方向。',
  },
  angularity: {
    inspectZh: '正弦规/角度块；三坐标夹角。',
    costZh: '中',
    dofNoteZh: '相对基准非 90° 方向。',
  },
  position: {
    inspectZh: '三坐标相对 DRF；功能量规（MMC）常用于孔系。',
    costZh: '中–高',
    dofNoteZh: '相对完整基准体系约束位置+方向。',
  },
  concentricity: {
    inspectZh: '三坐标中心点/轴线；实务多用位置度或跳动替代。',
    costZh: '高',
    dofNoteZh: 'ASME 同轴度检测困难，慎用。',
  },
  symmetry: {
    inspectZh: '三坐标中心平面；或对称量规。',
    costZh: '中',
    dofNoteZh: '相对中心平面；也可用位置度表达。',
  },
  circular_runout: {
    inspectZh: '顶尖/V 块支承，百分表单截面旋转读数。',
    costZh: '低',
    dofNoteZh: '相对旋转基准，综合形状+位置误差。',
  },
  total_runout: {
    inspectZh: '支承旋转，表沿全长/全端面扫描。',
    costZh: '中',
    dofNoteZh: '比圆跳动更严，覆盖全表面。',
  },
}

/** 经典图样框示例（可解读） */
export const GDT_DECODE_EXAMPLES = [
  {
    id: 'pos_mmc_ab',
    titleZh: '孔系位置度 + MMC',
    titleEn: 'Pattern position @ MMC',
    input: {
      symbolId: 'position',
      tolerance: 0.1,
      diameter: true,
      modifier: 'mmc',
      datums: ['A', 'B'],
    },
    storyZh: '底板孔相对底面 A 与侧面 B 定位，装配时允许红利公差。',
  },
  {
    id: 'flat_only',
    titleZh: '密封面平面度',
    titleEn: 'Seal-face flatness',
    input: {
      symbolId: 'flatness',
      tolerance: 0.05,
      diameter: false,
      modifier: '',
      datums: [],
    },
    storyZh: '仅控制面自身平整，不相对其他面定向。',
  },
  {
    id: 'perp_a',
    titleZh: '孔相对底面垂直',
    titleEn: 'Bore ⊥ face A',
    input: {
      symbolId: 'perpendicularity',
      tolerance: 0.08,
      diameter: true,
      modifier: '',
      datums: ['A'],
    },
    storyZh: '只管轴线垂直于 A，不管孔在平面内的位置偏移。',
  },
  {
    id: 'runout_a',
    titleZh: '轴颈圆跳动',
    titleEn: 'Journal circular runout',
    input: {
      symbolId: 'circular_runout',
      tolerance: 0.02,
      diameter: false,
      modifier: '',
      datums: ['A'],
    },
    storyZh: '旋转检测：单截面径向综合误差相对轴线基准 A。',
  },
  {
    id: 'pos_abc',
    titleZh: '完整 3-2-1 基准位置度',
    titleEn: 'Position to A|B|C',
    input: {
      symbolId: 'position',
      tolerance: 0.05,
      diameter: true,
      modifier: 'mmc',
      datums: ['A', 'B', 'C'],
    },
    storyZh: '主基准面 A、第二方向 B、第三平移 C，孔系完全定位。',
  },
]

const MOD_EXPLAIN = {
  mmc: {
    glyph: 'Ⓜ',
    nameZh: '最大实体要求（MMC）',
    zh: '在要素处于最大实体尺寸时，几何公差取框内给定值；实际尺寸偏离 MMC 时，几何公差带可按偏离量增大（红利公差）。常用于保证装配互换。',
  },
  lmc: {
    glyph: 'Ⓛ',
    nameZh: '最小实体要求（LMC）',
    zh: '在要素处于最小实体尺寸时几何公差取给定值；尺寸偏离 LMC 时可增大几何带。多用于保证最小壁厚或强度。',
  },
  rfs: {
    glyph: 'Ⓢ',
    nameZh: '与尺寸无关（RFS）',
    zh: '几何公差与尺寸无关，无红利；公差带大小固定为框内数值。未标注材料状态时，多数标准默认 RFS。',
  },
}

/** 各符号：公差带几何 + 控制/不控制要点 */
const ZONE_DECODE = {
  straightness: {
    zone: (t, dia) =>
      dia
        ? `公差带为直径 Ø${t} 的圆柱，被测轴线须落在该圆柱内。`
        : `公差带为间距 ${t} 的两平行平面（或两平行直线），被测线要素须落在其间。`,
    controls: '仅控制线/轴线自身形状（直线偏离）。',
    notControls: '不控制相对基准的位置或方向；也不代替尺寸公差。',
  },
  flatness: {
    zone: (t) => `公差带为间距 ${t} 的两平行平面，被测平面须完全落在其间。`,
    controls: '仅控制平面自身形状。',
    notControls: '不建立基准，也不控制该面相对其他面的平行/垂直。',
  },
  circularity: {
    zone: (t) => `在任一垂直于轴线的截面内，公差带为径向间距 ${t} 的两同心圆；该截面轮廓须落在其间。`,
    controls: '仅控制各截面圆度。',
    notControls: '不控制圆柱全长锥度、直线度或同轴；全长综合形状用圆柱度。',
  },
  cylindricity: {
    zone: (t) => `公差带为径向间距 ${t} 的两同轴圆柱面，被测圆柱面须完全落在其间。`,
    controls: '综合控制圆度、直线度与锥度（全表面形状）。',
    notControls: '不相对基准定位；成本高，非必要勿默认。',
  },
  profile_line: {
    zone: (t) => `公差带为沿名义线轮廓两侧各 ${t / 2}（总宽 ${t}）的等距带（未注不等分时默认均分）。`,
    controls: '控制截面线相对名义轮廓的偏离；可有/无基准。',
    notControls: '三维曲面应用面轮廓度，勿用线轮廓代替。',
  },
  profile_surface: {
    zone: (t) => `公差带为沿名义曲面法向两侧的等距壳，总法向带宽 ${t}（默认均分）。`,
    controls: '无基准时控形状；有基准时同时约束面相对 DRF 的方位。',
    notControls: '检测依赖名义 CAD/点云，成本通常较高。',
  },
  parallelism: {
    zone: (t, dia) =>
      dia
        ? `相对基准，公差带为直径 Ø${t}、轴线平行于基准的圆柱。`
        : `相对基准，公差带为间距 ${t}、平行于基准的两平行平面。`,
    controls: '控制被测要素相对基准的平行方向。',
    notControls: '不限制要素在平行方向上的位置偏移（位置用位置度）。',
  },
  perpendicularity: {
    zone: (t, dia) =>
      dia
        ? `相对基准，公差带为直径 Ø${t}、轴线垂直于基准的圆柱。`
        : `相对基准，公差带为间距 ${t}、垂直于基准的两平行平面。`,
    controls: '控制被测要素相对基准 90° 方向。',
    notControls: '不限制孔/面在基准平面内的平移位置。',
  },
  angularity: {
    zone: (t, dia) =>
      dia
        ? `相对基准，公差带为直径 Ø${t}、轴线成基本角度的圆柱（角度由尺寸标注给出）。`
        : `相对基准，公差带为间距 ${t}、成基本角度的两平行平面。`,
    controls: '控制相对基准的非 90° 倾斜方向。',
    notControls: '基本角度由理论正确尺寸给出；本框只管方向带宽度。',
  },
  position: {
    zone: (t, dia) =>
      dia
        ? `相对基准体系，公差带为直径 Ø${t} 的圆柱（或球），理论正确位置由基本尺寸定位。`
        : `相对基准体系，公差带为间距 ${t} 的两平行平面/带，中心位于理论正确位置。`,
    controls: '同时约束被测要素相对 DRF 的位置与方向。',
    notControls: '不代替尺寸公差本身；MMC/LMC 时有效带随实际尺寸变化。',
  },
  concentricity: {
    zone: (t) => `相对基准轴线，公差带为直径 Ø${t} 的圆柱，被测中心点/轴线须落在其内（ASME 同轴度）。`,
    controls: '中心点相对基准轴的同轴。',
    notControls: '检测困难，实务常用位置度或跳动替代。',
  },
  symmetry: {
    zone: (t) => `相对基准中心平面，公差带为对称分布、总宽 ${t} 的两平行平面。`,
    controls: '中心平面/中心线相对基准中面的对称。',
    notControls: '也可用位置度表达同类要求。',
  },
  circular_runout: {
    zone: (t) => `零件绕基准轴线旋转时，任一固定测点截面上，指示表全跳动读数不得超过 ${t}。`,
    controls: '单截面内形状+位置的综合误差（相对旋转轴）。',
    notControls: '不覆盖全长/全端面；全表面用全跳动。',
  },
  total_runout: {
    zone: (t) => `绕基准轴线旋转并沿被测面全长（或全端面）移动测头时，全读数差不得超过 ${t}。`,
    controls: '全表面相对旋转轴的综合形状与位置。',
    notControls: '比圆跳动更严，覆盖锥度、直线度等累积。',
  },
}

function formatTol(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v)
  return String(Number(n.toFixed(4)))
}

function buildSummaryZh(built, input) {
  const sym = built.symbol
  const t = formatTol(input.tolerance)
  const dia = built.showDia
  const datums = built.datums
  const mod = built.modifier
  const zoneFn = ZONE_DECODE[sym.id]
  const zoneLine = zoneFn ? zoneFn.zone(t, dia) : `公差值 ${t}。`

  let rel = ''
  if (datums.length === 0) {
    rel = sym.datumRequired === true ? '（缺少基准，框不完整）' : '无基准，仅约束要素自身几何。'
  } else if (datums.length === 1) {
    rel = `相对主基准 ${datums[0]}。`
  } else if (datums.length === 2) {
    rel = `相对基准体系 ${datums[0]}→${datums[1]}（主→第二）。`
  } else {
    rel = `相对完整基准体系 ${datums.join('→')}（主→第二→第三）。`
  }

  let modLine = ''
  if (mod === 'mmc') {
    modLine = dia
      ? `标注 Ⓜ：在 MMC 时几何带为 Ø${t}；实际尺寸偏离 MMC 时有效几何公差可增大。`
      : `标注 Ⓜ：几何公差随尺寸偏离 MMC 可产生红利（本框未用 Ø，请确认是否适用）。`
  } else if (mod === 'lmc') {
    modLine = `标注 Ⓛ：在 LMC 时几何带取 ${dia ? 'Ø' : ''}${t}，偏离 LMC 时可增大。`
  } else if (mod === 'rfs') {
    modLine = `标注 Ⓢ：几何公差固定为 ${dia ? 'Ø' : ''}${t}，无尺寸红利。`
  } else if (sym.datumRequired === true || ['position', 'parallelism', 'perpendicularity', 'angularity', 'concentricity', 'symmetry', 'circular_runout', 'total_runout'].includes(sym.id)) {
    modLine = `未注材料状态：按 RFS 理解，几何公差固定为 ${dia ? 'Ø' : ''}${t}。`
  }

  return [
    `本框表示：对要素施加「${sym.nameZh}」要求。`,
    zoneLine,
    rel,
    modLine,
    zoneFn?.controls || '',
    zoneFn ? `不控制：${zoneFn.notControls}` : '',
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * 解读特征控制框各格（随拼装实时生成）
 */
export function decodeFeatureControlFrame(input = {}) {
  const built = buildFeatureControlFrame(input)
  if (!built.ok) return { ...built, segments: [], summaryZh: '', rulesZh: [] }

  const t = formatTol(input.tolerance)
  const dia = built.showDia
  const zoneFn = ZONE_DECODE[built.symbol.id]
  const depth = GDT_SYMBOL_DEPTH[built.symbol.id]
  const segments = []

  segments.push({
    cell: built.symbol.glyph,
    roleZh: '几何特性',
    roleKey: 'symbol',
    detailZh: [
      `${built.symbol.nameZh}（${built.symbol.nameEn}）。`,
      built.symbol.noteZh ? `要点：${built.symbol.noteZh}。` : '',
      `典型用途：${built.symbol.useZh}`,
      zoneFn ? `控制：${zoneFn.controls}` : '',
      zoneFn ? `注意：${zoneFn.notControls}` : '',
      built.symbol.mistakeZh ? `常见误用：${built.symbol.mistakeZh}` : '',
    ]
      .filter(Boolean)
      .join(' '),
  })

  segments.push({
    cell: built.cells[1],
    roleZh: '公差值',
    roleKey: 'tolerance',
    detailZh: [
      zoneFn ? zoneFn.zone(Number(t), dia) : `公差数值为 ${t}。`,
      dia
        ? `Ø 表示公差带为圆柱（或球）形，轴线/中心落在 Ø${t} 带内。`
        : `无 Ø：公差带为平行平面/等距带等，总宽度为 ${t}。`,
      `单位与图样线性尺寸单位一致（通常为 mm）。`,
    ].join(' '),
  })

  if (built.modifier && MOD_EXPLAIN[built.modifier]) {
    const m = MOD_EXPLAIN[built.modifier]
    segments.push({
      cell: m.glyph,
      roleZh: '材料状态',
      roleKey: 'modifier',
      detailZh: `${m.nameZh}。${m.zh}`,
    })
  }

  const datumRanks = [
    {
      roleZh: '主基准',
      detail: (d) =>
        `主基准 ${d}：优先贴合/约束，通常限制约 3 个自由度（例如平面：2 转 + 1 平）。后续基准须在已约束自由度之外继续约束。`,
    },
    {
      roleZh: '第二基准',
      detail: (d) =>
        `第二基准 ${d}：在主基准之后建立，通常再约束约 2 个自由度（如第二平面约束剩余转动与一个平移）。`,
    },
    {
      roleZh: '第三基准',
      detail: (d) =>
        `第三基准 ${d}：完成 3-2-1，通常约束最后 1 个平移自由度，使被测要素相对完整 DRF 定位。`,
    },
  ]

  built.datums.forEach((d, i) => {
    const rank = datumRanks[i] || {
      roleZh: `基准 ${i + 1}`,
      detail: (letter) => `基准 ${letter}：按图样基准要素解释。`,
    }
    segments.push({
      cell: d,
      roleZh: rank.roleZh,
      roleKey: `datum_${i}`,
      detailZh: rank.detail(d),
    })
  })

  const rulesZh = [
    zoneFn?.controls,
    zoneFn ? `不控制：${zoneFn.notControls}` : null,
    depth?.dofNoteZh ? `自由度：${depth.dofNoteZh}` : null,
    built.symbol.mistakeZh ? `误用提醒：${built.symbol.mistakeZh}` : null,
  ].filter(Boolean)

  return {
    ...built,
    segments,
    summaryZh: buildSummaryZh(built, input),
    rulesZh,
    inspectZh: depth?.inspectZh ?? '',
    costZh: depth?.costZh ?? '',
    storyZh: input.storyZh || '',
  }
}


export function decodeExampleById(id) {
  const ex = GDT_DECODE_EXAMPLES.find((e) => e.id === id)
  if (!ex) return null
  return {
    ...ex,
    decoded: decodeFeatureControlFrame({ ...ex.input, storyZh: ex.storyZh }),
  }
}

/**
 * 3-2-1 基准体系：剩余自由度示意
 * primary/secondary/tertiary: '' | 'plane' | 'axis' | 'point'
 */
export function analyzeDatumReferenceFrame(input = {}) {
  const primary = input.primary || 'plane'
  const secondary = input.secondary || 'plane'
  const tertiary = input.tertiary || 'plane'

  // 教学简化：平面主基准锁 3（2 转+1 平），第二平面锁 2，第三锁 1
  const lockOf = {
    plane: { primary: 3, secondary: 2, tertiary: 1 },
    axis: { primary: 4, secondary: 2, tertiary: 1 }, // 轴主基准常锁 4（2 平+2 转近似）
    point: { primary: 3, secondary: 2, tertiary: 1 },
  }

  let locked = 0
  const steps = []
  if (primary) {
    const n = lockOf[primary]?.primary ?? 3
    locked += n
    steps.push({ rank: 1, type: primary, lock: n, label: 'A' })
  }
  if (secondary) {
    const n = lockOf[secondary]?.secondary ?? 2
    locked += n
    steps.push({ rank: 2, type: secondary, lock: n, label: 'B' })
  }
  if (tertiary) {
    const n = lockOf[tertiary]?.tertiary ?? 1
    locked += n
    steps.push({ rank: 3, type: tertiary, lock: n, label: 'C' })
  }

  locked = Math.min(6, locked)
  const remaining = Math.max(0, 6 - locked)

  return {
    primary,
    secondary,
    tertiary,
    locked,
    remaining,
    steps,
    complete: remaining === 0,
    tipZh:
      remaining === 0
        ? '6 个刚体自由度已约束完毕（3-2-1 教学模型）。'
        : `仍剩 ${remaining} 个自由度未约束，孔系位置可能绕未锁方向漂移。`,
    estimateOnly: true,
  }
}

/**
 * 虚拟条件 VC（教学）
 * 孔 @MMC：VC = MMC孔径 − t_geom（内边界）
 * 轴 @MMC：VC = MMC轴径 + t_geom（外边界）
 */
export function calcVirtualCondition(input = {}) {
  const feature = input.feature === 'shaft' ? 'shaft' : 'hole'
  const mmcSize = Number(input.mmcSize)
  const tolGeom = Math.max(0, Number(input.geometricTol) || 0)
  if (!Number.isFinite(mmcSize) || !(mmcSize > 0) || !(tolGeom >= 0)) {
    return { ok: false, errorKey: 'vc_need_inputs' }
  }

  const vc = feature === 'hole' ? mmcSize - tolGeom : mmcSize + tolGeom
  const gageHint =
    feature === 'hole'
      ? `功能量规销径 ≈ VC = ${vc.toFixed(3)}（教学近似）`
      : `功能量规环径 ≈ VC = ${vc.toFixed(3)}（教学近似）`

  return {
    ok: true,
    feature,
    mmcSize,
    geometricTol: tolGeom,
    virtualCondition: vc,
    gageHint,
    formulaZh:
      feature === 'hole'
        ? '孔 MMC：VC = MMC − t（内虚拟边界）'
        : '轴 MMC：VC = MMC + t（外虚拟边界）',
    estimateOnly: true,
  }
}

/**
 * 简单“单特征位置预算”：把位置度 t 换成 ±t/2 贡献提示（非完整栈）
 */
export function estimatePositionBudget(input = {}) {
  const t = Math.max(0, Number(input.tolerance) || 0)
  const count = Math.max(1, Math.round(Number(input.featureCount) || 1))
  const method = input.method === 'rss' ? 'rss' : 'worst'
  if (!(t > 0)) return { ok: false, errorKey: 'budget_need_tol' }

  const half = t / 2
  const worst = half * count
  const rss = half * Math.sqrt(count)
  const stack = method === 'rss' ? rss : worst

  return {
    ok: true,
    tolerance: t,
    featureCount: count,
    method,
    halfBand: half,
    stackUp: stack,
    tipZh:
      method === 'rss'
        ? `RSS 粗估：√n · (t/2) = ${stack.toFixed(4)}（仅示意，正式请用公差栈）`
        : `极值粗估：n · (t/2) = ${stack.toFixed(4)}（偏保守）`,
    estimateOnly: true,
  }
}

export function getSymbolDepth(symbolId) {
  const base = findGdtSymbol(symbolId)
  const depth = GDT_SYMBOL_DEPTH[symbolId]
  if (!base) return null
  return { ...base, ...depth }
}
