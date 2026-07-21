/**
 * ASME Y14.5 / ISO 1101 形位公差符号（教学交互，非正式标准全文）
 */

/** @typedef {'form'|'profile'|'orientation'|'location'|'runout'} GdtCategoryId */

export const GDT_CATEGORIES = [
  {
    id: 'form',
    labelZh: '形状公差',
    labelEn: 'Form',
    symbols: [
      {
        id: 'straightness',
        glyph: '⏤',
        nameZh: '直线度',
        nameEn: 'Straightness',
        noteZh: '要素自身直线偏离',
        datumRequired: false,
        diameterZone: 'optional',
        useZh: '轴心线、刃口、导轨直线；可与 MMC 用于轴/孔轴线。',
        zoneZh: '两平行平面（面）或圆柱公差带（轴线 Ø）。',
        mistakeZh: '把轴线直线度当成位置度；有配合孔轴时忽略 MMC 红利。',
      },
      {
        id: 'flatness',
        glyph: '⏥',
        nameZh: '平面度',
        nameEn: 'Flatness',
        noteZh: '平面自身偏离',
        datumRequired: false,
        diameterZone: 'no',
        useZh: '密封面、安装面、基准候选面自身平整。',
        zoneZh: '整个被测表面位于间距为 t 的两平行平面之间。',
        mistakeZh: '用平面度代替平行度（后者相对基准）。',
      },
      {
        id: 'circularity',
        glyph: '○',
        nameZh: '圆度',
        nameEn: 'Circularity',
        noteZh: '任一正截面圆轮廓',
        datumRequired: false,
        diameterZone: 'no',
        useZh: '轴承座孔、轴颈任一横截面不圆度。',
        zoneZh: '任一正截面内半径差为 t 的两同心圆之间。',
        mistakeZh: '用圆度代替圆柱度（后者控制全长表面）。',
      },
      {
        id: 'cylindricity',
        glyph: '⌭',
        nameZh: '圆柱度',
        nameEn: 'Cylindricity',
        noteZh: '整圆柱面综合',
        datumRequired: false,
        diameterZone: 'no',
        useZh: '活塞、液压缸筒、精密轴外圆综合形状。',
        zoneZh: '整个被测圆柱面位于半径差为 t 的两同轴圆柱面之间。',
        mistakeZh: '加工/检测成本高，非必要勿默认圆柱度。',
      },
    ],
  },
  {
    id: 'profile',
    labelZh: '轮廓公差',
    labelEn: 'Profile',
    symbols: [
      {
        id: 'profile_line',
        glyph: '⌒',
        nameZh: '线轮廓度',
        nameEn: 'Profile of a line',
        noteZh: '截面线轮廓',
        datumRequired: 'optional',
        diameterZone: 'no',
        useZh: '2D 曲线截面（凸轮廓线、钣金断面）。',
        zoneZh: '截面线位于沿理论正确轮廓法向、总宽度为 t 的两等距曲线之间（无特殊规定时对称分布）。',
        mistakeZh: '三维曲面误用线轮廓度；应用面轮廓度。',
      },
      {
        id: 'profile_surface',
        glyph: '⌓',
        nameZh: '面轮廓度',
        nameEn: 'Profile of a surface',
        noteZh: '三维面轮廓',
        datumRequired: 'optional',
        diameterZone: 'no',
        useZh: '自由曲面、复合面、车身覆盖件。',
        zoneZh: '整个表面位于沿理论正确轮廓法向、总宽度为 t 的两等距曲面之间（无特殊规定时对称分布）。',
        mistakeZh: '无基准时仅控制形状；定位还需基准体系。',
      },
    ],
  },
  {
    id: 'orientation',
    labelZh: '方向公差',
    labelEn: 'Orientation',
    symbols: [
      {
        id: 'parallelism',
        glyph: '∥',
        nameZh: '平行度',
        nameEn: 'Parallelism',
        noteZh: '相对基准平行',
        datumRequired: true,
        diameterZone: 'optional',
        useZh: '导轨相对、孔系轴线平行、安装面平行。',
        zoneZh: '面平行度为与基准平面平行、间距为 t 的两平行平面之间。',
        mistakeZh: '无基准却标平行度；应先立基准。',
      },
      {
        id: 'perpendicularity',
        glyph: '⟂',
        nameZh: '垂直度',
        nameEn: 'Perpendicularity',
        noteZh: '相对基准垂直',
        datumRequired: true,
        diameterZone: 'optional',
        useZh: '孔相对安装面垂直、端面相对轴线垂直。',
        zoneZh: '面垂直度为与基准面垂直、间距为 t 的两平行平面之间；轴线加 ⌀ 时为直径 t 的圆柱带。',
        mistakeZh: '与位置度混淆：垂直度只管方向，不管位置偏移。',
      },
      {
        id: 'angularity',
        glyph: '∠',
        nameZh: '倾斜度',
        nameEn: 'Angularity',
        noteZh: '相对基准倾斜角',
        datumRequired: true,
        diameterZone: 'optional',
        useZh: '非 90° 的斜面/斜孔相对基准。',
        zoneZh: '表面位于与基准成基本角 α、法向间距为 t 的两平行平面之间；轴线带标注 ⌀ 时为圆柱带。',
        mistakeZh: '90° 场合应优先用垂直度符号。',
      },
    ],
  },
  {
    id: 'location',
    labelZh: '位置公差',
    labelEn: 'Location',
    symbols: [
      {
        id: 'position',
        glyph: '⌖',
        nameZh: '位置度',
        nameEn: 'Position',
        noteZh: '相对基准位置（常用）',
        datumRequired: true,
        diameterZone: 'usual',
        useZh: '孔系、销孔、螺纹孔相对基准体系定位（最常用）。',
        zoneZh: '孔轴线通常位于理论正确位置处直径为 ⌀t 的圆柱公差带内。',
        mistakeZh: '漏标基准；有配合时忽略 MMC/LMC 红利。',
      },
      {
        id: 'concentricity',
        glyph: '◎',
        nameZh: '同轴度',
        nameEn: 'Concentricity / Coaxiality',
        noteZh: 'ISO 同轴；ASME 同轴度慎用',
        datumRequired: true,
        diameterZone: 'usual',
        useZh: 'ISO：轴线同轴；ASME 更推荐位置度/跳动替代同轴度。',
        zoneZh: '导出中线位于与基准轴线同轴、直径为 ⌀t 的圆柱公差带内。',
        mistakeZh: 'ASME 图样滥用 concentricity（检测困难）；优先位置度或跳动。',
      },
      {
        id: 'symmetry',
        glyph: '⌯',
        nameZh: '对称度',
        nameEn: 'Symmetry',
        noteZh: '相对中心平面对称',
        datumRequired: true,
        diameterZone: 'no',
        useZh: '键槽、槽口相对中心平面对称。',
        zoneZh: '相对基准中心平面的对称带。',
        mistakeZh: 'ASME 中较少用，可用位置度表达。',
      },
    ],
  },
  {
    id: 'runout',
    labelZh: '跳动公差',
    labelEn: 'Runout',
    symbols: [
      {
        id: 'circular_runout',
        glyph: '↗',
        nameZh: '圆跳动',
        nameEn: 'Circular runout',
        noteZh: '单截面径向/端面',
        datumRequired: true,
        diameterZone: 'no',
        useZh: '旋转件径向跳动、端面跳动（单截面检测）。',
        zoneZh: '任一正截面内，实际圆轮廓位于相对基准轴、半径差为 t 的两同心圆之间。',
        mistakeZh: '需要全表面控制时应用全跳动。',
      },
      {
        id: 'total_runout',
        glyph: '↗↗',
        nameZh: '全跳动',
        nameEn: 'Total runout',
        noteZh: '全表面综合跳动',
        datumRequired: true,
        diameterZone: 'no',
        useZh: '精密轴全长径向、端面全跳（综合形状+位置）。',
        zoneZh: '径向全跳动时，整个实际圆柱面位于相对基准轴、半径差为 t 的两同轴圆柱面之间。',
        mistakeZh: '要求严、成本高；能用圆跳动则勿升全跳动。',
      },
    ],
  },
]

