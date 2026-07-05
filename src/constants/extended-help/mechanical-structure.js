/**
 * 结构件扩展帮助 — 梁 / 轴 / 键 / 焊缝 / 弹簧
 * 与 beam-calc、shaft-calc、shaft-combined、key-calc、weld-calc、spring-calc 对齐
 */
import {
  pickLocale,
  stdCalcModes,
  faqBlock,
  limitsBlock,
  examplesBlock,
  passBlock,
  formulasBlock,
  modesBlock,
  guideBlock,
  howToPassBlock,
  standardsBlock,
} from './builders.js'

/** @param {'zh'|'en'} locale @param {Record<string, object>} content */
function buildHelp(locale, content) {
  const c = pickLocale(locale, content)
  const blocks = [
    modesBlock(c.modesTitle, c.modes, c.modesSubtitle),
    formulasBlock(c.formulasTitle, c.formulas, c.formulasSubtitle),
    passBlock(c.passTitle, c.passChecks, c.passSubtitle),
    guideBlock(c.guideTitle, { intro: c.guideIntro, sections: c.guideSections }),
    examplesBlock(c.examplesTitle, c.examples, c.examplesSubtitle),
    faqBlock(c.faqTitle, c.faq),
    howToPassBlock(c.howToPassTitle, c.howToPass, c.howToPassColumns ?? 3),
  ]
  if (c.standards) {
    blocks.push(standardsBlock(c.standardsTitle, c.standards, c.standardsIntro))
  }
  blocks.push(limitsBlock(c.limitsTitle, c.limits))
  return { blocks }
}

// ── Beam ─────────────────────────────────────────────────────────────────────

