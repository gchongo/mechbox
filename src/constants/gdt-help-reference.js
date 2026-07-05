/** GD&T 公差栈帮助页扩展内容 — 计算模式、栈模型、算例与适用边界 */

export const GDT_CALC_MODES_HELP = {
  zh: [
    {
      mode: '简化',
      outputs: '仅叠加公差（RSS / 极值 / Modified RSS）',
      passRule: '合成公差 $T_{stack}$ 落在封闭环 $[0, T_{closed}]$ 内',
      caveat: '已输入基准时不计入基准累积；适配层会标「估算/待复核」，不能据此直接放行',
    },
    {
      mode: '完整',
      outputs: '叠加公差 + 贡献度排序 + 含基准累积',
      passRule: '$T_{stack}$ 通过且 $\\sqrt{T_{stack}^2 + T_{datum}^2} \\le T_{closed}$',
      caveat: '基准按加权 RSS 近似，仅用于前期公差预算',
    },
    {
      mode: '专业',
      outputs: '完整模式输出 + 敏感度排序 + 极值裕度',
      passRule: '完整模式通过且 worst-case 裕度 $\\ge 0$',
      caveat: 'RSS 通过不等于极值安全；功能件应同时看极值裕度',
    },
  ],
  en: [
    {
      mode: 'Simplified',
      outputs: 'Stacked tolerance only (RSS / worst / modified RSS)',
      passRule: '$T_{stack}$ within closed zone $[0, T_{closed}]$',
      caveat: 'Datums ignored; adapter marks estimate-only—do not release on this alone',
    },
    {
      mode: 'Full',
      outputs: 'Stack + contribution ranking + datum accumulation',
      passRule: '$T_{stack}$ pass and $\\sqrt{T_{stack}^2 + T_{datum}^2} \\le T_{closed}$',
      caveat: 'Datum model is weighted RSS—early budget only',
    },
    {
      mode: 'Professional',
      outputs: 'Full outputs + sensitivity ranking + worst-case margin',
      passRule: 'Full pass and worst-case margin $\\ge 0$',
      caveat: 'RSS pass does not imply worst-case safety',
    },
  ],
}

export const GDT_STACK_MODELS = {
  zh: [
    {
      type: '位置度链 (2d-position)',
      formula: 'T_{pos} = 2\\sqrt{(T_x/2)^2 + (T_y/2)^2}',
      worst: 'T_{pos}^{worst} = T_x + T_y',
      note: 'X/Y 环按方向分组 RSS；无方向环归入 X 轴。系数 factor 为传递灵敏度。',
    },
    {
      type: '平面度 / 直线度 (form-direct)',
      formula: 'T = \\sqrt{\\sum T_i^2} \\text{ 或 } \\sum T_i',
      worst: '极值法直接相加',
      note: '多平面 flatness 等直接叠加至 $[0, T_{closed}]$ 预算带。',
    },
    {
      type: '同轴度 / 跳动 / 圆度 (radial)',
      formula: 'T_{rad} = \\sqrt{\\sum (f_i T_i)^2}',
      worst: 'T_{rad} = \\sum f_i T_i',
      note: '径向误差源 RSS 合成，适用于 runout、偏心、游隙等。',
    },
    {
      type: '平行度 / 垂直度 / 轮廓 (form-linear)',
      formula: 'T = \\sqrt{\\sum (f_i T_i)^2}',
      worst: '极值相加',
      note: '相关面 flatness 与定位尺寸按 1D RSS 预算。',
    },
    {
      type: '3D 装配链 (1d-weighted)',
      formula: 'T = \\sqrt{\\sum (f_i T_i)^2}',
      worst: '极值相加',
      note: '传递系数 $f_i$ 表示方向灵敏度；箱体/机架装配常用。',
    },
  ],
  en: [
    {
      type: 'Position (2d-position)',
      formula: 'T_{pos} = 2\\sqrt{(T_x/2)^2 + (T_y/2)^2}',
      worst: 'T_{pos}^{worst} = T_x + T_y',
      note: 'X/Y rings grouped by direction; undirected rings go to X. factor = sensitivity.',
    },
    {
      type: 'Flatness / straightness (form-direct)',
      formula: 'T = \\sqrt{\\sum T_i^2} \\text{ or } \\sum T_i',
      worst: 'Worst-case sum',
      note: 'Multiple flatness zones stack to budget band $[0, T_{closed}]$.',
    },
    {
      type: 'Coaxiality / runout / roundness (radial)',
      formula: 'T_{rad} = \\sqrt{\\sum (f_i T_i)^2}',
      worst: 'T_{rad} = \\sum f_i T_i',
      note: 'Radial errors RSS-combined—runout, eccentricity, clearance, etc.',
    },
    {
      type: 'Parallelism / perpendicularity / profile (form-linear)',
      formula: 'T = \\sqrt{\\sum (f_i T_i)^2}',
      worst: 'Worst-case sum',
      note: 'Related face flatness and locating dimensions as 1D RSS budget.',
    },
    {
      type: '3D assembly (1d-weighted)',
      formula: 'T = \\sqrt{\\sum (f_i T_i)^2}',
      worst: 'Worst-case sum',
      note: 'factor $f_i$ = directional sensitivity; housings, frames.',
    },
  ],
}

