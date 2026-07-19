/**
 * 疲劳寿命帮助页扩展 — 计算模式、S-N/Miner、判定与门禁
 */
import { CRITICAL_INPUT_SPECS } from '@/utils/critical-input-guard'
import { SN_MATERIALS } from '@/utils/fatigue-calc'

export const FATIGUE_CALC_MODES = {
  zh: [
    {
      mode: '简化',
      features: '单级应力幅 $S_a$ → Basquin 寿命 $N$；无 Miner 载荷谱',
      passRule: '**通过判定恒为否**（仅估算）；左侧仍显示估算寿命',
      caveat: '只看数量级，不能作为放行依据',
    },
    {
      mode: '完整',
      features: '单级寿命 + **Miner 多级载荷谱** $D=\\sum n_i/N_{f,i}$',
      passRule: '有载荷谱时 **综合通过判定 = ($D<1$)**；Miner 用谱面 **原始 $S_a$**，$N_f$ 以材料 $\\sigma_{-1}$ 为膝点',
      caveat: '不含 $S_m$、$k_a$、$k_b$；左侧单级与 Miner **独立**，综合通过判定不看单级',
    },
    {
      mode: '专业',
      features: '完整 + Goodman/Soderberg + $k_a,k_b$；Miner 各级 $S_{a,eff,i}$ 与 $S_e\'=k_a k_b\\sigma_{-1}$',
      passRule: '有载荷谱时 **综合通过判定 = ($D<1$)**（Miner 已含平均应力与 $S_e\'$）；单级区为 **对照**',
      caveat: '与完整同参时 D 往往更大、更保守；$k_a k_b<1$ 时单级常 ✗ 即使 Sa 已为 UI 最小值',
    },
  ],
  en: [
    {
      mode: 'Simplified',
      features: 'Single $S_a$ → Basquin life $N$; no Miner spectrum',
      passRule: '**pass always false** (estimateOnly); life still shown left',
      caveat: 'Magnitude only—not a release basis',
    },
    {
      mode: 'Full',
      features: 'Single-level life + **Miner** $D=\\sum n_i/N_{f,i}$',
      passRule: 'With spectrum: **overall pass = (D<1)**; Miner uses **raw Sa**, $N_f$ knee at material $\\sigma_{-1}$',
      caveat: 'No $S_m$, $k_a$, $k_b$; single-level vs Miner **independent**; overall pass ignores single-level',
    },
    {
      mode: 'Professional',
      features: 'Full + Goodman/Soderberg + $k_a,k_b$; Miner blocks use $S_{a,eff,i}$ vs $S_e\'$',
      passRule: 'With spectrum: **overall pass = (D<1)** (Miner includes mean stress & Se′); single-level is **reference**',
      caveat: 'Same inputs as Full often give higher D; with $k_a k_b<1$ single-level may fail at min Sa',
    },
  ],
}

export const FATIGUE_SN_MATERIALS = {
  zh: [
    { key: 'steel_45', label: '45 钢（调质）', sf: '900', b: '−0.085', endurance: '280', nref: '10⁶' },
    { key: 'steel_40cr', label: '40Cr（调质）', sf: '1100', b: '−0.09', endurance: '350', nref: '10⁶' },
    { key: 'spring_steel', label: '弹簧钢', sf: '2000', b: '−0.10', endurance: '450', nref: '10⁶' },
    { key: 'aluminum_6061', label: '6061-T6', sf: '450', b: '−0.102', endurance: '97', nref: '5×10⁸' },
    { key: 'cast_iron', label: '灰铸铁', sf: '400', b: '−0.08', endurance: '100', nref: '10⁶' },
  ],
  en: [
    { key: 'steel_45', label: '45 steel (QT)', sf: '900', b: '−0.085', endurance: '280', nref: '10⁶' },
    { key: 'steel_40cr', label: '40Cr (QT)', sf: '1100', b: '−0.09', endurance: '350', nref: '10⁶' },
    { key: 'spring_steel', label: 'Spring steel', sf: '2000', b: '−0.10', endurance: '450', nref: '10⁶' },
    { key: 'aluminum_6061', label: '6061-T6', sf: '450', b: '−0.102', endurance: '97', nref: '5×10⁸' },
    { key: 'cast_iron', label: 'Gray cast iron', sf: '400', b: '−0.08', endurance: '100', nref: '10⁶' },
  ],
}

