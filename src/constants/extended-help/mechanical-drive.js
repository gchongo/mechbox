/**
 * 传动件扩展帮助 — 皮带 / 链 / 离合器 / 螺栓组
 * 与 belt-calc、chain-calc、clutch-calc、bolt-group-calc 对齐
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

// ── Belt ─────────────────────────────────────────────────────────────────────

const BELT = {
  zh: {
    modesTitle: '皮带传动 — 计算模式',
    modesSubtitle: '开口/V 带 Euler 张力；同步带节距选型与安装张力（同页 Tab）',
    modes: stdCalcModes('zh', {
      simpleModel: 'V 带：带长、传动比、Euler $F_1/F_2$。同步带：节距推荐、$F_e$、$0.5F_e$ 安装张力',
      completeModel: 'V 带：几何包角 + **带速校核** + 根数。同步带：带宽功率容量 + 带速',
      proModel: 'V 带：使用系数 + 挠曲应力 + 寿命。同步带：寿命量级估算',
      simplePass: 'V 带无正式 pass；同步带 estimateOnly',
      completePass: 'V 带 **speedPass**；同步带 speedPass ∧ widthPass',
      proPass: 'V 带 speedPass ∧ flexPass；同步带 speed ∧ width + 寿命粗估',
      simpleCaveat: '同步带勿用 Euler 摩擦分配',
      completeCaveat: '节距包络为选型辅助，非厂家样本',
      proCaveat: '寿命为量级估算，非 L10 曲线',
    }),
    formulasTitle: '主要公式',
    formulas: [
      { name: '带长（V 带）', latex: 'L = 2C + \\frac{\\pi(D_1+D_2)}{2} + \\frac{(D_2-D_1)^2}{4C}', note: '开口传动' },
      { name: '带速', latex: 'v = \\frac{\\pi D_1 n}{60000}', note: 'm/s；$D$ mm，$n$ rpm' },
      { name: '有效圆周力', latex: 'F_e = \\frac{1000P}{\\eta v}', note: 'V 带与同步带通用' },
      { name: 'Euler 张力（仅 V 带）', latex: 'F_1 = F_2 e^{\\mu\\theta}, \\quad F_e = F_1 - F_2', note: '$\\theta$ 弧度' },
      { name: '安装张力（同步带）', latex: 'F_{\\mathrm{inst}} \\approx 0.5 F_e', note: '常用 0.4–0.6 $F_e$' },
      { name: '根数（V 带）', latex: 'z = \\lceil P K_s / P_{belt} \\rceil', note: 'complete 中 $K_s=1$' },
    ],
    passTitle: '判定依据',
    passChecks: [
      { check: 'V 带 speedPass', rule: '完整/专业：beltSpeed $\\le$ maxBeltSpeed（默认 30 m/s）' },
      { check: '同步带 widthPass', rule: '设计功率 ≤ 带宽×许用功率密度' },
      { check: 'flexPass（V 带专业）', rule: 'flexStress $=F_1/(beltSection)\\le[\\sigma_t]$' },
      { check: '简化模式', rule: '无正式放行 — 仅估算' },
    ],
    guideTitle: '使用指南',
    guideIntro: '同页切换 V 带 / 同步带。V 带输入两轮直径；同步带输入齿数与节距（可自动推荐）。',
    guideSections: [
      {
        title: 'V 带',
        bullets: [
          'friction 默认 0.3；efficiency 默认 0.95',
          '完整模式自动算包角并校核带速',
        ],
      },
      {
        title: '同步带',
        bullets: [
          '节距按功率–转速包络粗选（MXL…14M / HTD）',
          '安装张力约 0.5 $F_e$，不按 Euler 分配',
          '带宽功率密度默认可调（kW/mm）',
        ],
      },
    ],
    examplesTitle: '算例要点',
    examples: [
      { step: 'V 带几何', detail: '$D_1=120,D_2=240,C=400$ → 带长、包角、$i=2$' },
      { step: '同步带', detail: '$P=2$ kW，$n=1450$ → 推荐 5M；算 $F_e$ 与安装张力' },
      { step: '带速', detail: '超 maxBeltSpeed 则 fail' },
    ],
    faqTitle: '常见问题',
    faq: [
      { q: '同步带为何没有 F₁/F₂？', a: '齿啮合传递，不用 Euler 摩擦公式；用 $F_e$ 与安装张力即可。' },
      { q: '节距自动推荐准吗？', a: '仅功率–转速包络粗选，正式选型请对照厂家样本。' },
      { q: '交叉传动？', a: '当前带长公式为开口平行传动；交叉需另式。' },
    ],
    howToPassTitle: '如何让判定通过',
    howToPass: [
      { goal: '带速过高', steps: ['减小小轮/齿数或转速', '提高 maxBeltSpeed（需带型允许）'] },
      { goal: '同步带带宽不足', steps: ['加宽带宽', '提高 allowPowerPerMm（仅当样本允许）', '改更大节距系列'] },
      { goal: 'V 带打滑风险', steps: ['增大包角', '提高 μ', '增加预紧/根数'] },
    ],
    standardsTitle: '相关标准与资料',
    standardsIntro: 'V 带 Euler；同步带选型请对照厂家样本（HTD/STD 等）。',
    standards: [
      'GB/T 11544 / ISO 4184 — V 带与带轮（选型参考）',
      'ISO 5296 / 厂家样本 — 同步带节距与功率表',
      '机械设计手册 — 带传动张力与包角',
    ],
    limitsTitle: '适用边界',
    limits: [
      '稳态传动；未计离心力对有效摩擦的详细修正（除专业 flex 近似）。',
      '开口平行布置；未含张紧轮自动调节。',
      '同步带寿命为量级估算，非厂家寿命曲线。',
    ],
  },
  en: {
    modesTitle: 'Belt drive — calculation modes',
    modesSubtitle: 'V-belt Euler tension; timing-belt pitch & install tension (same-page tabs)',
    modes: stdCalcModes('en', {
      simpleModel: 'V-belt: length, ratio, Euler. Timing: pitch pick, $F_e$, $0.5F_e$ install',
      completeModel: 'V-belt: wrap + **speedPass** + count. Timing: width capacity + speed',
      proModel: 'V-belt: serviceFactor + flex + life. Timing: life order-of-magnitude',
      simplePass: 'V-belt no formal pass; timing estimateOnly',
      completePass: 'V-belt **speedPass**; timing speed ∧ width',
      proPass: 'V-belt speed ∧ flex; timing speed ∧ width + rough life',
      simpleCaveat: 'Do not use Euler split for timing belts',
      completeCaveat: 'Pitch envelope is advisory, not a catalog',
      proCaveat: 'Life is rough scale—not L10 curves',
    }),
    formulasTitle: 'Key formulas',
    formulas: [
      { name: 'Belt length (V)', latex: 'L = 2C + \\pi(D_1+D_2)/2 + (D_2-D_1)^2/(4C)', note: 'Open drive' },
      { name: 'Belt speed', latex: 'v = \\pi D_1 n / 60000', note: 'm/s' },
      { name: 'Effective force', latex: 'F_e = 1000P/(\\eta v)', note: 'V-belt and timing' },
      { name: 'Euler (V only)', latex: 'F_1 = F_2 e^{\\mu\\theta}', note: 'θ in radians' },
      { name: 'Install tension (timing)', latex: 'F_{\\mathrm{inst}} \\approx 0.5 F_e', note: 'Often 0.4–0.6 $F_e$' },
      { name: 'Belt count (V)', latex: 'z = \\lceil P K_s / P_{belt} \\rceil', note: 'Pro uses serviceFactor' },
    ],
    passTitle: 'Pass criteria',
    passChecks: [
      { check: 'V-belt speedPass', rule: 'Full/Pro: beltSpeed $\\le$ maxBeltSpeed' },
      { check: 'Timing widthPass', rule: 'Design power ≤ width × power density' },
      { check: 'flexPass (V Pro)', rule: '$F_1/beltSection \\le allowTension$' },
      { check: 'Simple', rule: 'No formal release—estimate only' },
    ],
    guideTitle: 'How to use',
    guideIntro: 'Switch V-belt / timing on the same page. V-belt uses pulley diameters; timing uses teeth and pitch (auto-recommendable).',
    guideSections: [
      { title: 'V-belt', bullets: ['friction default 0.3', 'efficiency default 0.95', 'Full mode checks speed'] },
      { title: 'Timing', bullets: ['Pitch from power–speed envelope', 'Install ≈ 0.5 $F_e$', 'Width power density adjustable'] },
    ],
    examplesTitle: 'Example notes',
    examples: [
      { step: 'V geometry', detail: 'D₁,D₂,C → length, wrap, ratio' },
      { step: 'Timing', detail: '2 kW, 1450 rpm → ~5M; $F_e$ and install tension' },
      { step: 'Speed', detail: 'Check v vs maxBeltSpeed' },
    ],
    faqTitle: 'FAQ',
    faq: [
      { q: 'Why no F₁/F₂ for timing?', a: 'Tooth engagement—use $F_e$ and install tension, not Euler.' },
      { q: 'Is pitch auto accurate?', a: 'Envelope only—use manufacturer catalogs for selection.' },
      { q: 'Crossed belts?', a: 'Open parallel formula only.' },
    ],
    howToPassTitle: 'How to pass',
    howToPass: [
      { goal: 'Speed fail', steps: ['Smaller pulley/teeth or rpm', 'Raise limit if belt allows'] },
      { goal: 'Timing width', steps: ['Wider belt', 'Raise density if catalog allows', 'Larger pitch'] },
      { goal: 'V-belt slip', steps: ['Larger wrap', 'Higher μ', 'More belts / pretension'] },
    ],
    standardsTitle: 'References',
    standardsIntro: 'V-belt Euler; timing selection from manufacturer catalogs (HTD/STD).',
    standards: [
      'GB/T 11544 / ISO 4184 — V-belts (reference)',
      'ISO 5296 / catalogs — timing pitch and power',
      'Handbook — belt tension and wrap',
    ],
    limitsTitle: 'Limitations',
    limits: [
      'Steady drive; limited centrifugal modeling.',
      'Open parallel layout; no automatic tensioner model.',
      'Timing life is order-of-magnitude—not manufacturer L10.',
    ],
  },
}

// ── Chain ────────────────────────────────────────────────────────────────────

const CHAIN = {
  zh: {
    modesTitle: '链传动 — 计算模式',
    modesSubtitle: 'GB/T 1243 节距简化；链长取整节距',
    modes: stdCalcModes('zh', {
      simpleModel: '传动比、链长（向上取整节数）、链速、张力',
      completeModel: '**链速 + 张力** 双限：speedPass $\\land$ tensionPass；serviceFactor 1.15',
      proModel: '完整 + serviceFactor 1.3 + 润滑系数 + 分链 strand 张力 + 寿命',
      simplePass: '无正式 pass',
      completePass: 'speedPass（默认 $v_{max}=15$ m/s）$\\land$ tensionPass（默认 20000 N）',
      proPass: '同完整且 tensionPerStrand $\\le$ allowTension',
      simpleCaveat: '不看许用张力与链速',
      completeCaveat: '链型号许用需用户对表 allowTension',
      proCaveat: 'estimatedLifeHours 为 $15000\\times(T/F)^2\\times$ 润滑系数',
    }),
    formulasTitle: '主要公式',
    formulas: [
      { name: '链长', latex: 'L_p = \\frac{2C}{p}+\\frac{z_1+z_2}{2}+\\frac{p(z_2-z_1)^2}{4\\pi^2 C}', note: '向上取整 × 节距 p' },
      { name: '链速', latex: 'v = \\frac{p z_1 n}{60000}', note: 'm/s' },
      { name: '链张力', latex: 'F = \\frac{P}{v\\eta}', note: '设计功率 × serviceFactor' },
      { name: '传动比', latex: 'i = z_2 / z_1', note: '齿数比' },
    ],
    passTitle: '判定依据',
    passChecks: [
      { check: 'speedPass', rule: 'chainSpeed $\\le$ maxChainSpeed（默认 15 m/s）' },
      { check: 'tensionPass', rule: 'chainTension $\\le$ allowTension（默认 20000 N）' },
      { check: '专业分链', rule: 'tensionPerStrand = F/strands $\\le$ allowTension' },
      { check: '综合 pass', rule: 'complete/pro：speed $\\land$ tension（pro 含 per-strand）' },
      { check: '简化', rule: '无 pass — 仅几何与张力量级' },
    ],
    guideTitle: '使用指南',
    guideIntro: '选节距 p 与齿数 z₁、z₂，输入中心距 C 与功率；完整模式校核速度与张力。',
    guideSections: [
      {
        title: 'GB/T 1243 简化',
        bullets: [
          'pitch 对应滚子链节距（如 12.7、15.875 mm）',
          'links = ceil(L/p) 向上取整',
          'allowTension 应查所选链号样本',
        ],
      },
      {
        title: '专业润滑',
        bullets: [
          'lubricationFactor 默认 1',
          'strands 多排链分担张力',
          'serviceFactor 1.3 较 complete 更保守',
        ],
      },
    ],
    examplesTitle: '算例要点',
    examples: [
      { step: '08B 链', detail: 'p=12.7，z₁=19，z₂=57，C=400 → 链长与节数' },
      { step: '张力', detail: 'P=3 kW，v=8 m/s → F≈375 N；对比 allowTension' },
      { step: '超速', detail: 'n 过高或 p 过大 → speedPass 失败' },
    ],
    faqTitle: '常见问题',
    faq: [
      { q: 'allowTension 默认 20000？', a: '占位默认；须按链号（如 16A）样本填写。' },
      { q: '与皮带页差异？', a: '链为啮合传动；张力公式形式类似但限值为链号相关。' },
      { q: '垂度与排距？', a: '链长公式含中心距 C；未单独校核垂度。' },
    ],
    howToPassTitle: '如何让判定通过',
    howToPass: [
      { goal: '链速过高', steps: ['减少 z₁ 或 rpm', '选更大节距链（需同时校核张力）', '提高 maxChainSpeed（须链型允许）'] },
      { goal: '张力过大', steps: ['增大链号 allowTension', '多排链 strands>1', '降速或减功率'] },
      { goal: '链长不合适', steps: ['调整 C 使 Lp 取整后接近标准中心距', '微调 z₂ 齿数'] },
    ],
    standardsTitle: '相关标准',
    standardsIntro: '节距与齿数按滚子链国标系列初选。',
    standards: [
      'GB/T 1243 — 短节距精密滚子链',
      'GB/T 1244 — 链轮齿形（选型配套）',
    ],
    limitsTitle: '适用边界',
    limits: [
      '稳态平均传动比；未计多边形效应动载荷系数详细值。',
      '张力为直边近似；未含离链冲击。',
      '寿命为经验指数，非厂家磨损曲线。',
    ],
  },
  en: {
    modesTitle: 'Chain drive — calculation modes',
    modesSubtitle: 'GB/T 1243 pitch simplified; length rounded to whole pitches',
    modes: stdCalcModes('en', {
      simpleModel: 'Ratio, length (ceil pitches), speed, tension',
      completeModel: '**Speed + tension** limits; serviceFactor 1.15',
      proModel: 'Full + serviceFactor 1.3 + lubrication + per-strand check + life',
      simplePass: 'No formal pass',
      completePass: 'speedPass (default 15 m/s) $\\land$ tensionPass (default 20000 N)',
      proPass: 'Same + tensionPerStrand $\\le$ allowTension',
      simpleCaveat: 'No tension/speed limits',
      completeCaveat: 'allowTension from user catalog',
      proCaveat: 'Life ~ $15000(T/F)^2 \\times$ lube factor',
    }),
    formulasTitle: 'Key formulas',
    formulas: [
      { name: 'Chain length', latex: 'L_p = 2C/p + (z_1+z_2)/2 + \\cdots', note: 'Ceil to whole pitches' },
      { name: 'Chain speed', latex: 'v = p z_1 n / 60000', note: 'm/s' },
      { name: 'Tension', latex: 'F = P/(v\\eta)', note: 'Design power × serviceFactor' },
      { name: 'Ratio', latex: 'i = z_2/z_1', note: 'Tooth count ratio' },
    ],
    passTitle: 'Pass criteria',
    passChecks: [
      { check: 'speedPass', rule: 'chainSpeed $\\le$ maxChainSpeed (default 15 m/s)' },
      { check: 'tensionPass', rule: 'chainTension $\\le$ allowTension' },
      { check: 'Pro per-strand', rule: 'F/strands $\\le$ allowTension' },
      { check: 'Overall', rule: 'Full/Pro: speed $\\land$ tension' },
      { check: 'Simple', rule: 'No pass' },
    ],
    guideTitle: 'How to use',
    guideIntro: 'Pick pitch p and tooth counts; enter C and power; Full checks speed and tension.',
    guideSections: [
      { title: 'GB/T 1243 simplified', bullets: ['pitch = roller chain pitch', 'links = ceil(L/p)', 'allowTension from catalog'] },
      { title: 'Pro lubrication', bullets: ['lubricationFactor default 1', 'strands for multi-row', 'serviceFactor 1.3'] },
    ],
    examplesTitle: 'Example notes',
    examples: [
      { step: '08B chain', detail: 'p=12.7, z₁=19, z₂=57 → length and links' },
      { step: 'Tension', detail: '3 kW at 8 m/s → compare allowTension' },
      { step: 'Overspeed', detail: 'High n or p → speedPass fail' },
    ],
    faqTitle: 'FAQ',
    faq: [
      { q: 'Default allowTension 20000?', a: 'Placeholder—set from chain size catalog.' },
      { q: 'Vs belt page?', a: 'Engagement drive; similar F=P/(vη) but chain-specific limits.' },
      { q: 'Sag?', a: 'C in length formula; sag not checked separately.' },
    ],
    howToPassTitle: 'How to pass',
    howToPass: [
      { goal: 'Speed fail', steps: ['Lower z₁ or rpm', 'Larger pitch if allowed', 'Raise limit if chain allows'] },
      { goal: 'Tension fail', steps: ['Larger chain allowTension', 'Multi-strand', 'Reduce power or speed'] },
      { goal: 'Length fit', steps: ['Adjust C for integer pitches', 'Tune z₂'] },
    ],
    standardsTitle: 'Standards',
    standardsIntro: 'Roller chain series per GB/T 1243.',
    standards: ['GB/T 1243 — precision roller chain', 'GB/T 1244 — sprocket geometry'],
    limitsTitle: 'Limitations',
    limits: [
      'Steady ratio; polygon effect not fully modeled.',
      'Straight-span tension; no impact from disengagement.',
      'Empirical life—not manufacturer wear curve.',
    ],
  },
}

// ── Clutch ───────────────────────────────────────────────────────────────────

const CLUTCH = {
  zh: {
    modesTitle: '摩擦离合器 — 计算模式',
    modesSubtitle: '均匀磨损模型有效半径；专业含离心减载与热衰退',
    modes: stdCalcModes('zh', {
      simpleModel: '$T=n\\mu F R$；可反算 requiredTorque 所需 F',
      completeModel: '内外径 → calcMeanFrictionRadius + **接触压强** pressurePass',
      proModel: '完整 + 离心减载 + **thermalFade** 热衰退 deratedTorque',
      simplePass: '**pass 恒为 false**（estimateOnly）',
      completePass: 'torquePass $\\land$ pressurePass（$p\\le p_{max}$ 默认 1.5 MPa）',
      proPass: 'deratedTorque $\\ge T_{req}\\times SF$（默认 SF=1.2）$\\land$ pressurePass',
      simpleCaveat: '单半径 R；不作正式放行',
      completeCaveat: 'allowableTorque 默认 ∞ — 须手填',
      proCaveat: 'thermalFade 为乘性系数（<1 降扭矩）',
    }),
    formulasTitle: '主要公式',
    formulas: [
      { name: '摩擦扭矩', latex: 'T = \\frac{n \\mu F R}{1000}', note: 'T N·m；F N；R mm；n 摩擦面数' },
      { name: '有效半径', latex: 'R_m = \\frac{2(R_o^3-R_i^3)}{3(R_o^2-R_i^2)}', note: 'complete/pro 均匀磨损模型' },
      { name: '所需压紧力', latex: 'F = \\frac{1000T}{n\\mu R}', note: '反算 clampForce' },
      { name: '接触压强', latex: 'p = F / A_{annular}', note: 'complete 校核 maxPressure' },
      { name: '离心减载', latex: 'F_{eff} = \\max(0, F - F_{cf})', note: '专业；$F_{cf}\\propto\\omega^2$' },
      { name: '热衰退', latex: 'T_{derated} = T(\\omega) \\times \\text{thermalFade}', note: 'thermalFade 默认 1' },
    ],
    passTitle: '判定依据',
    passChecks: [
      { check: 'torquePass', rule: '$T \\le allowableTorque$（complete 须填写）' },
      { check: 'pressurePass', rule: 'contactPressure $\\le$ maxPressure（默认 1.5 MPa）' },
      { check: '简化', rule: 'estimateOnly；pass=false' },
      { check: '专业 deratedTorque', rule: '离心修正后扭矩 × thermalFade' },
      { check: '专业综合', rule: '填 requiredTorque：deratedTorque $\\ge T_{req}\\times safetyFactor$' },
    ],
    guideTitle: '使用指南',
    guideIntro: '片式离合器先估可传扭矩；完整模式校核接触压强；高速或温升用专业模式。',
    guideSections: [
      {
        title: '几何输入',
        bullets: [
          'simple：单半径 radius',
          'complete/pro：innerDiameter + outerDiameter → R_m',
          'surfaces 为有效摩擦面数（多片 ×2）',
        ],
      },
      {
        title: '专业热/速',
        bullets: [
          'rpm 高 → centrifugalForce 降低有效压紧力',
          'thermalFade<1 模拟摩擦材料热衰退',
          'safetyFactor 默认 1.2',
        ],
      },
    ],
    examplesTitle: '算例要点',
    examples: [
      { step: '单片', detail: '$\\mu=0.15,F=5000$ N，$R=80$ mm，$n=1$ → $T$' },
      { step: '压强', detail: '外径 200、内径 120 → 环面积 → p 对比 1.5 MPa' },
      { step: '专业', detail: 'rpm=3000，thermalFade=0.85 → deratedTorque 对比需求' },
    ],
    faqTitle: '常见问题',
    faq: [
      { q: 'allowableTorque 无限？', a: 'complete 默认 ∞；须按材料/实验填许用扭矩才 meaningful pass。' },
      { q: 'μ 怎么取？', a: '干式钢对钢 ~0.15；浸油、烧结片查样本。' },
      { q: 'thermalFade 含义？', a: '用户给定乘性系数，模拟温升后摩擦系数下降。' },
    ],
    howToPassTitle: '如何让判定通过',
    howToPass: [
      { goal: '扭矩不足', steps: ['增大压紧力 F', '增加摩擦面数 n', '增大摩擦半径或外径'] },
      { goal: '压强过高', steps: ['增大摩擦面积（加大外径）', '降低 F 并增 n 片', '换允许更高 p 的材料'] },
      { goal: '专业高速失败', steps: ['降低 rpm 影响（弹簧压紧补偿）', '提高 thermalFade 输入（更好材料/冷却）', '增大 SF 设计裕度'] },
    ],
    standardsTitle: '相关标准与资料',
    standardsIntro: '摩擦离合器多为企业标准与样本选型。',
    standards: [
      '机械设计手册 — 摩擦离合器计算',
      'JB/T 7006 等 — 摩擦片材料（参考）',
    ],
    limitsTitle: '适用边界',
    limits: [
      '静摩擦均匀压力；未计沟槽排油与微动磨损。',
      '离心公式为简化；热衰退由用户系数表征，无瞬态热分析。',
      '未含接合冲击与操纵机构力学。',
    ],
  },
  en: {
    modesTitle: 'Friction clutch — calculation modes',
    modesSubtitle: 'Uniform-pressure mean radius; Pro adds centrifugal and thermal derating',
    modes: stdCalcModes('en', {
      simpleModel: '$T=n\\mu FR$; can back-solve F from requiredTorque',
      completeModel: 'Inner/outer dia → mean radius + **contact pressure** pressurePass',
      proModel: 'Full + centrifugal reduction + **thermalFade** deratedTorque',
      simplePass: '**pass always false** (estimateOnly)',
      completePass: 'torquePass $\\land$ pressurePass ($p\\le p_{max}$ default 1.5 MPa)',
      proPass: 'deratedTorque $\\ge T_{req}\\times SF$ (default 1.2) $\\land$ pressurePass',
      simpleCaveat: 'Single radius; not for release',
      completeCaveat: 'allowableTorque defaults ∞—must set',
      proCaveat: 'thermalFade multiplies torque capacity',
    }),
    formulasTitle: 'Key formulas',
    formulas: [
      { name: 'Friction torque', latex: 'T = n\\mu FR/1000', note: 'T N·m, F N, R mm' },
      { name: 'Mean radius', latex: 'R_m from uniform pressure', note: 'Complete/Pro annulus' },
      { name: 'Clamp force', latex: 'F = 1000T/(n\\mu R)', note: 'Back-calculate' },
      { name: 'Contact pressure', latex: 'p = F/A', note: 'Vs maxPressure' },
      { name: 'Centrifugal', latex: 'F_eff = max(0, F - F_cf)', note: 'Pro; ω² scaling' },
      { name: 'Thermal derating', latex: 'T_der = T(\\omega) \\times thermalFade', note: 'Default 1' },
    ],
    passTitle: 'Pass criteria',
    passChecks: [
      { check: 'torquePass', rule: '$T \\le allowableTorque$ (set in Complete)' },
      { check: 'pressurePass', rule: 'contactPressure $\\le$ maxPressure' },
      { check: 'Simple', rule: 'estimateOnly; pass=false' },
      { check: 'Pro deratedTorque', rule: 'After centrifugal × thermalFade' },
      { check: 'Pro overall', rule: 'If requiredTorque: derated $\\ge T_{req}\\times SF$' },
    ],
    guideTitle: 'How to use',
    guideIntro: 'Estimate transferable torque; Full checks contact pressure; Pro for speed and heat.',
    guideSections: [
      { title: 'Geometry', bullets: ['Simple: single radius', 'Full/Pro: inner/outer → R_m', 'surfaces = active friction faces'] },
      { title: 'Pro speed/heat', bullets: ['High rpm reduces effective clamp', 'thermalFade < 1 for hot fade', 'safetyFactor default 1.2'] },
    ],
    examplesTitle: 'Example notes',
    examples: [
      { step: 'Single plate', detail: 'μ=0.15, F=5000 N, R=80 mm → T' },
      { step: 'Pressure', detail: 'Annulus area → p vs 1.5 MPa' },
      { step: 'Pro', detail: 'rpm=3000, thermalFade=0.85 → derated vs required' },
    ],
    faqTitle: 'FAQ',
    faq: [
      { q: 'Infinite allowableTorque?', a: 'Default ∞ in Complete—set a limit for meaningful pass.' },
      { q: 'Friction μ?', a: 'Dry steel ~0.15; wet/sintered from catalog.' },
      { q: 'thermalFade?', a: 'User multiplier for temperature fade.' },
    ],
    howToPassTitle: 'How to pass',
    howToPass: [
      { goal: 'Low torque', steps: ['More clamp force F', 'More surfaces n', 'Larger radius'] },
      { goal: 'High pressure', steps: ['Larger annulus area', 'More plates', 'Higher p_allow material'] },
      { goal: 'Pro speed fail', steps: ['Compensate centrifugal loss', 'Better cooling / thermalFade', 'Design margin SF'] },
    ],
    standardsTitle: 'References',
    standardsIntro: 'Clutches often selected from manufacturer data.',
    standards: ['Mechanical design handbook — friction clutch', 'JB/T 7006 — friction materials (reference)'],
    limitsTitle: 'Limitations',
    limits: [
      'Uniform pressure static friction; no groove drainage model.',
      'Centrifugal simplified; thermalFade is user factor—no transient heat.',
      'No engagement dynamics or linkage mechanics.',
    ],
  },
}

// ── Bolt group ───────────────────────────────────────────────────────────────

const BOLT_GROUP = {
  zh: {
    modesTitle: '螺栓组 — 计算模式',
    modesSubtitle: '简化均分 + 极惯性矩；完整逐栓矢量叠加 + 撬力 + 摩擦抗滑',
    modes: stdCalcModes('zh', {
      simpleModel: '均分剪力 + $M/(n r_{max}^2)$ 扭转近似；maxForce = 直接 + 扭转',
      completeModel: '**逐栓矢量**：$f_{x,i}=F_x/n - My/I_p$，$f_{y,i}=F_y/n + Mx/I_p$ + **撬力 prying**',
      proModel: '与 complete 同算法（calcMode=professional 仍走 analyzeBoltGroupComplete）',
      simplePass: '**pass 恒为 false**（estimateOnly）',
      completePass: 'shearPass $\\land$ interactionPass $\\land$ slipPass（填摩擦时）',
      proPass: '同 complete',
      simpleCaveat: '未含逐栓表格与剪拉交互',
      completeCaveat: 'prying 为简化杠杆：$T_{pry}=M/(n\\cdot arm)$',
      proCaveat: '剪拉交互为 $\\sqrt{(V/V_a)^2+(T/T_a)^2}\\le1$',
    }),
    formulasTitle: '主要公式',
    formulas: [
      { name: '直接剪力', latex: 'F_{direct} = \\sqrt{F_x^2+F_y^2}/n', note: '形心均分' },
      { name: '力矩分量', latex: 'f_{x,i} = F_x/n - M y_i/I_p,\\; f_{y,i} = F_y/n + M x_i/I_p', note: 'complete 矢量叠加' },
      { name: '栓剪力', latex: '|F_i| = \\sqrt{f_{x,i}^2+f_{y,i}^2}', note: '逐栓' },
      { name: '撬力拉力', latex: 'T_{pry} = M/(n \\cdot a_{pry})', note: 'complete；与轴向拉力叠加' },
      { name: '剪拉交互', latex: '\\sqrt{(V/[V])^2+(T/[T])^2} \\le 1', note: 'assessBoltInteraction' },
      { name: '摩擦抗滑', latex: 'V_{slip} = \\mu \\sum F_{clamp}', note: '填 frictionCoeff + clampForcePerBolt' },
    ],
    passTitle: '判定依据',
    passChecks: [
      { check: 'shearPass', rule: '所有栓 shearForce $\\le$ allowPerBolt' },
      { check: 'interactionPass', rule: '各栓剪拉交互 utilization $\\le 1$' },
      { check: 'slipPass', rule: '填摩擦时：$\\sqrt{F_x^2+F_y^2} \\le \\mu n F_{clamp}$' },
      { check: 'criticalBoltIndex', rule: 'combinedForce 最大栓为控制栓' },
      { check: '简化', rule: 'estimateOnly；pass=false（forcePass 仍显示）' },
      { check: 'prying', rule: 'complete+：axialTension/n + pryingTension → 拉力分量' },
    ],
    guideTitle: '使用指南',
    guideIntro: '偏心载荷连接先完整模式；简化只看最大栓力数量级。摩擦型连接填预紧与 μ。',
    guideSections: [
      {
        title: '完整矢量法',
        bullets: [
          'boltCircleRadius + boltCount → 圆周均布坐标',
          '可自定义 boltPositions',
          'Ip = Σ(x²+y²) 极惯性矩近似',
        ],
      },
      {
        title: '撬力与摩擦',
        bullets: [
          'moment + pryingArm → calcPryingTension',
          'frictionCoeff>0 且 clampForcePerBolt>0 启用 slipPass',
          'allowTensionPerBolt 用于拉剪交互',
        ],
      },
    ],
    examplesTitle: '算例要点',
    examples: [
      { step: '4 栓均布', detail: '$F_y=20000$ N，$M=500000$ N·mm，R=50 → 最远栓最大' },
      { step: '撬力', detail: 'pryingArm=40 mm → 附加拉力进交互判据' },
      { step: '摩擦抗滑', detail: 'μ=0.2，每栓预紧 30000 N → slipCapacity' },
    ],
    faqTitle: '常见问题',
    faq: [
      { q: 'complete 与 professional 区别？', a: '当前代码同 analyzeBoltGroupComplete；专业标签一致。' },
      { q: '为何简化 pass false？', a: 'estimateOnly；须 complete 才 interactionPass。' },
      { q: '与 VDI 2230 单栓？', a: '本页为组受力分配；预紧细节见 bolt-preload 页。' },
    ],
    howToPassTitle: '如何让判定通过',
    howToPass: [
      { goal: '剪力超限', steps: ['增加栓数 n', '增大分布圆半径（降低 M 臂）', '提高 allowPerBolt 规格'] },
      { goal: '撬力/拉剪失败', steps: ['减小外弯矩', '增大 pryingArm（加劲减小杠杆效应）', '提高 allowTensionPerBolt'] },
      { goal: '滑移', steps: ['提高预紧 clampForcePerBolt', '增大 μ（摩擦面处理）', '增加栓数'] },
    ],
    standardsTitle: '相关标准',
    standardsIntro: '螺栓组分配为弹性基础经典法简化；正式设计对照规范与 FE。',
    standards: [
      'GB/T 16823 — 钢结构的螺栓连接（概念参考）',
      'VDI 2230 — 单栓预紧与强度（见 bolt-preload 工具）',
      'AISC / Eurocode 3 — 偏心连接设计方法',
    ],
    limitsTitle: '适用边界',
    limits: [
      '弹性线弹性分配；大变形或显著撬曲需非线性 FE。',
      'prying 为杠杆简化，非完整 T-stub 模型。',
      '摩擦型 μ 常数；未计松弛与温度预紧损失。',
    ],
  },
  en: {
    modesTitle: 'Bolt group — calculation modes',
    modesSubtitle: 'Simple uniform split; Full per-bolt vector superposition + prying + slip',
    modes: stdCalcModes('en', {
      simpleModel: 'Uniform shear + torsion approx; maxForce = direct + torsion',
      completeModel: '**Per-bolt vectors** $f_{x,i}, f_{y,i}$ + **prying tension**',
      proModel: 'Same as Complete (analyzeBoltGroupComplete)',
      simplePass: '**pass always false** (estimateOnly)',
      completePass: 'shearPass $\\land$ interactionPass $\\land$ slipPass (if friction set)',
      proPass: 'Same as Complete',
      simpleCaveat: 'No per-bolt table or interaction',
      completeCaveat: 'Prying lever: $T_{pry}=M/(n\\cdot arm)$',
      proCaveat: 'Interaction $\\sqrt{(V/V_a)^2+(T/T_a)^2}\\le1$',
    }),
    formulasTitle: 'Key formulas',
    formulas: [
      { name: 'Direct shear', latex: 'F_{direct} = \\sqrt{F_x^2+F_y^2}/n', note: 'Centroid split' },
      { name: 'Moment components', latex: 'f_{x,i} = F_x/n - My/I_p, etc.', note: 'Vector superposition' },
      { name: 'Bolt shear', latex: '|F_i| = \\sqrt{f_{x,i}^2+f_{y,i}^2}', note: 'Per bolt' },
      { name: 'Prying', latex: 'T_{pry} = M/(n \\cdot a_{pry})', note: 'Added to axial tension' },
      { name: 'Interaction', latex: '\\sqrt{(V/[V])^2+(T/[T])^2} \\le 1', note: 'von Mises-style' },
      { name: 'Slip resistance', latex: 'V_{slip} = \\mu \\sum F_{clamp}', note: 'If friction inputs set' },
    ],
    passTitle: 'Pass criteria',
    passChecks: [
      { check: 'shearPass', rule: 'Every bolt shearForce $\\le$ allowPerBolt' },
      { check: 'interactionPass', rule: 'Per-bolt utilization $\\le 1$' },
      { check: 'slipPass', rule: 'If friction: resultant shear $\\le$ slipCapacity' },
      { check: 'criticalBoltIndex', rule: 'Max combinedForce governs' },
      { check: 'Simple', rule: 'estimateOnly; pass=false' },
      { check: 'Prying', rule: 'Complete+: axial/n + pryingTension in tension component' },
    ],
    guideTitle: 'How to use',
    guideIntro: 'Use Complete for eccentric loads; Simple for magnitude only. Friction connections need preload and μ.',
    guideSections: [
      { title: 'Full vector method', bullets: ['Circle layout from count and radius', 'Optional boltPositions', 'Ip = Σ(x²+y²)'] },
      { title: 'Prying and slip', bullets: ['moment + pryingArm → prying tension', 'frictionCoeff + clamp → slipPass', 'allowTensionPerBolt for interaction'] },
    ],
    examplesTitle: 'Example notes',
    examples: [
      { step: '4-bolt pattern', detail: 'Fy=20 kN, M=500 kN·mm → farthest bolt critical' },
      { step: 'Prying', detail: 'pryingArm=40 mm adds tension to interaction' },
      { step: 'Slip', detail: 'μ=0.2, 30 kN clamp each → slipCapacity' },
    ],
    faqTitle: 'FAQ',
    faq: [
      { q: 'Complete vs Professional?', a: 'Same code path today—analyzeBoltGroupComplete.' },
      { q: 'Why Simple never passes?', a: 'estimateOnly; Complete for interactionPass.' },
      { q: 'Vs VDI 2230 single bolt?', a: 'Group load split; see bolt-preload for preload detail.' },
    ],
    howToPassTitle: 'How to pass',
    howToPass: [
      { goal: 'Shear fail', steps: ['More bolts n', 'Larger bolt circle', 'Higher bolt grade'] },
      { goal: 'Prying / interaction', steps: ['Reduce moment', 'Stiffeners / pryingArm', 'Higher allowTensionPerBolt'] },
      { goal: 'Slip', steps: ['Higher preload', 'Better μ surface', 'More bolts'] },
    ],
    standardsTitle: 'Standards',
    standardsIntro: 'Elastic distribution simplified; verify with code or FE for release.',
    standards: ['GB/T 16823 — bolted connections (reference)', 'VDI 2230 — single-bolt (bolt-preload tool)', 'AISC / EC3 — eccentric connections'],
    limitsTitle: 'Limitations',
    limits: [
      'Elastic linear distribution; large prying needs nonlinear FE.',
      'Prying is lever simplification—not full T-stub.',
      'Constant μ; no relaxation or thermal preload loss.',
    ],
  },
}

/** @param {'zh'|'en'} [locale] */
export function getBeltHelp(locale = 'zh') {
  return buildHelp(locale, BELT)
}

