/**
 * 公差栈 / 统计 / 质量 — 扩展帮助（blocks 供 ExtendedHelpReference）
 */
import {
  pickLocale,
  faqBlock,
  limitsBlock,
  examplesBlock,
  passBlock,
  formulasBlock,
  guideBlock,
  howToPassBlock,
  standardsBlock,
} from './builders.js'

// ── Editor (size chain) ─────────────────────────────────────────────────────

const EDITOR_FORMULAS = {
  zh: [
    { name: '极值法', latex: 'T_{worst} = \\sum |f_i T_i|', note: '上下限分别代数叠加（支持 ES/EI 非对称）' },
    { name: 'RSS 法', latex: 'T_{RSS} = \\sqrt{\\sum (f_i T_i)^2}', note: '名义值含 (ES+EI)/2 均值偏移' },
    { name: '修正 RSS', latex: 'T_{mod} = T_{RSS} \\cdot k_{dist} \\cdot k_{skew}', note: 'k_dist：uniform 1.15 … skewed 1.12；**经验系数**' },
    { name: '6σ RSS', latex: 'T_{6\\sigma} = 6\\sqrt{\\sum (T_i/K_i)^2}', note: 'K：normal=6, uniform=3.46, triangular=4.24, skewed=5' },
    { name: '封闭环判定', latex: 'pass \\Leftrightarrow L_{lower} \\ge L_{min} \\land L_{upper} \\le L_{max}', note: '对所有方法统一' },
  ],
  en: [
    { name: 'Worst case', latex: 'T_{worst} = \\sum |f_i T_i|', note: 'Upper/lower stacked separately (asymmetric ES/EI)' },
    { name: 'RSS', latex: 'T_{RSS} = \\sqrt{\\sum (f_i T_i)^2}', note: 'Nominal includes (ES+EI)/2 mean shift' },
    { name: 'Modified RSS', latex: 'T_{mod} = T_{RSS} \\cdot k_{dist} \\cdot k_{skew}', note: 'k_dist: uniform 1.15 … skewed 1.12; **empirical**' },
    { name: '6σ RSS', latex: 'T_{6\\sigma} = 6\\sqrt{\\sum (T_i/K_i)^2}', note: 'K: normal=6, uniform=3.46, triangular=4.24, skewed=5' },
    { name: 'Closed ring pass', latex: 'pass \\Leftrightarrow L_{lower} \\ge L_{min} \\land L_{upper} \\le L_{max}', note: 'Same for all methods' },
  ],
}

const EDITOR_PASS = {
  zh: [
    { check: '单方法 pass', rule: '选中方法的 [lower, upper] 完全落在封闭环 [min, max] 内' },
    { check: '极值 vs RSS', rule: 'RSS 通过但极值未通过 → stackAdvice **critical**（rss_pass_worst_fail）' },
    { check: '修正 RSS', rule: '界面标注 empirical；MODIFIED_RSS_DISCLAIMER 提示非 GB/ISO 标准算法' },
    { check: '评审状态', rule: 'estimateOnly / releaseBlocked / 未确认关键输入 → getCalcReviewStatus=**review**' },
    { check: '方法差异', rule: 'worst/rss 比值 ≥2 → warn；≥1.5 → caution' },
  ],
  en: [
    { check: 'Single-method pass', rule: 'Active method [lower, upper] within closed ring [min, max]' },
    { check: 'Worst vs RSS', rule: 'RSS pass but worst fail → stackAdvice **critical** (rss_pass_worst_fail)' },
    { check: 'Modified RSS', rule: 'UI marks empirical; MODIFIED_RSS_DISCLAIMER—not GB/ISO standard' },
    { check: 'Review status', rule: 'estimateOnly / releaseBlocked / unconfirmed critical → getCalcReviewStatus=**review**' },
    { check: 'Method divergence', rule: 'worst/rss ratio ≥2 → warn; ≥1.5 → caution' },
  ],
}

// ── Batch ─────────────────────────────────────────────────────────────────────

const BATCH_FORMULAS = {
  zh: [
    { name: '批量 RSS', latex: 'T_{RSS} = \\sqrt{\\sum T_i^2}', note: '各行独立；可选 factor 加权' },
    { name: '批量极值', latex: 'T_{worst} = \\sum T_i', note: '对称公差带宽度叠加' },
    { name: '目标带', latex: '[L_{lower}^{RSS}, L_{upper}^{RSS}] \\subseteq [targetMin, targetMax]', note: 'rssPass / worstPass 分别判定' },
  ],
  en: [
    { name: 'Batch RSS', latex: 'T_{RSS} = \\sqrt{\\sum T_i^2}', note: 'Per row; optional factor weighting' },
    { name: 'Batch worst', latex: 'T_{worst} = \\sum T_i', note: 'Symmetric band width sum' },
    { name: 'Target band', latex: '[L_{lower}^{RSS}, L_{upper}^{RSS}] \\subseteq [targetMin, targetMax]', note: 'rssPass / worstPass separately' },
  ],
}

const BATCH_PASS = {
  zh: [
    { check: 'rssPass', rule: 'RSS 上下限均在 [targetMin, targetMax]' },
    { check: 'worstPass', rule: '极值上下限均在目标带内' },
    { check: 'adviceLevel', rule: 'combineStackAdvice：critical / warn / caution / none' },
    { check: '无 pass 字段', rule: '批量行输出 rssPass、worstPass 与 adviceKey，无单一综合 pass' },
  ],
  en: [
    { check: 'rssPass', rule: 'RSS limits within [targetMin, targetMax]' },
    { check: 'worstPass', rule: 'Worst-case limits within target band' },
    { check: 'adviceLevel', rule: 'combineStackAdvice: critical / warn / caution / none' },
    { check: 'No single pass', rule: 'Rows expose rssPass, worstPass, adviceKey—no one combined pass flag' },
  ],
}

// ── Allocation ────────────────────────────────────────────────────────────────