export const FATIGUE_FORMULAS = {
  zh: [
    { name: 'Basquin 强度', latex: 'S(N) = S_f\' \\cdot N^b \\quad (N < N_{ref})', note: '$N_{ref}$ = cycleLimit；$N \\ge N_{ref}$ 时 $S=\\sigma_{-1}$' },
    { name: '应力幅 → 寿命', latex: 'N = \\left(\\frac{S_a}{S_f\'}\\right)^{1/b}', note: '$S_a \\le \\sigma_{-1}$ 时 $N=\\infty$' },
    { name: 'Miner 损伤', latex: 'D = \\sum_i \\frac{n_i}{N_{f,i}}', note: '专业：$N_{f,i}$ 由 $S_{a,eff,i}$ 与 $S_e\'$ 查 Basquin；恒定 $S_m$ 假设' },
    { name: 'Goodman 等效幅', latex: 'S_{a,eff} = \\frac{S_a}{1 - S_m / \\sigma_u}', note: '专业模式；$S_m \\ge \\sigma_u$ → 等效幅 ∞' },
    { name: '修正持久极限', latex: "\\sigma'_{-1} = k_a \\cdot k_b \\cdot \\sigma_{-1}", note: '专业模式表面/尺寸系数' },
  ],
  en: [
    { name: 'Basquin strength', latex: 'S(N) = S_f\' \\cdot N^b \\quad (N < N_{ref})', note: 'At $N \\ge N_{ref}$: $S=\\sigma_{-1}$' },
    { name: 'Stress to life', latex: 'N = \\left(\\frac{S_a}{S_f\'}\\right)^{1/b}', note: '$S_a \\le \\sigma_{-1}$ → $N=\\infty$' },
    { name: 'Miner damage', latex: 'D = \\sum_i \\frac{n_i}{N_{f,i}}', note: 'Professional: $N_{f,i}$ from $S_{a,eff,i}$ vs $S_e\'$; constant $S_m$ assumed' },
    { name: 'Goodman effective', latex: 'S_{a,eff} = \\frac{S_a}{1 - S_m / \\sigma_u}', note: 'Professional mode' },
    { name: 'Adjusted endurance', latex: "\\sigma'_{-1} = k_a \\cdot k_b \\cdot \\sigma_{-1}", note: 'Surface & size factors' },
  ],
}

export const FATIGUE_PASS_CHECKS = {
  zh: [
    { check: '综合判定（有载荷谱）', rule: '**pass = (D<1)**；与左侧单级 ✓/✗ **无关**' },
    { check: '综合判定（无载荷谱）', rule: 'pass = ($N=\\infty$ 或 $N \\ge N_{target}$)' },
    { check: '单级判定（右栏）', rule: '对照：$N\\ge N_{target}$ 且（专业）$S_{a,eff}\\le S_e\'$；**不驱动**综合 pass' },
    { check: '简化模式', rule: 'pass 恒 false（estimateOnly）；仅看数量级' },
    { check: 'Miner 状态', rule: '$D<0.8$ 安全；$0.8\\le D<1$ 预警仍 pass；$D\\ge1$ 失败' },
    { check: '完整 vs 专业 Miner', rule: '完整：原始 Sa + $\\sigma_{-1}$；专业：$S_{a,eff,i}$ + $S_e\'$ → **同谱 D 可差数倍**' },
  ],
  en: [
    { check: 'Overall (with spectrum)', rule: '**pass = (D<1)**; independent of single-level ✓/✗' },
    { check: 'Overall (no spectrum)', rule: 'pass = ($N=\\infty$ or $N \\ge N_{target}$)' },
    { check: 'Single-level (right panel)', rule: 'Reference: $N\\ge N_{target}$ and (pro) $S_{a,eff}\\le S_e\'$; **does not drive** overall pass' },
    { check: 'Simplified', rule: 'pass always false (estimateOnly)' },
    { check: 'Miner status', rule: '$D<0.8$ safe; $0.8\\le D<1$ warn but pass; $D\\ge1$ fail' },
    { check: 'Full vs Pro Miner', rule: 'Full: raw Sa + $\\sigma_{-1}$; Pro: $S_{a,eff,i}$ + $S_e\'$ → **D can differ greatly**' },
  ],
}

export const FATIGUE_MINER_STATUS = {
  zh: [
    { status: 'safe', rule: '$D < 0.8$' },
    { status: 'warn', rule: '$0.8 \\le D < 1$' },
    { status: 'fail', rule: '$D \\ge 1$ → pass=false' },
  ],
  en: [
    { status: 'safe', rule: '$D < 0.8$' },
    { status: 'warn', rule: '$0.8 \\le D < 1$' },
    { status: 'fail', rule: '$D \\ge 1$ → pass=false' },
  ],
}