export const GDT_MODIFIERS = [
  {
    id: 'mmc',
    glyph: 'Ⓜ',
    nameZh: '最大实体要求 MMC',
    nameEn: 'MMC',
    tipZh: '尺寸偏离最大实体时公差带可增大（红利公差），利于装配。',
  },
  {
    id: 'lmc',
    glyph: 'Ⓛ',
    nameZh: '最小实体要求 LMC',
    nameEn: 'LMC',
    tipZh: '保证最小壁厚/强度时常用；尺寸偏离最小实体可获红利。',
  },
  {
    id: 'rfs',
    glyph: 'Ⓢ',
    nameZh: '与尺寸无关 RFS',
    nameEn: 'RFS',
    tipZh: '默认：几何公差与实际尺寸无关，无红利。',
  },
  {
    id: 'projected',
    glyph: 'Ⓟ',
    nameZh: '延伸公差带',
    nameEn: 'Projected tolerance zone',
    tipZh: '控制装配后伸出段（如螺柱装配干涉）。',
  },
  {
    id: 'free_state',
    glyph: 'Ⓕ',
    nameZh: '自由状态',
    nameEn: 'Free state',
    tipZh: '非刚性件在无约束状态下检验。',
  },
  {
    id: 'tangent',
    glyph: 'Ⓣ',
    nameZh: '切面',
    nameEn: 'Tangent plane',
    tipZh: '用切平面代替表面高点控制方向。',
  },
]