const ALLOCATION_FORMULAS = {
  zh: [
    { name: '等贡献 RSS', latex: 'T_i = \\frac{T}{f_i \\sqrt{n}}', note: '各环 T_i f_i 贡献相等' },
    { name: '等公差 RSS', latex: 'T_i = T/\\sqrt{n}', note: '再 RSS 验证' },
    { name: '最小成本', latex: 'T_i = T \\cdot \\frac{\\sqrt{c_i}}{f_i \\sqrt{\\sum c_j}}', note: '成本系数越大分配越小' },
    { name: '验证', latex: 'T_{stack} = \\sqrt{\\sum (f_i T_i)^2} \\le T_{target}', note: 'verify.pass' },
  ],
  en: [
    { name: 'Equal contribution', latex: 'T_i = \\frac{T}{f_i \\sqrt{n}}', note: 'Equal T_i f_i RSS terms' },
    { name: 'Equal tolerance', latex: 'T_i = T/\\sqrt{n}', note: 'Then RSS verify' },
    { name: 'Min cost', latex: 'T_i = T \\cdot \\frac{\\sqrt{c_i}}{f_i \\sqrt{\\sum c_j}}', note: 'Higher cost → smaller allocation' },
    { name: 'Verify', latex: 'T_{stack} = \\sqrt{\\sum (f_i T_i)^2} \\le T_{target}', note: 'verify.pass' },
  ],
}

const ALLOCATION_PASS = {
  zh: [
    { check: 'verify.pass', rule: 'RSS 叠加 stacked ≤ targetTolerance（+1e-9 容差）' },
    { check: 'utilization', rule: 'stacked/target × 100%' },
    { check: '遗传/帕累托', rule: 'GA feasible 或 Pareto 行 stacked ≤ target' },
    { check: '比例分配', rule: '按名义尺寸比例（极值法参考），verify 仍用 RSS' },
  ],
  en: [
    { check: 'verify.pass', rule: 'RSS stacked ≤ targetTolerance (+1e-9 tol.)' },
    { check: 'utilization', rule: 'stacked/target × 100%' },
    { check: 'GA / Pareto', rule: 'GA feasible or Pareto row stacked ≤ target' },
    { check: 'Proportional', rule: 'By nominal size (worst-case ref.); verify still RSS' },
  ],
}

// ── Statistics ────────────────────────────────────────────────────────────────

const STATISTICS_FORMULAS = {
  zh: [
    { name: '过程能力 Cp', latex: 'C_p = \\frac{USL-LSL}{6\\sigma}', note: 'T/(6σ)；居中时 C=Cp' },
    { name: 'Cpk', latex: 'C_{pk} = \\min\\left(\\frac{USL-\\mu}{3\\sigma}, \\frac{\\mu-LSL}{3\\sigma}\\right)', note: 'UI 阈值 **> 1.33**' },
    { name: '合格率', latex: 'P_{pass} = \\Phi(USL) - \\Phi(LSL)', note: '正态假设；UI **≥ 99.73%**' },
    { name: 'σ 水平', latex: '\\sigma_{level} = 3 \\cdot C_{pk}', note: '短程定义；非 Motorola 1.5σ 漂移' },
    { name: '加权 RSS', latex: 'T_w = \\sqrt{\\sum (f_i T_i)^2}', note: '统计页 RSS 计算器' },
  ],
  en: [
    { name: 'Cp', latex: 'C_p = \\frac{USL-LSL}{6\\sigma}', note: 'T/(6σ); centered: C=Cp' },
    { name: 'Cpk', latex: 'C_{pk} = \\min\\left(\\frac{USL-\\mu}{3\\sigma}, \\frac{\\mu-LSL}{3\\sigma}\\right)', note: 'UI threshold **> 1.33**' },
    { name: 'Pass rate', latex: 'P_{pass} = \\Phi(USL) - \\Phi(LSL)', note: 'Normal assumption; UI **≥ 99.73%**' },
    { name: 'Sigma level', latex: '\\sigma_{level} = 3 \\cdot C_{pk}', note: 'Short-term; NOT Motorola 1.5σ shift' },
    { name: 'Weighted RSS', latex: 'T_w = \\sqrt{\\sum (f_i T_i)^2}', note: 'Statistics RSS calculator' },
  ],
}

const STATISTICS_PASS = {
  zh: [
    { check: 'Cpk 指示', rule: 'capabilityCpkOk：Cpk **> 1.33**（绿色/警告色）' },
    { check: '合格率指示', rule: 'capabilityPassRateOk：passRate **≥ 0.9973** (3σ 双侧)' },
    { check: '修正 RSS', rule: 'getModifiedRssBreakdown.empirical=true 时界面警示' },
    { check: '无全局 pass 位', rule: '统计页为分析工具，不输出单一 release pass' },
  ],
  en: [
    { check: 'Cpk indicator', rule: 'capabilityCpkOk: Cpk **> 1.33** (success/warning color)' },
    { check: 'Pass rate indicator', rule: 'capabilityPassRateOk: passRate **≥ 0.9973** (two-sided 3σ)' },
    { check: 'Modified RSS', rule: 'Warning when getModifiedRssBreakdown.empirical=true' },
    { check: 'No global pass', rule: 'Statistics is analysis—no single release pass flag' },
  ],
}

// ── Monte Carlo ───────────────────────────────────────────────────────────────

const MONTE_CARLO_FORMULAS = {
  zh: [
    { name: '采样', latex: '\\delta_i \\sim \\mathcal{D}(ES_i, EI_i, K)', note: '正态默认 K=6；截断在 [ei,es]' },
    { name: '封闭环值', latex: 'L = L_0 + \\sum s_i (\\delta_i - \\mu_i)', note: 's_i=±1 增/减环' },
    { name: '合格率', latex: 'passRate = \\frac{\\#{L \\in [L_{min}, L_{max}]}}{N}', note: 'N=iterations' },
    { name: '分布 K', latex: 'normal:6, uniform:3.46, triangular:4.24, skewed:5', note: 'customK 可覆盖' },
  ],
  en: [
    { name: 'Sampling', latex: '\\delta_i \\sim \\mathcal{D}(ES_i, EI_i, K)', note: 'Normal default K=6; truncated to [ei,es]' },
    { name: 'Closed value', latex: 'L = L_0 + \\sum s_i (\\delta_i - \\mu_i)', note: 's_i=±1 inc/dec ring' },
    { name: 'Pass rate', latex: 'passRate = \\frac{\\#{L \\in [L_{min}, L_{max}]}}{N}', note: 'N=iterations' },
    { name: 'Distribution K', latex: 'normal:6, uniform:3.46, triangular:4.24, skewed:5', note: 'customK override' },
  ],
}