/** 孔组位置度预设逐步验算（与工具默认预设一致） */
export const GDT_POSITION_EXAMPLE_STEPS = {
  zh: [
    { step: '输入', detail: 'X 定位 0.0500、Y 定位 0.0400、孔径 0.0200×系数 0.5（X 向）；封闭环上限 0.1500；基准 A 0.0200（主）、B 0.0300（次）；RFS' },
    {
      step: '叠加公差',
      detail: '$T_x=\\sqrt{0.05^2+0.01^2}=0.05099$；$T_{pos}=2\\sqrt{(0.0255)^2+(0.02)^2}\\approx 0.0648$ mm',
    },
    {
      step: '贡献度',
      detail: '2D RSS 下方差在 X/Y 各分 50%：Y 定位 50.0%、X 定位 48.1%、孔径 1.9% — 优先收紧 Y、X 定位',
    },
    {
      step: '含基准',
      detail: '$T_{datum}=\\sqrt{(1.0\\times0.02)^2+(0.7\\times0.03)^2}\\approx 0.0290$；$T_{含基准}=\\sqrt{0.0648^2+0.0290^2}\\approx 0.0710$ mm',
    },
    {
      step: '极值裕度',
      detail: '$T_x^{worst}=0.06$，$T_y^{worst}=0.04$ → $T_{pos}^{worst}=0.10$；裕度 $=0.15-0.10=0.0500$ mm',
    },
    { step: '判定', detail: 'RSS、含基准、极值均通过；设计裕量充足，孔径贡献可忽略' },
  ],
  en: [
    { step: 'Inputs', detail: 'X loc 0.0500, Y loc 0.0400, hole Ø 0.0200×0.5 (X); closed max 0.1500; datum A 0.0200 (primary), B 0.0300 (secondary); RFS' },
    {
      step: 'Stack',
      detail: '$T_x=\\sqrt{0.05^2+0.01^2}=0.05099$; $T_{pos}=2\\sqrt{(0.0255)^2+(0.02)^2}\\approx 0.0648$ mm',
    },
    {
      step: 'Contributions',
      detail: '2D RSS splits variance 50/50 on axes: Y 50.0%, X 48.1%, hole 1.9% — tighten Y and X first',
    },
    {
      step: 'With datums',
      detail: '$T_{datum}=\\sqrt{(1.0\\times0.02)^2+(0.7\\times0.03)^2}\\approx 0.0290$; combined $\\approx 0.0710$ mm',
    },
    {
      step: 'Worst margin',
      detail: '$T_x^{worst}=0.06$, $T_y^{worst}=0.04$ → $T_{pos}^{worst}=0.10$; margin $=0.05$ mm',
    },
    { step: 'Verdict', detail: 'RSS, with datums, and worst-case all pass; ample margin; hole contribution negligible' },
  ],
}