export const GDT_DATUM = [
  { id: 'datum_feature', glyph: 'Ａ', nameZh: '基准要素字母', nameEn: 'Datum feature' },
  { id: 'datum_target', glyph: '⊕', nameZh: '基准目标', nameEn: 'Datum target' },
]

/** 场景选型：选工况 → 推荐符号 */
export const GDT_SCENARIOS = [
  {
    id: 'hole_pattern',
    labelZh: '安装孔系相对基准定位',
    labelEn: 'Hole pattern to datums',
    recommendIds: ['position'],
    whyZh: '孔系功能定位首选位置度，可配合 Ø 与 MMC。',
  },
  {
    id: 'seal_face',
    labelZh: '密封/安装平面自身平整',
    labelEn: 'Seal / mounting flatness',
    recommendIds: ['flatness'],
    whyZh: '无相对基准时用平面度；相对另一面平行再用平行度。',
  },
  {
    id: 'bearing_bore',
    labelZh: '轴承孔不圆 / 圆柱综合',
    labelEn: 'Bearing bore roundness',
    recommendIds: ['circularity', 'cylindricity'],
    whyZh: '单截面圆度；全长综合用圆柱度（更严）。',
  },
  {
    id: 'shaft_runout',
    labelZh: '旋转轴相对基准跳动',
    labelEn: 'Shaft runout to datum',
    recommendIds: ['circular_runout', 'total_runout'],
    whyZh: '单截面圆跳动即可时用圆跳动；全长用全跳动。',
  },
  {
    id: 'hole_perp',
    labelZh: '孔相对安装面垂直',
    labelEn: 'Hole perpendicular to face',
    recommendIds: ['perpendicularity', 'position'],
    whyZh: '只要方向用垂直度；既要方向又要位置用位置度。',
  },
  {
    id: 'keyway',
    labelZh: '键槽相对中心对称',
    labelEn: 'Keyway symmetry',
    recommendIds: ['symmetry', 'position'],
    whyZh: '可用对称度；也可用位置度相对中心平面表达。',
  },
]

export function listAllGdtSymbols() {
  return GDT_CATEGORIES.flatMap((c) =>
    c.symbols.map((s) => ({
      ...s,
      categoryId: c.id,
      categoryZh: c.labelZh,
      categoryEn: c.labelEn,
    })),
  )
}

export function findGdtSymbol(id) {
  return listAllGdtSymbols().find((s) => s.id === id) ?? null
}

/**
 * 拼特征控制框文本段
 * @param {{
 *   symbolId: string,
 *   diameter?: boolean,
 *   tolerance?: number|string,
 *   modifier?: ''|'mmc'|'lmc'|'rfs',
 *   datums?: string[],
 * }} input
 */