const MONTE_CARLO_PASS = {
  zh: [
    { check: 'passRate', rule: '模拟样本落在封闭环内的比例；无硬编码 99% pass 位' },
    { check: 'vs 极值', rule: 'assessMcWorstGap：worst 未过且 passRate≥**0.99** → critical 警告' },
    { check: '龙卷风', rule: '逐环孤立波动 std；用于敏感度排序' },
    { check: '校验失败', rule: '环 type/公差非法 → errorKey，passRate=0' },
  ],
  en: [
    { check: 'passRate', rule: 'Fraction of samples in closed ring; no hardcoded 99% pass bit' },
    { check: 'vs worst', rule: 'assessMcWorstGap: worst fail & passRate≥**0.99** → critical warning' },
    { check: 'Tornado', rule: 'Per-ring isolated std for sensitivity ranking' },
    { check: 'Validation fail', rule: 'Invalid ring type/tol → errorKey, passRate=0' },
  ],
}

// ── Quality (MSA / SPC / FMEA / AQL) ────────────────────────────────────────

const QUALITY_MSA = {
  zh: [
    { check: 'GRR%', rule: 'pctGRR = 100·GRR/TV' },
    { check: 'ratingKey', rule: '**<10%** acceptable；**10–30%** conditional；**≥30%** unacceptable' },
    { check: 'ndc', rule: '1.41·PV/GRR；≥5 可分辨（界面提示）' },
    { check: '极差法', rule: 'EV=r̄·K₁，AV 由 x̄_diff 与 EV 合成' },
  ],
  en: [
    { check: 'GRR%', rule: 'pctGRR = 100·GRR/TV' },
    { check: 'ratingKey', rule: '**<10%** acceptable; **10–30%** conditional; **≥30%** unacceptable' },
    { check: 'ndc', rule: '1.41·PV/GRR; ≥5 for discrimination (UI hint)' },
    { check: 'Range method', rule: 'EV=r̄·K₁, AV from x̄_diff and EV' },
  ],
}

const QUALITY_SPC = {
  zh: [
    { check: 'X-R 图', rule: '子组 n=2–10；X̄ 限 X̿±A₂R̄；R 限 D₃/D₄ R̄' },
    { check: '失控', rule: 'xOutOfControl / rOutOfControl 点超出 UCL/LCL' },
    { check: 'P 图', rule: 'p̄±3√(p̄(1-p̄)/n)；不合格率监控' },
    { check: '无 pass 位', rule: '输出失控点数，不自动判批次合格' },
  ],
  en: [
    { check: 'X-R chart', rule: 'Subgroup n=2–10; X̄ limits X̿±A₂R̄; R limits D₃/D₄ R̄' },
    { check: 'Out of control', rule: 'xOutOfControl / rOutOfControl beyond UCL/LCL' },
    { check: 'P chart', rule: 'p̄±3√(p̄(1-p̄)/n); defect rate monitoring' },
    { check: 'No pass flag', rule: 'Reports OOC count—no automatic lot accept' },
  ],
}

const QUALITY_FMEA = {
  zh: [
    { check: 'RPN', rule: 'S×O×D；**≥100** 高亮 highRisk' },
    { check: 'Action Priority', rule: 'AIAG-VDA 2019 查表 H/M/L' },
    { check: '排序', rule: 'AP 优先，其次 S、RPN' },
    { check: '无 pass', rule: '输出 highApCount / topRisk，不判设计放行' },
  ],
  en: [
    { check: 'RPN', rule: 'S×O×D; **≥100** highlighted highRisk' },
    { check: 'Action Priority', rule: 'AIAG-VDA 2019 lookup H/M/L' },
    { check: 'Sort', rule: 'AP first, then S, RPN' },
    { check: 'No pass', rule: 'Reports highApCount / topRisk—no design release' },
  ],
}

const QUALITY_AQL = {
  zh: [
    { check: '抽样方案', rule: 'GB/T 2828.1 / ISO 2859-1 简化；检验水平 **II 正常**' },
    { check: 'pass', rule: 'defectCount **≤ Ac** → accept / pass=true' },
    { check: '拒收', rule: 'defectCount **≥ Re** → reject' },
    { check: 'AQL 水平', rule: '1.0 / 1.5 / 2.5 / 4.0 查 Ac/Re' },
  ],
  en: [
    { check: 'Sampling plan', rule: 'GB/T 2828.1 / ISO 2859-1 simplified; **Level II normal**' },
    { check: 'pass', rule: 'defectCount **≤ Ac** → accept / pass=true' },
    { check: 'Reject', rule: 'defectCount **≥ Re** → reject' },
    { check: 'AQL levels', rule: '1.0 / 1.5 / 2.5 / 4.0 for Ac/Re lookup' },
  ],
}

function buildToleranceHelp(locale, config) {
  const L = locale === 'en'
  const blocks = [
    formulasBlock(config.titleFormulas, pickLocale(locale, config.formulas), config.formulaSubtitle),
    passBlock(config.titlePass, pickLocale(locale, config.passRows), config.passSubtitle),
    guideBlock(config.titleGuide, pickLocale(locale, config.guide)),
    examplesBlock(config.titleExamples, pickLocale(locale, config.examples), config.exampleSubtitle),
    howToPassBlock(config.titleHowToPass, pickLocale(locale, config.howToPass)),
    faqBlock(config.titleFaq, pickLocale(locale, config.faq)),
    standardsBlock(config.titleStandards, pickLocale(locale, config.standards), pickLocale(locale, config.standardsIntro)),
    limitsBlock(config.titleLimits, pickLocale(locale, config.limits)),
  ]
  if (config.extraBlocks) blocks.push(...config.extraBlocks(locale))
  return { blocks }
}