export const GDT_DATUM_WEIGHTS = {
  zh: [
    { priority: '主基准 (primary)', weight: '1.0', meaning: '第一基准面/轴，累积权重最高' },
    { priority: '次基准 (secondary)', weight: '0.7', meaning: '第二基准，影响次于主基准' },
    { priority: '第三基准 (tertiary)', weight: '0.5', meaning: '第三基准，进一步降权' },
  ],
  en: [
    { priority: 'Primary', weight: '1.0', meaning: 'First datum—highest accumulation weight' },
    { priority: 'Secondary', weight: '0.7', meaning: 'Second datum—less than primary' },
    { priority: 'Tertiary', weight: '0.5', meaning: 'Third datum—lowest weight' },
  ],
}

export const GDT_MMC_RULES = {
  zh: [
    { item: 'RFS', rule: '无奖励公差；$T_{eff}=T_{stack}$' },
    { item: 'MMC', rule: '仅尺寸要素 (孔/轴) 参与；自动模式奖励 ≈ 各 FOS 尺寸公差全额之和；$T_{eff}=T_{stack}-bonus$' },
    { item: 'LMC', rule: '同 MMC 识别 FOS；奖励按半额计入（保守简化）' },
    { item: '自动 vs 手动', rule: 'autoBonus 关闭时用 bonusTolerance 手动值；无 FOS 时回退手动输入' },
  ],
  en: [
    { item: 'RFS', rule: 'No bonus; $T_{eff}=T_{stack}$' },
    { item: 'MMC', rule: 'FOS (hole/shaft) only; auto bonus ≈ sum of full size tolerances; $T_{eff}=T_{stack}-bonus$' },
    { item: 'LMC', rule: 'Same FOS detection; bonus at 50% (conservative simplification)' },
    { item: 'Auto vs manual', rule: 'Manual bonusTolerance when autoBonus off; falls back if no FOS rings' },
  ],
}

export const GDT_LIMITATIONS = {
  zh: [
    '基准模型为加权 flatness/perpendicularity RSS，未仿真完整 datum reference frame shift、simultaneous requirement、孔组 pattern 等 ASME Y14.5 机制。',
    '位置度与孔径耦合通过 factor 传递系数近似，不等同于标准中 bonus tolerance 与 actual mating envelope 的逐件关系。',
    'MMC 自动奖励按尺寸公差全额估计，未按实测离 MMC 的偏离量计算——偏教学/保守。',
    '封闭环 $[0, T_{closed}]$ 为形位公差预算带；若误填对称尺寸链带，判定语义会不同。',
    '简化模式有基准输入时界面可能仍显示 RSS 通过，但系统标 estimateOnly，须切换完整/专业模式复核。',
    '本工具用于前期公差预算与方案比较，不能替代 CMM 检测、GD&T 仿真或正式 ASME/ISO 符合性判定。',
  ],
  en: [
    'Datum model is weighted RSS—not full DRF shift, simultaneous requirements, or pattern tolerance per ASME Y14.5.',
    'Hole/size coupling uses factor sensitivity—not item-by-item bonus vs actual mating envelope.',
    'Auto MMC bonus uses full size tolerance—conservative/teaching; not per measured departure from MMC.',
    'Closed zone $[0, T_{closed}]$ is a geometric budget band; symmetric size-chain bands change pass semantics.',
    'Simplified mode with datums may show RSS pass but marks estimateOnly—use Full/Professional.',
    'For early tolerance budgeting and comparison—not CMM, GD&T simulation, or formal ASME/ISO compliance.',
  ],
}

export function getGdtHelpRef(locale = 'zh') {
  const loc = locale === 'en' ? 'en' : 'zh'
  return {
    calcModes: GDT_CALC_MODES_HELP[loc],
    stackModels: GDT_STACK_MODELS[loc],
    exampleSteps: GDT_POSITION_EXAMPLE_STEPS[loc],
    datumWeights: GDT_DATUM_WEIGHTS[loc],
    mmcRules: GDT_MMC_RULES[loc],
    limitations: GDT_LIMITATIONS[loc],
  }
}