/** @param {'zh'|'en'} locale */
export function getFatigueCriticalInputRows(locale = 'zh') {
  const labels =
    locale === 'en'
      ? {
          material: 'Material',
          stressAmplitude: 'Stress amplitude Sa',
          meanStress: 'Mean stress Sm',
          surfaceFactor: 'Surface factor ka',
          sizeFactor: 'Size factor kb',
          targetLife: 'Target cycles N_target',
          meanStressMethod: 'Mean-stress method',
        }
      : {
          material: '材料',
          stressAmplitude: '应力幅 Sa',
          meanStress: '平均应力 Sm',
          surfaceFactor: '表面系数 ka',
          sizeFactor: '尺寸系数 kb',
          targetLife: '目标循环次数 N_target',
          meanStressMethod: '平均应力修正',
        }

  const complete = CRITICAL_INPUT_SPECS.fatigue.complete
  const professional = CRITICAL_INPUT_SPECS.fatigue.professional

  return {
    complete: complete.map((k) => labels[k] ?? k),
    professional: professional.map((k) => labels[k] ?? k),
    sizeFactorNote:
      locale === 'en'
        ? 'Changing material, Sa, spectrum, Sm, ka, kb, or N_target immediately updates pass on this page.'
        : '本页修改材料、Sa、载荷谱、Sm、ka、kb、N_target 后 pass 立即更新，无需确认按钮。',
    confirmNote:
      locale === 'en'
        ? 'The /fatigue page does **not** block on these fields in Full/Professional modes. The list documents inputs that affect pass when using enforceCriticalConfirm in API/other modules.'
        : '本页完整/专业 **不阻断** 下列字段；列表说明影响 pass 的输入项，供 API 或其它模块启用 enforceCriticalConfirm 时参考。',
  }
}

export const FATIGUE_EXAMPLE_STEPS = {
  zh: [
    { step: '单级·完整', detail: '45 钢 $S_a=200$ MPa $< \\sigma_{-1}$ → $N=\\infty$；$N_{target}=10^6$ → 单级 ✓' },
    {
      step: '单级·专业失败',
      detail: '$S_a=280$（UI 最小），$k_a k_b=0.25$ → $S_e\'=70$ MPa，$S_{a,eff}=280>S_e\'$ → 单级 ✗；但 $N\\gg N_{target}$ 仍可能成立',
    },
    {
      step: 'Goodman',
      detail: '$S_a=200$，$S_m=150$，Goodman → $S_{a,eff}\\approx267$ MPa；$k_a k_b=0.77$ → $S_e\'\\approx215$ MPa → goodmanPass 失败',
    },
    {
      step: 'Miner·完整',
      detail: '同谱 $D\\approx0.27$ → **综合通过**；350 MPa 级 $n/N_f$ 最大',
    },
    {
      step: 'Miner·专业',
      detail: '同谱 + $S_m=100$、$k_a k_b=0.765$ → $D\\approx2.67$ → **综合未通过**；350 MPa 级 $n/N_f>1$',
    },
    {
      step: '综合 vs 单级',
      detail: '$D=0.31$ 综合 ✓ + 单级 ✗：以 Miner 为准；左栏 Sa 非谱内档位时单级仅作对照',
    },
    {
      step: 'assessComponentFatigue',
      detail: '轴/梁/键页无 Miner；**勿与本页 pass 混用**',
    },
  ],
  en: [
    { step: 'Single·Full', detail: '45 steel Sa=200 < σ−1 → infinite; N_target=1e6 → single ✓' },
    {
      step: 'Single·Pro fail',
      detail: 'Sa=280 (UI min), ka·kb=0.25 → Se′=70, Sa,eff>Se′ → single ✗',
    },
    {
      step: 'Goodman',
      detail: 'Sa=200, Sm=150 → Sa,eff≈267; with ka·kb may fail goodmanPass',
    },
    { step: 'Miner·Full', detail: 'Same spectrum D≈0.27 → overall pass' },
    { step: 'Miner·Pro', detail: 'Same spectrum + Sm, ka·kb → D≈2.67 → fail' },
    { step: 'Overall vs single', detail: 'D safe + single fail: trust Miner if spectrum governs' },
    { step: 'assessComponentFatigue', detail: 'Shaft/beam/key—no Miner; do not mix pass' },
  ],
}