/** @param {'zh'|'en'} locale — 尺寸链编辑器 */
export function getEditorHelp(locale = 'zh') {
  const L = locale === 'en'
  return buildToleranceHelp(locale, {
    titleFormulas: L ? 'Stack methods & formulas' : '叠加方法与公式',
    formulas: EDITOR_FORMULAS,
    formulaSubtitle: L ? 'From size-chain-math.js — ASME Y14.5 budget context' : '来自 size-chain-math.js — 配合 ASME Y14.5 公差预算',
    titlePass: L ? 'Pass & review rules' : '判定与评审',
    passRows: EDITOR_PASS,
    titleGuide: L ? 'Editor workflow' : '编辑器工作流',
    guide: {
      zh: {
        intro: '封闭环 [min, max] 为**装配功能预算带**；组成环须标 type（增/减）与 ES/EI 或对称 T。',
        sections: [
          { title: '方法选择', bullets: ['功能件：RSS + 极值对照', '修正 RSS：偏态/均匀分布经验放大', '6σ RSS：与 Monte Carlo K 一致的过程假设'] },
          { title: 'GD&T 栈', body: '形位公差栈见 GD&T 模块；本编辑器为 1D 尺寸链。', bullets: ['可跳转 Monte Carlo 带 payload'] },
        ],
      },
      en: {
        intro: 'Closed ring [min, max] is the **functional assembly budget**; rings need type (inc/dec) and ES/EI or symmetric T.',
        sections: [
          { title: 'Method choice', bullets: ['Functional parts: RSS + worst-case compare', 'Modified RSS: empirical spread for non-normal', '6σ RSS: aligns with Monte Carlo K assumptions'] },
          { title: 'GD&T stack', body: 'Geometric stacks use GD&T module; this editor is 1D size chain.', bullets: ['Can push payload to Monte Carlo'] },
        ],
      },
    },
    titleExamples: L ? 'Worked example' : '算例',
    examples: {
      zh: [
        { step: '封闭环', detail: 'L0∈[0.1, 0.35] mm；三环 0.06/0.05/0.04 dec/dec/inc' },
        { step: 'RSS', detail: '$T_{RSS}=\\sqrt{0.06^2+0.05^2+0.04^2}=0.086$ mm' },
        { step: '极值', detail: '$T_{worst}=0.15$ mm；区间更宽' },
        { step: '判定', detail: '若 RSS 区间⊂[0.1,0.35] 则 rss pass ✓' },
      ],
      en: [
        { step: 'Closed', detail: 'L0∈[0.1, 0.35] mm; three rings 0.06/0.05/0.04 dec/dec/inc' },
        { step: 'RSS', detail: '$T_{RSS}=\\sqrt{0.06^2+0.05^2+0.04^2}=0.086$ mm' },
        { step: 'Worst', detail: '$T_{worst}=0.15$ mm; wider band' },
        { step: 'Verdict', detail: 'If RSS band ⊂ [0.1,0.35] then rss pass ✓' },
      ],
    },
    titleHowToPass: L ? 'How to pass' : '如何让判定通过',
    howToPass: {
      zh: [
        { goal: 'RSS pass', steps: ['收紧贡献度最高的环（贡献度表）', '改为减环或缩小 ES/EI', '必要时仅 RSS 不足时仍须看极值'] },
        { goal: '极值也 pass', steps: ['逐环减小 T', '调整 nominal 使均值居中', '考虑 6σ RSS 或 Monte Carlo 验证'] },
      ],
      en: [
        { goal: 'RSS pass', steps: ['Tighten highest-contribution rings', 'Change ring type or shrink ES/EI', 'If RSS ok, still check worst for safety-critical'] },
        { goal: 'Worst pass too', steps: ['Reduce each T', 'Center nominal mean', 'Verify with 6σ RSS or Monte Carlo'] },
      ],
    },
    titleFaq: L ? 'FAQ' : '常见问题',
    faq: {
      zh: [
        { q: '修正 RSS 能用于正式报告吗？', a: '工具标注 empirical；正式工程优先 6σ RSS 或 Monte Carlo。' },
        { q: 'RSS 过极值不过？', a: '安全关键须当 fail 处理；见 stackAdvice critical。' },
        { q: '与 ASME Y14.5 关系？', a: '本工具为 1D 线性栈；形位/DRF/MMC 见 GD&T 栈页。' },
      ],
      en: [
        { q: 'Modified RSS for formal reports?', a: 'Marked empirical; prefer 6σ RSS or Monte Carlo for release.' },
        { q: 'RSS pass, worst fail?', a: 'Treat as fail for safety-critical; see stackAdvice critical.' },
        { q: 'vs ASME Y14.5?', a: 'This is 1D linear stack; geometry/DRF/MMC on GD&T stack page.' },
      ],
    },
    titleStandards: L ? 'Standards' : '标准',
    standardsIntro: { zh: '尺寸公差体系与形位公差配合使用。', en: 'Size tolerances used with geometric tolerancing.' },
    standards: {
      zh: [
        '**ASME Y14.5** — 尺寸/形位公差与栈分析语境',
        '**ISO 8015** / **GB/T 4249** — 公差原则与独立原则',
        'RSS/极值 — 经典机械公差设计（Bender 等）',
        '修正 RSS — MechBox 经验系数，**非** GB/ISO 条文',
      ],
      en: [
        '**ASME Y14.5** — size/geometric tolerance stack context',
        '**ISO 8015** / **GB/T 4249** — tolerance principles',
        'RSS/worst-case — classic mechanical tolerance design',
        'Modified RSS — MechBox empirical, **not** GB/ISO normative',
      ],
    },
    titleLimits: L ? 'Limitations' : '适用边界',
    limits: {
      zh: [
        '未含形位基准漂移、MMC bonus 自动逐件计算（见 GD&T 页）。',
        '非对称公差 RSS 用 ES−EI 宽度，未建模相关偏差。',
        'modified-rss / skewness 为教学/前期预算，非合规鉴定。',
      ],
      en: [
        'No full DRF shift or per-part MMC bonus (see GD&T page).',
        'Asymmetric RSS uses ES−EI width; correlated deviations not modeled.',
        'modified-rss / skewness for early budget—not compliance proof.',
      ],
    },
  })
}

