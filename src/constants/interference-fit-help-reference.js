/**
 * 过盈配合帮助页扩展 — 计算模式、公式、判定与关键输入门禁
 */
import { CRITICAL_INPUT_SPECS } from '@/utils/critical-input-guard'

export const INTERFERENCE_CALC_MODES = {
  zh: [
    {
      mode: '简化',
      model: '实心轴 + Lame 厚壁筒；不校核空心轴',
      passRule: '仅输出 $p$、$F$、$T$、应力；**通过判定恒为否**（仅估算）',
      caveat: '适合快速看数量级，不能作为放行依据',
    },
    {
      mode: '完整',
      model: '可填轴内径 $d_i$（空心轴柔度更大 → $p$ 更低）；许用切向应力校核',
      passRule: '$i>0$ 且 hoopPass 且 **关键输入已全部确认**',
      caveat: '默认值未编辑时不确认 → releaseBlocked，右侧只显示警示',
    },
    {
      mode: '专业',
      model: '完整 + 温升 $\\Delta T$ 修正有效过盈 $i\'$',
      passRule: '同完整；温升后 $i\'<0$ 时报 clearance_after_thermal',
      caveat: '模式说明含「粗糙度修正」— 当前代码仅做温变，未做粗糙度',
    },
  ],
  en: [
    {
      mode: 'Simplified',
      model: 'Solid shaft + Lame thick cylinder; no hollow shaft',
      passRule: 'Outputs $p$, $F$, $T$, stress; **pass always false** (estimateOnly)',
      caveat: 'For magnitude only—not a release basis',
    },
    {
      mode: 'Full',
      model: 'Optional $d_i$ (hollow lowers $p$); hoop stress vs allowables',
      passRule: '$i>0$, hoopPass, and **all critical inputs confirmed**',
      caveat: 'Prefilled defaults unconfirmed → releaseBlocked; warning only on right',
    },
    {
      mode: 'Professional',
      model: 'Full + $\\Delta T$ adjusts effective interference $i\'$',
      passRule: 'Same as Full; $i\'<0$ after heat → clearance_after_thermal',
      caveat: 'UI mentions roughness—code implements thermal only today',
    },
  ],
}

export const INTERFERENCE_FORMULAS = {
  zh: [
    { name: '过盈量', latex: 'i = d - D', note: '轴径减孔径；须 $i>0$' },
    { name: '径向干涉', latex: '\\Delta r = i/2', note: '代入 Lame 压力公式' },
    {
      name: '轮毂柔度',
      latex: 'C_h = \\frac{1}{E_h}\\left(\\frac{r_o^2+r_i^2}{r_o^2-r_i^2}+\\nu_h\\right)',
      note: '$r_i=D/2$，$r_o=D_A/2$',
    },
    {
      name: '实心轴柔度',
      latex: 'C_s = \\frac{1-\\nu_s}{E_s}',
      note: '$d_i=0$',
    },
    {
      name: '空心轴柔度',
      latex: 'C_s = \\frac{1}{E_s}\\left(\\frac{r_{so}^2+r_{si}^2}{r_{so}^2-r_{si}^2}+\\nu_s\\right)',
      note: '完整/专业模式；$r_{so}=d/2$，$r_{si}=d_i/2$',
    },
    {
      name: '接触压力',
      latex: 'p = \\frac{\\Delta r}{r_i(C_h+C_s)}',
      note: '单位 MPa（$E$ 用 MPa，尺寸 mm）',
    },
    {
      name: '轮毂切向应力',
      latex: '\\sigma_{t,h} = p\\frac{r_o^2+r_i^2}{r_o^2-r_i^2}',
      note: '厚壁放大',
    },
    { name: '实心轴切向应力', latex: '\\sigma_{t,s} \\approx p', note: '简化近似' },
    {
      name: '压装力',
      latex: 'F = \\pi p d L(\\mu+0.02)',
      note: 'N；$\\mu$ 为摩擦系数；+0.02 为式中经验项',
    },
    {
      name: '传递扭矩',
      latex: 'T = \\frac{\\pi p d^2 L \\mu}{2}',
      note: 'N·mm；页面显示 N·m 为 $T/1000$',
    },
    {
      name: '温变过盈',
      latex: "i' = i + \\alpha_s d\\Delta T - \\alpha_h D\\Delta T",
      note: '专业模式；$\\Delta T$ 相对装配参考温升',
    },
  ],
  en: [
    { name: 'Interference', latex: 'i = d - D', note: 'Shaft minus bore; require $i>0$' },
    { name: 'Radial interference', latex: '\\Delta r = i/2', note: 'Used in Lame pressure' },
    {
      name: 'Hub compliance',
      latex: 'C_h = \\frac{1}{E_h}\\left(\\frac{r_o^2+r_i^2}{r_o^2-r_i^2}+\\nu_h\\right)',
      note: '$r_i=D/2$, $r_o=D_A/2$',
    },
    { name: 'Solid shaft', latex: 'C_s = \\frac{1-\\nu_s}{E_s}', note: '$d_i=0$' },
    {
      name: 'Hollow shaft',
      latex: 'C_s = \\frac{1}{E_s}\\left(\\frac{r_{so}^2+r_{si}^2}{r_{so}^2-r_{si}^2}+\\nu_s\\right)',
      note: 'Full/Professional modes',
    },
    { name: 'Contact pressure', latex: 'p = \\frac{\\Delta r}{r_i(C_h+C_s)}', note: 'MPa if $E$ in MPa, mm sizes' },
    {
      name: 'Hub hoop',
      latex: '\\sigma_{t,h} = p\\frac{r_o^2+r_i^2}{r_o^2-r_i^2}',
      note: 'Thick-wall amplification',
    },
    { name: 'Shaft hoop (solid)', latex: '\\sigma_{t,s} \\approx p', note: 'Simplified' },
    { name: 'Press force', latex: 'F = \\pi p d L(\\mu+0.02)', note: 'N; +0.02 empirical term' },
    { name: 'Torque', latex: 'T = \\frac{\\pi p d^2 L \\mu}{2}', note: 'N·mm; UI shows N·m' },
    {
      name: 'Thermal interference',
      latex: "i' = i + \\alpha_s d\\Delta T - \\alpha_h D\\Delta T",
      note: 'Professional mode',
    },
  ],
}