const BEAM = {
  zh: {
    modesTitle: '梁挠度 — 计算模式',
    modesSubtitle: 'Euler-Bernoulli 解析梁；四种边界/载荷组合',
    modes: stdCalcModes('zh', {
      simpleModel: 'Euler 挠度 + 弯曲应力 $\\sigma=M/W$；须选材料得 $[\\sigma]$',
      completeModel: '完整 + 应力/挠度利用率、最小 $W$ 与 $I$ 反算建议',
      proModel: '完整 + 动载系数、$K_t$；**loadMin/loadMax** → assessComponentFatigue',
      simplePass: '$\\sigma\\le[\\sigma]$ 且 $f\\le[f]$（默认 $[f]=L/1000$）',
      completePass: '同简化',
      proPass: '静强度通过 **且**（填载荷幅时）fatiguePass',
      simpleCaveat: '忽略动载与应力集中；$L/d>40$ 时 slendernessWarning',
      completeCaveat: '仍为小变形线弹性梁',
      proCaveat: '疲劳走 assessComponentFatigue（无 Miner）；与 /fatigue 页 pass 不同',
    }),
    formulasTitle: '主要公式',
    formulasSubtitle: '截面 $I$、$W$ 由实心圆 / 空心圆 / 矩形自动计算',
    formulas: [
      { name: '弯矩', latex: 'M = f(P, L, \\text{case})', note: 'simply_center: $PL/4$；cantilever_end: $PL$；均布见 case' },
      { name: '弯曲应力', latex: '\\sigma = \\frac{M}{W}', note: '专业：$\\sigma_{peak}=K_t\\cdot M/W$' },
      { name: '挠度（简支跨中集中）', latex: 'f = \\frac{PL^3}{48EI}', note: '其余 case 见 BEAM_CASES' },
      { name: '疲劳幅值', latex: 'S_a = \\frac{(M_{max}-M_{min})/W \\cdot K_t}{2}', note: '专业；$M$ 由 loadMin/loadMax×动载系数' },
    ],
    passTitle: '判定依据',
    passChecks: [
      { check: '弯曲 stressPass', rule: '$\\sigma \\le [\\sigma]$（材料库或手动许用）' },
      { check: '挠度 deflectionPass', rule: '$f \\le [f]$（默认 $L/1000$ mm）' },
      { check: '综合 pass', rule: 'stressPass $\\land$ deflectionPass（专业再 $\\land$ fatiguePass）' },
      { check: '长细比警告', rule: '$L/d>40$ → slendernessWarning；adapter estimateOnly' },
      { check: '专业疲劳', rule: '填 loadMin+loadMax → assessComponentFatigue；$S_a$、Goodman、$k_a k_b$' },
    ],
    guideTitle: '使用指南',
    guideIntro: '先选梁型与截面，再对照刚度（挠度）与强度（弯曲应力）。交变载荷用专业模式。',
    guideSections: [
      {
        title: '输入顺序',
        bullets: [
          'caseId：简支/悬臂 × 集中/均布',
          'sectionType + 尺寸 → 自动算 $I$、$W$',
          '简化模式须选 materialId；完整/专业可手改 $[\\sigma]$',
        ],
      },
      {
        title: '专业疲劳',
        bullets: [
          'loadMin、loadMax 与 dynamicFactor 换算 $M_{min/max}$',
          'stressConcentration 放大峰值应力',
          '未填载荷幅时不算 fatiguePass',
        ],
      },
    ],
    examplesTitle: '算例要点',
    examples: [
      { step: '简支跨中', detail: '$L=800$ mm，$P=2000$ N，$d=30$ → $M=4\\times10^5$ N·mm；查 $f$ 与 $\\sigma$' },
      { step: '挠度控制', detail: 'complete 输出 minInertiaDeflection — 反算所需 $I$' },
      { step: '专业疲劳', detail: 'loadMin=500，loadMax=2000，$K_t=1.5$ → 幅值进 assessComponentFatigue' },
    ],
    faqTitle: '常见问题',
    faq: [
      { q: '简化模式为何必须选材料？', a: '许用弯曲应力 $[\\sigma]$ 来自材料库；未选则 material_required。' },
      { q: '与 /fatigue 页 fatiguePass 一样吗？', a: '同 assessComponentFatigue API，但梁页无 Miner 载荷谱。' },
      { q: '矩形截面弯矩方向？', a: '按高度 $h$ 为受弯方向（$W=bh^2/6$）。' },
    ],
    howToPassTitle: '如何让判定通过',
    howToPass: [
      { goal: '挠度超限', steps: ['加大 $h$ 或 $d$ 提高 $I$', '缩短跨度 $L$', '换更高 $E$ 材料', '放宽 $[f]$（需功能许可）'] },
      { goal: '弯曲应力超限', steps: ['加大截面模量 $W$', '降低载荷或动载系数', '提高 $[\\sigma]$（换材料）'] },
      { goal: '专业疲劳失败', steps: ['降低载荷幅或 $K_t$', '提高 $k_a$、$k_b$', '换更高 $\\sigma_{-1}$ 材料'] },
    ],
    standardsTitle: '相关标准与理论',
    standardsIntro: '工具采用材料力学 Euler-Bernoulli 梁，正式设计请对照结构规范。',
    standards: [
      'GB 50017 — 钢结构弹性阶段梁挠度限值（参考）',
      'Euler-Bernoulli 梁 — 忽略剪切变形；短粗梁需 Timoshenko 修正',
    ],
    limitsTitle: '适用边界',
    limits: [
      '小变形、线弹性、等截面直梁；无轴向力与翘曲。',
      '未计横向剪切变形；$L/d$ 很大时 slendernessWarning。',
      '专业疲劳为单级 $S_a$/$S_m$，非多轴 Miner 谱。',
    ],
  },
  en: {
    modesTitle: 'Beam — calculation modes',
    modesSubtitle: 'Euler-Bernoulli analytical cases; four load/boundary combinations',
    modes: stdCalcModes('en', {
      simpleModel: 'Euler deflection + $\\sigma=M/W$; material required for $[\\sigma]$',
      completeModel: 'Full + utilization, suggested min $W$ and $I$',
      proModel: 'Full + dynamic factor, $K_t$; **loadMin/loadMax** → assessComponentFatigue',
      simplePass: '$\\sigma\\le[\\sigma]$ and $f\\le[f]$ (default $[f]=L/1000$)',
      completePass: 'Same as simplified',
      proPass: 'Static pass **and** (if load range) fatiguePass',
      simpleCaveat: 'No dynamic load or $K_t$; slendernessWarning if $L/d>40$',
      completeCaveat: 'Small-deflection linear elastic beam',
      proCaveat: 'Fatigue via assessComponentFatigue (no Miner); differs from /fatigue page',
    }),
    formulasTitle: 'Key formulas',
    formulasSubtitle: 'Section $I$, $W$ from solid/hollow round or rectangle',
    formulas: [
      { name: 'Bending moment', latex: 'M = f(P, L, \\text{case})', note: 'simply_center: $PL/4$; see BEAM_CASES' },
      { name: 'Bending stress', latex: '\\sigma = \\frac{M}{W}', note: 'Pro: $\\sigma_{peak}=K_t M/W$' },
      { name: 'Deflection (simply, center load)', latex: 'f = \\frac{PL^3}{48EI}', note: 'Other cases in BEAM_CASES' },
      { name: 'Fatigue amplitude', latex: 'S_a = \\frac{(M_{max}-M_{min})/W \\cdot K_t}{2}', note: 'Professional; loads × dynamic factor' },
    ],
    passTitle: 'Pass criteria',
    passChecks: [
      { check: 'stressPass', rule: '$\\sigma \\le [\\sigma]$ (material DB or manual)' },
      { check: 'deflectionPass', rule: '$f \\le [f]$ (default $L/1000$ mm)' },
      { check: 'Overall pass', rule: 'stressPass $\\land$ deflectionPass (pro also fatiguePass)' },
      { check: 'Slenderness', rule: '$L/d>40$ → slendernessWarning; adapter estimateOnly' },
      { check: 'Pro fatigue', rule: 'loadMin+loadMax → assessComponentFatigue with Goodman, $k_a k_b$' },
    ],
    guideTitle: 'How to use',
    guideIntro: 'Pick case and section, check stiffness (deflection) and strength (bending). Use Professional for alternating loads.',
    guideSections: [
      {
        title: 'Input order',
        bullets: [
          'caseId: simply/cantilever × point/uniform load',
          'sectionType + dims → auto $I$, $W$',
          'Simple mode needs materialId; Full/Pro can override $[\\sigma]$',
        ],
      },
      {
        title: 'Professional fatigue',
        bullets: [
          'loadMin, loadMax and dynamicFactor → $M_{min/max}$',
          'stressConcentration scales peak stress',
          'No fatigue check without load range',
        ],
      },
    ],
    examplesTitle: 'Example notes',
    examples: [
      { step: 'Simply supported', detail: '$L=800$ mm, $P=2000$ N, $d=30$ → check $f$ and $\\sigma$' },
      { step: 'Deflection control', detail: 'Complete mode outputs minInertiaDeflection' },
      { step: 'Pro fatigue', detail: 'loadMin=500, loadMax=2000, $K_t=1.5$ → assessComponentFatigue' },
    ],
    faqTitle: 'FAQ',
    faq: [
      { q: 'Why material in Simple mode?', a: 'Allowable stress $[\\sigma]$ comes from material DB; else material_required.' },
      { q: 'Same as /fatigue pass?', a: 'Same assessComponentFatigue API; beam page has no Miner spectrum.' },
      { q: 'Rectangle bending axis?', a: 'Height $h$ is the bending direction ($W=bh^2/6$).' },
    ],
    howToPassTitle: 'How to pass',
    howToPass: [
      { goal: 'Deflection fail', steps: ['Increase $I$ (larger $d$ or $h$)', 'Shorten span $L$', 'Higher $E$', 'Relax $[f]$ if allowed'] },
      { goal: 'Stress fail', steps: ['Increase section modulus $W$', 'Reduce load or dynamic factor', 'Higher $[\\sigma]$ material'] },
      { goal: 'Pro fatigue fail', steps: ['Reduce load range or $K_t$', 'Raise $k_a$, $k_b$', 'Material with higher $\\sigma_{-1}$'] },
    ],
    standardsTitle: 'Standards & theory',
    standardsIntro: 'Euler-Bernoulli beam theory; verify against your structural code for release.',
    standards: [
      'GB 50017 — steel beam deflection limits (reference)',
      'Euler-Bernoulli — shear deformation ignored; use Timoshenko for short thick beams',
    ],
    limitsTitle: 'Limitations',
    limits: [
      'Small deflection, linear elastic, prismatic straight beam; no axial load.',
      'Transverse shear ignored; slendernessWarning for large $L/d$.',
      'Pro fatigue is single-level $S_a$/$S_m$, not multi-block Miner.',
    ],
  },
}

// ── Shaft ────────────────────────────────────────────────────────────────────