/** @param {'zh'|'en'} locale — 批量验证 */
export function getBatchHelp(locale = 'zh') {
  const L = locale === 'en'
  return buildToleranceHelp(locale, {
    titleFormulas: L ? 'Batch stack formulas' : '批量叠加公式',
    formulas: BATCH_FORMULAS,
    titlePass: L ? 'Pass criteria per row' : '各行判定',
    passRows: BATCH_PASS,
    titleGuide: L ? 'Batch verification guide' : '批量验证指南',
    guide: {
      zh: {
        intro: 'CSV 每行：名称, T1, T2, …；对同一 [targetMin, targetMax] 批量 RSS/极值判定。',
        sections: [{ title: '建议', bullets: ['方案比选：同时看 rssPass 与 worstPass', 'methodRatio≥2 时偏保守选极值', 'adviceKey 驱动界面警示文案'] }],
      },
      en: {
        intro: 'CSV rows: name, T1, T2, …; RSS/worst against one [targetMin, targetMax].',
        sections: [{ title: 'Tips', bullets: ['Compare rssPass and worstPass', 'methodRatio≥2 → favor worst-case', 'adviceKey drives UI warnings'] }],
      },
    },
    titleExamples: L ? 'Example row' : '算例行',
    examples: {
      zh: [{ step: '一行', detail: '三环 0.04,0.03,0.03；目标 [0,0.08] → RSS 0.058 pass，极值 0.10 fail → advice critical' }],
      en: [{ step: 'One row', detail: 'Three rings 0.04,0.03,0.03; target [0,0.08] → RSS 0.058 pass, worst 0.10 fail → advice critical' }],
    },
    titleHowToPass: L ? 'How to pass both' : '如何让双法均过',
    howToPass: {
      zh: [{ goal: 'rssPass ∧ worstPass', steps: ['减小最大环公差', '减少环数或降 factor', '加宽目标带（若规范允许）'] }],
      en: [{ goal: 'rssPass ∧ worstPass', steps: ['Shrink largest ring tolerance', 'Fewer rings or lower factors', 'Widen target band if spec allows'] }],
    },
    titleFaq: L ? 'FAQ' : '常见问题',
    faq: {
      zh: [{ q: '为何无总 pass？', a: '批量用于方案对比；同时展示 rssPass、worstPass 与 adviceLevel。' }],
      en: [{ q: 'Why no overall pass?', a: 'Batch compares alternatives; shows rssPass, worstPass, adviceLevel.' }],
    },
    titleStandards: L ? 'Standards' : '标准',
    standardsIntro: { zh: '批量 RSS/极值与编辑器方法一致。', en: 'Batch RSS/worst aligns with editor methods.' },
    standards: { zh: ['同尺寸链编辑器 RSS/极值定义', 'ASME Y14.5 预算思想'], en: ['Same RSS/worst as editor', 'ASME Y14.5 budgeting mindset'] },
    titleLimits: L ? 'Limitations' : '适用边界',
    limits: { zh: ['仅对称公差列表；无 ES/EI 非对称批量。', '无 Modified RSS / 6σ 批量列。'], en: ['Symmetric T list only; no ES/EI batch.', 'No modified RSS / 6σ batch columns.'] },
  })
}

/** @param {'zh'|'en'} locale — 公差分配 */
export function getAllocationHelp(locale = 'zh') {
  const L = locale === 'en'
  return buildToleranceHelp(locale, {
    titleFormulas: L ? 'Allocation methods' : '分配方法',
    formulas: ALLOCATION_FORMULAS,
    titlePass: L ? 'Verification pass' : '验证判定',
    passRows: ALLOCATION_PASS,
    titleGuide: L ? 'Allocation guide' : '分配指南',
    guide: {
      zh: {
        intro: '给定总公差 T_target，向各组成环分配 T_i，**verify** 用 RSS 回代 stacked ≤ T。',
        sections: [
          { title: '方法', bullets: ['等贡献 / 等公差 / 比例 / 最小成本 / 灵敏度 / 迭代灵敏度', '遗传算法、帕累托多目标可选'] },
          { title: 'factor', body: '传递系数 f_i 进入 verify RSS。', bullets: ['normalizeFactors 防零/负'] },
        ],
      },
      en: {
        intro: 'Given total T_target, allocate T_i to rings; **verify** RSS stacked ≤ T.',
        sections: [
          { title: 'Methods', bullets: ['Equal effect / equal tol / proportional / min cost / sensitivity / iterative', 'Optional GA & Pareto multi-objective'] },
          { title: 'factor', body: 'Sensitivity f_i enters verify RSS.', bullets: ['normalizeFactors guards zero/negative'] },
        ],
      },
    },
    titleExamples: L ? 'Example' : '算例',
    examples: {
      zh: [
        { step: '目标', detail: 'T_target=0.1 mm，4 环 factor=1' },
        { step: '等贡献', detail: '各 T_i=0.05 mm' },
        { step: '验证', detail: 'stacked=0.1 mm，utilization=100%，pass ✓' },
      ],
      en: [
        { step: 'Target', detail: 'T_target=0.1 mm, 4 rings factor=1' },
        { step: 'Equal effect', detail: 'Each T_i=0.05 mm' },
        { step: 'Verify', detail: 'stacked=0.1 mm, utilization=100%, pass ✓' },
      ],
    },
    titleHowToPass: L ? 'How to pass verify' : '如何让 verify 通过',
    howToPass: {
      zh: [{ goal: 'verify.pass', steps: ['增大 T_target', '减少环数或降低 f_i', '最小成本：提高贵环 cost 以获更小 T_i'] }],
      en: [{ goal: 'verify.pass', steps: ['Increase T_target', 'Fewer rings or lower f_i', 'Min cost: raise cost on expensive rings'] }],
    },
    titleFaq: L ? 'FAQ' : '常见问题',
    faq: {
      zh: [
        { q: '比例分配为何 verify 用 RSS？', a: '比例按极值思想分初值，验证仍 RSS 保守回代。' },
        { q: '帕累托行 pass？', a: 'applyPareto 时 pass = stacked ≤ target。' },
      ],
      en: [
        { q: 'Proportional uses RSS verify?', a: 'Proportional splits by worst-case idea; verify still RSS.' },
        { q: 'Pareto row pass?', a: 'applyPareto: pass = stacked ≤ target.' },
      ],
    },
    titleStandards: L ? 'Standards' : '标准',
    standardsIntro: { zh: '公差分配为设计实践，非单一国标公式。', en: 'Tolerance allocation is design practice—not one national formula.' },
    standards: { zh: ['RSS 分配 — 常见机械设计教材', 'ASME Y14.5 公差预算'], en: ['RSS allocation — design texts', 'ASME Y14.5 tolerance budget'] },
    titleLimits: L ? 'Limitations' : '适用边界',
    limits: { zh: ['GA/帕累托为启发式，不保证全局最优。', '未含制造成本曲线与 Cpk 反馈闭环。'], en: ['GA/Pareto are heuristic—not global optimum.', 'No manufacturing cost curves or Cpk feedback loop.'] },
  })
}