export const FATIGUE_LIMITATIONS = {
  zh: [
    '内置 5 种材料 S-N 为工程近似，非试样或锻件实测曲线；正式设计应用试验或手册数据。',
    '无应力集中 $K_t$、缺口几何、喷丸/镀层等完整修正链；专业模式仅 $k_a$、$k_b$ 两个标量。',
    'Miner 线性累积、无加载次序效应；专业模式假定 **恒定 $S_m$** 对各级 $S_a$ 做 Goodman/Soderberg。',
    '有载荷谱时 pass 只看 Miner（已含专业平均应力修正）；左侧单级判定 **不参与** 综合 pass。',
    '示意图与 S-N 图标注点用 **输入 $S_a$**，专业寿命用 **Goodman 等效幅**——二者可能不一致。',
    '简化模式 pass 恒 false；完整/专业改参后 pass 立即更新，无确认阻断。',
    'assessComponentFatigue（轴/梁/键）与本页 analyzeFatigue 参数与 pass 路径不同，勿交叉引用放行。',
  ],
  en: [
    'Five built-in S-N curves are approximations—not test data for your part.',
    'No Kt, notch, or full surface treatment chain—only ka, kb scalars in Professional mode.',
    'Linear Miner, no sequence effect; Professional assumes **constant $S_m$** for Goodman/Soderberg on each block.',
    'With spectrum, pass is Miner-only (includes mean-stress in Professional); single-level check does not drive pass.',
    'Diagram/chart use input Sa; Professional life uses Goodman effective amplitude—they may differ.',
    'Simplified pass always false; Full/Professional pass updates immediately with inputs—no confirm gate.',
    'assessComponentFatigue (shaft/beam/key) differs from this page analyzeFatigue—do not mix release conclusions.',
  ],
}

export const FATIGUE_ASSESS_VS_PAGE = {
  zh: [
    { item: '入口', page: '本页 analyzeFatigue', other: '轴/梁/键 assessComponentFatigue' },
    { item: 'Miner', page: '有', other: '无' },
    { item: '平均应力', page: '专业：Goodman/Soderberg 可选', other: 'Goodman / Soderberg 可选' },
    { item: '切应力', page: '无', other: 'stressMode=shear，极限 ÷√3' },
    { item: 'pass', page: '有谱：Miner D<1；无谱：单级', other: 'fatiguePass 统一逻辑' },
  ],
  en: [
    { item: 'Entry', page: 'analyzeFatigue (this page)', other: 'assessComponentFatigue (shaft/beam/key)' },
    { item: 'Miner', page: 'Yes', other: 'No' },
    { item: 'Mean stress', page: 'Professional: Goodman/Soderberg', other: 'Goodman / Soderberg' },
    { item: 'Shear', page: 'No', other: 'shear mode, limits ÷√3' },
    { item: 'pass', page: 'Spectrum: Miner D<1; else single-level', other: 'fatiguePass' },
  ],
}

/** 单级判定教材 — 与右栏 UI 一致 */
export const FATIGUE_SINGLE_LEVEL_GUIDE = {
  zh: {
    intro:
      '**单级 S-N 判定**回答：若构件长期只有左栏这一组工况（一个 $S_a$、一个 $N_{target}$），是否满足疲劳要求。它**不是** Miner 载荷谱各级的叠加结果，也**不决定**有谱时的综合 pass。',
    sections: [
      {
        title: '1. 左栏输入各自含义',
        bullets: [
          '$S_a$：单级交变应力幅 (MPa)，用于左栏寿命估算与（专业）Goodman 修正',
          '$N_{target}$：你希望达到的目标循环次数；单级判定要求估算 $N \\ge N_{target}$（或 $N=\\infty$）',
          '$S_m$（仅专业）：平均应力；与 $S_a$ 合成等效应力幅 $S_{a,eff}$',
          '$k_a, k_b$（仅专业）：表面/尺寸系数；修正持久极限 $S_e\'=k_a k_b \\sigma_{-1}$',
          'Miner 载荷谱：多级工况表格；与左栏 $S_a$ **无强制相等关系**',
        ],
      },
      {
        title: '2. 单级通过条件（代码逻辑）',
        bullets: [
          '**完整模式**：$N=\\infty$（$S_a \\le \\sigma_{-1}$ 且 Basquin 膝点）或 $N \\ge N_{target}$',
          '**专业模式**：在上式基础上还需 **goodmanPass**：$S_{a,eff} \\le S_e\'$',
          '右栏「平均应力修正 ✗」= $S_{a,eff} > S_e\'$，即使 $N \\gg N_{target}$ 仍可能单级 ✗',
        ],
      },
      {
        title: '3. 与 Miner / 综合判定的关系',
        bullets: [
          '**有载荷谱时：综合 pass 只看 Miner $D<1$**，单级 ✓/✗ 不参与',
          '常见现象：Miner 安全 + 单级 ✗ → 谱面工况 OK，但左栏 $S_a$ 代表的另一单级工况不安全',
          '左栏 $S_a$ 应填「与谱同级或更危险」的单级校核应力；勿填与谱无关的数又期待单级 ✓',
        ],
      },
    ],
  },
  en: {
    intro:
      'The **single-level S-N check** asks: if the part saw only the left-panel duty ($S_a$, $N_{target}$), would it be OK? It is **not** the Miner sum over the spectrum and **does not drive** overall pass when a spectrum exists.',
    sections: [
      {
        title: '1. Left-panel inputs',
        bullets: [
          '$S_a$: single-level stress amplitude (MPa)',
          '$N_{target}$: required cycles; need $N \\ge N_{target}$ or infinite life',
          '$S_m$ (Professional): mean stress → $S_{a,eff}$',
          '$k_a, k_b$ (Professional): $S_e\'=k_a k_b \\sigma_{-1}$',
          'Miner spectrum: multi-level table; **not required** to match left $S_a$',
        ],
      },
      {
        title: '2. Single-level pass (code)',
        bullets: [
          '**Full**: infinite life or $N \\ge N_{target}$',
          '**Professional**: also need $S_{a,eff} \\le S_e\'$ (goodmanPass)',
          'Mean-stress line ✗ means $S_{a,eff} > S_e\'$ even if $N$ is huge',
        ],
      },
      {
        title: '3. vs Miner / overall',
        bullets: [
          '**With spectrum: overall pass = D<1 only**',
          'Miner safe + single-level fail is valid: spectrum OK, left-panel duty not',
          'Set left $S_a$ to the single-level case you actually need to check',
        ],
      },
    ],
  },
}