export const INTERFERENCE_PASS_CHECKS = {
  zh: [
    { check: '过盈为正', rule: '$i = d-D > 0$；否则 interference_positive' },
    { check: '几何有效', rule: '$D_A > D$，$d_i < d$；轮毂外径须大于孔径' },
    { check: '切向应力 hoopPass', rule: '$\\sigma_{t,s} \\le$ 轴许用 且 $\\sigma_{t,h} \\le$ 孔许用（完整/专业）' },
    { check: '接触压力上限', rule: '$p < allowPressure$（默认无上限）' },
    { check: '关键输入确认', rule: '完整/专业须 confirmedFields 覆盖门禁列表，否则 releaseBlocked' },
    { check: '温变后仍为过盈', rule: '专业模式 $i\' \\ge 0$；否则 clearance_after_thermal' },
    { check: '薄壁警告', rule: '$(D_A-D)/2 < 0.1d$ 时 thinWallWarning，结果仅供估算' },
  ],
  en: [
    { check: 'Positive interference', rule: '$i=d-D>0$ else interference_positive' },
    { check: 'Valid geometry', rule: '$D_A>D$, $d_i<d$' },
    { check: 'hoopPass', rule: '$\\sigma_{t,s}\\le$ shaft allow. and $\\sigma_{t,h}\\le$ hub allow. (Full/Pro)' },
    { check: 'Pressure cap', rule: '$p < allowPressure$ (default unlimited)' },
    { check: 'Critical confirm', rule: 'Full/Pro need confirmedFields or releaseBlocked' },
    { check: 'After thermal', rule: 'Professional: $i\'\\ge0$ else clearance_after_thermal' },
    { check: 'Thin wall', rule: 'Wall $<0.1d$ → thinWallWarning' },
  ],
}

/** @param {'zh'|'en'} locale */
export function getCriticalInputRows(locale = 'zh') {
  const labels = locale === 'en'
    ? {
        shaftDiameter: 'Shaft diameter d',
        holeDiameter: 'Bore diameter D',
        hubOuterDiameter: 'Hub OD D_A',
        fitLength: 'Fit length L',
        shaftAllowHoop: 'Shaft allowable hoop',
        hubAllowHoop: 'Hub allowable hoop',
        deltaT: 'Temperature rise ΔT',
        shaftAlpha: 'Shaft α',
        holeAlpha: 'Hub α',
      }
    : {
        shaftDiameter: '轴径 d',
        holeDiameter: '孔径 D',
        hubOuterDiameter: '轮毂外径 D_A',
        fitLength: '配合长度 L',
        shaftAllowHoop: '轴许用切向应力',
        hubAllowHoop: '孔许用切向应力',
        deltaT: '温差 ΔT',
        shaftAlpha: '轴 α',
        holeAlpha: '孔 α',
      }

  const complete = CRITICAL_INPUT_SPECS['interference-fit'].complete
  const professional = CRITICAL_INPUT_SPECS['interference-fit'].professional

  return {
    complete: complete.map((k) => labels[k] ?? k),
    professional: professional.map((k) => labels[k] ?? k),
    confirmNote:
      locale === 'en'
        ? 'Each field must trigger @change (user edit) to mark confirmed; switching calc mode resets confirmations. Prefilled defaults are not auto-confirmed—by design.'
        : '每项须在界面中编辑并触发 change 才会记入 confirmedFields；切换计算模式会清空确认。预填默认值不会自动确认——此为有意设计，防止未核对图纸即放行。',
  }
}