/** @param {'zh'|'en'} locale — 统计页 */
export function getStatisticsHelp(locale = 'zh') {
  const L = locale === 'en'
  return buildToleranceHelp(locale, {
    titleFormulas: L ? 'Capability & RSS formulas' : '过程能力与 RSS 公式',
    formulas: STATISTICS_FORMULAS,
    titlePass: L ? 'UI thresholds (indicators)' : 'UI 阈值（指示）',
    passRows: STATISTICS_PASS,
    titleGuide: L ? 'Statistics tools guide' : '统计工具指南',
    guide: {
      zh: {
        intro: '子工具：公差换算、RSS（基本/加权/修正）、σ 分析、分布曲线、回归/DOE 等。',
        sections: [
          { title: 'Cpk 门槛', bullets: ['**> 1.33** 常见量产要求（界面 capabilityCpkOk）', '≥ 1.67 更严；< 1.0 不足'] },
          { title: '合格率', bullets: ['**99.73%** 对应 ±3σ 双侧（capabilityPassRateOk）', 'passRate 由正态 CDF 积分'] },
          { title: '修正 RSS', bullets: ['可联动样本偏度 skewness', 'empirical 时显示警示'] },
        ],
      },
      en: {
        intro: 'Sub-tools: tolerance conversion, RSS (basic/weighted/modified), sigma analysis, PDF chart, regression/DOE, etc.',
        sections: [
          { title: 'Cpk gate', bullets: ['**> 1.33** common production target (capabilityCpkOk)', '≥ 1.67 stricter; < 1.0 inadequate'] },
          { title: 'Pass rate', bullets: ['**99.73%** two-sided ±3σ (capabilityPassRateOk)', 'passRate from normal CDF'] },
          { title: 'Modified RSS', bullets: ['Can use sample skewness', 'Warning when empirical'] },
        ],
      },
    },
    titleExamples: L ? 'Cpk example' : 'Cpk 算例',
    examples: {
      zh: [
        { step: '规格', detail: 'LSL=9.9, USL=10.1, μ=10.0, σ=0.02' },
        { step: 'Cpk', detail: 'Cpk=min(0.1/0.06,0.1/0.06)=1.67 >1.33 ✓' },
        { step: '合格率', detail: 'P_pass≈99.99% >99.73% ✓' },
      ],
      en: [
        { step: 'Spec', detail: 'LSL=9.9, USL=10.1, μ=10.0, σ=0.02' },
        { step: 'Cpk', detail: 'Cpk=min(0.1/0.06,0.1/0.06)=1.67 >1.33 ✓' },
        { step: 'Pass rate', detail: 'P_pass≈99.99% >99.73% ✓' },
      ],
    },
    titleHowToPass: L ? 'Improve capability' : '如何提升能力',
    howToPass: {
      zh: [
        { goal: 'Cpk > 1.33', steps: ['减小 σ（工艺稳定）', '均值 μ 对准规格中心', '加宽规格（若设计允许）'] },
        { goal: 'RSS 预算', steps: ['用加权 RSS 分配环公差', '修正 RSS 仅作非正态提示'] },
      ],
      en: [
        { goal: 'Cpk > 1.33', steps: ['Reduce σ (process stability)', 'Center μ on spec', 'Widen spec if design allows'] },
        { goal: 'RSS budget', steps: ['Use weighted RSS on rings', 'Modified RSS only hints non-normal'] },
      ],
    },
    titleFaq: L ? 'FAQ' : '常见问题',
    faq: {
      zh: [
        { q: 'C 与 Cpk 区别？', a: 'C=T/(6σ) 居中能力；Cpk 含均值偏移，UI 以 Cpk 为主。' },
        { q: 'σ 水平是 6σ 吗？', a: '本工具 σ_level=3·Cpk（短程），非 Motorola 长期 6σ+1.5 漂移。' },
      ],
      en: [
        { q: 'C vs Cpk?', a: 'C=T/(6σ) centered; Cpk includes mean shift—UI focuses on Cpk.' },
        { q: 'Sigma level = 6σ?', a: 'Here σ_level=3·Cpk (short-term), not Motorola long-term 6σ+1.5 shift.' },
      ],
    },
    titleStandards: L ? 'Standards' : '标准',
    standardsIntro: { zh: '过程能力指数行业通用定义。', en: 'Industry-standard process capability definitions.' },
    standards: {
      zh: ['**ISO 22514** / **GB/T 4091** — 过程能力指数', '**AIAG SPC Manual** — Cpk 目标惯例', 'RSS_CORRECTION — MechBox 经验（非国标）'],
      en: ['**ISO 22514** / **GB/T 4091** — capability indices', '**AIAG SPC Manual** — Cpk targets', 'RSS_CORRECTION — MechBox empirical (not national std)'],
    },
    titleLimits: L ? 'Limitations' : '适用边界',
    limits: {
      zh: ['能力指数假设正态、稳定过程。', '修正 RSS 系数非 GB/ISO 标准值。', 't 检验/ANOVA 等于通用统计，非专标判定。'],
      en: ['Capability assumes normal stable process.', 'Modified RSS factors not GB/ISO normative.', 't-test/ANOVA are generic stats—not specialized pass/fail codes.'],
    },
  })
}