const SHAFT = {
  zh: {
    modesTitle: '轴强度 — 计算模式',
    modesSubtitle: '页内两页签：扭转 / 弯扭合成（von Mises 或第三强度）',
    modes: stdCalcModes('zh', {
      simpleModel: '扭转：$\\tau=16T/(\\pi d^3)$；合成：$\\sigma_{eq}=\\sqrt{\\sigma_b^2+3\\tau^2}$（默认 von Mises）',
      completeModel: '可空心轴 $d_i$；扭转校核 twistAngle；合成拆分 bendingPass/torsionPass',
      proModel: '扭转/合成均支持 $K_\\tau$、$K_t$；扭矩或弯矩幅值 → assessComponentFatigue',
      simplePass: '扭转 $\\tau\\le[\\tau]$；合成 $\\sigma_{eq}\\le[\\sigma]$（须材料/屈服）',
      completePass: '扭转：torsionPass $\\land$ anglePass；合成：combinedPass',
      proPass: '完整通过 + peakPass；填幅值时 $\\land$ fatiguePass',
      simpleCaveat: '简化强制实心轴（$d_i=0$）',
      proCaveat: '疲劳：扭转页 shear 模式；合成页 normal 模式',
    }),
    formulasTitle: '主要公式',
    formulas: [
      { name: '扭转剪应力', latex: '\\tau = \\frac{T \\cdot (d/2)}{J}, \\quad J=\\frac{\\pi d^4}{32}', note: '空心：$J=\\pi(d^4-d_i^4)/32$' },
      { name: '弯曲应力', latex: '\\sigma_b = \\frac{M}{W}, \\quad W=\\frac{\\pi d^3}{32}', note: '合成页；$M$ 单位 kN·m→N·mm  internally' },
      { name: 'von Mises', latex: '\\sigma_{eq} = \\sqrt{\\sigma_b^2 + 3\\tau^2}', note: '可选第三强度：$\\sqrt{\\sigma_b^2+4\\tau^2}$' },
      { name: '扭转角', latex: '\\theta = \\frac{TL}{GJ}\\cdot\\frac{180}{\\pi}', note: '完整/专业；$G$ 默认 79000 MPa' },
      { name: '最小轴径', latex: 'd_{min}=\\sqrt[3]{\\frac{16T}{\\pi[\\tau]}}', note: '实心；空心迭代搜索' },
    ],
    passTitle: '判定依据',
    passChecks: [
      { check: '扭转 torsionPass', rule: '$\\tau \\le [\\tau]$（材料 $\\tau_{allow}$ 或 $0.5\\sigma_s$）' },
      { check: '扭转角 anglePass', rule: '$\\theta \\le \\theta_{max}$（未填则跳过）' },
      { check: '合成 combinedPass', rule: '$\\sigma_{eq}\\le[\\sigma]$；分项 $\\sigma_b\\le[\\sigma]$，$\\tau\\le[\\sigma]/\\sqrt{3}$' },
      { check: '专业 peakPass', rule: '$\\tau K_\\tau \\le [\\tau]$ 或合成峰值应力' },
      { check: '专业疲劳', rule: 'torqueAmplitude 或 bendingAmplitude>0 → assessComponentFatigue' },
    ],
    guideTitle: '使用指南',
    guideIntro: '纯扭转传动先算扭转页；有弯矩（齿轮力、皮带力等）用合成页。',
    guideSections: [
      {
        title: '页签选择',
        bullets: [
          '扭转：轴系、联轴器段、键槽前初算',
          '弯扭合成：减速器轴、悬臂轮轴',
          '完整模式可填 innerDiameter 空心轴',
        ],
      },
      {
        title: '专业应力集中',
        bullets: [
          '键槽/台阶：$K_\\tau$、$K_t$ 查手册或 FEA',
          '填 torqueAmplitude / bendingAmplitude 启用疲劳',
        ],
      },
    ],
    examplesTitle: '算例要点',
    examples: [
      { step: '纯扭转', detail: '$T=500$ N·m，$d=40$ → $\\tau\\approx79$ MPa；对比 45 钢 $[\\tau]$' },
      { step: '弯扭合成', detail: '$M=200$ N·m，$T=300$ N·m → von Mises $\\sigma_{eq}$' },
      { step: '空心轴', detail: 'complete：$d_i=20$ 降低 $\\tau$ 与 $\\theta$' },
    ],
    faqTitle: '常见问题',
    faq: [
      { q: '第三强度与 von Mises？', a: 'strengthTheory 切换；第三强度对塑性材料更保守。' },
      { q: '许用应力从哪来？', a: '材料库 sigmaAllow / tauAllow，或手填 yieldStrength。' },
      { q: '两页签 pass 关系？', a: '独立计算；各自显示 overall，无自动合并。' },
    ],
    howToPassTitle: '如何让判定通过',
    howToPass: [
      { goal: '扭转超限', steps: ['增大轴径 $d$（$\\tau\\propto 1/d^3$）', '空心改实心或增大外径', '提高 $[\\tau]$'] },
      { goal: '合成超限', steps: ['降低弯矩或扭矩', '增大轴径', '降低 $K_t$、$K_\\tau$ 来源（圆角）'] },
      { goal: '疲劳失败', steps: ['降低幅值', '表面强化提高 $k_a$', '换调质钢 SN 曲线'] },
    ],
    standardsTitle: '相关标准',
    standardsIntro: '教材式强度理论；轴系设计常对照机械设计手册与 GB/T。',
    standards: [
      'GB/T 1095 / 1096 — 轴径与平键配套（见键连接页）',
      '第三 / 第四强度理论 — 弯扭合成常用 von Mises',
    ],
    limitsTitle: '适用边界',
    limits: [
      '圆轴（实心/空心）；未计轴肩局部应力的详细 FEM。',
      '弯矩、扭矩静载或专业单级疲劳幅；无 Miner 谱。',
      '简化模式实心轴；长轴临界转速未校核。',
    ],
  },
  en: {
    modesTitle: 'Shaft — calculation modes',
    modesSubtitle: 'Two tabs: torsion / combined bending-torsion (von Mises or third theory)',
    modes: stdCalcModes('en', {
      simpleModel: 'Torsion $\\tau=16T/(\\pi d^3)$; combined $\\sigma_{eq}=\\sqrt{\\sigma_b^2+3\\tau^2}$',
      completeModel: 'Hollow $d_i$; twist angle check; split bending/torsion passes',
      proModel: '$K_\\tau$, $K_t$; torque or bending amplitude → assessComponentFatigue',
      simplePass: 'Torsion $\\tau\\le[\\tau]$; combined $\\sigma_{eq}\\le[\\sigma]$',
      completePass: 'Torsion: torsionPass $\\land$ anglePass; combined: combinedPass',
      proPass: 'Full pass + peakPass; with amplitude also fatiguePass',
      simpleCaveat: 'Simple forces solid shaft ($d_i=0$)',
      proCaveat: 'Fatigue: shear mode (torsion tab), normal mode (combined tab)',
    }),
    formulasTitle: 'Key formulas',
    formulas: [
      { name: 'Torsion shear', latex: '\\tau = \\frac{T(d/2)}{J}', note: 'Hollow: $J=\\pi(d^4-d_i^4)/32$' },
      { name: 'Bending stress', latex: '\\sigma_b = M/W', note: 'Combined tab' },
      { name: 'von Mises', latex: '\\sigma_{eq} = \\sqrt{\\sigma_b^2 + 3\\tau^2}', note: 'Or third theory option' },
      { name: 'Twist angle', latex: '\\theta = TL/(GJ) \\cdot 180/\\pi', note: 'Full/Pro; $G$ default 79000 MPa' },
      { name: 'Min diameter', latex: 'd_{min}=\\sqrt[3]{16T/(\\pi[\\tau])}', note: 'Solid; hollow uses iteration' },
    ],
    passTitle: 'Pass criteria',
    passChecks: [
      { check: 'torsionPass', rule: '$\\tau \\le [\\tau]$ (material or $0.5\\sigma_s$)' },
      { check: 'anglePass', rule: '$\\theta \\le \\theta_{max}$ if set' },
      { check: 'combinedPass', rule: '$\\sigma_{eq}\\le[\\sigma]$ with component checks' },
      { check: 'peakPass (Pro)', rule: 'Peak stress with $K_\\tau$ or $K_t$' },
      { check: 'Pro fatigue', rule: 'Amplitude > 0 → assessComponentFatigue' },
    ],
    guideTitle: 'How to use',
    guideIntro: 'Use torsion tab for pure drive shafts; combined tab when bending moment exists.',
    guideSections: [
      { title: 'Tab choice', bullets: ['Torsion: drive sections, before keyway detail', 'Combined: gearbox shafts, overhung loads', 'Full: hollow inner diameter'] },
      { title: 'Pro stress concentration', bullets: ['Keyways/steps: handbook $K_\\tau$, $K_t$', 'Amplitude inputs enable fatigue'] },
    ],
    examplesTitle: 'Example notes',
    examples: [
      { step: 'Pure torsion', detail: '$T=500$ N·m, $d=40$ → compare $\\tau$ to allowables' },
      { step: 'Combined', detail: '$M=200$, $T=300$ N·m → von Mises $\\sigma_{eq}$' },
      { step: 'Hollow', detail: 'Complete: $d_i=20$ lowers $\\tau$ and $\\theta$' },
    ],
    faqTitle: 'FAQ',
    faq: [
      { q: 'Third vs von Mises?', a: 'Switch strengthTheory; third is more conservative for ductile materials.' },
      { q: 'Allowables source?', a: 'Material DB or manual yieldStrength.' },
      { q: 'Both tabs pass?', a: 'Independent results per tab.' },
    ],
    howToPassTitle: 'How to pass',
    howToPass: [
      { goal: 'Torsion fail', steps: ['Increase $d$ ($\\tau\\propto 1/d^3$)', 'Solid vs hollow sizing', 'Raise $[\\tau]$'] },
      { goal: 'Combined fail', steps: ['Reduce $M$ or $T$', 'Larger diameter', 'Lower stress concentrations'] },
      { goal: 'Fatigue fail', steps: ['Reduce amplitude', 'Improve $k_a$', 'Higher-endurance material'] },
    ],
    standardsTitle: 'Related standards',
    standardsIntro: 'Textbook strength theories; pair with key/bearing pages for powertrain.',
    standards: ['GB/T 1095/1096 — shaft/key sizing', 'von Mises / third theory for combined loading'],
    limitsTitle: 'Limitations',
    limits: [
      'Circular shaft; no detailed FEM at shoulders.',
      'Static or single-level fatigue; no Miner spectrum.',
      'Simple: solid only; critical speed not checked.',
    ],
  },
}