export const FATIGUE_OVERALL_VS_SINGLE = {
  zh: {
    paragraphs: [
      '页面右上方 **「校核：通过/未通过」= 综合判定**，完整/专业模式下有 Miner 谱时 **仅由 $D$ 决定**。',
      '其下方 **「单级 S-N 判定」** 是独立对照区，可能出现 **综合 ✓ + 单级 ✗**，这不是程序自相矛盾。',
    ],
    examples: [
      {
        label: '典型可接受组合',
        detail:
          '谱面 $D=0.31$（安全），左栏 $S_a=280$、$k_a k_b=0.25$ → $S_e\'=70$ MPa，$S_{a,eff}=280>S_e\'$ → 单级 ✗。若设计以谱为准，**以 Miner 为准**。',
      },
      {
        label: '需警惕的组合',
        detail:
          'Miner $D<1$ 但左栏 $S_a$ 高于谱中最高档：说明还存在更危险单级工况未进谱，应补谱或降低 $S_a$ 校核。',
      },
    ],
  },
  en: {
    paragraphs: [
      'The top **Overall** badge follows **Miner D** when a spectrum is present.',
      'The **single-level** block below is independent—you may see overall pass with single-level fail.',
    ],
    examples: [
      {
        label: 'Often acceptable',
        detail: 'D=0.31 safe while single-level fails because $S_a=280 > S_e\'=70$ with ka·kb=0.25—trust Miner if spectrum governs.',
      },
      {
        label: 'Watch out',
        detail: 'D<1 but left Sa exceeds max spectrum level—add levels or fix the single-level check stress.',
      },
    ],
  },
}