/** @param {'zh'|'en'} locale — Monte Carlo */
export function getMonteCarloHelp(locale = 'zh') {
  const L = locale === 'en'
  return buildToleranceHelp(locale, {
    titleFormulas: L ? 'Simulation formulas' : '模拟公式',
    formulas: MONTE_CARLO_FORMULAS,
    titlePass: L ? 'Pass rate & warnings' : '合格率与警示',
    passRows: MONTE_CARLO_PASS,
    titleGuide: L ? 'Monte Carlo guide' : 'Monte Carlo 指南',
    guide: {
      zh: {
        intro: '对每环按分布采样误差，叠加得封闭环样本；passRate 为落在 [min,max] 的比例。',
        sections: [
          { title: '分布', bullets: ['正态默认截断于 [ei,es]', 'uniform/triangular/skewed 用 DISTRIBUTION_K', 'customK 覆盖默认 K'] },
          { title: '与解析法', bullets: ['passRate 高但极值 fail → mc_pass_worst_fail', '可从编辑器 sessionStorage 导入环'] },
        ],
      },
      en: {
        intro: 'Sample per-ring errors, sum to closed-ring samples; passRate = fraction in [min,max].',
        sections: [
          { title: 'Distributions', bullets: ['Normal truncated to [ei,es] by default', 'uniform/triangular/skewed use DISTRIBUTION_K', 'customK overrides K'] },
          { title: 'vs analytic', bullets: ['High passRate but worst fail → mc_pass_worst_fail', 'Import rings from editor via sessionStorage'] },
        ],
      },
    },
    titleExamples: L ? 'Example' : '算例',
    examples: {
      zh: [
        { step: '设定', detail: 'N=10000，正态，三环；封闭 [0.1,0.35]' },
        { step: '结果', detail: 'passRate≈97% → 约 3% 样本超规' },
        { step: '警示', detail: '若极值未过且 passRate≥99% → 界面 critical 提示' },
      ],
      en: [
        { step: 'Setup', detail: 'N=10000, normal, three rings; closed [0.1,0.35]' },
        { step: 'Result', detail: 'passRate≈97% → ~3% out of spec' },
        { step: 'Warning', detail: 'If worst fails & passRate≥99% → UI critical hint' },
      ],
    },
    titleHowToPass: L ? 'Raise passRate' : '如何提高合格率',
    howToPass: {
      zh: [{ goal: 'passRate → 100%', steps: ['收紧环公差或 ES/EI', '加宽封闭环（若功能允许）', '降低 mean 偏移；用龙卷风找敏感环'] }],
      en: [{ goal: 'passRate → 100%', steps: ['Tighten ring tolerances or ES/EI', 'Widen closed ring if function allows', 'Reduce mean shift; tornado for sensitive rings'] }],
    },
    titleFaq: L ? 'FAQ' : '常见问题',
    faq: {
      zh: [
        { q: 'passRate 多少算过？', a: '工具不设硬阈值；设计常取 ≥99% 或 99.73%，须结合极值法。' },
        { q: '与 6σ RSS 关系？', a: '同 K 假设时 MC passRate 应接近 6σ 解析结果（有限 N 有波动）。' },
      ],
      en: [
        { q: 'What passRate is enough?', a: 'No hard tool threshold; designs often want ≥99% or 99.73% plus worst-case.' },
        { q: 'vs 6σ RSS?', a: 'With same K, MC passRate should track 6σ analytic (noise from finite N).' },
      ],
    },
    titleStandards: L ? 'Standards' : '标准',
    standardsIntro: { zh: 'Monte Carlo 为通用统计模拟，非公差标准专属算法。', en: 'Monte Carlo is generic simulation—not a tolerance-standard exclusive method.' },
    standards: { zh: ['ISO 22514 / SPC — 与能力指数对照', '尺寸链 MC — 工程实践'], en: ['ISO 22514 / SPC — compare to capability', 'Size-chain MC — engineering practice'] },
    titleLimits: L ? 'Limitations' : '适用边界',
    limits: {
      zh: ['默认环独立采样，未建模制造相关。', 'N 过小则分位数不稳定；龙卷风为孤立环近似。'],
      en: ['Default independent rings—no manufacturing correlation.', 'Small N unstable quantiles; tornado is isolated-ring approx.'],
    },
  })
}