// ── Key ──────────────────────────────────────────────────────────────────────

const KEY = {
  zh: {
    modesTitle: '平键连接 — 计算模式',
    modesSubtitle: 'GB/T 1096 标准尺寸查表 + 挤压 / 剪切双校核',
    modes: stdCalcModes('zh', {
      simpleModel: 'GB/T 1096 查 $b\\times h$；挤压 $\\sigma_c$、剪切 $\\tau$',
      completeModel: '标准键 + 最小键长反算 + lengthPass',
      proModel: '完整 + 多键 keyCount、扭矩幅 fatigue、可选 requiredSafetyFactor',
      simplePass: '**pass 恒为 false**（estimateOnly）；仍显示应力',
      completePass: 'shearPass $\\land$ crushPass $\\land$ lengthPass',
      proPass: '完整 $\\land$ fatiguePass（填 torqueAmplitude）$\\land$ 额外 SF',
      simpleCaveat: '仅看数量级，不作放行',
      completeCaveat: '许用 $\\tau$、$\\sigma_c$ 需用户按材料选取',
      proCaveat: '疲劳为键剪切幅 assessComponentFatigue（shear 模式）',
    }),
    formulasTitle: '主要公式',
    formulas: [
      { name: '圆周力', latex: 'F_t = \\frac{2T}{d}', note: '代码：$F_t=2000T/d$（$T$ N·m，$d$ mm）' },
      { name: '挤压应力', latex: '\\sigma_c = \\frac{F_t}{h \\cdot L/2}', note: 'hubLength 默认键长' },
      { name: '剪切应力', latex: '\\tau = \\frac{F_t}{b \\cdot L}', note: '键截面剪切' },
      { name: '最小键长', latex: 'L \\ge \\max\\left(\\frac{F}{b[\\tau]}, \\frac{2F}{h[\\sigma_c]}\\right)', note: 'complete/pro 输出 recommendedLength' },
    ],
    passTitle: '判定依据',
    passChecks: [
      { check: 'shearPass', rule: '$\\tau \\le [\\tau]$（默认 100 MPa）' },
      { check: 'crushPass', rule: '$\\sigma_c \\le [\\sigma_c]$（默认 150 MPa）' },
      { check: 'lengthPass', rule: '$L \\ge recommendedLength$（完整/专业）' },
      { check: '简化模式', rule: 'estimateOnly；pass=false' },
      { check: '专业疲劳', rule: 'torqueAmplitude>0 → 剪切幅 fatiguePass' },
      { check: '专业 SF', rule: 'requiredSafetyFactor 时 $\\tau$、$\\sigma_c$ 须 $\\le$ 许用/SF' },
    ],
    guideTitle: '使用指南',
    guideIntro: '按轴径查标准键尺寸，校核挤压（轮毂侧）与键剪切。键长通常 1.5d～2d。',
    guideSections: [
      {
        title: 'GB/T 1096 查表',
        bullets: ['shaftDiameter 自动 lookupKeySize', 'complete 可改 keyWidth/keyHeight/keyLength', 'hubLength 影响挤压面积'],
      },
      { title: '专业多键', bullets: ['keyCount 均分圆周力', '疲劳按单键剪切幅值'] },
    ],
    examplesTitle: '算例要点',
    examples: [
      { step: 'M30 轴', detail: '查表 $b=8,h=7$；$T=800$ N·m → $F_t$，对比 $[\\tau]$、$[\\sigma_c]$' },
      { step: '加长键', detail: 'crush 控制时增大 hubLength / keyLength' },
      { step: '简化', detail: '显示应力但 pass 恒 ✗ — 须切完整模式' },
    ],
    faqTitle: '常见问题',
    faq: [
      { q: '为何简化不能 pass？', a: 'estimateOnly 设计；须完整模式才 lengthPass + 正式 pass。' },
      { q: '许用应力怎么取？', a: '键材料（45 钢）与轮毂材料取低值；参考手册。' },
      { q: '与轴系设计链？', a: '设计链共享扭矩/轴径/键尺寸，逻辑与本页一致。' },
    ],
    howToPassTitle: '如何让判定通过',
    howToPass: [
      { goal: '挤压失败', steps: ['加长键 / hubLength', '增大键高 h（大一号标准键）', '提高 $[\\sigma_c]$（材料）'] },
      { goal: '剪切失败', steps: ['加长键 L', '加宽键 b', '双键 keyCount=2（专业）'] },
      { goal: '键长不足', steps: ['L ≥ recommendedLength', '优先满足 crush 与 shear 较大者'] },
    ],
    standardsTitle: '相关标准',
    standardsIntro: '平键尺寸与公差按国标系列选取。',
    standards: ['GB/T 1095 — 键槽尺寸', 'GB/T 1096 — 平键截面 $b\\times h$ 系列'],
    limitsTitle: '适用边界',
    limits: [
      '静载或专业单级扭矩幅；无键槽应力集中详细计算。',
      '挤压面积取 $h\\times L/2$ 简化；载荷分布均匀假设。',
      '未计轮毂材料差异与过盈装配附加应力。',
    ],
  },
  en: {
    modesTitle: 'Parallel key — calculation modes',
    modesSubtitle: 'GB/T 1096 size lookup + crush and shear checks',
    modes: stdCalcModes('en', {
      simpleModel: 'GB/T 1096 $b\\times h$ lookup; crush $\\sigma_c$ and shear $\\tau$',
      completeModel: 'Standard key + min length + lengthPass',
      proModel: 'Full + keyCount, torque-amplitude fatigue, optional requiredSafetyFactor',
      simplePass: '**pass always false** (estimateOnly); stresses still shown',
      completePass: 'shearPass $\\land$ crushPass $\\land$ lengthPass',
      proPass: 'Full $\\land$ fatiguePass (torqueAmplitude) $\\land$ extra SF if set',
      simpleCaveat: 'Magnitude only—not a release basis',
      completeCaveat: 'Allowables user-defined per material',
      proCaveat: 'Fatigue: shear-mode assessComponentFatigue on key',
    }),
    formulasTitle: 'Key formulas',
    formulas: [
      { name: 'Tangential force', latex: 'F_t = 2000T/d', note: '$T$ in N·m, $d$ in mm' },
      { name: 'Crush stress', latex: '\\sigma_c = F_t/(h \\cdot L/2)', note: 'Hub side' },
      { name: 'Shear stress', latex: '\\tau = F_t/(bL)', note: 'Key shear plane' },
      { name: 'Min key length', latex: 'L \\ge \\max(F/(b[\\tau]), 2F/(h[\\sigma_c]))', note: 'recommendedLength in Complete/Pro' },
    ],
    passTitle: 'Pass criteria',
    passChecks: [
      { check: 'shearPass', rule: '$\\tau \\le [\\tau]$ (default 100 MPa)' },
      { check: 'crushPass', rule: '$\\sigma_c \\le [\\sigma_c]$ (default 150 MPa)' },
      { check: 'lengthPass', rule: '$L \\ge recommendedLength$ (Full/Pro)' },
      { check: 'Simplified', rule: 'estimateOnly; pass=false' },
      { check: 'Pro fatigue', rule: 'torqueAmplitude>0 → shear fatiguePass' },
      { check: 'Pro SF', rule: 'requiredSafetyFactor divides allowables' },
    ],
    guideTitle: 'How to use',
    guideIntro: 'Lookup standard key by shaft diameter; check hub crush and key shear. Typical length 1.5d–2d.',
    guideSections: [
      { title: 'GB/T 1096 lookup', bullets: ['Auto size from shaftDiameter', 'Full can override dimensions', 'hubLength affects crush area'] },
      { title: 'Pro multi-key', bullets: ['keyCount splits tangential force', 'Fatigue on per-key shear amplitude'] },
    ],
    examplesTitle: 'Example notes',
    examples: [
      { step: 'd=30 shaft', detail: 'Table $b=8,h=7$; $T=800$ N·m → check allowables' },
      { step: 'Longer key', detail: 'Crush-controlled: increase L or hubLength' },
      { step: 'Simple mode', detail: 'Shows stress but pass always fails' },
    ],
    faqTitle: 'FAQ',
    faq: [
      { q: 'Why Simple never passes?', a: 'estimateOnly; switch to Full for lengthPass and release pass.' },
      { q: 'Allowable stresses?', a: 'Take lower of key and hub material values from handbook.' },
      { q: 'Design chain?', a: 'Powertrain chain shares torque/diameter/key dims.' },
    ],
    howToPassTitle: 'How to pass',
    howToPass: [
      { goal: 'Crush fail', steps: ['Longer key / hubLength', 'Next larger standard key height', 'Higher $[\\sigma_c]$'] },
      { goal: 'Shear fail', steps: ['Increase L or b', 'Two keys (Pro keyCount=2)'] },
      { goal: 'Length fail', steps: ['Meet recommendedLength', 'Governed by max of shear/crush min length'] },
    ],
    standardsTitle: 'Standards',
    standardsIntro: 'Parallel key dimensions per Chinese GB series.',
    standards: ['GB/T 1095 — keyway dimensions', 'GB/T 1096 — key section $b\\times h$'],
    limitsTitle: 'Limitations',
    limits: [
      'Static or single-level torque amplitude; no detailed keyway $K_t$.',
      'Uniform load on crush area $hL/2$.',
      'Hub material and interference not modeled separately.',
    ],
  },
}