/** 同参完整 vs 专业 — 45 钢示例谱 */
export const FATIGUE_MODE_COMPARE = {
  zh: {
    intro:
      '下列为 **材料、左栏 $S_a$、$N_{target}$、同一四行载荷谱** 下，仅切换「完整 / 专业」时的典型差异（$S_m=100$ MPa，$k_a=0.9$，$k_b=0.85$，Goodman）。**不是 bug**。',
    sharedInputs: [
      '材料：45 钢（调质），$\\sigma_{-1}=280$ MPa，$\\sigma_u=600$ MPa',
      '左栏 $S_a=444$ MPa，$N_{target}=3\\times10^5$',
      '载荷谱：350/10⁴ + 300/5×10⁴ + 250/10⁵ + 220/2×10⁵ (MPa·次)',
    ],
    rows: [
      {
        scenario: 'Miner 修正链',
        complete: '各级 **原始 Sa**；$N_f$ 膝点 = $\\sigma_{-1}=280$ MPa',
        professional:
          '各级 $S_{a,eff}=S_a/(1-S_m/\\sigma_u)$（约 ×1.2）；膝点 $S_e\'=0.9\\times0.85\\times280\\approx214$ MPa',
      },
      {
        scenario: '350 MPa 级 $n/N_f$',
        complete: '$N_f\\approx66924$ → $n/N_f\\approx0.15$',
        professional: '$S_{a,eff}\\approx420$ → $N_f\\approx7835$ → $n/N_f\\approx1.28$',
      },
      {
        scenario: '累积损伤 D',
        complete: '$D\\approx0.27$ → **综合通过**',
        professional: '$D\\approx2.67$ → **综合未通过**',
      },
      {
        scenario: '左栏单级寿命 N',
        complete: 'Basquin 直算 $S_a=444$ → $N\\sim10^3$ 级',
        professional: '$S_{a,eff}\\approx533$ + $S_e\'\\approx214$ → $N$ 更小，单级常 ✗',
      },
    ],
    conclusion:
      '**完整**偏早期筛选（不含平均应力与表面/尺寸折减）；**专业**用于有 $S_m$ 与 $k_a k_b$ 的正式校核。同一数字在两种模式下 **不应期望相同 pass**。',
  },
  en: {
    intro:
      'Same material, left $S_a$, $N_{target}$, and four-line spectrum—only mode changes ($S_m=100$, $k_a=0.9$, $k_b=0.85$, Goodman). **Expected behavior.**',
    sharedInputs: [
      '45 steel QT: $\\sigma_{-1}=280$ MPa, $\\sigma_u=600$ MPa',
      'Left $S_a=444$ MPa, $N_{target}=3\\times10^5$',
      'Spectrum: 350/10⁴ + 300/5×10⁴ + 250/10⁵ + 220/2×10⁵',
    ],
    rows: [
      {
        scenario: 'Miner chain',
        complete: '**Raw Sa**; knee at $\\sigma_{-1}=280$ MPa',
        professional: '$S_{a,eff}$ with Sm; knee $S_e\'\\approx214$ MPa',
      },
      {
        scenario: '350 MPa block',
        complete: '$N_f\\approx66924$, $n/N_f\\approx0.15$',
        professional: '$S_{a,eff}\\approx420$, $N_f\\approx7835$, $n/N_f\\approx1.28$',
      },
      {
        scenario: 'Damage D',
        complete: '$D\\approx0.27$ → **pass**',
        professional: '$D\\approx2.67$ → **fail**',
      },
      {
        scenario: 'Left single-level N',
        complete: 'Direct Basquin at 444 MPa',
        professional: 'Higher $S_{a,eff}$ + lower $S_e\'$ → shorter N',
      },
    ],
    conclusion:
      '**Full** for early screening; **Professional** when Sm and ka·kb apply. **Do not expect the same pass** in both modes.',
  },
}

export const FATIGUE_SA_BOUNDS = {
  zh: {
    intro:
      '左栏 $S_a$ 的下限被约束在 **材料 $\\sigma_{-1}$**（45 钢为 280 MPa），以保证输入落在 S-N 示意曲线有效段。但 **专业模式判单级用的是 $S_e\'=k_a k_b \\sigma_{-1}$**，可以远低于 280 MPa。',
    sections: [
      {
        title: '为何 Sa 已最小仍单级 ✗',
        body:
          '当 $k_a k_b < 1$ 时，例如 $k_a=k_b=0.5$ → $S_e\'=70$ MPa。UI 允许的最小 $S_a=280>70$，故 **任意允许输入** 都会使 $S_{a,eff}>S_e\'$ → 平均应力修正 ✗ → 单级 ✗。这不是您「Sa 没调对」，而是 **σ₋₁ 下限与 Se′ 判据不一致** 的界面约束。',
      },
      {
        title: '数值例（45 钢，Sm=0，N_target=1000）',
        bullets: [
          '$S_a=280$ MPa（UI 最小），$k_a k_b=0.25$ → $S_e\'=70$ MPa',
          '估算 $N\\approx9.2\\times10^5 \\gg N_{target}$ → 寿命条件满足',
          '$S_{a,eff}=280>S_e\'$ → **goodmanPass 失败** → 单级仍 ✗',
          'Miner $D=0.31$ 仍可 **综合通过**（谱面与单级无关）',
        ],
      },
      {
        title: '工程上如何处理',
        bullets: [
          '**以 Miner 为准**：若校核对象是载荷谱，单级 ✗ 可忽略；左栏 Sa 改为谱中关注级别或留作对照',
          '**必须单级也通过**：在不改 Sa 下仅能提高 $k_a k_b$ 使 $S_e\'\\ge S_a$（需 $k_a k_b\\ge1$ 当 $S_a=\\sigma_{-1}$）；或改用 **完整模式** 做无 ka·kb 的单级估算',
          '勿误以为把 Sa 拉到 σ₋₁ 就能在专业模式下单级 ✓——当 ka·kb<1 时通常 **不可能**',
        ],
      },
    ],
  },
  en: {
    intro:
      'Left $S_a$ minimum is material $\\sigma_{-1}$ (280 MPa for 45 steel). Professional single-level check uses $S_e\'=k_a k_b \\sigma_{-1}$, which can be much lower.',
    sections: [
      {
        title: 'Why min Sa still fails single-level',
        body:
          'With $k_a k_b=0.25$, $S_e\'=70$ MPa while min $S_a=280$ MPa. Every allowed $S_a$ gives $S_{a,eff}>S_e\'$ → single-level fail. This is a **UI knee vs Se′ criterion** issue, not user error.',
      },
      {
        title: 'Example (45 steel, Sm=0, N_target=1000)',
        bullets: [
          '$S_a=280$, $S_e\'=70$ → life $\\gg N_{target}$ but goodmanPass fails',
          'Miner D=0.31 can still give overall pass',
        ],
      },
      {
        title: 'What to do',
        bullets: [
          'Trust **Miner** if the spectrum governs',
          'For single-level pass at $S_a=\\sigma_{-1}$: need $k_a k_b\\ge1$, or use **Full** mode without ka·kb',
        ],
      },
    ],
  },
}