export function buildFeatureControlFrame(input = {}) {
  const sym = findGdtSymbol(input.symbolId)
  if (!sym) return { ok: false, errorKey: 'need_symbol' }

  const tolRaw = input.tolerance
  const tolNum = Number(tolRaw)
  if (tolRaw === '' || tolRaw == null || !Number.isFinite(tolNum) || tolNum <= 0) {
    return { ok: false, errorKey: 'need_tolerance', symbol: sym }
  }

  const useDia =
    input.diameter === true ||
    (input.diameter !== false && (sym.diameterZone === 'usual' || sym.diameterZone === 'optional'))
  const forceDia = input.diameter === true
  const allowDia = sym.diameterZone !== 'no'
  const showDia = allowDia && (forceDia || (input.diameter !== false && sym.diameterZone === 'usual'))

  const modMap = { mmc: 'Ⓜ', lmc: 'Ⓛ', rfs: 'Ⓢ' }
  const mod = modMap[input.modifier] || ''
  const datums = (input.datums || []).map((d) => String(d).trim().toUpperCase()).filter(Boolean)

  if (sym.datumRequired === true && datums.length === 0) {
    return {
      ok: false,
      errorKey: 'need_datum',
      symbol: sym,
      warnings: ['datum_required'],
    }
  }

  const tolText = `${showDia ? 'Ø' : ''}${tolNum}`
  const cells = [sym.glyph, tolText, ...(mod ? [mod] : []), ...datums]
  const warnings = []
  if (sym.datumRequired === true && datums.length === 1) warnings.push('single_datum')
  if (input.modifier === 'mmc' && !showDia && sym.diameterZone !== 'no') {
    warnings.push('mmc_without_dia')
  }
  if (sym.diameterZone === 'no' && input.diameter === true) warnings.push('dia_not_for_symbol')

  return {
    ok: true,
    symbol: sym,
    cells,
    text: cells.join(' | '),
    showDia,
    modifier: input.modifier || '',
    datums,
    warnings,
    needsDatum: sym.datumRequired === true,
  }
}

export function recommendForScenario(scenarioId) {
  const sc = GDT_SCENARIOS.find((s) => s.id === scenarioId)
  if (!sc) return null
  return {
    ...sc,
    symbols: sc.recommendIds.map((id) => findGdtSymbol(id)).filter(Boolean),
  }
}

/** 易混淆符号对比组 */
export const GDT_COMPARE_PAIRS = [
  {
    id: 'circ_vs_cyl',
    leftId: 'circularity',
    rightId: 'cylindricity',
    tipZh: '圆度只控截面；圆柱度控全长圆柱面（更严、更贵）。',
  },
  {
    id: 'flat_vs_par',
    leftId: 'flatness',
    rightId: 'parallelism',
    tipZh: '平面度无基准；平行度相对基准。',
  },
  {
    id: 'perp_vs_pos',
    leftId: 'perpendicularity',
    rightId: 'position',
    tipZh: '垂直度只管方向；位置度同时约束位置与方向。',
  },
  {
    id: 'run_vs_total',
    leftId: 'circular_runout',
    rightId: 'total_runout',
    tipZh: '圆跳动单截面；全跳动扫全表面。',
  },
  {
    id: 'coax_vs_pos',
    leftId: 'concentricity',
    rightId: 'position',
    tipZh: 'ASME 实务更常以位置度/跳动代替同轴度。',
  },
]

/**
 * MMC 红利试算（孔：实际尺寸越大红利越大；轴相反）
 * bonus = |实际 − MMC 极限|（在公差带内时）
 */
export function calcMmcBonus(input = {}) {
  const feature = input.feature === 'shaft' ? 'shaft' : 'hole'
  const tolGeom = Math.max(0, Number(input.geometricTol) || 0)
  const mmcSize = Number(input.mmcSize)
  const actualSize = Number(input.actualSize)
  if (!Number.isFinite(mmcSize) || !Number.isFinite(actualSize) || !(tolGeom > 0)) {
    return { ok: false, errorKey: 'mmc_need_inputs' }
  }

  // 孔 MMC = 最小孔径；轴 MMC = 最大轴径
  let bonus = 0
  if (feature === 'hole') {
    bonus = Math.max(0, actualSize - mmcSize)
  } else {
    bonus = Math.max(0, mmcSize - actualSize)
  }
  const effective = tolGeom + bonus
  return {
    ok: true,
    feature,
    geometricTol: tolGeom,
    mmcSize,
    actualSize,
    bonus,
    effectiveTol: effective,
    estimateOnly: true,
  }
}

