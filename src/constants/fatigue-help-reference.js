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
      passRule: '**pass 恒为 false**（estimateOnly）；左侧仍显示估算寿命',
      caveat: '只看数量级，不能作为放行依据',
    },
    {
      mode: '完整',
      features: '单级寿命 + **Miner 多级载荷谱** $D=\\sum n_i/N_{f,i}$',
      passRule: '有载荷谱时 **pass = (D<1)**；须确认材料、$S_a$',
      caveat: 'Miner 各级不做 Goodman；pass 不看左侧单级寿命',
    },
    {
      mode: '专业',
      features: '完整 + **Goodman** 平均应力修正 + 表面/尺寸系数 $k_a,k_b$',
      passRule: 'Miner 通过；各级在恒定 $S_m$ 下做 Goodman/Soderberg，$N_f$ 用 $S_{a,eff}$ 与 $S_e\'=k_a k_b\\sigma_{-1}$；须确认全部关键输入',
      caveat: '载荷谱修改会清空确认；Miner 与左侧单级 pass 可不一致',
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
      passRule: 'With spectrum: **pass = (D<1)**; confirm material & $S_a$',
      caveat: 'Miner blocks not Goodman-corrected; pass ignores left-panel life',
    },
    {
      mode: 'Professional',
      features: 'Full + **Goodman** mean stress + surface/size factors $k_a,k_b$',
      passRule: 'Miner pass; each block Goodman/Soderberg at constant $S_m$, $N_f$ from $S_{a,eff}$ and $S_e\'=k_a k_b\\sigma_{-1}$; confirm all critical inputs',
      caveat: 'Editing spectrum clears confirmations; Miner vs single-level pass may differ',
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
    { check: '简化模式', rule: 'pass 恒 false；estimateOnly' },
    { check: 'Miner 主导（有载荷谱）', rule: 'pass = (D<1)；专业模式平均应力已计入各级 $N_f$' },
    { check: '无载荷谱', rule: 'pass = ($N=\\infty$ 或 $N \\ge N_{target}$，默认 $10^6$)' },
    { check: '专业 Goodman', rule: '填 $S_m$ 时须 goodmanPass：$S_{a,eff} \\le \\sigma\'_{-1}$' },
    { check: '关键输入确认', rule: '完整/专业未确认 → releaseBlocked，pass=false' },
    { check: '与左侧寿命关系', rule: '有 Miner 时 pass **不看**左侧单级寿命是否 $\\ge10^6$' },
    { check: 'releaseBlocked 显示', rule: '与过盈不同：阻断时 **仍显示** Miner 表，状态为「需复核/未放行」' },
  ],
  en: [
    { check: 'Simplified', rule: 'pass always false; estimateOnly' },
    { check: 'Miner (with spectrum)', rule: 'pass = (D<1); professional mean stress in each block $N_f$' },
    { check: 'No spectrum', rule: 'pass = ($N=\\infty$ or $N \\ge N_{target}$, default $10^6$)' },
    { check: 'Professional Goodman', rule: 'If $S_m$ set: need goodmanPass' },
    { check: 'Critical confirm', rule: 'Unconfirmed → releaseBlocked, pass=false' },
    { check: 'Left-panel life', rule: 'With Miner, pass **ignores** single-level life on left' },
    { check: 'releaseBlocked UI', rule: 'Unlike interference fit: Miner table still visible when blocked' },
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
        ? 'Professional mode requires confirming ka, kb, N_target, mean-stress method, and Sm. Editing the load spectrum clears all confirmations.'
        : '专业模式须确认 ka、kb、N_target、平均应力修正与 Sm；修改载荷谱会清空全部确认状态。',
    confirmNote:
      locale === 'en'
        ? 'Click the button to release the verdict for the current inputs. Any change to material, loads, target life, or correction settings invalidates confirmation until you click again.'
        : '须点击按钮对当前全部输入放行；修改材料、载荷谱、目标寿命或修正参数后须重新点击，仅改字段不会自动消除阻断提示。',
  }
}