/** @param {'zh'|'en'} [locale] */
export function getChainHelp(locale = 'zh') {
  return buildHelp(locale, CHAIN)
}

/** @param {'zh'|'en'} [locale] */
export function getClutchHelp(locale = 'zh') {
  return buildHelp(locale, CLUTCH)
}

/** @param {'zh'|'en'} [locale] */
export function getBoltGroupHelp(locale = 'zh') {
  return buildHelp(locale, BOLT_GROUP)
}

/** @param {'zh'|'en'} [locale] */
export function getWormGearHelp(locale = 'zh') {
  const L = locale === 'en'
  return {
    blocks: [
      modesBlock(L ? 'Calculation modes' : '计算模式', stdCalcModes(locale, pickLocale(locale, {
        zh: {
          simpleModel: '几何、$i$、$\\gamma$、$\\eta$、$T_2$、力（estimateOnly）',
          completeModel: '$\\sigma_F=Y_F F_{t2}/(b m)$、$\\sigma_H=Z_E\\sqrt{F_{t2}/(d_2 b)}$',
          proModel: '$K_A$、μ′、$v_s$、$P_{loss}\\le P_{th}$',
          simplePass: '**pass 恒 false**（estimateOnly）',
          completePass: 'bendingPass ∧ contactPass',
          proPass: '弯曲 ∧ 接触 ∧ 滑动 ∧ 散热',
          simpleCaveat: '方案级',
          completeCaveat: 'Lewis/Hertz 教材式；非 ISO 14521',
          proCaveat: '散热为封闭箱体量级粗估',
        },
        en: {
          simpleModel: 'Geometry, $i$, $\\gamma$, $\\eta$, $T_2$, forces (estimateOnly)',
          completeModel: '$\\sigma_F=Y_F F_{t2}/(b m)$, $\\sigma_H=Z_E\\sqrt{F_{t2}/(d_2 b)}$',
          proModel: '$K_A$, μ′, $v_s$, $P_{loss}\\le P_{th}$',
          simplePass: '**pass always false** (estimateOnly)',
          completePass: 'bendingPass ∧ contactPass',
          proPass: 'bending ∧ contact ∧ sliding ∧ thermal',
          simpleCaveat: 'Concept stage',
          completeCaveat: 'Textbook Lewis/Hertz; not ISO 14521',
          proCaveat: 'Heat capacity is enclosed-box order-of-magnitude',
        },
      }))),
      formulasBlock(L ? 'Worm drive' : '蜗轮蜗杆', [
        { name: L ? 'Ratio' : '传动比', latex: 'i=z_2/z_1', note: '' },
        { name: L ? 'Lead angle' : '导程角', latex: '\\tan\\gamma=z_1/q', note: 'q=d_1/m' },
        { name: L ? 'Efficiency' : '效率', latex: '\\eta=\\tan\\gamma/\\tan(\\gamma+\\rho)', note: '\\rho=\\arctan\\mu' },
        { name: L ? 'Output torque' : '输出扭矩', latex: 'T_2=T_1 i \\eta', note: '蜗杆主动' },
        { name: L ? 'Forces' : '力', latex: 'F_{a1}=F_{t2}=2000 T_2/d_2', note: '' },
        { name: L ? 'Bending' : '弯曲', latex: '\\sigma_F=Y_F F_{t2}/(b m)', note: 'Y_F\\approx1.6' },
        { name: L ? 'Contact' : '接触', latex: '\\sigma_H=Z_E\\sqrt{F_{t2}/(d_2 b)}', note: 'Z_E\\approx160' },
        { name: L ? 'Sliding' : '滑动速度', latex: 'v_s=\\pi d_1 n_1/(60000\\cos\\gamma)', note: '专业' },
      ]),
      passBlock(L ? 'Pass criteria' : '判定', pickLocale(locale, {
        zh: [
          { check: '简化', rule: 'estimateOnly → getCalcReviewStatus=review；pass=false' },
          { check: '完整', rule: 'σ_F≤[σ_F] ∧ σ_H≤[σ_H] ∧ T₁>0' },
          { check: '专业', rule: '完整 ∧ v_s≤v_{s,max} ∧ P_loss≤P_th（载荷含 K_A）' },
          { check: '自锁', rule: 'γ≤ρ 仅提示，不参与 pass' },
        ],
        en: [
          { check: 'Simple', rule: 'estimateOnly → review status; pass=false' },
          { check: 'Full', rule: 'σ_F≤[σ_F] ∧ σ_H≤[σ_H] ∧ T₁>0' },
          { check: 'Pro', rule: 'Full ∧ v_s≤v_{s,max} ∧ P_loss≤P_th (loads include K_A)' },
          { check: 'Self-lock', rule: 'γ≤ρ advisory only; not in pass' },
        ],
      })),
      limitsBlock(L ? 'Limitations' : '适用边界', pickLocale(locale, {
        zh: [
          '仅蜗杆主动减速；未含 ISO 14521 / GB/T 10085 全套系数与齿形修正。',
          '接触用钢—青铜表值 Z_E；其它配对需自行改 Z_E/[σ_H]。',
          '散热容量为封闭箱体粗估，精密传动须另做热平衡试验。',
        ],
        en: [
          'Worm driving only; not full ISO 14521 / GB/T 10085 factor sets.',
          'Contact uses steel–bronze Z_E; other pairs need custom Z_E/[σ_H].',
          'Heat capacity is enclosed-box estimate—verify thermally for precision drives.',
        ],
      })),
    ],
  }
}