/** 零件示意上的可点击特征 */
export const GDT_PART_FEATURES = [
  {
    id: 'top_face',
    labelZh: '顶面',
    labelEn: 'Top face',
    x: 120,
    y: 48,
    suggestIds: ['flatness', 'parallelism'],
    hintZh: '密封/安装面：自身平整用平面度；相对底面用平行度。',
  },
  {
    id: 'bore',
    labelZh: '孔',
    labelEn: 'Bore',
    x: 210,
    y: 118,
    suggestIds: ['position', 'perpendicularity', 'circularity'],
    hintZh: '孔系定位用位置度；只要垂直用垂直度；截面圆度用圆度。',
  },
  {
    id: 'side_face',
    labelZh: '侧面',
    labelEn: 'Side face',
    x: 320,
    y: 130,
    suggestIds: ['perpendicularity', 'flatness'],
    hintZh: '相对底面垂直，或自身平面度。',
  },
  {
    id: 'bottom_datum',
    labelZh: '底面基准 A',
    labelEn: 'Bottom datum A',
    x: 200,
    y: 198,
    suggestIds: ['flatness'],
    hintZh: '常作主基准；可先控平面度再作为基准 A。',
  },
]

/**
 * 生成练习题（可复现随机）
 * @param {number} [seed]
 */
export function generateGdtQuiz(seed = Date.now()) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  const rnd = () => {
    s = (s * 48271) % 2147483647
    return (s - 1) / 2147483646
  }
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)]
  const shuffle = (arr) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const all = listAllGdtSymbols()
  const questions = []

  // 看符号选名称
  for (let i = 0; i < 4; i++) {
    const correct = pick(all)
    const distractors = shuffle(all.filter((x) => x.id !== correct.id)).slice(0, 3)
    const options = shuffle([correct, ...distractors])
    questions.push({
      type: 'glyph_to_name',
      id: `g2n_${i}_${correct.id}`,
      promptGlyph: correct.glyph,
      promptZh: '这个符号是？',
      correctId: correct.id,
      options: options.map((o) => ({ id: o.id, labelZh: o.nameZh, glyph: o.glyph })),
    })
  }

  // 看场景选符号
  for (let i = 0; i < 3; i++) {
    const sc = pick(GDT_SCENARIOS)
    const correctId = sc.recommendIds[0]
    const correct = findGdtSymbol(correctId)
    const distractors = shuffle(all.filter((x) => x.id !== correctId)).slice(0, 3)
    const options = shuffle([correct, ...distractors])
    questions.push({
      type: 'scenario_to_symbol',
      id: `s2g_${i}_${sc.id}`,
      promptZh: sc.labelZh,
      correctId,
      options: options.map((o) => ({ id: o.id, labelZh: `${o.glyph} ${o.nameZh}`, glyph: o.glyph })),
    })
  }

  // 对错判断
  const facts = [
    { text: '平面度需要基准。', answer: false, explain: '平面度是形状公差，不需基准。' },
    { text: '位置度通常需要基准体系。', answer: true, explain: '位置度相对基准定位。' },
    { text: '圆度控制整个圆柱全长。', answer: false, explain: '圆度只管截面；全长用圆柱度。' },
    { text: 'MMC 可在尺寸偏离最大实体时增大几何公差带。', answer: true, explain: '红利公差概念。' },
    { text: '垂直度同时限制孔的平面位置偏移。', answer: false, explain: '垂直度只管方向；位置用位置度。' },
  ]
  for (let i = 0; i < 3; i++) {
    const f = pick(facts)
    questions.push({
      type: 'true_false',
      id: `tf_${i}_${f.text.slice(0, 8)}`,
      promptZh: f.text,
      correctBool: f.answer,
      explainZh: f.explain,
    })
  }

  return { seed, questions: shuffle(questions).slice(0, 8) }
}

export function scoreGdtAnswer(question, answer) {
  if (!question) return { correct: false }
  if (question.type === 'true_false') {
    const correct = answer === question.correctBool
    return { correct, explainZh: question.explainZh }
  }
  const correct = answer === question.correctId
  const sym = findGdtSymbol(question.correctId)
  return {
    correct,
    explainZh: correct
      ? '正确'
      : `正确答案：${sym ? `${sym.glyph} ${sym.nameZh}` : question.correctId}`,
  }
}