export const FATIGUE_HOW_TO_PASS = {
  zh: [
    {
      goal: '让综合判定通过（有载荷谱）',
      steps: [
        '降低谱中高档 $S_a$ 或循环次数 $n$，使 $D=\\sum n_i/N_{f,i}<1$',
        '完整模式：检查是否过多档位 $S_a\\le\\sigma_{-1}$（$N_f=\\infty$）导致低估—专业模式 Se′ 更低时会更保守',
        '专业模式：提高 $k_a k_b$ 或降低 $S_m$ 可减小各级 $N_f$ 分母侧影响（$S_{a,eff}$ 与 $S_e\'$）',
        '$D$ 在 0.8～1 仍算 pass 但应视为 **预警**，建议加安全系数或试验验证',
      ],
    },
    {
      goal: '让单级判定也通过（右栏 ✓）',
      steps: [
        '条件 A：$N\\ge N_{target}$（或无限寿命）',
        '条件 B（专业）：$S_{a,eff}\\le S_e\'$',
        '降 $S_a$：受 UI 下限 $\\sigma_{-1}$ 约束；当 $k_a k_b<1$ 时 **无法在专业模式下单级 ✓**',
        '降 $N_{target}$ 至 $\\le$ 估算 $N$ 只能满足条件 A；若 $S_{a,eff}>S_e\'$ 仍 ✗',
        '提高 $k_a k_b$ 使 $S_e\'\\ge S_{a,eff}$（在 $S_a=280$ 时需 $k_a k_b\\ge1$）',
        '降 $S_m$ 或改 Soderberg/Goodman 可略降 $S_{a,eff}$（Soderberg 更保守）',
      ],
    },
    {
      goal: '完整 vs 专业怎么选',
      steps: [
        '方案比选、量级估算 → **完整**（快，偏乐观）',
        '有平均应力、表面/尺寸折减的签审 → **专业**（与 Miner 一致纳入 $S_m$、$S_e\'$）',
        '勿用完整 pass 代替专业校核，也勿用专业 fail 否定完整筛选过的候选方案—应 **同谱重算**',
      ],
    },
  ],
  en: [
    {
      goal: 'Pass overall (with spectrum)',
      steps: [
        'Reduce high Sa levels or cycle counts so D<1',
        'Professional mode is usually more conservative (Se′, Sa,eff)',
        '0.8≤D<1 is pass but treat as warning',
      ],
    },
    {
      goal: 'Pass single-level (right panel ✓)',
      steps: [
        'Need N≥N_target and (Pro) Sa,eff≤Se′',
        'With ka·kb<1, min Sa=σ−1 cannot pass professional single-level',
        'Raise ka·kb to ≥1 or use Full mode for uncorrected single-level',
      ],
    },
    {
      goal: 'Mode selection',
      steps: ['Full: screening', 'Professional: release with Sm and ka·kb', 'Re-run same spectrum in both when comparing'],
    },
  ],
}