export const INTERFERENCE_EXAMPLE_STEPS = {
  zh: [
    {
      step: '输入',
      detail:
        '$d=50$，$D=49.975$ → $i=0.025$ mm（典型压装量级）；$D_A=90$，$L=40$，$\\mu=0.12$；实心轴；$E=210$ GPa，$\\nu=0.3$；许用 350 MPa',
    },
    {
      step: '接触压力',
      detail: '$\\Delta r=0.0125$ mm；Lame 得 $p \\approx 39$ MPa',
    },
    {
      step: '切向应力',
      detail: '孔壁 $\\sigma_{t,h}\\approx 66$ MPa，轴 $\\sigma_{t,s}\\approx 39$ MPa；均 $<350$ → hoopPass ✓',
    },
    {
      step: '装配与扭矩',
      detail: '$F \\approx 3.4\\times10^5$ N；$T \\approx 180$ N·m（随 $\\mu$、$L$ 变化）',
    },
    {
      step: '完整模式',
      detail: '须逐项确认轴径、孔径、$D_A$、$L$、许用应力后，releaseBlocked 解除，方可显示 pass',
    },
    {
      step: '反例',
      detail: '$D=45.98$ → $i=4$ mm（约为正常值 160 倍）→ $p$ 达 GPa 量级，hoopPass 必失败；多为孔径填错',
    },
  ],
  en: [
    {
      step: 'Inputs',
      detail:
        '$d=50$, $D=49.975$ → $i=0.025$ mm; $D_A=90$, $L=40$, $\\mu=0.12$; solid; $E=210$ GPa; allowables 350 MPa',
    },
    { step: 'Pressure', detail: '$\\Delta r=0.0125$ mm; Lame $p \\approx 39$ MPa' },
    { step: 'Hoop stress', detail: 'Hub $\\approx 66$ MPa, shaft $\\approx 39$ MPa; both $<350$ → hoopPass ✓' },
    { step: 'Force & torque', detail: '$F \\approx 3.4\\times10^5$ N; $T \\approx 180$ N·m' },
    { step: 'Full mode', detail: 'Confirm critical fields to clear releaseBlocked before pass shows' },
    { step: 'Bad input', detail: '$D=45.98$ → $i=4$ mm → GPa-scale $p$; likely bore typo (49.98?)' },
  ],
}

export const INTERFERENCE_LIMITATIONS = {
  zh: [
    '平面应力厚壁圆筒 Lame 解，未考虑三维效应、塑性变形、微动磨损与疲劳。',
    '摩擦系数 $\\mu$ 为常数；压装/服役、粗糙度、润滑对 $F$、$T$ 影响大，工具未分项建模。',
    '许用切向应力需用户按材料屈服与安全系数选取，工具不查材料库。',
    '过盈量需手工输入或与 /fit 查表结果对照；不会自动取 ISO 286 最大过盈。',
    '专业模式文案含粗糙度修正，当前实现仅有 $\\Delta T$ 与 $\\alpha$ 修正。',
    'releaseBlocked 时右侧不显示数值结果，仅为流程约束，不代表算式错误。',
  ],
  en: [
    'Plane-stress Lame thick cylinder—no 3D, plasticity, fretting, or fatigue.',
    'Constant $\\mu$; roughness and lubrication not modeled separately.',
    'Hoop allowables are user-defined—not from material database.',
    'Interference entered manually—link to /fit for ISO 286 limits.',
    'Professional UI mentions roughness—code has thermal correction only.',
    'releaseBlocked hides results as process gate—not a calculation failure.',
  ],
}

export function getInterferenceHelpRef(locale = 'zh') {
  const loc = locale === 'en' ? 'en' : 'zh'
  return {
    calcModes: INTERFERENCE_CALC_MODES[loc],
    formulas: INTERFERENCE_FORMULAS[loc],
    passChecks: INTERFERENCE_PASS_CHECKS[loc],
    criticalInputs: getCriticalInputRows(loc),
    exampleSteps: INTERFERENCE_EXAMPLE_STEPS[loc],
    limitations: INTERFERENCE_LIMITATIONS[loc],
  }
}