/** @param {'zh'|'en'} locale — 质量页 MSA/SPC/FMEA/AQL */
export function getQualityHelp(locale = 'zh') {
  const L = locale === 'en'
  return {
    blocks: [
      guideBlock(L ? 'Quality module overview' : '质量模块概览', pickLocale(locale, {
        zh: {
          intro: '四标签：**MSA (Gage R&R)**、**SPC (X-R / P)**、**FMEA**、**AQL 抽样**。各子工具判定逻辑独立。',
          sections: [
            { title: 'MSA', body: '极差法 GRR；pctGRR 三分档。', bullets: ['≥2 操作员、≥2 零件、≥2 重复'] },
            { title: 'SPC', body: 'X-R 子组 n=2–10；P 图监控不合格率。', bullets: ['失控点计数，无批次 pass'] },
            { title: 'FMEA', body: 'AIAG-VDA 2019 AP + 传统 RPN。', bullets: ['RPN≥100 高亮'] },
            { title: 'AQL', body: 'GB/T 2828.1 / ISO 2859-1 简化表。', bullets: ['pass = d ≤ Ac'] },
          ],
        },
        en: {
          intro: 'Four tabs: **MSA (Gage R&R)**, **SPC (X-R / P)**, **FMEA**, **AQL sampling**. Each sub-tool has its own pass logic.',
          sections: [
            { title: 'MSA', body: 'Range-method GRR; pctGRR three bands.', bullets: ['≥2 operators, ≥2 parts, ≥2 trials'] },
            { title: 'SPC', body: 'X-R subgroup n=2–10; P chart for defect rate.', bullets: ['OOC point count, no lot pass'] },
            { title: 'FMEA', body: 'AIAG-VDA 2019 AP + classic RPN.', bullets: ['RPN≥100 highlight'] },
            { title: 'AQL', body: 'GB/T 2828.1 / ISO 2859-1 simplified tables.', bullets: ['pass = d ≤ Ac'] },
          ],
        },
      })),
      passBlock(L ? 'MSA — Gage R&R' : 'MSA — Gage R&R', pickLocale(locale, QUALITY_MSA)),
      passBlock(L ? 'SPC — control charts' : 'SPC — 控制图', pickLocale(locale, QUALITY_SPC)),
      passBlock(L ? 'FMEA' : 'FMEA', pickLocale(locale, QUALITY_FMEA)),
      passBlock(L ? 'AQL sampling' : 'AQL 抽样', pickLocale(locale, QUALITY_AQL)),
      formulasBlock(L ? 'Key formulas' : '关键公式', pickLocale(locale, {
        zh: [
          { name: 'GRR', latex: 'GRR = \\sqrt{EV^2 + AV^2}', note: 'TV=√(GRR²+PV²)' },
          { name: 'X-R 限', latex: 'UCL_X = \\bar{\\bar{X}} + A_2 \\bar{R}', note: 'σ̂ = R̄/d₂' },
          { name: 'RPN', latex: 'RPN = S \\times O \\times D', note: 'S,O,D ∈ [1,10]' },
          { name: 'AQL 判定', latex: 'd \\le A_c \\Rightarrow accept', note: 'Re 拒收；OC 曲线二项近似' },
        ],
        en: [
          { name: 'GRR', latex: 'GRR = \\sqrt{EV^2 + AV^2}', note: 'TV=√(GRR²+PV²)' },
          { name: 'X-R limits', latex: 'UCL_X = \\bar{\\bar{X}} + A_2 \\bar{R}', note: 'σ̂ = R̄/d₂' },
          { name: 'RPN', latex: 'RPN = S \\times O \\times D', note: 'S,O,D ∈ [1,10]' },
          { name: 'AQL decision', latex: 'd \\le A_c \\Rightarrow accept', note: 'Re reject; OC curve binomial approx.' },
        ],
      })),
      examplesBlock(L ? 'Sub-tool examples' : '子工具算例', pickLocale(locale, {
        zh: [
          { step: 'MSA', detail: 'pctGRR=8% → rating acceptable' },
          { step: 'X-R', detail: '1 点超 UCL → outOfControlCount=1' },
          { step: 'FMEA', detail: 'S=8,O=4,D=5 → RPN=160, AP=H' },
          { step: 'AQL', detail: 'N=500, AQL=2.5, d=1, Ac=1 → pass accept' },
        ],
        en: [
          { step: 'MSA', detail: 'pctGRR=8% → rating acceptable' },
          { step: 'X-R', detail: '1 point beyond UCL → outOfControlCount=1' },
          { step: 'FMEA', detail: 'S=8,O=4,D=5 → RPN=160, AP=H' },
          { step: 'AQL', detail: 'N=500, AQL=2.5, d=1, Ac=1 → pass accept' },
        ],
      })),
      howToPassBlock(L ? 'How to pass / improve' : '如何通过 / 改进', pickLocale(locale, {
        zh: [
          { goal: 'MSA acceptable', steps: ['GRR% <10%', '提高 ndc≥5', '校准量具、固定夹具、培训操作员'] },
          { goal: 'SPC 稳定', steps: ['消除失控特殊原因', '子组内仅常见原因变异'] },
          { goal: 'AQL accept', steps: ['实测 d ≤ Ac', '或加严过程使 d 下降'] },
        ],
        en: [
          { goal: 'MSA acceptable', steps: ['GRR% <10%', 'ndc≥5', 'Calibrate gage, fix fixture, train operators'] },
          { goal: 'SPC stable', steps: ['Remove special causes for OOC', 'Within-subgroup common cause only'] },
          { goal: 'AQL accept', steps: ['Measured d ≤ Ac', 'Or tighten process to reduce d'] },
        ],
      }), 3),
      faqBlock(L ? 'FAQ' : '常见问题', pickLocale(locale, {
        zh: [
          { q: 'MSA 与 SPC σ 一样吗？', a: 'MSA 评测量系统；SPC X-R 的 σ̂=R̄/d₂ 评过程—目的不同。' },
          { q: 'FMEA 还用 RPN 吗？', a: 'VDA 2019 主推 AP；本工具仍算 RPN 并标 ≥100。' },
          { q: 'AQL 表完整吗？', a: '仅 Level II 正常部分 AQL 子集；正式检验用标准全文。' },
        ],
        en: [
          { q: 'MSA vs SPC σ?', a: 'MSA gauges measurement system; SPC X-R σ̂=R̄/d₂ monitors process—different purpose.' },
          { q: 'FMEA still use RPN?', a: 'VDA 2019 emphasizes AP; tool still computes RPN and flags ≥100.' },
          { q: 'Full AQL tables?', a: 'Subset Level II normal only; use standard full tables for formal inspection.' },
        ],
      })),
      standardsBlock(L ? 'Standards' : '标准', pickLocale(locale, {
        zh: [
          '**AIAG MSA** — Gage R&R 极差法与 GRR% 准则',
          '**AIAG SPC Manual** — X-R、P 控制图',
          '**AIAG-VDA FMEA Handbook (2019)** — Action Priority',
          '**GB/T 2828.1** / **ISO 2859-1** — AQL 计数抽样',
        ],
        en: [
          '**AIAG MSA** — Gage R&R range method & GRR% criteria',
          '**AIAG SPC Manual** — X-R, P charts',
          '**AIAG-VDA FMEA Handbook (2019)** — Action Priority',
          '**GB/T 2828.1** / **ISO 2859-1** — AQL attribute sampling',
        ],
      }), pickLocale(locale, { zh: '子工具与 listed 标准对齐为简化实现。', en: 'Sub-tools align with listed standards as simplified implementations.' })),
      limitsBlock(L ? 'Limitations' : '适用边界', pickLocale(locale, {
        zh: [
          'MSA 为极差法简化，非 ANOVA 完整 MSA。',
          'SPC 未含 Western Electric 规则全集、EWMA 等。',
          'FMEA 不含控制计划/DFMEA-PFMEA 联动导出。',
          'AQL 表为大样本字码子集，不含加严/放宽转换规则全文。',
        ],
        en: [
          'MSA is simplified range method—not full ANOVA MSA.',
          'SPC lacks full Western Electric rules, EWMA, etc.',
          'FMEA no control-plan / DFMEA-PFMEA linkage export.',
          'AQL tables are subset of code letters—no full tightened/reduced switch rules.',
        ],
      })),
    ],
  }
}