// ── Weld ─────────────────────────────────────────────────────────────────────

const WELD = {
  zh: {
    modesTitle: '焊缝强度 — 计算模式（角焊缝）',
    modesSubtitle: '简化 GB；完整三标准对照；专业合成 + HAZ + 可选疲劳',
    modes: stdCalcModes('zh', {
      simpleModel: 'GB/T 985 角焊缝喉厚 $a=0.7h_f$；纯剪切 $\\tau=F/(aL)$',
      completeModel: '**GB985 + EN1993-1-8 + AWS D1.1** 三标准并行；allPass=三者皆过',
      proModel: '三标准 + 偏心合成 von Mises + HAZ 软化 + 可选 weld 疲劳 S-N',
      simplePass: '**pass 恒为 false**（estimateOnly）',
      completePass: 'gb.pass $\\land$ eurocode.pass $\\land$ aws.pass',
      proPass: 'allPass $\\land$ combinedPass $\\land$ haz.pass $\\land$（填 stressRange 时）fatigue.pass',
      simpleCaveat: '仅 GB 单标准估算',
      completeCaveat: '均为规范简化式，非完整细节类别验算',
      proCaveat: '合成许用取 Eurocode 剪切许用；HAZ 按热输入折减',
    }),
    formulasTitle: '主要公式',
    formulas: [
      { name: '喉厚', latex: 'a = 0.7 h_f', note: '角焊缝有效厚度' },
      { name: '纯剪', latex: '\\tau = \\frac{F}{aL}', note: '三标准共用工作应力' },
      { name: 'GB 许用', latex: '[\\tau] = f(\\text{钢级})', note: 'Q235→160 MPa 等 gbAllow' },
      { name: 'Eurocode', latex: '[\\tau] = \\frac{f_u/\\sqrt{3}}{\\beta_w \\gamma_{M2}}', note: '默认 $\\beta_w=0.85$, $\\gamma_{M2}=1.25$' },
      { name: 'AWS D1.1', latex: '[\\tau] = 0.3 f_u', note: '角焊缝简化' },
      { name: '偏心合成', latex: '\\sigma_{eq}=\\sqrt{\\sigma_b^2+3\\tau^2}', note: '专业；$\\sigma_b=M/(WL^2/6)$' },
      { name: 'HAZ', latex: '[\\tau]_{HAZ}=0.88\\sim0.82 \\cdot [\\tau]_{base}', note: 'heatInput>2.5 kJ/mm 取 0.82' },
    ],
    passTitle: '判定依据',
    passChecks: [
      { check: '三标准 allPass', rule: 'GB、Eurocode、AWS 剪切均 $\\tau\\le$ 各自许用' },
      { check: 'strictest', rule: 'complete 标最严标准（许用最低者）' },
      { check: 'combinedPass（专业）', rule: '$\\sigma_{eq}\\le$ Eurocode 许用剪切' },
      { check: 'haz.pass', rule: '焊缝应力 $\\le$ HAZ 折减许用' },
      { check: 'fatigue.pass', rule: '填 stressRange：$\\Delta\\tau\\le$ 细节类别 S-N 许用' },
      { check: '对接焊（另页签）', rule: 'complete：三标准正应力；pro：$\\sigma K_f/\\eta$ 修正' },
    ],
    guideTitle: '使用指南',
    guideIntro: '角焊缝页选模式；对接焊在 butt 页签单独算。偏心载荷用专业模式。',
    guideSections: [
      {
        title: '完整三标准',
        bullets: [
          'steelGrade 映射 fu/fy/gbAllow',
          '同时看三条 pass — 任一失败则 allPass 失败',
          'strictest 指出控制标准',
        ],
      },
      {
        title: '专业 HAZ + 疲劳',
        bullets: [
          'heatInput、plateThickness → hazWidth 与 strengthReduction',
          'stressRange + detailCategory → analyzeWeldFatigue',
          'eccentricity 或 forceX/Y 驱动合成应力',
        ],
      },
    ],
    examplesTitle: '算例要点',
    examples: [
      { step: '角焊 6 mm', detail: '$h_f=6$ → $a=4.2$ mm；$F=12000$ N，$L=80$ mm → $\\tau$' },
      { step: '三标准对比', detail: 'S355：GB 200 vs EC ~218 vs AWS ~141 MPa 许用' },
      { step: '专业偏心', detail: 'eccentricity 产生 $\\sigma_b$ → combinedPass 可能控制' },
    ],
    faqTitle: '常见问题',
    faq: [
      { q: '为何简化 pass 恒 false？', a: 'estimateOnly；正式放行用完整/专业三标准。' },
      { q: '哪个标准最严？', a: '通常 AWS 或 GB 较 EC 更严，视钢级与 partial factor 而定。' },
      { q: 'HAZ 与母材？', a: '热影响区强度折减；高线能量焊接需复核。' },
    ],
    howToPassTitle: '如何让判定通过',
    howToPass: [
      { goal: '剪切超限', steps: ['加大焊脚 $h_f$（$a=0.7h_f$）', '延长焊缝长度 L', '换更高 fu 钢级'] },
      { goal: '合成应力', steps: ['减小偏心距', '加劲板分担弯矩', '双焊缝布局'] },
      { goal: 'HAZ / 疲劳', steps: ['降低 heatInput', '降低 stressRange', '选 higher detailCategory'] },
    ],
    standardsTitle: '对照标准',
    standardsIntro: '角焊缝静强度简化对照；疲劳为工具内 S-N 近似。',
    standards: [
      'GB/T 985 — 角焊缝外观与质量（许用简化）',
      'EN 1993-1-8 — Eurocode 3 焊接连接',
      'AWS D1.1 — 结构焊接规范（美标）',
    ],
    limitsTitle: '适用边界',
    limits: [
      '单向静剪或专业简化合成；未计焊趾缺口全尺寸 FEM。',
      '疲劳为固定细节类别 S-N，非 EN 1993-1-9 完整 FAT 曲线。',
      '焊缝质量、探伤等级未纳入计算。',
    ],
  },
  en: {
    modesTitle: 'Weld — modes (fillet)',
    modesSubtitle: 'Simple GB; Full tri-standard; Pro combined + HAZ + optional fatigue',
    modes: stdCalcModes('en', {
      simpleModel: 'GB/T 985 throat $a=0.7h_f$; shear $\\tau=F/(aL)$',
      completeModel: '**GB985 + EN1993-1-8 + AWS D1.1** in parallel; allPass=all three',
      proModel: 'Tri-standard + eccentric von Mises + HAZ softening + optional weld S-N fatigue',
      simplePass: '**pass always false** (estimateOnly)',
      completePass: 'gb.pass $\\land$ eurocode.pass $\\land$ aws.pass',
      proPass: 'allPass $\\land$ combinedPass $\\land$ haz.pass $\\land$ (if stressRange) fatigue.pass',
      simpleCaveat: 'GB estimate only',
      completeCaveat: 'Simplified code formulas—not full detail category',
      proCaveat: 'Combined allow from Eurocode shear; HAZ by heat input',
    }),
    formulasTitle: 'Key formulas',
    formulas: [
      { name: 'Throat', latex: 'a = 0.7 h_f', note: 'Effective fillet thickness' },
      { name: 'Shear', latex: '\\tau = F/(aL)', note: 'Shared working stress' },
      { name: 'GB allowable', latex: '[\\tau] from steel grade', note: 'Q235 → 160 MPa etc.' },
      { name: 'Eurocode', latex: '[\\tau] = f_u/(\\sqrt{3}\\beta_w\\gamma_{M2})', note: 'Defaults 0.85, 1.25' },
      { name: 'AWS D1.1', latex: '[\\tau] = 0.3 f_u', note: 'Fillet simplified' },
      { name: 'Combined (Pro)', latex: '\\sigma_{eq}=\\sqrt{\\sigma_b^2+3\\tau^2}', note: 'Eccentric bending' },
      { name: 'HAZ', latex: '[\\tau]_{HAZ} = (0.88\\sim0.82)[\\tau]_{base}', note: 'High heat input → 0.82' },
    ],
    passTitle: 'Pass criteria',
    passChecks: [
      { check: 'allPass', rule: 'GB, Eurocode, AWS shear all pass' },
      { check: 'strictest', rule: 'Lowest allowable governs' },
      { check: 'combinedPass (Pro)', rule: '$\\sigma_{eq}\\le$ EC shear allowable' },
      { check: 'haz.pass', rule: 'Weld stress $\\le$ reduced HAZ allowable' },
      { check: 'fatigue.pass', rule: 'If stressRange: S-N vs detail category' },
      { check: 'Butt weld tab', rule: 'Tri-standard normal stress; Pro: $K_f/\\eta$ correction' },
    ],
    guideTitle: 'How to use',
    guideIntro: 'Fillet tab for modes; butt weld on separate tab. Use Pro for eccentric loads.',
    guideSections: [
      { title: 'Full tri-standard', bullets: ['steelGrade maps fu/fy/gbAllow', 'All three must pass', 'strictest shows governor'] },
      { title: 'Pro HAZ + fatigue', bullets: ['heatInput → strengthReduction', 'stressRange + detailCategory', 'Eccentricity drives combined stress'] },
    ],
    examplesTitle: 'Example notes',
    examples: [
      { step: '6 mm fillet', detail: '$a=4.2$ mm; compute $\\tau$ from F and L' },
      { step: 'Compare codes', detail: 'S355: different allowables per standard' },
      { step: 'Eccentric Pro', detail: 'Bending adds to combinedPass' },
    ],
    faqTitle: 'FAQ',
    faq: [
      { q: 'Why Simple never passes?', a: 'estimateOnly; use Full/Pro for release.' },
      { q: 'Strictest standard?', a: 'Often AWS or GB vs EC depends on grade and factors.' },
      { q: 'HAZ vs base?', a: 'Heat-affected zone strength reduction.' },
    ],
    howToPassTitle: 'How to pass',
    howToPass: [
      { goal: 'Shear fail', steps: ['Larger leg $h_f$', 'Longer weld L', 'Higher fu grade'] },
      { goal: 'Combined stress', steps: ['Reduce eccentricity', 'Stiffeners', 'Double fillet layout'] },
      { goal: 'HAZ / fatigue', steps: ['Lower heatInput', 'Lower stressRange', 'Better detail category'] },
    ],
    standardsTitle: 'Standards',
    standardsIntro: 'Simplified static comparison; fatigue uses built-in S-N.',
    standards: ['GB/T 985', 'EN 1993-1-8', 'AWS D1.1'],
    limitsTitle: 'Limitations',
    limits: [
      'Single-shear or simplified combined; no full notch FEM.',
      'Fatigue: fixed detail S-N, not full EN 1993-1-9 FAT curves.',
      'Weld quality / NDT class not in calc.',
    ],
  },
}