export const FATIGUE_EXAMPLE_STEPS = {
  zh: [
    { step: '单级', detail: '45 钢 $S_a=200$ MPa $< \\sigma_{-1}=280$ → **无限寿命**' },
    {
      step: 'Goodman',
      detail: '专业：$S_a=200$，$S_m=150$，$\\sigma_u=600$ → $S_{a,eff}=200/0.75\\approx267$ MPa；$k_a k_b=0.77$ 时 $\\sigma\'_{-1}\\approx215$ MPa → 可能 goodmanPass 失败',
    },
    {
      step: 'Miner 示例谱',
      detail: '350/10⁴ + 300/5×10⁴ + 250/10⁵ + 220/2×10⁵ MPa·次；350 MPa 级往往主导 $D$，看表格 n/Nf',
    },
    { step: '判定', detail: '完整/专业有谱时 pass 仅看 $D<1$；须确认材料与 $S_a$（及专业 $S_m$、$k_a$）' },
    {
      step: 'assessComponentFatigue',
      detail: '轴/梁/键页用同一 S-N 库的 assessComponentFatigue（可选 Soderberg、切应力模式），**结论不与本页 Miner 混用**',
    },
  ],
  en: [
    { step: 'Single-level', detail: '45 steel $S_a=200$ MPa $< \\sigma_{-1}=280$ → **infinite life**' },
    {
      step: 'Goodman',
      detail: 'Pro: $S_a=200$, $S_m=150$, $\\sigma_u=600$ → $S_{a,eff}\\approx267$ MPa; with $k_a k_b$ may fail goodmanPass',
    },
    {
      step: 'Miner sample',
      detail: '350/10⁴ + 300/5×10⁴ + … ; high Sa levels dominate D—check n/Nf table',
    },
    { step: 'Verdict', detail: 'With spectrum, pass = D<1 only; confirm critical inputs' },
    {
      step: 'assessComponentFatigue',
      detail: 'Shaft/beam/key pages use assessComponentFatigue—do not mix with this page Miner pass',
    },
  ],
}

export const FATIGUE_LIMITATIONS = {
  zh: [
    '内置 5 种材料 S-N 为工程近似，非试样或锻件实测曲线；正式设计应用试验或手册数据。',
    '无应力集中 $K_t$、缺口几何、喷丸/镀层等完整修正链；专业模式仅 $k_a$、$k_b$ 两个标量。',
    'Miner 线性累积、无加载次序效应；专业模式假定 **恒定 $S_m$** 对各级 $S_a$ 做 Goodman/Soderberg。',
    '有载荷谱时 pass 只看 Miner（已含专业平均应力修正）；左侧单级判定 **不参与** 综合 pass。',
    '示意图与 S-N 图标注点用 **输入 $S_a$**，专业寿命用 **Goodman 等效幅**——二者可能不一致。',
    '简化模式 pass 恒 false；releaseBlocked 时仍可见 Miner 结果，但 pass 与状态为待复核。',
    'assessComponentFatigue（轴/梁/键）与本页 analyzeFatigue 参数与 pass 路径不同，勿交叉引用放行。',
  ],
  en: [
    'Five built-in S-N curves are approximations—not test data for your part.',
    'No Kt, notch, or full surface treatment chain—only ka, kb scalars in Professional mode.',
    'Linear Miner, no sequence effect; Professional assumes **constant $S_m$** for Goodman/Soderberg on each block.',
    'With spectrum, pass is Miner-only (includes mean-stress in Professional); single-level check does not drive pass.',
    'Diagram/chart use input Sa; Professional life uses Goodman effective amplitude—they may differ.',
    'Simplified pass always false; releaseBlocked still shows Miner with review status.',
    'assessComponentFatigue (shaft/beam/key) differs from this page analyzeFatigue—do not mix release conclusions.',
  ],
}

export const FATIGUE_ASSESS_VS_PAGE = {
  zh: [
    { item: '入口', page: '本页 analyzeFatigue', other: '轴/梁/键 assessComponentFatigue' },
    { item: 'Miner', page: '有', other: '无' },
    { item: '平均应力', page: '专业 + Goodman（固定）', other: 'Goodman / Soderberg 可选' },
    { item: '切应力', page: '无', other: 'stressMode=shear，极限 ÷√3' },
    { item: 'pass', page: 'Miner 或单级 + 门禁', other: 'fatiguePass 统一逻辑' },
  ],
  en: [
    { item: 'Entry', page: 'analyzeFatigue (this page)', other: 'assessComponentFatigue (shaft/beam/key)' },
    { item: 'Miner', page: 'Yes', other: 'No' },
    { item: 'Mean stress', page: 'Professional Goodman only', other: 'Goodman / Soderberg' },
    { item: 'Shear', page: 'No', other: 'shear mode, limits ÷√3' },
    { item: 'pass', page: 'Miner or single + gate', other: 'fatiguePass' },
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
    materialKeys: Object.keys(SN_MATERIALS),
  }
}