export const FATIGUE_FAQ = {
  zh: [
    {
      q: '为什么完整通过、专业不通过？',
      a: '专业 Miner 对每级做 Goodman 并降低持久极限至 $S_e\'$；同谱 $D$ 可从小于 1 变为大于 1。见上文「完整 vs 专业」对照表。',
    },
    {
      q: '为什么 Miner 安全但单级打叉？',
      a: '有谱时综合只看 $D$。单级检查左栏 $S_a$ 与 $N_{target}$（及专业 Goodman），与谱面独立。左栏 Sa 填 280 而 $S_e\'=70$ 时极常见。',
    },
    {
      q: 'Sa 不能再小了，怎么让单级通过？',
      a: '专业模式下当 $k_a k_b<1$：在 UI 约束下 **通常无法** 单级 ✓。提高 $k_a k_b$ 至 $S_e\'\\ge S_a$，或忽略单级、以 Miner 为准，或用完整模式。',
    },
    {
      q: '左栏 Sa 要和谱里某一档一样吗？',
      a: '不强制。Sa 表示「单级校核工况」；谱表示「多级累积」。若 Sa 高于谱中最高档，Miner 通过仍可能掩盖更危险的单级应力。',
    },
    {
      q: 'Soderberg 和 Goodman 差多少？',
      a: 'Soderberg 用屈服强度 $S_y$ 作分母，通常比 Goodman（用 $\\sigma_u$）**更保守**，$S_{a,eff}$ 更大、$D$ 更高。',
    },
    {
      q: '和轴/梁/键页疲劳结论能混用吗？',
      a: '**不能**。那些页用 assessComponentFatigue，无 Miner；本页有 Miner。材料库相同但 pass 路径不同。',
    },
  ],
  en: [
    {
      q: 'Why Full pass but Professional fail?',
      a: 'Professional applies Goodman and Se′ on each Miner block—D can exceed 1 for the same spectrum.',
    },
    {
      q: 'Why Miner safe but single-level fail?',
      a: 'Overall uses D only. Single-level checks left Sa vs N_target and Se′—independent.',
    },
    {
      q: 'Sa at UI minimum—how to pass single-level?',
      a: 'With ka·kb<1 in Professional, usually impossible; raise ka·kb or use Full mode or ignore single-level.',
    },
    {
      q: 'Must left Sa match a spectrum row?',
      a: 'No. Sa is your single-level check case; spectrum is multi-level Miner.',
    },
    {
      q: 'Soderberg vs Goodman?',
      a: 'Soderberg uses yield in denominator—more conservative.',
    },
    {
      q: 'Mix with shaft/beam/key fatigue?',
      a: 'No—different API, no Miner on those pages.',
    },
  ],
}

export const FATIGUE_PAGE_NOTES = {
  zh: [
    '完整/专业启用关键输入确认：待确认字段琥珀色边框与 *；右侧数值仍显示，未确认时总判待复核（releaseBlocked）。简化模式不门禁、不高亮（仍为 estimateOnly）。',
    '右栏蓝色/info 条显示当前模式实际使用的修正链（Sm、ka·kb、Se′ 或 σ₋₁）。',
    'Miner 表「占 D 比例」= 该行 $n_i/N_{f,i}$ 占 **总 D** 的百分比，不是占 100% 损伤预算的绝对分额。',
    '专业 Miner 假定 **恒定 $S_m$** 作用于谱中各级；变均值谱需分段或外部工具。',
  ],
  en: [
    'Full/Professional enable critical-input confirmation: amber border + * on pending fields; values stay visible while overall status is review (releaseBlocked). Simple mode has no gate (still estimateOnly).',
    'Info banner shows the active correction chain for the current mode.',
    'Miner column «share of D» is fraction of total D, not absolute damage budget.',
    'Professional Miner assumes **constant Sm** across spectrum blocks.',
  ],
}

export function getFatigueHelpRef(locale = 'zh') {
  const loc = locale === 'en' ? 'en' : 'zh'
  return {
    calcModes: FATIGUE_CALC_MODES[loc],
    materials: FATIGUE_SN_MATERIALS[loc],
    formulas: FATIGUE_FORMULAS[loc],
    passChecks: FATIGUE_PASS_CHECKS[loc],
    minerStatus: FATIGUE_MINER_STATUS[loc],
    criticalInputs: getFatigueCriticalInputRows(loc),
    exampleSteps: FATIGUE_EXAMPLE_STEPS[loc],
    limitations: FATIGUE_LIMITATIONS[loc],
    assessVsPage: FATIGUE_ASSESS_VS_PAGE[loc],
    singleLevelGuide: FATIGUE_SINGLE_LEVEL_GUIDE[loc],
    overallVsSingle: FATIGUE_OVERALL_VS_SINGLE[loc],
    modeCompare: FATIGUE_MODE_COMPARE[loc],
    saBounds: FATIGUE_SA_BOUNDS[loc],
    howToPass: FATIGUE_HOW_TO_PASS[loc],
    faq: FATIGUE_FAQ[loc],
    pageNotes: FATIGUE_PAGE_NOTES[loc],
    materialKeys: Object.keys(SN_MATERIALS),
  }
}