// ── Spring ───────────────────────────────────────────────────────────────────

const SPRING = {
  zh: {
    modesTitle: '压缩弹簧 — 计算模式',
    modesSubtitle: 'GB/T 23935-2009；Wahl 曲度系数；完整含稳定性与特性',
    modes: stdCalcModes('zh', {
      simpleModel: '刚度 $P\'$、Wahl 切应力 $\\tau$；材料 [τ] 查表或默认',
      completeModel: 'GB23935 表3/图1 许用 + 压并 + 特性 0.2fs~0.8fs + 屈曲 + 共振',
      proModel: '完整 + 式(30) 疲劳 **S≥1.1**（默认 fatigueSafety）',
      simplePass: '**pass 恒为 false**（estimateOnly）',
      completePass: 'shearPass $\\land$ indexPass $\\land$ buckling $\\land$ solidPass $\\land$ characteristic $\\land$ resonance',
      proPass: '完整 $\\land$ fatiguePass（$S=(\\tau_{u0}+0.75\\tau_{min})/\\tau_{max}\\ge1.1$）',
      simpleCaveat: '仅刚度/应力数量级',
      completeCaveat: 'Rm 来自附录 F 线径查表；高度非法可回退 loadMax',
      proCaveat: '疲劳载荷：H₁/H₂ 优先，否则 loadMin/loadMax',
    }),
    formulasTitle: '主要公式',
    formulas: [
      { name: '刚度', latex: "P' = \\frac{Gd^4}{8D^3 n}", note: 'G 默认 80000 MPa' },
      { name: 'Wahl 系数', latex: 'K = \\frac{4C-1}{4C-4}+\\frac{0.615}{C}, \\quad C=D/d', note: 'GB23935 式(7)' },
      { name: '切应力', latex: '\\tau = \\frac{8FD}{\\pi d^3}K', note: 'F 为设计最大工作载荷' },
      { name: '许用 [τ]', latex: '[\\tau]=k \\cdot R_m', note: '表3 / 图1 按静载/动载/γ 查 k' },
      { name: '屈曲', latex: 'F_c = C_B P\' H_0 > F_2', note: '§6.5.2；$b=H_0/D$ 超限时用图3 $C_B$' },
      { name: '疲劳式(30)', latex: 'S = \\frac{\\tau_{u0}+0.75\\tau_{min}}{\\tau_{max}} \\ge 1.1', note: '表9 $\\tau_{u0}$ 与 $N$ 相关' },
    ],
    passTitle: '判定依据',
    passChecks: [
      { check: 'shearPass / staticShearCheck', rule: '$\\tau_{max}\\le[\\tau]$（GB23935 许用链）' },
      { check: 'indexPass', rule: '旋绕比 $C=D/d\\ge4$（$C>16$ 仅警告）' },
      { check: 'bucklingPass', rule: '$b=H_0/D$ 小 → 简化通过；大 → $F_c>F_2$' },
      { check: 'solidPass', rule: '工作变形 $\\le H_0-H_b-margin$' },
      { check: 'characteristicPass', rule: '$0.2f_s\\le f\\le0.8f_s$ 且 $F_2\\le F_s$' },
      { check: 'resonancePass', rule: '填激励频率时 $f_e/f_r>10$' },
      { check: 'fatiguePass（专业）', rule: '$S\\ge1.1$（DEFAULT_FATIGUE_SAFETY）' },
      { check: '简化', rule: 'estimateOnly；pass=false' },
    ],
    guideTitle: '使用指南',
    guideIntro: '先定线径 d、中径 D、有效圈数 n，再校核静强度、压并、稳定性；动载用专业疲劳。',
    guideSections: [
      {
        title: 'GB/T 23935 许用链',
        bullets: [
          'resolveSpringAllowableShear：静载 / 有限寿命 / 图1',
          'Rm 由线径附录 F 查表（material+wireDiameter）',
          'loadCategory=auto 按 targetCycles 与载荷变化推断',
        ],
      },
      {
        title: '高度与载荷',
        bullets: [
          'H₀≥H₁≥H₂≥Hb 顺序校验',
          '高度合法时疲劳优先 H₁/H₂ 换算 F₁/F₂',
          '高度非法且有 loadMin/loadMax → 回退载荷对',
        ],
      },
    ],
    examplesTitle: '算例要点',
    examples: [
      { step: '静载', detail: '$N<10^4$ → 表3 static 系数 × Rm 得 [τ]' },
      { step: '屈曲', detail: '$H_0/D=8$ 固定端 → 查图3 $C_B$ 得 $F_c$' },
      { step: '专业疲劳', detail: '$F_1=200,F_2=800$ N → $\\tau_{min/max}$ → $S\\ge1.1$' },
    ],
    faqTitle: '常见问题',
    faq: [
      { q: '为何简化不能 pass？', a: 'estimateOnly；完整模式才启用 buckling/characteristic 等。' },
      { q: 'SF=1.1 能改吗？', a: '专业 fatigueSafety 输入；默认 DEFAULT_FATIGUE_SAFETY=1.1。' },
      { q: '热卷与冷卷？', a: 'springProcess=hot 时试验切应力走表5 HRC 插值。' },
    ],
    howToPassTitle: '如何让判定通过',
    howToPass: [
      { goal: '切应力超限', steps: ['增大线径 d（∝1/d³）', '增大中径 D 或减圈数 n', '选更高 Rm 材料'] },
      { goal: '屈曲失败', steps: ['缩短自由高 H₀', '加导向杆/套（guided）', '增大 D 降低 b'] },
      { goal: '疲劳 S<1.1', steps: ['降低 F₂ 或提高 F₁（减小幅值）', '提高 Rm / 选更高 τu0 档', '增大 n 降低刚度分担'] },
    ],
    standardsTitle: '相关标准',
    standardsIntro: '计算逻辑对齐 GB/T 23935-2009 与 GB/T 1239 习惯用法。',
    standards: [
      'GB/T 23935-2009 — 圆柱螺旋弹簧设计、试验与稳定性',
      'GB/T 1239 — 普通圆柱螺旋弹簧（系列尺寸参考）',
    ],
    limitsTitle: '适用边界',
    limits: [
      '圆柱螺旋压缩弹簧；未计端部磨平与喷丸残余应力细节。',
      '共振为 fe/fr 简化判据；非完整模态分析。',
      'enforceCriticalConfirm 时完整/专业有关键输入门禁（若页面启用）。',
    ],
  },
  en: {
    modesTitle: 'Compression spring — modes',
    modesSubtitle: 'GB/T 23935-2009; Wahl factor; Full adds stability and characteristics',
    modes: stdCalcModes('en', {
      simpleModel: 'Rate $P\'$, Wahl shear $\\tau$; allowable from table or default',
      completeModel: 'GB23935 Table3/Fig1 allowable + solid + char. 0.2fs–0.8fs + buckling + resonance',
      proModel: 'Full + Eq.(30) fatigue **S≥1.1** (default fatigueSafety)',
      simplePass: '**pass always false** (estimateOnly)',
      completePass: 'shear + index + buckling + solid + characteristic + resonance',
      proPass: 'Full $\\land$ fatiguePass ($S\\ge1.1$)',
      simpleCaveat: 'Stiffness/stress magnitude only',
      completeCaveat: 'Rm from wire-diameter table; invalid heights → loadMax fallback',
      proCaveat: 'Fatigue loads: H₁/H₂ first, else loadMin/loadMax',
    }),
    formulasTitle: 'Key formulas',
    formulas: [
      { name: 'Spring rate', latex: "P' = Gd^4/(8D^3 n)", note: 'G default 80000 MPa' },
      { name: 'Wahl K', latex: 'K = (4C-1)/(4C-4)+0.615/C', note: 'GB23935 Eq.(7)' },
      { name: 'Shear stress', latex: '\\tau = 8FD/(\\pi d^3)K', note: 'F = max working load' },
      { name: 'Allowable', latex: '[\\tau]=k \\cdot R_m', note: 'Table3 / Fig1 by load class and γ' },
      { name: 'Buckling', latex: 'F_c = C_B P\' H_0 > F_2', note: '§6.5.2; Fig3 $C_B$ when b exceeds limit' },
      { name: 'Fatigue Eq.(30)', latex: 'S = (\\tau_{u0}+0.75\\tau_{min})/\\tau_{max} \\ge 1.1', note: 'Table9 $\\tau_{u0}$ vs cycles' },
    ],
    passTitle: 'Pass criteria',
    passChecks: [
      { check: 'shearPass', rule: '$\\tau_{max}\\le[\\tau]$ per GB23935 chain' },
      { check: 'indexPass', rule: '$C=D/d\\ge4$ ($C>16$ warning)' },
      { check: 'bucklingPass', rule: 'Low b: simplified pass; high b: $F_c>F_2$' },
      { check: 'solidPass', rule: 'Deflection within solid margin' },
      { check: 'characteristicPass', rule: '$0.2f_s\\le f\\le0.8f_s$ and $F_2\\le F_s$' },
      { check: 'resonancePass', rule: 'If excitation set: $f_e/f_r>10$' },
      { check: 'fatiguePass (Pro)', rule: '$S\\ge1.1$' },
      { check: 'Simplified', rule: 'estimateOnly; pass=false' },
    ],
    guideTitle: 'How to use',
    guideIntro: 'Size wire d, mean D, active coils n; check static, solid, stability; Pro for fatigue.',
    guideSections: [
      { title: 'GB23935 allowable chain', bullets: ['Static / limited life / Fig1 lookup', 'Rm from appendix F by wire diameter', 'auto loadCategory from cycles and variation'] },
      { title: 'Heights vs loads', bullets: ['Validate H₀≥H₁≥H₂≥Hb', 'Fatigue prefers height-derived F₁/F₂', 'Fallback to loadMin/loadMax if heights invalid'] },
    ],
    examplesTitle: 'Example notes',
    examples: [
      { step: 'Static', detail: '$N<10^4$ → Table3 static factor × Rm' },
      { step: 'Buckling', detail: '$H_0/D=8$ fixed ends → Fig3 $C_B$' },
      { step: 'Pro fatigue', detail: 'Load range → $S\\ge1.1$' },
    ],
    faqTitle: 'FAQ',
    faq: [
      { q: 'Why Simple never passes?', a: 'estimateOnly; Full enables buckling/characteristic gates.' },
      { q: 'Change SF 1.1?', a: 'Pro fatigueSafety input; default 1.1.' },
      { q: 'Hot vs cold coiled?', a: 'hot: Table5 test shear from HRC.' },
    ],
    howToPassTitle: 'How to pass',
    howToPass: [
      { goal: 'Shear fail', steps: ['Larger wire d', 'Adjust D or n', 'Higher Rm material'] },
      { goal: 'Buckling fail', steps: ['Shorter H₀', 'Guided support', 'Larger D to reduce b'] },
      { goal: 'Fatigue S<1.1', steps: ['Reduce amplitude', 'Higher Rm / τu0 tier', 'More coils'] },
    ],
    standardsTitle: 'Standards',
    standardsIntro: 'Aligned with GB/T 23935-2009 design practice.',
    standards: ['GB/T 23935-2009 — helical spring design', 'GB/T 1239 — general spring dimensions'],
    limitsTitle: 'Limitations',
    limits: [
      'Cylindrical compression springs; end grinding / shot peening not detailed.',
      'Resonance: simplified fe/fr, not modal FEA.',
      'Critical-input gate if enforceCriticalConfirm enabled.',
    ],
  },
}

/** @param {'zh'|'en'} [locale] */
export function getBeamHelp(locale = 'zh') {
  return buildHelp(locale, BEAM)
}

/** @param {'zh'|'en'} [locale] */
export function getShaftHelp(locale = 'zh') {
  return buildHelp(locale, SHAFT)
}

/** @param {'zh'|'en'} [locale] */
export function getKeyHelp(locale = 'zh') {
  return buildHelp(locale, KEY)
}

/** @param {'zh'|'en'} [locale] */
export function getWeldHelp(locale = 'zh') {
  return buildHelp(locale, WELD)
}

/** @param {'zh'|'en'} [locale] */
export function getSpringHelp(locale = 'zh') {
  return buildHelp(locale, SPRING)
}
