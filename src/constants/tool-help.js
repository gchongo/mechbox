/**
 * 工具帮助文档 — 面向入门用户与学生
 * 每篇：概述、操作步骤、原理、公式、注意点、标准、相关工具
 */

export const HELP_LEVELS = {
  beginner: { zh: '入门', en: 'Beginner' },
  intermediate: { zh: '进阶', en: 'Intermediate' },
  advanced: { zh: '进阶+', en: 'Advanced' },
}

/** @typedef {{ latex: string, note?: string }} HelpFormula */
/** @typedef {{
 *   id: string,
 *   path: string,
 *   groupId: string,
 *   level: 'beginner'|'intermediate'|'advanced',
 *   title: string,
 *   summary: string,
 *   steps: string[],
 *   principle: string,
 *   useCases?: string[],
 *   inputs?: Array<{ name: string, meaning: string, source: string }>,
 *   formulas?: HelpFormula[],
 *   outputs?: Array<{ name: string, meaning: string, judgement?: string }>,
 *   notes: string[],
 *   reliability?: string[],
 *   beginnerTips?: string[],
 *   professionalChecks?: string[],
 *   standards?: string[],
 *   example?: string,
 *   related?: string[],
 *   keywords?: string[],
 * }} HelpArticle */

/** @type {HelpArticle[]} */
export const TOOL_HELP_ARTICLES = [
  {
    id: 'getting-started',
    path: '/help',
    groupId: 'intro',
    level: 'beginner',
    title: '快速入门',
    summary: 'MechBox 把常用机械设计计算做成可联动的工具。建议先从尺寸链或轴系设计链上手，再深入单个强度/寿命工具。',
    steps: [
      '在首页选择工具分组：设计链、尺寸链与强度、传动与结构、材料与工艺。',
      '打开工具后，先看「计算模式」：简化 / 完整 / 专业，入门用简化或完整即可。',
      '填写输入区参数，右侧会实时给出结果与是否通过。',
      '需要反算、方案对比或敏感度分析时，使用页面下方的「决策工具」面板（见本页「决策工具」一文）。',
      '多工具联动时，用「轴系设计链」或「螺栓连接设计链」，共享参数会自动同步。',
      '不确定术语时查「术语表」；只记公式时查「公式手册」；本页提供完整操作说明。',
    ],
    related: ['decision-tools'],
    principle:
      '工程计算的一般流程是：明确设计目标（寿命、安全系数、间隙等）→ 建立简化模型 → 代入载荷与材料参数 → 与许用值比较 → 不满足则改尺寸或材料。MechBox 把这一流程固化在各工具中，并在设计链里把上下游参数串起来。',
    formulas: [
      { latex: 'S = \\frac{[\\sigma]}{\\sigma}', note: '安全系数：许用应力 / 工作应力，通常要求 S ≥ 目标值' },
    ],
    notes: [
      '本站结果仅供学习与方案初算，正式产品须按企业规范与完整标准校核。',
      '单位要统一：力用 N、应力用 MPa、长度用 mm、转速用 rpm。',
      '「通过」只表示当前输入下满足工具内置判据，不代表装配或工艺一定可行。',
      '完整/专业模式的关键输入：待核对字段为琥珀色边框与控件后 *；右侧仍显示数值，总判多为待复核，须逐项编辑确认后才放行 pass。简化模式不门禁、不高亮。',
    ],
    keywords: ['入门', '新手', '学生', '帮助'],
  },
  {
    id: 'decision-tools',
    path: '/help',
    groupId: 'intro',
    level: 'beginner',
    title: '决策工具',
    summary:
      '多数计算页底部的「决策工具」面板提供方案对比、反算求解与敏感度分析，帮助从“算一次”变成“做设计决策”。',
    steps: [
      '先在上方主表单填好基准参数，确认主结果区已有通过/不通过结论。',
      '打开页面下方「决策工具」面板，三个页签：方案对比、反算求解、敏感度。',
      '方案对比：调整参数后点「保存当前为方案」，可并排比较关键指标；不需要的方案可删除。',
      '反算求解：选择目标（如最小轴径、满足寿命的动载荷 C），点「求解」，满意后「应用到表单」。',
      '敏感度：选择追踪指标（如寿命、总公差），拖动扰动幅度（±5%～±30%），点「运行分析」，查看龙卷风图——条越长表示该参数对结果影响越大。',
      '需要存档时，可用「导出增强报告」生成含假设、建议与敏感度摘要的 PDF。',
    ],
    principle:
      '反算是正向计算的逆问题：固定合格判据，搜索某个输入变量的临界值。敏感度则对每个输入做小幅扰动（默认 ±10%），比较输出变化幅度，找出“最敏感”的设计参数，便于优先收紧公差或加大裕度。',
    formulas: [
      {
        latex: '\\text{swing}\\% = \\frac{|y_{+\\delta}-y_{-\\delta}|}{|y_0|}\\times 100\\%',
        note: '敏感度影响幅度：高/低扰动下输出之差相对基准值的百分比',
      },
    ],
    notes: [
      '敏感度必须先点「运行分析」才会出图；改完主表单参数后若要更新图，需再点一次。',
      '扰动幅度是相对当前基准值的百分比，不是绝对公差带。',
      '反算结果是数值解，仍需圆整到标准件规格（轴径、键长、轴承型号等）。',
      '并非所有工具都配置了反算目标；未配置时「反算求解」页签会禁用。',
      '尺寸链编辑器的敏感度常追踪 totalTolerance，扰动的是各组成环公差。',
    ],
    example:
      '轴承页：追踪寿命 lifeHours，运行敏感度后若径向载荷 Fr 的条最长，说明减载或加大 C 比微调转速更有效。',
    related: ['getting-started', 'bearing', 'editor', 'shaft'],
    keywords: ['决策', '敏感度', '反算', '方案对比', '龙卷风'],
  },

  // —— 设计链 ——
  {
    id: 'design-projects',
    path: '/design/projects',
    groupId: 'design-chain',
    level: 'beginner',
    title: '设计项目',
    summary: '把多条设计链归档成「项目」，方便方案对比与后续打开。',
    steps: [
      '进入设计项目页，点击新建项目并命名。',
      '在项目中关联已有的轴系链或螺栓链，或从空项目再去各设计链页新建。',
      '需要时重命名、删除项目；打开项目可跳转到对应设计链继续编辑。',
    ],
    principle: '设计项目是组织层：不直接做强度计算，而是管理多条「设计链」快照，便于同一产品的不同方案并存。',
    notes: [
      '数据保存在浏览器本地，清除站点数据会丢失，重要方案请导出报告或备份。',
      '先建设计链再归档到项目，逻辑更清晰。',
    ],
    related: ['design-powertrain', 'design-bolt-joint'],
    keywords: ['项目', '归档', '方案'],
  },
  {
    id: 'design-powertrain',
    path: '/design/powertrain',
    groupId: 'design-chain',
    level: 'beginner',
    title: '轴系设计链',
    summary: '在同一页面联动分析轴强度 → 轴承寿命 → 平键连接，共享扭矩、转速、轴径等参数。',
    steps: [
      '点击「新建链」，填写共享输入：扭矩、转速、轴径、材料屈服强度、轴承载荷与目标寿命、键尺寸等。',
      '查看三个步骤卡片的实时结果（通过/不通过与关键指标）。',
      '某步不通过时，可点「一键反算」自动回写建议尺寸（如最小轴径、键长、轴承动载）。',
      '点「打开工具」进入单工具页做更细参数；改完后可通过链同步横幅写回设计链。',
      '全部通过后，导出「链级报告」作为方案记录。',
    ],
    principle:
      '轴系设计通常先定扭矩与转速，再定轴径（扭转/弯扭强度），再选轴承（寿命与静载），最后校核键连接（挤压与剪切）。共享轴径与扭矩，可避免三处手填不一致。',
    formulas: [
      { latex: '\\tau = \\frac{16T}{\\pi d^3}', note: '轴扭转剪应力（简化）' },
      { latex: 'L_{10h} = \\frac{10^6}{60n}\\left(\\frac{C}{P}\\right)^\\varepsilon', note: '轴承寿命（小时）' },
    ],
    notes: [
      '共享参数改一处，三步结果会一起更新。',
      '轴承步骤默认简化模式；需要预紧/配对时请打开轴承单页用完整/专业模式。',
      '反算结果是建议值，仍需结合标准件规格圆整。',
    ],
    standards: ['ISO 281（轴承）', 'GB/T 1095（平键）'],
    related: ['shaft', 'bearing', 'key'],
    keywords: ['轴系', '联动', '设计链'],
  },
  {
    id: 'design-bolt-joint',
    path: '/design/bolt-joint',
    groupId: 'design-chain',
    level: 'intermediate',
    title: '螺栓连接设计链',
    summary: '联动分析螺栓预紧 → 螺栓组载荷分配 → 焊缝强度，共享预紧力、螺栓直径与外载。',
    steps: [
      '新建链，填写螺栓直径、螺距、预紧力、外载、夹紧长度、螺栓数量与分布半径、焊缝尺寸等。',
      '查看三步卡片：预紧是否分离、螺栓组是否超许用、焊缝是否合格。',
      '用一键反算调整预紧力、螺栓数量或焊脚尺寸。',
      '导出链级报告存档。',
    ],
    principle:
      '受拉螺栓连接先保证预紧后不分离，再校核螺栓组在偏心载荷下的最危险螺栓，焊缝则承担部分或全部结构力。预紧力同时影响分离裕度与夹紧摩擦抗剪。',
    formulas: [
      { latex: 'F_{M\\min} \\ge F_A \\frac{1-\\Phi}{\\Phi}', note: '防分离所需最小预紧（示意，Φ 为载荷系数）' },
    ],
    notes: [
      '预紧力与拧紧扭矩强相关，表面状态（μ）影响很大。',
      '螺栓组许用值需与材料等级、安全系数一致。',
    ],
    standards: ['VDI 2230（预紧参考）', 'GB 焊缝强度简化'],
    related: ['bolt-preload', 'bolt-group', 'weld'],
    keywords: ['螺栓', '预紧', '焊缝', '设计链'],
  },

  // —— 尺寸链与强度 ——
  {
    id: 'editor',
    path: '/editor',
    groupId: 'chain',
    level: 'beginner',
    title: '尺寸链编辑器',
    summary: '建立封闭环与组成环，用极值法 / RSS / 修正 RSS / 6σ 判断装配是否满足公差要求。',
    steps: [
      '选择分析类型（1D 间隙、位置度、平面度等）。',
      '定义封闭环：名称、最小/最大允许值、方向与单位。',
      '添加组成环：公称尺寸、上偏差 ES、下偏差 EI；增环/减环由方向自动判定。',
      '需要时打开高级模式填写传递系数 k。',
      'GD&T 类型：在组成环表中把尺寸要素标为孔/轴（FOS），尺寸公差可由 ES/EI 自动同步。',
      '步骤 5 展开 GD&T：选 MMC/LMC，默认开启「自动奖励」（按 FOS 尺寸公差求和）；也可关闭后手填奖励公差。',
      '选择叠加方法，查看合格判定、贡献度与西格玛指标；底部决策工具可做公差敏感度分析。',
      '可跳转 Monte Carlo 或 GD&T 公差栈做进一步分析。',
    ],
    principle:
      '尺寸链描述装配中尺寸的封闭关系。封闭环是最终要保证的间隙或位置；组成环是零件尺寸。极值法假设误差同时取最不利方向；RSS 假设误差独立随机，用平方和开方估计总公差，更接近批量生产。',
    formulas: [
      { latex: 'T_{\\text{worst}} = \\sum |\\xi_i| T_i', note: '极值法总公差' },
      { latex: 'T_{\\text{RSS}} = \\sqrt{\\sum (\\xi_i T_i)^2}', note: 'RSS 法总公差' },
    ],
    notes: [
      '安全关键件优先看极值法；一般装配可看 RSS，但勿仅凭 RSS 放行高风险件。',
      '增环增大使封闭环增大，减环相反；画草图有助于判断方向。',
      '贡献度高的环优先收紧公差，性价比更高。',
    ],
    standards: ['ASME Y14.5（GD&T 奖励公差概念）'],
    example: '间隙链：箱体孔距为增环，轴段长度为减环，封闭环为装配间隙。',
    related: ['allocation', 'monte-carlo', 'gdt-stack'],
    keywords: ['尺寸链', 'RSS', '公差'],
  },
  {
    id: 'batch',
    path: '/batch',
    groupId: 'chain',
    level: 'beginner',
    title: '批量公差验证',
    summary:
      '质量工程师场景：对多组组成环公差列表一次性做 RSS 与极值法检验，对比封闭环允许区间。最多 50 组；支持 CSV 粘贴与结果导出。判定逻辑与尺寸链编辑器一致，摘要区显示分析方法与风险提示。',
    steps: [
      '在「目标规格」输入封闭环下限 min 与上限 max（mm），定义允许的合成尺寸区间。',
      '在「批量输入」按行填写：方案名,公差1,公差2,…（逗号分隔；可选第二列起为传递系数，默认 1）。',
      '点击「开始验证」，查看每行 RSS/极值公差宽度、合格标记及「方法风险提示」。',
      '阅读摘要区「分析方法与判定依据」；关注「RSS过/极值不过」计数——RSS 通过但极值未通过时不可仅凭 RSS 放行。',
      '导出 CSV 存档；正式放行前建议回尺寸链编辑器核对增/减环方向与真实名义尺寸。',
    ],
    principle:
      '批量工具是尺寸链 RSS/极值法的表格化批处理：各组成环名义尺寸视为 0、对称公差带 $\\pm T_i/2$、均为增环（与编辑器默认 RSS/极值叠加一致）。合格判定比较的是合成区间 $[L,U]$ 是否落在封闭环 $[\\min,\\max]$ 内，而非仅比较总公差宽度是否小于预算。',
    formulas: [
      {
        latex: 'T_{\\mathrm{worst}} = \\sum_i T_i f_i',
        note: '极值法总公差；默认 $f_i=1$。合成区间 $[L,U]=[-T_{\\mathrm{worst}}/2,\\,+T_{\\mathrm{worst}}/2]$',
      },
      {
        latex: 'T_{\\mathrm{rss}} = \\sqrt{\\sum_i (T_i f_i)^2}',
        note: 'RSS 总公差；合成区间 $[L,U]=[-T_{\\mathrm{rss}}/2,\\,+T_{\\mathrm{rss}}/2]$',
      },
      {
        latex: 'L \\ge \\min \\;\\land\\; U \\le \\max \\Rightarrow \\text{合格}',
        note: 'RSS 与极值分别独立判定；两行都须看，不能混为一谈',
      },
      {
        latex: 'R = T_{\\mathrm{worst}} / T_{\\mathrm{rss}}',
        note: '极值/RSS 公差比；$R\\ge 1.5$ 提示方法差异偏大，$R\\ge 2$ 警告',
      },
    ],
    notes: [
      '「不合格」= RSS 与极值均未通过；「RSS过/极值不过」= RSS 通过但极值未通过，安全关键件须优先关注。',
      'RSS 通过而极值未通过时，表格显示「RSS ✓ 极值 ✗ — 勿仅依据 RSS 放行」；反之提示核对过程能力。',
      '默认封闭环下限为 0 时，全增环、零名义模型下 RSS 合成下界常为负，易使本应为「公差预算」的检验变成「绝对区间」检验——请按实际封闭环 min/max 设置目标。',
      '示例数据与默认目标组合可能全部显示未通过，属目标区间设置问题，不一定是公差列表错误。',
      '批量输入不含名义尺寸与增/减环方向；复杂链请先在编辑器建链，再提取公差列表或改用编辑器逐步验算。',
    ],
    example:
      '3 环公差 0.05, 0.04, 0.03 mm（$f_i=1$）：$T_{\\mathrm{worst}}=0.12$ mm，区间 $[-0.06,\\,+0.06]$；$T_{\\mathrm{rss}}=0.0707$ mm，区间 $[-0.0354,\\,+0.0354]$。若封闭环要求 $[0,\\,0.10]$ mm，则 RSS 与极值均合格；若要求 $[0,\\,0.05]$ mm，则 RSS 合格、极值不合格——摘要「RSS过/极值不过」+1。',
    related: ['editor', 'allocation', 'monte-carlo'],
    keywords: ['批量', '验证', 'RSS', '极值', '质量'],
  },
  {
    id: 'allocation',
    path: '/allocation',
    groupId: 'chain',
    level: 'intermediate',
    title: '公差分配优化',
    summary:
      '给定封闭环 RSS 目标公差 $T_0$，将公差合理分配到各组成环。支持等贡献、等公差、比例、最小成本、灵敏度等解析法，以及遗传算法与 Pareto 多目标优化；结果可一键带回尺寸链编辑器验算。',
    steps: [
      '在「分配参数」中输入目标 RSS 公差 $T_0$（mm），选择分配方法；下方会显示该方法的核心公式。',
      '在「组成环」中填写环名、传递系数 $f_i$、名义尺寸 $n_i$；最小成本/遗传/Pareto 需填写成本系数 $c_i$；灵敏度法需填写灵敏度 $s_i$。',
      '点击「计算分配」，查看 RSS 验算、利用率与各环分配公差 $T_i$、半公差 $\\pm T_i/2$。',
      '在「多方法对比」中横向比较 RSS、利用率、Min/Max 公差与成本指数；点击某行可切换当前方法。',
      '选定方案后，用「应用到编辑器」载入尺寸链编辑器，核对封闭环 min/max 与增/减环方向后再正式放行。',
    ],
    principle:
      '公差分配是尺寸链的逆问题：尺寸链正算已知各环 $T_i$ 求合成 RSS；本工具已知目标 $T_0$ 反求各环 $T_i$。所有 RSS 解析法均以 $T_{\\mathrm{stack}}=\\sqrt{\\sum (T_i f_i)^2}\\le T_0$ 为硬约束；比例分配面向极值法参考，不保证 RSS 打满预算。半公差 $\\pm T_i/2$ 表示对称公差带，用于制造与圆整，不参与 RSS 叠加公式。',
    formulas: [
      {
        latex: 'T_{\\mathrm{stack}} = \\sqrt{\\sum_i (T_i f_i)^2}',
        note: 'RSS 验算公式（与尺寸链编辑器 RSS 法一致）；$f_i$ 为传递系数',
      },
      {
        latex: 'T_{\\mathrm{stack}} \\le T_0 \\quad\\Rightarrow\\quad \\text{利用率} = \\frac{T_{\\mathrm{stack}}}{T_0}\\times 100\\%',
        note: '合格判据：RSS 验算值不超过目标公差（允许 $10^{-9}$ mm 数值误差）',
      },
      {
        latex: 'T_i = \\frac{T_0}{f_i \\sqrt{n}}',
        note: '等贡献 RSS：各环 $(T_i f_i)^2$ 相等；$n$ 为环数。当全部 $f_i=1$ 时简化为 $T_i=T_0/\\sqrt{n}$',
      },
      {
        latex: 'T_i = \\frac{T_0}{\\sqrt{n}}',
        note: '等公差 RSS：各环分配相同 $T_i$（忽略 $f_i$ 差异后再验 RSS）',
      },
      {
        latex: 'T_i = T_0 \\cdot \\frac{n_i}{\\sum_j n_j}',
        note: '比例分配：按名义尺寸比例分总公差；面向极值法思路，RSS 利用率通常低于 100%',
      },
      {
        latex: 'T_i = \\frac{T_0 \\sqrt{c_i}}{f_i \\sqrt{\\sum_j c_j}}',
        note: '最小成本 RSS：成本系数 $c_i$ 越大，分配公差越小',
      },
      {
        latex: 'T_i = \\frac{T_0 \\cdot s_i}{f_i \\sqrt{\\sum_j s_j^2}}',
        note: '灵敏度 RSS：$s_i$ 越大分配越大；迭代灵敏度法多轮更新 $s_i$ 后收敛',
      },
      {
        latex: '\\text{成本指数} = \\sum_i \\frac{c_i}{T_i}',
        note: '多方法对比排序依据：指数越低通常表示加工成本越省（公差越松、$c_i/T_i$ 越小）',
      },
    ],
    notes: [
      '分配结果须圆整到可加工的公差等级（如 IT 级或企业标准档），圆整后应回到编辑器或批量验证重新验算 RSS。',
      '等贡献/等公差/最小成本/灵敏度等 RSS 解析法设计目标即满足 $T_0$ 预算；比例分配不保证 RSS 满预算，对比表中利用率偏低属正常。',
      '传递系数 $f_i>1$ 时，同样 RSS 贡献下分配公差应更小；测试用例验证 $f_A=1,f_B=2$ 时 $T_A\\approx 2T_B$。',
      '遗传算法在 $T_{\\mathrm{stack}}\\le T_0$ 约束下最小化 $\\sum c_i n_i/T_i$；Pareto 法在成本与利用率间给非支配解集，需人工权衡。',
      '「应用到编辑器」会载入示例封闭环 min/max，正式放行前必须按实际图纸修改封闭环与增/减环方向。',
    ],
    example:
      '示例：$T_0=0.10$ mm，3 个组成环且 $f_i=1$。等贡献 RSS 得 $T_i=0.10/\\sqrt{3}\\approx 0.0577$ mm，半公差 $\\pm 0.0289$ mm；RSS 验算 $=\\sqrt{3\\times 0.0577^2}=0.1000$ mm，利用率 100%。若改比例分配（名义尺寸 40/15/55.25 mm），RSS 验算约 0.051 mm、利用率约 51%——说明比例法未打满 RSS 预算，不可与等贡献结果直接比较「松紧」。',
    related: ['editor', 'batch', 'monte-carlo'],
    keywords: ['公差分配', 'RSS', '等贡献', 'Pareto', '遗传算法'],
  },
  {
    id: 'fit',
    path: '/fit',
    groupId: 'chain',
    level: 'beginner',
    title: 'ISO 286 配合查询',
    summary:
      '按孔/轴公差带代号（如 H7/g6、H7/n6）计算极限尺寸、最大/最小间隙或过盈、配合品质指数及装配温差影响。结果用于方案初选与分类，正式出图须对照 GB/T 1800 / ISO 286-2 标准表复核。',
    steps: [
      '输入公称尺寸（1～500 mm）、孔代号与轴代号，或在下方基孔制/基轴制附表中点击单元格选用。',
      '可选输入装配温差 ΔT（相对 20°C）；默认同材质时热致间隙变化为 0，异种材料须另算。',
      '查看孔/轴极限尺寸、最大/最小间隙（μm）、平均间隙、品质指数 Q 及配合类型（间隙 / 过渡 / 过盈）。',
      '关注「校核」状态与假设说明；「需关注」表示待工程师复核，不等于配合不合格。',
      '过渡或过盈配合、温升工况、正式放行前，请用标准手册或企业公差表逐项核对偏差值。',
    ],
    principle:
      '本工具按 ISO 286 结构计算：字母定公差带位置，数字定 IT 等级。孔 $EI$、轴 $es$ 由内置基本偏差表按尺寸段查得；$IT$ 带宽由标准公差单位 $i$ 的连续公式计算（非整段标准表取整）。配合间隙由孔轴极限尺寸作差得到。与 GB/T 1800 / ISO 286-2 逐表对照时，常见间隙配合（H + g/f/h）偏差通常较接近；部分正偏差轴代号（如 n、k、p）在个别尺寸段可能与标准表不一致，须人工复核。',
    formulas: [
      {
        latex: 'i = 0.45 \\cdot D^{1/3} + 0.001 \\cdot D \\quad (\\mu m)',
        note: '标准公差单位；$D$ 为公称尺寸 (mm)。IT 带宽 $IT = k \\cdot i / 1000$ (mm)，$k$ 为 IT5～IT11 系数（如 IT7→16，IT6→10）',
      },
      {
        latex: 'ES = EI + IT \\; (\\text{孔}), \\quad ei = es - IT \\; (\\text{轴})',
        note: 'H 孔 $EI=0$；h 轴 $es=0$；其余字母查内置偏差表（按 >3～6、>6～10…>400～500 mm 分段）',
      },
      {
        latex: 'D_{\\max} = D_{\\mathrm{nom}} + ES, \\quad D_{\\min} = D_{\\mathrm{nom}} + EI \\; (\\text{孔}); \\quad \\text{轴同理用 } es/ei',
        note: '结果区「孔 H7 / 轴 n6」后为极限尺寸范围 (mm)',
      },
      {
        latex: 'X_{\\max} = D_{\\mathrm{hole,max}} - D_{\\mathrm{shaft,min}} = ES - ei',
        note: '最大间隙 (mm)；为正表示最松状态',
      },
      {
        latex: 'X_{\\min} = D_{\\mathrm{hole,min}} - D_{\\mathrm{shaft,max}} = EI - es',
        note: '最小间隙 (mm)；为负表示存在过盈（最大过盈 $|X_{\\min}|$）',
      },
      {
        latex: 'X_{\\min} \\ge 0 \\Rightarrow \\text{间隙}; \\; X_{\\max} \\le 0 \\Rightarrow \\text{过盈}; \\; \\text{否则过渡}',
        note: '配合类型判定（与 ISO 配合分类一致）',
      },
      {
        latex: 'Q = \\frac{X_{\\max} + X_{\\min}}{2\\,(X_{\\max} - X_{\\min})}',
        note: '配合品质指数；0.5 为间隙带居中，仅用于方案比较，非功能合格判据',
      },
      {
        latex: '\\Delta X_{\\mathrm{th}} = \\alpha_h L \\Delta T - \\alpha_s L \\Delta T',
        note: '热致间隙变化；默认孔轴同为钢材 $\\alpha=11.5\\times10^{-6}$ 时 $\\Delta X_{\\mathrm{th}}=0$；异种材料需在输入中区分 $\\alpha$（当前页面未暴露材料选项）',
      },
    ],
    notes: [
      '与标准表的已知差异：$IT$ 用连续公式在名义尺寸 $D$ 上计算，标准表按尺寸段取整（如 Ø11 mm 处 IT7 本工具约 16.2 μm，标准表 18 μm；Ø25 mm 处 IT7 约 21.5 μm，标准表 21 μm）。',
      '轴 n 等基本偏差：小尺寸段与 ISO 286-2 较一致；Ø25 mm H7/n6 等工况下，本工具轴 $es$ 可能为 +8 μm 而标准表为 +15 μm，导致最大间隙、最大过盈与手册相差约 20 μm——过渡/过盈配合必须以标准手册为准。',
      '校核「需关注」：未触发热风险时，系统标记为估算/待复核 (estimateOnly)，并非配合失败；页内假设说明已注明未输入功能目标时结果仅用于分类。',
      '常用间隙配合 H7/g6：g 偏差表在常用段较可靠；IT 公式误差通常约 10% 量级，方案初选可用，正式图样请查表。',
      '图示中轴偏差若显示 (+8/-5) 而手册为 (+28/+15)，说明偏差源数据不同，以极限尺寸与间隙数值为准对照手册。',
      '与外部计算器/手册对照时，间隙公式 $X_{\\max}=ES-ei$、$X_{\\min}=EI-es$ 相同；数值差异来自 IT 公式或轴 n/k/p 等基本偏差查表，而非配合公式不同。',
      '名义尺寸 >500 mm 不在查表范围；IT 仅支持 5～11 级；字母表为常用子集，非全 ISO 286。',
      '帮助页附表 D3-3 列出优先配合的典型应用；D4-1 给出 IT 等级与加工方法关系，选用配合后应核对工艺能否达到相应 IT。',
    ],
    example:
      '例 1 — Ø11 H7/g6（间隙，与标准较接近）：本工具孔 11.000～11.0162 mm，轴 10.9829～10.9930 mm，$X_{\\max}\\approx 33.3\\ \\mu m$，$X_{\\min}\\approx 7.0\\ \\mu m$，平均间隙约 20.2 μm，品质指数 $Q\\approx 0.77$（仅方案比较）。标准表 IT7=18 μm 时 $X_{\\max}$ 约 36 μm，差在 IT 连续公式。例 2 — Ø25 H7/n6（过渡，与标准计算器差异大）：标准/手册孔 +21/0、轴 +28/+15 μm → $X_{\\max}=+6\\ \\mu m$，$X_{\\min}=-28\\ \\mu m$；本工具轴 n 基本偏差查表为 +8 μm（非 +15 μm）→ 轴约 +8/-5 μm，$X_{\\max}\\approx 26.9\\ \\mu m$，$X_{\\min}\\approx -8\\ \\mu m$，最大过盈被低估约 20 μm。过渡/过盈配合必须以 GB/T 1800 手册为准。',
    standards: ['ISO 286', 'GB/T 1800（建议对照复核）'],
    related: ['interference-fit', 'editor', 'allocation'],
    keywords: ['配合', 'H7', 'g6', 'n6', 'ISO286', '间隙', '过盈', '过渡'],
  },
  {
    id: 'gdt-stack',
    path: '/gdt-stack',
    groupId: 'chain',
    level: 'intermediate',
    title: 'GD&T 公差栈',
    summary:
      '对位置度、平面度、同轴度等形位公差做 RSS/极值叠加，支持 MMC/LMC 奖励公差、基准累积与贡献度分解。用于装配链路上的形位公差预算与方案比较；正式放行须对照 ASME Y14.5 与实测状态复核。',
    useCases: [
      '孔组位置度、多贴合面平面度、轴承同轴度等在装配中会累积，需估算合成是否仍落在图样允许带内。',
      '方案阶段比较不同定位公差、基准面精度或 MMC 奖励对可装配性的影响。',
      '需要知道哪些组成环贡献最大，以便优先收紧关键工序或改基准顺序。',
      '功能件或单件必过场合，除 RSS 外还要用专业模式的极值裕度做最坏情况复核。',
    ],
    steps: [
      '选择计算模式：简化（仅叠加）/ 完整（+贡献+基准）/ 专业（+极值裕度）。有基准输入时勿仅用简化模式放行。',
      '选择 GD&T 类型（位置度、平面度、同轴度等）与叠加方法（RSS / 极值 / Modified RSS）。',
      '填写封闭环上限 $T_{closed}$（形位公差预算带下界为 0）；添加各组成环公差、传递系数 factor；位置度须指定 X/Y 方向。',
      '尺寸要素（孔/轴）标注 featureKind 与 sizeTolerance，以便 MMC/LMC 自动奖励；非尺寸要素不参与奖励。',
      '可选添加基准及 flatness/perpendicularity 公差；完整/专业模式会 RSS 合成含基准累积值。',
      '查看叠加公差、贡献度、含基准累积、极值裕度（专业）与校验状态；贡献条越长越应优先优化。',
      '可从尺寸链编辑器导入组成环；导出 PDF 报告存档。',
    ],
    principle:
      '形位公差在装配与测量链路上会累积。与 1D 尺寸链不同，多数形位栈使用预算带 $[0, T_{closed}]$（名义≈0），而非对称 $\\pm$ 半公差带。位置度是二维问题：X/Y 方向偏差先在各轴 RSS，再合成直径公差带 $T_{pos}=2\\sqrt{(T_x/2)^2+(T_y/2)^2}$。基准体系引入额外累积，本工具用加权 RSS 近似（主 1.0、次 0.7、三 0.5）。MMC 下尺寸要素偏离最大实体时可获奖励公差，使有效可用公差增大；自动模式按 FOS 尺寸公差全额估计，偏教学/保守。RSS 通过不等于极值安全——专业模式额外计算 worst-case 裕度。',
    formulas: [
      {
        latex: 'T_{pos} = 2\\sqrt{\\left(\\frac{T_x}{2}\\right)^2 + \\left(\\frac{T_y}{2}\\right)^2}',
        note: '位置度 RSS；$T_x$、$T_y$ 为各轴环（含 factor）RSS 合成全公差',
      },
      {
        latex: 'T_{pos}^{worst} = T_x + T_y',
        note: '位置度极值：各轴内先极值加，再轴间相加',
      },
      {
        latex: 'T_{rad} = \\sqrt{\\sum (f_i T_i)^2}',
        note: '同轴度/跳动/圆度等径向栈 RSS',
      },
      {
        latex: 'T_{datum} = \\sqrt{\\sum (w_i T_i)^2}',
        note: '基准累积；$w_i$ 为主 1.0 / 次 0.7 / 三 0.5',
      },
      {
        latex: 'T_{含基准} = \\sqrt{T_{stack}^2 + T_{datum}^2}',
        note: '完整/专业模式：主栈与基准 RSS 再合成',
      },
      {
        latex: 'T_{eff} = T_{stack} - bonus',
        note: 'MMC/LMC 下有效栈减小；bonus 来自 FOS 尺寸公差（MMC 全额，LMC 半额简化）',
      },
      {
        latex: 'M_{worst} = T_{closed} - T_{stack}^{worst}',
        note: '专业模式极值裕度；$M_{worst}\\ge 0$ 才通过',
      },
    ],
    notes: [
      '封闭环填 $[0, T_{closed}]$ 预算带；若误填对称尺寸链 min/max，判定语义会变为 band 模式而非 budget。',
      '简化模式已输入基准时不计入基准累积，系统标 estimateOnly/待复核——须切换完整或专业模式。',
      '贡献度：2D 位置度 RSS 下 X/Y 轴各分 50% 方差；1D/radial 栈按 $T_i^2/\\sum T_j^2$ 分配。',
      'factor 为传递系数/灵敏度，孔径对 X 向常用 0.5 近似耦合，不等同于标准逐件 bonus 计算。',
      '非尺寸要素（纯平面度等）不参与 MMC/LMC 奖励；自动 bonus 按尺寸公差全额，精密场合按实测离 MMC 偏离计算。',
      'Modified RSS 需配合分布参数；sigma6-rss 在部分栈类型可用，见工具下拉选项。',
      '本工具为前期公差预算，非 CMM/GD&T 仿真；pattern 位置度、simultaneous、DRF shift 等须专用软件或手工按 Y14.5 复核。',
    ],
    example:
      '孔组位置度预设（专业 · RSS · RFS）：X 定位 0.0500、Y 0.0400、孔径 0.0200×0.5（X）；上限 0.1500；基准 A 0.0200（主）、B 0.0300（次）。叠加 $T_{pos}\\approx 0.0648$ mm；贡献 Y 50.0%、X 48.1%、孔 1.9%；含基准 $\\approx 0.0710$ mm；极值 $T_{pos}^{worst}=0.10$ mm，裕度 0.05 mm；三项均通过。优化优先级：Y 定位 > X 定位 >> 孔径；基准公差放大时会先于主栈耗尽裕度。',
    standards: ['ASME Y14.5', 'ISO 1101（概念对照）'],
    related: ['editor', 'allocation', 'monte-carlo'],
    keywords: ['GD&T', '位置度', '平面度', '同轴度', 'MMC', '基准', 'RSS', '贡献度'],
  },
  {
    id: 'units',
    path: '/units',
    groupId: 'chain',
    level: 'beginner',
    title: '单位换算',
    summary: '在常用力学、长度与面积单位之间换算，避免混用 MPa 与 psi、mm 与 in。',
    steps: [
      '选择物理量类型（长度、面积、应力、力等）。',
      '输入数值与源单位，选择目标单位。',
      '复制结果到其他计算工具。',
    ],
    principle: '同一物理量在不同单位制下的换算因子是常数（如 1 in = 25.4 mm，1 ksi ≈ 6.895 MPa，1 MPa = 1 N/mm²）。',
    notes: [
      '工程计算出错最常见原因之一是单位混用，换算后建议心算数量级是否合理。',
      '应力可用 MPa、N/mm²、ksi 等；面积含 mm²/m²、公顷，以及亩/分/顷与 ft²/yd²/acre/mi²。',
    ],
    keywords: ['单位', 'MPa', 'N/mm²', 'psi', '面积', '亩'],
  },
  {
    id: 'interference-fit',
    path: '/interference-fit',
    groupId: 'chain',
    level: 'intermediate',
    title: '过盈配合',
    summary:
      '按厚壁圆筒 Lame 理论估算过盈产生的接触压力、切向应力、压装力与可传递扭矩（DIN 7190 思路）。完整/专业模式含许用应力校核与关键输入确认门禁；专业模式可修正温升对过盈的影响。',
    useCases: [
      '轴与轮毂压装/热装：判断给定过盈能否传递设计扭矩，压装力是否在设备能力内。',
      '与 ISO 286 /fit 查得的极限过盈对照，做弹性阶段压力与应力估算。',
      '空心轴、薄壁轮毂等几何下比较 solid vs hollow 对接触压力的影响。',
      '服役温升或异种材料时，估算有效过盈是否减小甚至变为间隙（专业模式）。',
    ],
    steps: [
      '选择模式：简化（仅看数量级，pass 恒 false）/ 完整（空心轴+应力校核+确认门禁）/ 专业（+温变修正）。',
      '输入轴径 $d$、孔径 $D$（过盈 $i=d-D$ 自动显示）、轮毂外径 $D_A$、配合长度 $L$、摩擦系数 $\\mu$。',
      '完整/专业：填写轴内径 $d_i$（0=实心）、轴/孔 $E,\\nu$、许用切向应力；$D_A$ 可用「推荐」约 $1.8d$。',
      '专业：输入温升 $\\Delta T$ 与轴/孔线膨胀系数 $\\alpha$（本页填物理值，钢约 $11.5\\times10^{-6}$/°C；与热膨胀页「×10⁻⁶ 数值」不同）；$\\alpha=0$ 时温变无效。',
      '完整/专业：逐项编辑并确认关键输入（见帮助「关键输入门禁」）。未确认时字段为琥珀色边框与 *，右侧仍显示 $p$、$F$ 等，总判为待复核（releaseBlocked）。',
      '查看 $p$、切向应力 hoopPass、压装力 $F$、扭矩 $T$；与工况扭矩、压机能力比较。',
      '过盈异常大（如 $i$ 达 mm 级而轴径仅 cm 级）时先核对孔径是否填错，再解读应力结论。',
    ],
    principle:
      '过盈使轴、孔结合面产生径向干涉 $\\Delta r=i/2$，在弹性范围内按 Lame 厚壁圆筒求接触压力 $p$。轮毂柔度 $C_h$ 与轴柔度 $C_s$（实心或空心）之和决定 $p=\\Delta r/[r_i(C_h+C_s)]$。摩擦传递扭矩 $T=\\pi p d^2 L\\mu/2$，压装力 $F=\\pi p d L(\\mu+0.02)$。完整/专业模式将孔壁、轴壁切向应力与许用值比较（hoopPass）。完整/专业还须通过关键输入确认门禁才放行 pass——预填默认值不代表已核对图纸；未确认时结果区仍可见数值。专业模式用 $i\'=i+\\alpha_s d\\Delta T-\\alpha_h D\\Delta T$ 修正有效过盈。',
    formulas: [
      { latex: 'i = d - D', note: '过盈量 (mm)；须 $i>0$' },
      { latex: 'p = \\frac{i/2}{r_i(C_h+C_s)}', note: '$r_i=D/2$；$C_h,C_s$ 含 $E,\\nu$ 与内外半径' },
      {
        latex: 'C_h = \\frac{1}{E_h}\\left(\\frac{r_o^2+r_i^2}{r_o^2-r_i^2}+\\nu_h\\right)',
        note: '轮毂柔度；$r_o=D_A/2$',
      },
      { latex: 'C_s = \\frac{1-\\nu_s}{E_s}', note: '实心轴；空心轴见帮助附表' },
      {
        latex: '\\sigma_{t,h} = p\\frac{r_o^2+r_i^2}{r_o^2-r_i^2},\\quad \\sigma_{t,s} \\approx p',
        note: '切向应力校核（完整/专业）',
      },
      { latex: 'F = \\pi p d L(\\mu+0.02)', note: '压装力 (N)' },
      { latex: 'T = \\frac{\\pi p d^2 L \\mu}{2}', note: '传递扭矩 (N·mm)；界面 N·m' },
      {
        latex: "i' = i + \\alpha_s d\\Delta T - \\alpha_h D\\Delta T",
        note: '专业模式温变后过盈',
      },
    ],
    notes: [
      '典型 ISO 过盈配合过盈量为 **μm～几十 μm**；$i$ 达 mm 级多为孔径错误或单位混用，应先核对 $D$ 是否应为 49.98 而非 45.98 等。',
      '简化模式 **通过判定恒为否**（仅估算），即使环向应力校核通过也不能放行。',
      '完整/专业：未确认关键输入时总判为待复核（releaseBlocked），右侧仍显示 $p$、$F$ 等；待确认字段琥珀色边框与 *——须逐项变更确认，此为有意设计。',
      '切换计算模式会 **清空** 已确认字段，需重新确认。',
      '薄壁：$(D_A-D)/2 < 0.1d$ 时 thinWallWarning；$D_A$ 过小会高估 $p$。',
      '模式说明中「粗糙度修正」尚未实现；当前专业模式仅温变修正。',
      '与 /fit、/thermal-expansion 联动：先查公差带过盈，再算压力；异种材料温升用专业 $\\alpha$。',
    ],
    example:
      '例 — Ø50 压装（$d=50$，$D=49.975$，$i=0.025$ mm）：$p\\approx39$ MPa，孔/轴切向应力约 66/39 MPa（$<350$ MPa 许用），$F\\approx3.4\\times10^5$ N，$T\\approx180$ N·m（$L=40$，$\\mu=0.12$）。完整模式须确认轴径、孔径、$D_A$、$L$、许用应力后才解除 releaseBlocked（此前数值已可见）。反例 — $D=45.98$ → $i=4$ mm：$p$ 达 GPa 量级，hoopPass 必败，无工程意义。',
    standards: ['DIN 7190（参考）', 'ISO 286（过盈量来源，见 /fit）'],
    related: ['fit', 'thermal-expansion'],
    keywords: ['过盈', '压装', 'Lame', '配合压力', '扭矩', 'releaseBlocked'],
  },
  {
    id: 'thermal-expansion',
    path: '/thermal-expansion',
    groupId: 'chain',
    level: 'beginner',
    title: '热膨胀',
    summary: '估算温度变化引起的尺寸变化，以及对间隙/过盈配合的影响。',
    steps: [
      '选择模式：简化（线膨胀估算）/ 完整（双材料配合变化）/ 专业（装配与服役分步 ΔT）。',
      '输入原长、温升；线膨胀系数 α 在界面填 **×10⁻⁶ 数值**（钢约 11.5，表示 $11.5\\times10^{-6}$/°C）。',
      '完整/专业：输入轴径、孔径与第二材料 α；专业再填装配/服役温差。待确认关键字段为琥珀色边框与 *。',
      '查看伸长量 ΔL；配合分析时查看过盈变化与是否变间隙。',
    ],
    principle: '大多数金属受热膨胀，$\\Delta L=\\alpha L \\Delta T$（公式中 α 为物理值）。孔与轴材料不同时，温升会改变配合松紧。',
    formulas: [
      { latex: '\\Delta L = \\alpha L \\Delta T', note: '线膨胀量；界面 α 按 ×10⁻⁶ 输入后再换算' },
    ],
    notes: [
      '界面 α 填 ×10⁻⁶ 量级数字（如 11.5），不是 $11.5\\times10^{-6}$ 原值；钢材物理 α 约 $1.2\\times10^{-5}$/°C。',
      '过盈配合页专业模式的 α 填物理值（如 $11.5\\times10^{-6}$），与本页输入约定不同。',
      '完整/专业有关键输入门禁：未确认时总判待复核，数值仍显示；简化模式不门禁。',
      '高温设备必须把热态间隙纳入尺寸链。',
    ],
    related: ['fit', 'interference-fit'],
    keywords: ['热膨胀', '温度', 'α', '×10⁻⁶'],
  },
  {
    id: 'fatigue',
    path: '/fatigue',
    groupId: 'chain',
    level: 'intermediate',
    title: '疲劳寿命',
    summary:
      '基于 Basquin S-N 曲线与 Miner 线性累积损伤，估算交变应力下的寿命与载荷谱损伤和 D。完整/专业含 Miner；专业另加 Goodman/Soderberg、ka·kb 与 Se′。有谱时综合 pass 只看 D；右栏单级判定为对照。详见帮助页教材章节。',
    useCases: [
      '已知应力幅或载荷谱，估算循环寿命或判断 Miner 损伤 $D$ 是否 $<1$。',
      '多级工况（启动/稳态/制动）用 Miner 谱快速对比方案。',
      '存在显著平均拉应力时，用专业模式 Goodman 修正后再判持久极限。',
      '与轴/梁/键页 assessComponentFatigue 区分：本页独有 Miner，彼处无谱累积。',
    ],
    steps: [
      '选择模式：简化（单级寿命，pass 恒 false）/ 完整（+Miner）/ 专业（+Goodman+$k_a,k_b$）。',
      '选择材料（5 种内置 S-N）；输入应力幅 $S_a$（范围由 $\\sigma_{-1}$ 与 $N=10^2$ 端点约束）。',
      '完整/专业：在文本框输入载荷谱，每行「应力幅(MPa), 循环次数」；可点「加载示例」。',
      '专业：填平均应力 $S_m$、表面系数 $k_a$、尺寸系数 $k_b$、目标循环 $N_{target}$；Miner 各级做 Goodman 并相对 $S_e\'$ 查 $N_f$。',
      '有载荷谱时 **综合通过判定只看 Miner $D<1$**；右栏「单级 S-N 判定」不参与综合通过判定。',
      '查看 Miner 表 n/Nf、占 D 比例、累积损伤 D、S-N 曲线（图用输入 $S_a$，非等效幅）。',
    ],
    principle:
      '疲劳破坏由交变应力引起。Basquin + Miner；专业 Goodman/Soderberg 与 $S_e\'=k_a k_b \\sigma_{-1}$。有 Miner 时 **综合通过判定 = $D<1$**；单级判定（$N\\ge N_{target}$ 且 $S_{a,eff}\\le S_e\'$）为右栏对照。完整 Miner 用原始 $S_a$ + $\\sigma_{-1}$；专业用 $S_{a,eff,i}$ + $S_e\'$——同谱 $D$ 可差数倍。',
    formulas: [
      { latex: 'S(N) = S_f\' \\cdot N^b \\quad (N < N_{ref})', note: '$N_{ref}$=cycleLimit；之后 $S=\\sigma_{-1}$' },
      { latex: 'N = \\left(\\frac{S_a}{S_f\'}\\right)^{1/b}', note: '$S_a \\le \\sigma_{-1}$ 时 $N=\\infty$' },
      { latex: 'D = \\sum_i \\frac{n_i}{N_{f,i}}', note: 'Miner；pass 要求 $D<1$' },
      { latex: 'S_{a,eff} = \\frac{S_a}{1 - S_m / \\sigma_u}', note: '专业 Goodman；$S_m\\ge\\sigma_u$ 时失效' },
      { latex: "\\sigma'_{-1} = k_a k_b \\sigma_{-1}", note: '专业修正持久极限' },
    ],
    notes: [
      '内置 5 种材料参数为近似，非你的锻件 S-N 曲线。',
      'Miner：完整用原始 Sa；专业各级 Goodman + Se′——同参可与完整 pass 相反。',
      '有载荷谱时综合通过判定 **仅看 Miner**；右栏单级 ✓/✗ 可与之相反（见帮助 FAQ）。',
      '简化通过判定恒为否；$S_a$ 下限为 $\\sigma_{-1}$，专业单级判 $S_e\'$ 时 $k_a k_b<1$ 常无法在 UI 下限下单级 ✓。',
      '专业模式可选 Goodman / Soderberg；Miner 假定恒定 $S_m$ 作用于谱中各级。',
      '无 $K_t$ 应力集中；轴/键疲劳请用对应工具 assessComponentFatigue。',
    ],
    example:
      '45 钢同谱：完整 $D\\approx0.27$ 通过，专业（$S_m=100$，$k_a k_b=0.765$）$D\\approx2.67$ 未通过——预期差异。单级：Sa=280（UI 最小）且 $S_e\'=70$ 时寿命够但 goodmanPass 仍 ✗。',
    standards: ['Basquin S-N', 'Miner 线性损伤（参考）', 'GB/T 3077（材料概念对照）'],
    related: ['gear', 'shaft', 'statistics'],
    keywords: ['疲劳', 'Miner', 'S-N', 'Goodman', 'Basquin', '单级判定'],
  },
  {
    id: 'gear',
    path: '/gear',
    groupId: 'chain',
    level: 'advanced',
    title: '齿轮强度',
    summary: '按计算模式切换校核路径：简化 Lewis、完整 ISO 6336、专业 ISO+AGMA 对照。',
    steps: [
      '选择计算模式：简化 = Lewis 估算；完整 = ISO 6336；专业 = ISO 与 AGMA 并排对照（无需另选标准标签）。',
      '输入模数、齿数、齿宽、功率/扭矩、转速与材料许用应力；完整/专业可调载荷系数与精度等级。',
      '查看接触/弯曲应力与安全系数；专业模式须 ISO 与 AGMA 四项子判定均通过（bothPass）才综合放行。',
    ],
    principle:
      '齿轮失效常见为点蚀（接触疲劳）与断齿（弯曲疲劳）。需分别校核齿面与齿根，并考虑载荷系数、动载与精度。模式即标准路径，不再单独切换 ISO/AGMA 页签。',
    formulas: [
      { latex: '\\sigma_H \\le \\sigma_{HP}', note: '接触应力不超过许用' },
      { latex: '\\sigma_F \\le \\sigma_{FP}', note: '齿根弯曲应力不超过许用' },
    ],
    notes: [
      '简化 Lewis 仅作数量级；正式方案用完整 ISO 或专业双标准对照。',
      '专业模式 AGMA 与 ISO 应力式不同，同参安全系数可差 10%～30%；bothPass 要求两套都过。',
      '精度等级与安装误差对动载影响大；润滑不良会显著降低接触疲劳寿命。',
    ],
    standards: ['ISO 6336', 'ISO 1328', 'AGMA 2101', 'GB/T 3480'],
    keywords: ['齿轮', '接触', '弯曲', 'Lewis', 'ISO6336', 'AGMA'],
  },
  {
    id: 'thread',
    path: '/thread',
    groupId: 'chain',
    level: 'beginner',
    title: '螺纹强度',
    summary: '校核螺纹牙的拉伸与剪切，并估算拧紧扭矩与轴向力关系。',
    steps: [
      '输入公称直径、螺距、旋合长度、材料许用应力与轴向载荷。',
      '查看牙底拉应力、剪切应力及安全裕度。',
      '需要时查看扭矩-预紧力换算结果。',
    ],
    principle: '外载由旋合螺纹牙分担。牙根截面受拉，牙侧面受剪；拧紧时扭矩一部分用于克服螺纹摩擦，一部分产生预紧力。',
    formulas: [
      { latex: '\\sigma_t = \\frac{F}{A_s}', note: '螺纹应力截面上的拉应力（简化）' },
    ],
    notes: ['旋合长度过短时牙剪切更危险。', '摩擦系数不确定时预紧力分散度很大。'],
    related: ['bolt-preload'],
    keywords: ['螺纹', '强度'],
  },
  {
    id: 'bolt-preload',
    path: '/bolt-preload',
    groupId: 'chain',
    level: 'intermediate',
    title: '螺栓预紧力',
    summary: '在预紧力与拧紧扭矩之间换算，并校核工作载荷下是否分离、螺栓应力是否超限。',
    steps: [
      '选择模式：由预紧力求扭矩，或由扭矩求预紧力。',
      '输入直径、螺距、性能等级、摩擦因数、夹紧长度与外载。',
      '查看预紧力、扭矩、工作应力与防分离结论。',
      '专业模式可进一步看嵌入、刚度分配等。',
    ],
    principle:
      '预紧使被连接件受压、螺栓受拉。外载到达后，螺栓力增量与被连接件卸载按刚度分配。预紧不足会分离；预紧过大则螺栓屈服或滑牙。',
    formulas: [
      { latex: 'T = F_M (0.16 p + 0.58 \\mu_G d_2 + 0.5 \\mu_K D_K)', note: '扭矩-预紧力近似（VDI 思路）' },
    ],
    notes: [
      'μ 取自手册或试验，润滑与表面处理影响极大。',
      '同一扭矩下预紧力可有 ±20% 以上分散，重要连接宜用更精确控制方法。',
    ],
    standards: ['VDI 2230（参考）'],
    related: ['bolt-group', 'thread', 'design-bolt-joint'],
    keywords: ['预紧', '扭矩', 'VDI'],
  },
  {
    id: 'bearing',
    path: '/bearing',
    groupId: 'chain',
    level: 'beginner',
    title: '轴承寿命',
    summary: '按 ISO 281 计算当量动载荷与 L10 寿命，支持 X/Y 查表、可靠性修正、预紧与双列安装。',
    steps: [
      '选择计算模式：简化（手填 X/Y）或完整（按系列自动查表）。',
      '输入 C、C0、Fr、Fa、转速与目标寿命。',
      '完整模式可选轴承系列/型号、工况 aISO、可靠度。',
      '需要时设置安装方式（单列 / DB / DF / DT）与轴向预紧 F0。',
      '查看当量载荷 P、寿命小时数、静载安全系数是否通过。',
    ],
    principle:
      '滚动轴承寿命与载荷呈幂次关系。当量动载荷把径向与轴向载荷合成一个与额定动载荷 C 可比的量。L10 表示 90% 可靠度下的基本额定寿命。',
    formulas: [
      { latex: 'P = X F_r + Y F_a', note: '当量动载荷' },
      { latex: 'L_{10} = (C/P)^\\varepsilon', note: '百万转寿命，球轴承 ε=3，滚子 ε=10/3' },
      { latex: 'L_{10h} = \\frac{10^6}{60 n} L_{10}', note: '小时寿命' },
    ],
    notes: [
      '预紧会增大有效轴向载荷，寿命通常下降，但刚度提高。',
      '串联 DT 按两套轴承计 C；背对背/面对面常对 Y 做配对修正。',
      '污染与高温会显著缩短寿命，专业模式用 aISO、温度系数体现。',
    ],
    standards: ['ISO 281:2007'],
    example: '电机轴：Fr=5000 N，Fa=1000 N，n=1500 rpm，C=35000 N，目标 10000 h。',
    related: ['shaft', 'design-powertrain'],
    keywords: ['轴承', 'L10', 'ISO281'],
  },

  // —— 传动与结构 ——
  {
    id: 'beam',
    path: '/beam',
    groupId: 'drive',
    level: 'beginner',
    title: '梁挠度',
    summary: '计算简支梁、悬臂梁在集中力或均布载荷下的最大挠度与弯矩，适合 FEA 前的手算估算。',
    steps: [
      '选择梁类型与载荷形式。',
      '输入跨度、载荷、截面惯性矩与弹性模量。',
      '查看最大挠度、弯矩，并与许用挠度比较。',
    ],
    principle: '材料力学中，梁的挠曲线由弯矩与 EI 决定。常见工况有现成公式，可用于快速判断刚度是否足够。',
    formulas: [
      { latex: '\\delta_{\\max} = \\frac{F L^3}{48 EI}', note: '简支梁跨中集中力' },
    ],
    notes: ['公式假设小变形、线弹性、忽略剪切变形（短粗梁需另计）。'],
    keywords: ['梁', '挠度'],
  },
  {
    id: 'sheet-metal',
    path: '/sheet-metal',
    groupId: 'drive',
    level: 'beginner',
    title: '钣金展开',
    summary: '用 K 因子或折弯扣除计算展开长度，便于下料。',
    steps: [
      '输入板厚、折弯半径、折弯角度与各直边长度。',
      '选择 K 因子或经验扣除方式。',
      '得到展开总长，用于激光切割或剪板下料。',
    ],
    principle: '折弯时中性层不在板厚正中，K 因子描述中性层位置，用于计算圆弧段展开长。',
    formulas: [
      { latex: 'BA = 2\\pi \\frac{A}{360}(R + K t)', note: '折弯余量（示意）' },
    ],
    notes: ['K 因子与材料、模具、工艺有关，重要零件应以试折为准。'],
    keywords: ['钣金', 'K因子', '展开'],
  },
  {
    id: 'o-ring',
    path: '/o-ring',
    groupId: 'drive',
    level: 'beginner',
    title: 'O 型圈密封',
    summary: '校核沟槽中的压缩率与填充率，判断密封是否过松或过挤。',
    steps: [
      '输入 O 型圈线径、内径与沟槽尺寸。',
      '查看压缩率、填充率是否在推荐范围。',
    ],
    principle: '靠弹性体压缩产生接触应力实现密封。压缩不足易泄漏，过大则装配困难并加速老化。',
    notes: ['介质、温度决定胶种；动态密封压缩率通常低于静态。'],
    keywords: ['O型圈', '密封'],
  },
  {
    id: 'shaft',
    path: '/shaft',
    groupId: 'drive',
    level: 'beginner',
    title: '轴强度',
    summary: '校核圆轴扭转强度，完整模式可做弯扭合成与安全系数判断。',
    steps: [
      '输入轴径、扭矩、材料屈服强度。',
      '完整模式补充弯矩等，查看合成应力与安全系数。',
      '不满足时增大轴径或换更高强度材料；可用决策面板反算最小轴径。',
    ],
    principle: '扭矩在圆轴截面产生剪应力，与直径三次方成反比。有弯矩时需按第三或第四强度理论合成。',
    formulas: [
      { latex: '\\tau = \\frac{16 T}{\\pi d^3}', note: '扭转剪应力' },
      { latex: 'S = \\frac{\\sigma_s / \\sqrt{3}}{\\tau}', note: '按剪切屈服估算安全系数（示意）' },
    ],
    notes: [
      '键槽、台阶处有应力集中，实际轴径常大于纯扭转计算值。',
      '单位：T 用 N·mm 或与工具一致的 N·m，勿混用。',
    ],
    related: ['key', 'bearing', 'design-powertrain'],
    keywords: ['轴', '扭转'],
  },
  {
    id: 'key',
    path: '/key',
    groupId: 'drive',
    level: 'beginner',
    title: '平键连接',
    summary: '校核平键侧面挤压与键的剪切强度。',
    steps: [
      '输入扭矩、轴径、键宽、键高、键长与许用挤压/剪应力。',
      '查看挤压应力与剪应力是否低于许用。',
      '不通过时可加长键或增大截面（按标准键系列）。',
    ],
    principle: '扭矩通过键的侧面挤压传到轮毂；键同时在宽度方向受剪。',
    formulas: [
      { latex: '\\sigma_p = \\frac{4T}{d h L}', note: '挤压应力（常用简化）' },
      { latex: '\\tau = \\frac{2T}{d b L}', note: '剪切应力（常用简化）' },
    ],
    notes: ['键长一般不超过 1.5d～2d，过长载荷不均匀。', '按 GB/T 1095 选标准 b×h。'],
    standards: ['GB/T 1095', 'GB/T 1096'],
    related: ['shaft'],
    keywords: ['平键', '挤压'],
  },
  {
    id: 'weld',
    path: '/weld',
    groupId: 'drive',
    level: 'beginner',
    title: '焊缝强度',
    summary: '对角焊缝等进行静强度校核，完整模式可对比多种规范简化结果。',
    steps: [
      '输入焊脚尺寸、焊缝长度、载荷与钢材牌号。',
      '查看计算应力与许用应力、是否通过。',
    ],
    principle: '角焊缝常按焊喉截面上的应力校核。载荷偏心时还需考虑弯矩引起的附加应力。',
    formulas: [
      { latex: '\\tau = \\frac{F}{0.7 h_f L}', note: '角焊缝剪应力简化（焊喉≈0.7hf）' },
    ],
    notes: ['实际焊缝质量受工艺与探伤等级影响，计算为名义强度。'],
    related: ['design-bolt-joint'],
    keywords: ['焊缝', '角焊'],
  },
  {
    id: 'bolt-group',
    path: '/bolt-group',
    groupId: 'drive',
    level: 'intermediate',
    title: '螺栓组',
    summary: '计算偏心载荷下各螺栓的受力，找出最危险螺栓并与许用比较。',
    steps: [
      '输入螺栓数量、分布圆半径、剪切力、弯矩/扭矩及单栓许用。',
      '若有预紧与摩擦抗剪，填写相应参数。',
      '查看各栓受力与最大受力是否超限。',
    ],
    principle:
      '螺栓组承受形心处的合力与力偶。剪切由各栓均分（或按摩擦），力偶按距形心距离分配，距形心最远的螺栓往往最危险。',
    formulas: [
      { latex: 'F_{iM} \\propto r_i', note: '力偶引起的螺栓力与半径成正比' },
    ],
    notes: ['布置应对称，减小偏心。', '摩擦型连接依赖预紧，滑移后转为承压型。'],
    related: ['bolt-preload'],
    keywords: ['螺栓组', '偏心'],
  },
  {
    id: 'spring',
    path: '/spring',
    groupId: 'drive',
    level: 'beginner',
    title: '弹簧设计',
    summary: '计算圆柱螺旋弹簧的刚度与切应力，判断是否满足载荷-变形要求。',
    steps: [
      '输入线径、中径、有效圈数、材料切变模量与载荷。',
      '查看弹簧刚度、变形量与切应力。',
    ],
    principle: '螺旋弹簧把轴向力转化为簧丝的扭转与剪切，刚度与线径四次方成正比、与中径三次方成反比。',
    formulas: [
      { latex: 'k = \\frac{G d^4}{8 D^3 n}', note: '圆柱螺旋压缩/拉伸弹簧刚度' },
    ],
    notes: ['需校核压并高度与疲劳（交变载荷时）。'],
    keywords: ['弹簧', '刚度'],
  },
  {
    id: 'clutch',
    path: '/clutch',
    groupId: 'drive',
    level: 'beginner',
    title: '离合器',
    summary: '估算摩擦离合器可传递的扭矩。',
    steps: [
      '输入摩擦面尺寸、数量、压紧力与摩擦系数。',
      '查看可传扭矩是否大于工作扭矩。',
    ],
    principle: '靠摩擦面压力产生摩擦力矩。多片可提高扭矩容量。',
    formulas: [
      { latex: 'T = n \\mu F R_m', note: '摩擦扭矩示意，Rm 为当量摩擦半径' },
    ],
    notes: ['μ 受温度与磨损影响，设计需留裕度。'],
    keywords: ['离合器', '摩擦'],
  },
  {
    id: 'belt',
    path: '/belt',
    groupId: 'drive',
    level: 'beginner',
    title: '皮带传动',
    summary: '计算带长、包角、速度与所需根数等基本参数。',
    steps: [
      '输入两轮直径、中心距、功率与转速。',
      '查看带长、包角、带速与是否超限。',
    ],
    principle: '皮带靠摩擦传动，小轮包角过小易打滑；带速过高离心力降低有效压紧。',
    notes: ['开口传动与交叉传动带长公式不同，按页面选项选择。'],
    keywords: ['皮带', '带传动'],
  },
  {
    id: 'chain',
    path: '/chain',
    groupId: 'drive',
    level: 'beginner',
    title: '链传动',
    summary: '计算链节数、中心距与链张力等。',
    steps: [
      '输入齿数、节距、功率与转速。',
      '查看链速、张力与推荐中心距。',
    ],
    principle: '链传动为啮合传动，平均传动比准确，但多边形效应引起速度波动。',
    notes: ['润滑与垂度影响寿命与噪声。'],
    keywords: ['链传动', '节距'],
  },
  {
    id: 'worm-gear',
    path: '/worm-gear',
    groupId: 'drive',
    level: 'intermediate',
    title: '蜗轮蜗杆',
    summary: '教材级传动比、滑动效率与输出扭矩；含简化/完整/专业三档。非正式 ISO 14521 全系数校核。',
    steps: [
      '输入模数、头数、齿数、直径系数 q、摩擦与载荷。',
      '查看 i、γ、η、T₂；完整/专业模式下对照粗强度。',
    ],
    principle: '交错轴滑动啮合；效率主要取决于导程角与摩擦系数。',
    formulas: [
      { latex: 'i = z_2/z_1', note: '传动比' },
      { latex: '\\tan\\gamma = z_1/q', note: '导程角' },
      { latex: '\\eta = \\dfrac{\\tan\\gamma}{\\tan(\\gamma+\\rho)}', note: '蜗杆驱动效率' },
      { latex: 'T_2 = T_1 i \\eta', note: '输出扭矩' },
    ],
    notes: ['γ≤ρ 时可能自锁（提示）。青铜蜗轮可参考材料库锡青铜。'],
    keywords: ['蜗轮', '蜗杆', '效率'],
    related: ['bevel-gear', 'gear', 'shaft', 'bearing'],
  },
  {
    id: 'bevel-gear',
    path: '/bevel-gear',
    groupId: 'drive',
    level: 'intermediate',
    title: '锥齿轮',
    summary: 'Σ=90° 直齿锥齿轮节锥角、力分解与粗强度；非正式 ISO 10300。',
    steps: [
      '输入模数、齿数、扭矩/转速。',
      '查看 δ、R、Ft/Fr/Fa；完整/专业模式对照弯曲与接触。',
    ],
    principle: '正交锥齿轮；力在平均分度圆上分解，强度用当量直齿粗估。',
    formulas: [
      { latex: '\\tan\\delta_1=z_1/z_2', note: '小轮节锥角' },
      { latex: 'R=\\dfrac{m}{2}\\sqrt{z_1^2+z_2^2}', note: '外锥距' },
      { latex: 'F_r=F_t\\tan\\alpha\\cos\\delta,\\ F_a=F_t\\tan\\alpha\\sin\\delta', note: '力分解' },
    ],
    notes: ['当前仅支持轴交角 90°；正式设计按 ISO 10300 / 厂家软件。'],
    keywords: ['锥齿轮', '伞齿轮', 'bevel'],
    related: ['gear', 'worm-gear', 'shaft', 'bearing', 'key'],
  },
  {
    id: 'pipe-flow',
    path: '/pipe-flow',
    groupId: 'drive',
    level: 'intermediate',
    title: '管路压降',
    summary: 'Darcy-Weisbach 沿程压降、局部损失与流速/压降限值校核。',
    steps: [
      '选择流体预设并输入管径、管长、流量与粗糙度。',
      '完整模式叠加局部损失 K，对照 Hazen-Williams。',
      '专业模式校核最大流速与允许压降。',
    ],
    principle: 'ΔP = f(L/D)(ρv²/2)；湍流 f 常用 Swamee-Jain 近似 Colebrook。',
    formulas: [
      { latex: '\\Delta P = f \\cdot \\frac{L}{D} \\cdot \\frac{\\rho v^2}{2}', note: 'Darcy-Weisbach' },
    ],
    notes: ['单直管段估算；未含完整配件库与可压缩详细模型。'],
    keywords: ['压降', '管路', 'Darcy'],
  },
  {
    id: 'plate-buckling',
    path: '/plate-buckling',
    groupId: 'drive',
    level: 'intermediate',
    title: '薄板屈曲',
    summary: '矩形薄板弹性临界应力、缺陷折减与安全系数判定。',
    steps: [
      '选择边界条件并输入板厚、宽、长与工作应力。',
      '完整模式考虑横向应力与缺陷系数。',
      '专业模式可校核面内剪切并估算后屈曲承载。',
    ],
    principle: 'σ_cr = k π²E / [12(1−ν²)] (t/b)²；k 取边界表值。',
    formulas: [
      { latex: '\\sigma_{cr} = k \\cdot \\frac{\\pi^2 E}{12(1-\\nu^2)}\\left(\\frac{t}{b}\\right)^2', note: '薄板弹性屈曲' },
    ],
    notes: ['默认要求 SF≥2；板长 a 不细分半波数。'],
    keywords: ['屈曲', '薄板'],
  },
  {
    id: 'column-buckling',
    path: '/column-buckling',
    groupId: 'drive',
    level: 'intermediate',
    title: '柱屈曲',
    summary: '压杆欧拉临界载荷、长细比与 Rankine 中长柱修正。',
    steps: [
      '选择端部约束与截面，输入长度与轴向力。',
      '完整模式输入屈服强度，按长细比切换 Rankine。',
      '专业模式可计入偏心放大应力。',
    ],
    principle: 'P_e = π²EI/(μL)²；λ=μL/i；中长柱用 Rankine。',
    formulas: [
      { latex: 'P_e = \\frac{\\pi^2 E I}{(\\mu L)^2}', note: '欧拉临界载荷' },
      { latex: '\\lambda = \\mu L / i', note: '长细比' },
    ],
    notes: ['简化模式仅欧拉估算；正式设计请核对端部约束与缺陷。'],
    keywords: ['柱屈曲', '压杆', '欧拉'],
    related: ['plate-buckling', 'beam'],
  },
  {
    id: 'pin-retainer',
    path: '/pin-retainer',
    groupId: 'drive',
    level: 'beginner',
    title: '销 / 挡圈',
    summary: '圆柱销剪切挤压与轴用弹性挡圈轴向力简化校核。',
    steps: [
      '选择销或挡圈页签并输入载荷与几何。',
      '完整模式调整许用应力与安全系数。',
      '专业：销孔 Kt；挡圈转速折减。',
    ],
    principle: '销：τ=4F/(nπd²)，σ_b=F/(d t)；挡圈：环剪与沟槽承压简化。',
    formulas: [
      { latex: '\\tau = \\frac{4F}{n\\pi d^2}', note: '销剪切' },
      { latex: '\\tau \\approx F/(\\pi d s)', note: '挡圈环剪（简化）' },
    ],
    notes: ['挡圈公式为工程简化，正式选型以厂家样本为准。'],
    keywords: ['销', '挡圈', '卡簧'],
    related: ['key', 'shaft'],
  },
  {
    id: 'gasket-flange',
    path: '/gasket-flange',
    groupId: 'drive',
    level: 'intermediate',
    title: '垫片法兰密封',
    summary: '垫片坐落比压与工况密封比压简化校核，可挂法兰密封设计链。',
    steps: [
      '选择垫片材料（带入 m、y）并输入 Di、Do、压力与螺栓预紧。',
      '完整模式校核坐落/工况/总预紧容量。',
      '专业模式增加安全系数与螺栓数均匀性提示。',
    ],
    principle: 'σ_seat = nF₀/Ag ≥ y；σ_op = (nF₀ − pAi)/Ag ≥ m·p。',
    formulas: [
      { latex: 'A_g = \\frac{\\pi}{4}(D_o^2-D_i^2)', note: '垫片面积' },
      { latex: '\\sigma_{op}=(n F_0-p A_i)/A_g \\ge m p', note: '工况密封比压' },
    ],
    notes: ['m、y 为简化表值；正式设计按垫片厂家与法兰标准。'],
    keywords: ['垫片', '法兰', '密封', '比压'],
    related: ['bolt-preload', 'bolt-group', 'o-ring'],
  },
  {
    id: 'modal-freq',
    path: '/modal-freq',
    groupId: 'drive',
    level: 'intermediate',
    title: '固有频率',
    summary: 'SDOF/梁一阶固有频率、共振裕度与位移传递率。',
    steps: [
      '选择模型（SDOF / 简支梁 / 悬臂梁）并输入参数。',
      '填写激励频率或转速查看共振裕度。',
      '专业模式输入阻尼比查看传递率 H(r)。',
    ],
    principle: '梁 fn 由 EI、ρA、跨度与边界决定；裕度 M=|f_n−f_exc|/f_n。',
    formulas: [
      { latex: 'f_n = \\frac{\\pi}{2L^2}\\sqrt{\\frac{EI}{\\rho A}}', note: '简支梁一阶' },
    ],
    notes: ['一阶近似前置验算，不能替代完整模态分析。'],
    keywords: ['固有频率', '模态', '共振'],
  },

  // —— 材料与工艺 ——
  {
    id: 'material-selection',
    path: '/material-selection',
    groupId: 'material',
    level: 'beginner',
    title: '材料选型',
    summary: '按强度、密度、成本等指标对候选材料打分排序。',
    steps: [
      '设定各指标权重（强度、成本、重量等）。',
      '从库中选择候选材料或输入性能。',
      '查看综合得分，选出候选再做详细校核。',
    ],
    principle: '材料选择是多目标决策：用加权评分把不同量纲指标归一后比较。',
    notes: ['评分不能替代强度校核与工艺可行性评估。'],
    related: ['materials'],
    keywords: ['材料选型'],
  },
  {
    id: 'heat-treatment',
    path: '/heat-treatment',
    groupId: 'material',
    level: 'intermediate',
    title: '热处理硬度',
    summary: '估算淬透性（Jominy）、碳当量与回火后硬度等工艺相关指标。',
    steps: [
      '输入成分或选择钢种相关参数。',
      '查看淬硬层深度趋势、碳当量焊接性提示、回火硬度估算。',
    ],
    principle: '淬透性描述淬火后硬化深度；碳当量高则焊接冷裂风险增加；回火降低硬度、提高韧性。',
    notes: ['实际热处理曲线以工艺试验与标准图谱为准。'],
    keywords: ['热处理', 'Jominy', '回火'],
  },
  {
    id: 'manufacturing',
    path: '/manufacturing',
    groupId: 'material',
    level: 'beginner',
    title: '制造工艺',
    summary: '机加工余量、铸造拔模、切削参数、粗糙度配合与注塑 DFM 速查。',
    steps: [
      '选择工艺类型（余量 / 拔模 / 切削 / 粗糙度 / 注塑）。',
      '输入零件尺寸、材料与工艺参数。',
      '查看建议余量、功率、速查表或 DFM 清单。',
    ],
    principle: '毛坯需留加工余量；铸件需拔模；切削力与功率由 kc·ap·f 估算；注塑几何须满足壁厚与拔模经验。',
    notes: ['余量过大浪费工时；切削与 DFM 为教材级估算，非正式工艺规范。'],
    keywords: ['余量', '拔模', '切削', '粗糙度', '注塑'],
    related: ['standards-ref', 'materials', 'heat-treatment'],
  },
  {
    id: 'vibration-isolation',
    path: '/vibration-isolation',
    groupId: 'drive',
    level: 'intermediate',
    title: '隔振传递率',
    summary: '单自由度隔振：固有频率、频率比、传递率 TR 与隔振区校核。',
    steps: [
      '输入质量、刚度、阻尼比与激励频率。',
      '完整模式校核 r>√2 与目标 TR；专业模式再校核隔振 dB。',
    ],
    principle: '力/位移传递率取决于频率比 r=f/fn 与阻尼比 ζ；通常要求 r>√2 才进入隔振区。',
    formulas: [
      { latex: 'f_n=\\dfrac{1}{2\\pi}\\sqrt{k/m}', note: '固有频率' },
      { latex: 'TR=\\dfrac{\\sqrt{1+(2\\zeta r)^2}}{\\sqrt{(1-r^2)^2+(2\\zeta r)^2}}', note: '传递率' },
    ],
    notes: ['单自由度理想模型；未含多点支撑耦合与非线性隔振器。'],
    keywords: ['隔振', '传递率', '减振'],
    related: ['modal-freq', 'spring'],
  },
  {
    id: 'heat-transfer',
    path: '/heat-transfer',
    groupId: 'drive',
    level: 'beginner',
    title: '简单换热',
    summary: '导热、对流与串联热阻的传热量与温升粗算。',
    steps: [
      '选择导热 / 对流 / 串联模式并输入几何与温差。',
      '完整模式校核散热容量；专业模式再校核等效表面温升。',
    ],
    principle: '稳态一维：导热 Q=kAΔT/L，对流 Q=hAΔT，串联热阻相加。',
    formulas: [
      { latex: 'Q=k A \\Delta T / L', note: '导热' },
      { latex: 'Q=h A \\Delta T', note: '对流' },
      { latex: 'R_{\\mathrm{th}}=L/(kA)\\ \\mathrm{or}\\ 1/(hA)', note: '热阻' },
    ],
    notes: ['忽略辐射与瞬态；正式热设计需仿真或实测。'],
    keywords: ['换热', '导热', '对流'],
    related: ['thermal-expansion', 'materials'],
  },
  {
    id: 'standards-ref',
    path: '/standards-ref',
    groupId: 'material',
    level: 'beginner',
    title: '标准件速查',
    summary: '平键截面、销直径/配合、O 型圈截面与轴用挡圈沟槽速查。',
    steps: [
      '选择键 / 销挡圈 / O 圈 Tab。',
      '按轴径或直径查表，再跳转对应强度/密封计算页。',
    ],
    principle: '常用规格速查，便于选型后进入专项校核。',
    notes: ['非正式完整国标全文；键槽公差、AS568 件号以正式标准与样本为准。'],
    keywords: ['键槽', '销', 'O型圈', '挡圈', '标准件'],
    related: ['key', 'pin-retainer', 'o-ring'],
  },
  {
    id: 'gdt-symbols',
    path: '/gdt-symbols',
    groupId: 'chain',
    level: 'beginner',
    title: '形位公差符号图解',
    summary: 'ASME Y14.5 / ISO 1101 常用形位公差符号、材料状态修饰符与特征控制框示意。',
    steps: [
      '在「公差符号」Tab 按形状 / 轮廓 / 方向 / 位置 / 跳动浏览。',
      '「修饰符」查看 MMC/LMC/RFS 等；「公差框」对照特征控制框结构。',
      '需要叠加分析时跳转 GD&T 公差栈或尺寸链编辑器。',
    ],
    principle: '形位公差在特征控制框中表达几何要求；材料状态修饰符影响公差带有效尺寸。',
    notes: ['教学图解，非正式标准全文；制图与验收以现行标准与企业规范为准。'],
    keywords: ['GD&T', '形位公差', '符号', 'MMC', '基准', 'Y14.5'],
    related: ['gdt-stack', 'fit', 'editor'],
  },
  {
    id: 'cylinder',
    path: '/cylinder',
    groupId: 'material',
    level: 'beginner',
    title: '液压/气动缸',
    summary: '计算液压缸/气动缸推力、速度与所需流量。',
    steps: [
      '选择液压或气动 Tab，输入缸径、杆径、工作压力与流量（或速度）。',
      '查看无杆腔/有杆腔推力与速度；气动可调效率。',
    ],
    principle: '推力来自压力作用于活塞有效面积；速度由流量与面积决定；气动需计效率。',
    formulas: [
      { latex: 'F = p A', note: '理论推力（未计效率）' },
      { latex: 'v = Q / A', note: '速度与流量关系（注意单位换算）' },
    ],
    notes: ['可用 /cylinder?tab=pneumatic 直达气动 Tab。'],
    keywords: ['液压', '气缸', '气动', '推力'],
    related: ['column-buckling', 'pin-retainer', 'materials'],
  },
  {
    id: 'materials',
    path: '/materials',
    groupId: 'material',
    level: 'beginner',
    title: '材料库',
    summary: '查阅常用工程材料的强度、弹性模量等性能数据，供其他计算引用。',
    steps: [
      '搜索或浏览材料列表。',
      '查看屈服强度、抗拉、弹性模量等。',
      '将数值填入轴、螺栓、梁等工具。',
    ],
    principle: '材料库提供典型手册值，便于教学与初算；牌号与热处理状态不同时性能差异很大。',
    notes: ['以供应商质保书或国家标准为准，库内数据为典型值。'],
    related: ['material-selection', 'shaft'],
    keywords: ['材料库', '强度'],
  },

  // —— 统计与质量 ——
  {
    id: 'statistics',
    path: '/statistics',
    groupId: 'stat',
    level: 'beginner',
    title: '概率统计工具',
    summary: '公差与标准差换算、RSS 叠加、西格玛/Cpk 与分布曲线，帮助理解尺寸链的统计含义。',
    steps: [
      '在统计页选择子工具：公差转换、RSS、西格玛或分布图。',
      '输入公差或 σ、组成环公差列表等。',
      '解读 Cpk、合格率与分布是否居中。',
    ],
    principle:
      '若尺寸服从正态分布，公差带常按 ±3σ 或 ±nσ 理解。Cpk 同时反映波动与偏移；RSS 则是多环公差的统计合成。',
    formulas: [
      { latex: 'C_{pk} = \\min\\!\\left(\\frac{USL-\\mu}{3\\sigma},\\frac{\\mu-LSL}{3\\sigma}\\right)', note: '过程能力指数' },
    ],
    notes: ['统计结论依赖正态与独立假设，小批量时要谨慎。'],
    related: ['editor', 'monte-carlo'],
    keywords: ['Cpk', 'RSS', '西格玛'],
  },
  {
    id: 'monte-carlo',
    path: '/monte-carlo',
    groupId: 'stat',
    level: 'intermediate',
    title: 'Monte Carlo 模拟',
    summary: '对尺寸链做随机抽样模拟，估计合格率与敏感因子（龙卷风图）。',
    steps: [
      '从编辑器导入链，或手动输入各环公差与分布。',
      '设置抽样次数，运行模拟。',
      '查看合格率、分布直方图与敏感度排序。',
    ],
    principle:
      '对每个组成环按设定分布随机取值，计算封闭环，重复成千上万次得到统计分布。比 RSS 更能处理非正态与非线性。',
    notes: [
      '抽样次数太少结果不稳定。',
      '输入分布若与真实工艺不符，模拟再精确也无意义。',
    ],
    related: ['editor', 'statistics'],
    keywords: ['蒙特卡洛', '模拟'],
  },
  {
    id: 'quality',
    path: '/quality',
    groupId: 'stat',
    level: 'intermediate',
    title: 'MSA / SPC / FMEA',
    summary: '测量系统分析、控制图与失效模式分析等质量管理工具入口。',
    steps: [
      '选择 MSA、SPC 或 FMEA 子模块。',
      '按表单输入重复性/再现性数据或控制图样本。',
      '解读 %GRR、控制限或 RPN。',
    ],
    principle: 'MSA 评估测量误差是否可接受；SPC 监控过程是否受控；FMEA 系统识别失效风险并优先改进。',
    notes: ['质量工具服务于过程改进，需结合现场数据，不能只靠一次计算。'],
    keywords: ['MSA', 'SPC', 'FMEA'],
  },
  {
    id: 'analytics',
    path: '/analytics',
    groupId: 'stat',
    level: 'advanced',
    title: '回归 / DOE / RSM',
    summary: '拟合回归模型、正交试验设计与响应面，用于工艺参数寻优。',
    steps: [
      '准备因子与响应数据。',
      '选择回归、正交表或响应面方法。',
      '查看拟合优度、主效应与最优方向。',
    ],
    principle: 'DOE 用较少试验估计因子效应；回归与响应面把试验数据变成可预测的近似模型。',
    notes: ['模型只在试验域内可靠，外推需谨慎。'],
    keywords: ['DOE', '回归', '响应面'],
  },
]

const COMMON_HELP_DETAILS = {
  useCases: [
    '当你已经有一组初步尺寸、载荷或材料参数，需要判断“是否够用”时使用。',
    '当你想比较多个方案，或想知道哪个参数最影响结果时，配合页面底部「决策工具」使用。',
  ],
  inputs: [
    {
      name: '设计目标',
      meaning: '需要满足的寿命、间隙、安全系数、许用应力或合格率。',
      source: '来自图纸、客户需求、企业设计规范或课程题目条件。',
    },
    {
      name: '几何尺寸',
      meaning: '直接决定截面积、惯性矩、力臂、接触面积或尺寸链叠加关系。',
      source: '来自草图、CAD、标准件样本或初步选型；先统一单位再填入。',
    },
    {
      name: '载荷与工况',
      meaning: '计算的驱动力。载荷越接近真实工况，结果越有参考价值。',
      source: '来自受力分析、设备功率/扭矩、测试数据或上游计算；不确定时取最不利值。',
    },
    {
      name: '材料/许用值',
      meaning: '决定强度、刚度或寿命判据，是“结果是否通过”的基准。',
      source: '来自材料牌号、热处理状态、标准手册、供应商数据或企业许用应力表。',
    },
  ],
  outputs: [
    {
      name: '通过 / 不通过',
      meaning: '工具把计算值与目标值或许用值比较后给出的初步判定。',
      judgement: '通过表示当前模型和输入下满足判据；不通过表示至少一个关键指标不足。',
    },
    {
      name: '关键指标',
      meaning: '如总公差、寿命小时数、应力、安全系数、合格率等，是判断结果的主要依据。',
      judgement: '先看关键指标是否越界，再看离边界有多少裕度。',
    },
    {
      name: '建议与敏感度',
      meaning: '用于判断下一步该改哪个参数，而不是盲目加大所有尺寸。',
      judgement: '敏感度大的参数优先复核输入来源，也优先作为优化对象。',
    },
  ],
  reliability: [
    '计算结果来自明确公式、标准简化或工程经验模型，不是 AI 文本猜测；页面上的公式和关键指标就是判定依据。',
    '可靠性取决于输入是否真实、单位是否一致、模型是否适用于当前结构。模型外的失效模式需要另外校核。',
    '正式工程发布前应按企业流程复核：图纸尺寸、材料批次、载荷谱、标准版本、工艺能力和安全系数。',
  ],
  beginnerTips: [
    '先用默认示例跑通，理解每个输入会让结果变大还是变小，再换成自己的数据。',
    '优先关注红色/绿色判定、关键指标和单位；不要只看最后一个数字。',
    '不确定某个参数时，不要随便填 0；先查手册、样本或用保守值。',
  ],
  professionalChecks: [
    '确认标准版本、失效模式和安全系数是否符合项目要求。',
    '检查边界条件：载荷方向、约束方式、材料状态、温度、润滑、制造误差等。',
    '对安全关键件，建议用手算抽查、有限元、试验或企业计算书复核。',
  ],
}

const DETAIL_OVERRIDES = {
  'getting-started': {
    useCases: [
      '第一次使用 MechBox，想知道从哪里开始。',
      '课程作业、毕业设计或方案初算，需要一套可解释的计算流程。',
      '工程师想快速判断一个方案是否值得继续细化。',
    ],
    inputs: [
      {
        name: '目标',
        meaning: '先写清楚你要保证什么：寿命、间隙、强度、安全系数还是合格率。',
        source: '图纸技术要求、设计任务书、客户规范、课程题目。',
      },
      {
        name: '模型选择',
        meaning: '选择最接近问题本质的工具，例如装配间隙用尺寸链，转轴承载用轴强度，滚动支承用轴承寿命。',
        source: '看帮助页的“什么时候用”；不确定时从设计链开始。',
      },
      {
        name: '输入数据',
        meaning: '包括尺寸、载荷、材料、工况。输入不可靠时，结果也不可靠。',
        source: 'CAD、手册、样本、测试、上游计算。',
      },
    ],
    outputs: [
      {
        name: '结果判定',
        meaning: '先看是否通过，再看哪个指标最接近边界。',
        judgement: '边界附近的方案不建议直接放行，应增加裕度或复核模型。',
      },
      {
        name: '公式和假设',
        meaning: '帮助你知道工具为什么这样算。',
        judgement: '公式适用条件不满足时，结果只能做参考，不能当最终结论。',
      },
    ],
    reliability: [
      'MechBox 的定位是“可解释的工程初算平台”：每个结果都对应公式、标准简化或明确的工程模型。',
      '它适合方案筛选、教学理解、设计早期校核；不替代完整标准计算书、试验验证或企业签审。',
    ],
  },
  'decision-tools': {
    useCases: [
      '你已经有一个计算结果，但想比较多个设计方案。',
      '你知道目标（例如寿命 ≥ 10000 h），但不知道某个输入至少要多大。',
      '你想找出最影响结果的参数，优先改对地方。',
    ],
    inputs: [
      {
        name: '基准表单',
        meaning: '当前工具页面上方已经填好的参数，作为方案对比、反算、敏感度的起点。',
        source: '先完成主工具计算，再打开决策工具。',
      },
      {
        name: '追踪指标',
        meaning: '你关心的输出，例如寿命、总公差、应力或安全系数。',
        source: '从下拉框选择；通常选最影响是否通过的指标。',
      },
      {
        name: '扰动幅度',
        meaning: '敏感度分析中每个输入上下变化的百分比。',
        source: '入门先用 ±10%；工艺波动大时可试 ±20% 或 ±30%。',
      },
    ],
    outputs: [
      {
        name: '方案表',
        meaning: '记录多个方案的关键指标，避免只凭印象判断好坏。',
        judgement: '同等通过时，优先选裕度足、成本低、制造更容易的方案。',
      },
      {
        name: '反算解',
        meaning: '满足目标的临界输入值。',
        judgement: '应用前必须圆整到标准规格，例如标准轴径、键长、轴承型号。',
      },
      {
        name: '敏感度条形图',
        meaning: '显示每个参数扰动后结果变化有多大。',
        judgement: '条越长，说明这个参数越值得优先控制或复核。',
      },
    ],
  },
  editor: {
    useCases: [
      '分析装配间隙、叠加公差、位置度/平面度等是否满足图纸要求。',
      '比较极值法与 RSS 的差异，判断公差是否过紧或过松。',
      '找出贡献最大的组成环，指导公差收紧或制造控制。',
    ],
    inputs: [
      {
        name: '封闭环',
        meaning: '最终要保证的结果，例如间隙、总长度、位置误差或平面度误差。',
        source: '图纸功能尺寸、装配要求或 GD&T 框格要求。',
      },
      {
        name: '组成环',
        meaning: '参与叠加的零件尺寸或形位误差。每个环都要有公称值和公差。',
        source: '零件图、公差表、测量数据；ES/EI 用上/下偏差填写。',
      },
      {
        name: '增环 / 减环 / 方向',
        meaning: '决定该环变大时封闭环是变大还是变小。',
        source: '画尺寸链草图，沿封闭环方向判断；工具会按方向辅助判断。',
      },
      {
        name: '传递系数 k',
        meaning: '组成环变化 1 单位时，封闭环变化的倍率。',
        source: '普通 1D 尺寸通常为 1；杠杆、角度、投影关系需由几何关系推导。',
      },
      {
        name: 'FOS 与尺寸公差',
        meaning: 'GD&T 下的孔/轴尺寸要素，用于 MMC/LMC 自动奖励公差。',
        source: '来自图纸尺寸要素及其尺寸公差；可由 ES/EI 自动同步。',
      },
    ],
    outputs: [
      {
        name: '总公差',
        meaning: '所有组成环按所选方法叠加后的封闭环波动范围。',
        judgement: '总公差必须小于封闭环允许范围，才有机会通过。',
      },
      {
        name: '上限 / 下限',
        meaning: '封闭环预测的最小与最大结果。',
        judgement: '必须落在目标 min/max 内；若极值法失败、RSS 通过，要看风险等级。',
      },
      {
        name: '贡献度',
        meaning: '每个环对总波动的占比。',
        judgement: '贡献度最大的环是首要优化对象。',
      },
      {
        name: 'Cpk / 合格率',
        meaning: '统计假设下过程能力的估计。',
        judgement: '依赖正态、独立、过程中心等假设；不等于真实批量合格率。',
      },
    ],
    reliability: [
      '极值法是保守的最坏情况模型，适合安全关键件和法规要求强的场景。',
      'RSS 假设各环独立随机，适合稳定批量生产；若环之间相关或过程偏移，需用 Monte Carlo 或实测数据复核。',
      'GD&T 自动奖励按 FOS 尺寸公差估计，适合早期判断；正式检测仍应按实际尺寸偏离和检具规则计算。',
    ],
    beginnerTips: [
      '先只做 1D 间隙链：封闭环填目标间隙，组成环填零件尺寸，再看上下限是否落入目标。',
      '不懂增减环时，把某个尺寸“想象变大”，看间隙是变大还是变小。',
      '先看极值法，再看 RSS；两者差很多时，说明统计假设很重要。',
    ],
    professionalChecks: [
      '复核尺寸链是否闭合，是否遗漏热变形、形位误差、装配变形或基准转换误差。',
      '确认 RSS 的独立性、分布、过程能力和中心偏移是否有数据支撑。',
      '对 GD&T 链，确认基准顺序、材料条件、FOS 定义和奖励公差来源。',
    ],
  },
  batch: {
    useCases: [
      '质量工程师对供应商或内部多方案公差列表做一次性 RSS/极值合格判定。',
      '公差分配或 Monte Carlo 之后，批量复核多组 ring 公差是否落在同一封闭环目标内。',
      '对比不同零件组合的公差宽度与方法风险（极值/RSS 公差比）。',
    ],
    inputs: [
      {
        name: '封闭环 min / max',
        meaning: '允许的合成尺寸区间上下限 (mm)；判定用 $L\\ge\\min$ 且 $U\\le\\max$。',
        source: '功能尺寸要求、编辑器步骤 2 封闭环目标；勿与「总公差预算」混淆。',
      },
      {
        name: '公差列表 Tᵢ',
        meaning: '每行一组组成环全宽公差 (mm)，逗号分隔；可选传递系数列，默认 1。',
        source: '图纸公差、分配工具输出、编辑器组成环表。',
      },
    ],
    outputs: [
      {
        name: 'RSS / 极值公差宽度',
        meaning: '$T_{\\mathrm{rss}}$、$T_{\\mathrm{worst}}$ 及对应合成区间。',
        judgement: '宽度小不等于合格——须看区间是否落在 min/max 内。',
      },
      {
        name: 'RSS / 极值合格',
        meaning: '两种方法独立 pass/fail。',
        judgement: 'RSS 过而极值不过时，安全件不可仅凭 RSS 放行。',
      },
      {
        name: '方法风险提示',
        meaning: '极值/RSS 公差比、RSS✓极值✗ 等标签。',
        judgement: 'critical 级提示须人工复核；非计算错误。',
      },
      {
        name: '摘要统计',
        meaning: '总方案数、RSS 合格、极值合格、不合格、RSS过/极值不过。',
        judgement: '「RSS过/极值不过」计数 >0 时应优先审查对应行。',
      },
    ],
    reliability: [
      'RSS/极值公式与尺寸链编辑器、公差分配验算使用同一套 $T_{\\mathrm{rss}}$、$T_{\\mathrm{worst}}$ 定义。',
      '建模假设：零名义、全增环、对称公差——与真实有减环或偏置公差的链可能不一致，复杂链应回编辑器。',
      '默认 min=0 时，RSS 合成下界常含负值，可能导致与「公差预算」直觉不符的全批未通过。',
    ],
    beginnerTips: [
      '先用编辑器跑通一条链，确认 min/max 含义，再批量粘贴公差列表。',
      '看到「RSS过/极值不过」时，读摘要区方法论说明，不要只改公差重跑。',
      '示例数据若全失败，先检查封闭环 min/max 是否设对。',
    ],
    professionalChecks: [
      '安全关键件以极值法通过为保守底线；RSS 通过不足以单独签字。',
      '极值/RSS 比 $\\ge 2$ 时考虑 Monte Carlo 或实测 Cpk 辅助决策。',
      '导出 CSV 前确认单位均为 mm，与编辑器一致。',
    ],
  },
  allocation: {
    useCases: [
      '封闭环 RSS 总公差已给定（来自功能要求或上级分配），需要分解到各零件图样。',
      '比较等贡献、最小成本、灵敏度等多种策略，在可制造性与 RSS 利用率间权衡。',
      '为多方案选型：多方法对比表 + Pareto 前沿，辅助质量/成本联合决策。',
    ],
    inputs: [
      {
        name: '目标 RSS 公差 T₀',
        meaning: '封闭环允许的总 RSS 公差带宽，是本工具的核心预算。',
        source: '功能尺寸要求、上级尺寸链计算结果、或设计任务书给定的总公差。',
      },
      {
        name: '传递系数 fᵢ',
        meaning: '组成环变化 1 单位时封闭环变化的倍率；进入 RSS 公式 $(T_i f_i)^2$。',
        source: '1D 链通常为 1；杠杆、投影、角度关系需由几何推导。',
      },
      {
        name: '名义尺寸 nᵢ',
        meaning: '用于比例分配；也参与遗传/Pareto 成本模型 $c_i n_i/T_i$。',
        source: '零件图公称尺寸；比例法按 $n_i/\\sum n_j$ 权重分配。',
      },
      {
        name: '成本系数 cᵢ',
        meaning: '加工难度/成本权重；越大表示该环越难做，最小成本法倾向分配更小公差。',
        source: '工艺评估、历史加工数据或企业成本模型；默认 1 表示同等成本。',
      },
      {
        name: '灵敏度 sᵢ',
        meaning: '灵敏度 RSS 与迭代灵敏度法的权重；越大分配公差越大。',
        source: 'Monte Carlo 敏感度、解析偏导或工程经验；默认 1。',
      },
    ],
    outputs: [
      {
        name: '分配公差 Tᵢ',
        meaning: '各组成环建议的全宽公差（mm）。',
        judgement: '须圆整到标准公差档后再验算；$f_i$ 大者应分得较小 $T_i$（等贡献法）。',
      },
      {
        name: '± 半公差',
        meaning: '对称公差带 $\\pm T_i/2$，便于写入 ES/EI。',
        judgement: '仅表示制造带宽，不参与 RSS 叠加；写入图纸时核对方向与基准。',
      },
      {
        name: 'RSS 验算',
        meaning: '$T_{\\mathrm{stack}}=\\sqrt{\\sum(T_i f_i)^2}$，检验分配是否满足预算。',
        judgement: '应 $\\le T_0$；解析 RSS 法通常 $\\approx T_0$，比例法常明显低于 $T_0$。',
      },
      {
        name: '利用率',
        meaning: '$T_{\\mathrm{stack}}/T_0\\times 100\\%$。',
        judgement: '100% 表示 RSS 预算打满；过低说明方法未针对 RSS 优化（如比例分配）。',
      },
      {
        name: '多方法对比 / 成本指数',
        meaning: '横向比较各解析法的 RSS、Min/Max 公差与 $\\sum c_i/T_i$。',
        judgement: '成本指数低不一定最优——须同时看利用率、最大单环公差是否可加工。',
      },
      {
        name: 'Pareto 解 / 遗传算法成本',
        meaning: '多目标或约束优化下的备选方案集。',
        judgement: '遗传算法可能给出近似解；Pareto 解需人工选点，不能自动替代工程签字。',
      },
    ],
    reliability: [
      '本工具 RSS 叠加与尺寸链编辑器、批量验证使用同一 $T_{\\mathrm{stack}}=\\sqrt{\\sum(T_i f_i)^2}$ 定义，便于闭环验算。',
      '解析 RSS 分配法在数学上保证（或逼近）$T_{\\mathrm{stack}}\\le T_0$；比例分配、遗传/Pareto 结果必须看 RSS 验算与利用率，不可只看表格排序。',
      '分配不包含极值法 $\\sum T_i$ 预算；若安全关键件以极值为准，分配后须在编辑器中同时查看极值法结论。',
      'RSS 假设独立随机误差；环相关、过程偏移或非对称公差带时，应结合 Monte Carlo 或实测 Cpk 复核。',
    ],
    beginnerTips: [
      '先用等贡献 RSS + 全部 $f_i=1$ 建立基准，再看最小成本或灵敏度如何改变各环松紧。',
      '利用率 100% 不代表极值法也通过——安全件要回编辑器看极值法行。',
      '多方法对比中「比例分配」利用率低是方法特性，不是算错。',
    ],
    professionalChecks: [
      '圆整到 IT 档或企业标准后重新 RSS 验算，确认仍 $\\le T_0$。',
      '核对传递系数与增/减环方向；「应用到编辑器」后必须按真实装配链修正。',
      '对 RSS 过/极值不过或利用率异常的方案，用 Monte Carlo 或批量验证做二次确认。',
    ],
  },
  fit: {
    useCases: [
      '初选轴孔配合代号（H7/g6、H7/n6 等），快速看间隙或过盈量级与配合类型。',
      '对比不同公差带组合的松紧，配合尺寸链分配结果做零件公差初值。',
      '可选输入装配温差 ΔT，粗估热态间隙变化方向（同材质时变化为零）。',
    ],
    inputs: [
      {
        name: '公称尺寸 D',
        meaning: '基本尺寸 (mm)，决定尺寸段与 $i$ 值；范围 1～500 mm。',
        source: '零件图公称直径；超出 500 mm 工具报错。',
      },
      {
        name: '孔代号 / 轴代号',
        meaning: '如 H7、n6：字母为基本偏差，数字为 IT 等级。',
        source: '设计选用、手册推荐配合或企业标准；本工具字母表为常用子集。',
      },
      {
        name: '装配温差 ΔT',
        meaning: '相对参考温度 20°C 的温差；热隙变化 $\\Delta X_{\\mathrm{th}}=\\alpha_h L\\Delta T-\\alpha_s L\\Delta T$。',
        source: '装配/服役工况；默认孔轴同 $\\alpha$ 时显示 0 μm。',
      },
    ],
    outputs: [
      {
        name: '极限尺寸',
        meaning: '孔/轴 $D_{\\min}$～$D_{\\max}$ (mm)。',
        judgement: '与手册 ES/EI、es/ei 对照；正偏差轴（n/k/p）在部分尺寸段可能偏差较大。',
      },
      {
        name: '最大 / 最小间隙',
        meaning: '$X_{\\max}$、$X_{\\min}$ (μm)；负值表示过盈。',
        judgement: '功能设计须单独规定所需间隙/过盈；本工具不算轴承游隙、密封预紧等功能指标。',
      },
      {
        name: '配合类型',
        meaning: '间隙 / 过渡 / 过盈三类。',
        judgement: '类型判定依赖本工具偏差数据；与手册一致时可采信，不一致时以手册为准。',
      },
      {
        name: '配合品质指数 Q',
        meaning: '间隙带内平均位置。',
        judgement: '仅方案比较用，非放行判据。',
      },
      {
        name: '校核：需关注 / 通过',
        meaning: '「需关注」= estimateOnly，表示待工程师复核，非计算失败。',
        judgement: '正式产品须对照 GB/T 1800 与功能要求，不能仅因显示「间隙配合」即放行。',
      },
      {
        name: '热致间隙变化',
        meaning: '专业模式；孔轴同材质默认 0。',
        judgement: '钢-铝、钢-铜等异种材料当前页面无法配置，须手工或专用热膨胀工具估算。',
      },
    ],
    reliability: [
      '间隙计算公式 $X_{\\max}=ES-ei$、$X_{\\min}=EI-es$ 与 ISO 体系一致；偏差数据来源为内置简化表 + $i$ 连续公式，不等于 GB/T 1800 全书逐表复刻。',
      'H 孔 + g/f/h 等常见间隙配合：偏差表在常用尺寸段较可靠，IT 有约 ±10% 公式误差。',
      'n、k、p 等正偏差轴：已知在部分尺寸段与 ISO 286-2 标准表不一致（如 Ø25 n6）；过渡/过盈配合必须用标准手册复核，不可只信本工具数值。',
      '「需关注」为产品免责语义（未输入功能目标、estimateOnly），不代表 H7/g6 等配合算错。',
      '专业模式提示含 Monte Carlo 表述，但本页未实现 MC；温差默认同 $\\alpha$，90°C 或 −180°C 同材质时热隙变化为 0 属预期行为。',
    ],
    beginnerTips: [
      '先用 H7/g6 等预设熟悉界面；改 n6、p6 后立即与手册对照极限尺寸。',
      '看到「需关注」先读假设说明，不要当成配合不合格。',
      '最大间隙、最小间隙单位是 μm；极限尺寸是 mm，勿混读数量级。',
    ],
    professionalChecks: [
      '用 GB/T 1800 / ISO 286-2 核对孔 ES/EI、轴 es/ei 及 IT 带宽，尤其 n/k/p 轴与 IT 取整。',
      '过渡配合核对最大过盈 $|X_{\\min}|$ 是否满足压装力、应力与传扭要求。',
      '温升/温降工况：异种材料须另算 $\\Delta X_{\\mathrm{th}}$；同材质相对间隙不变不代表绝对尺寸可忽略。',
      '圆整到 IT 档后重新算配合；形位误差、椭圆度、锥度不在本模型内。',
    ],
  },
  bearing: {
    useCases: [
      '已知轴承载荷和转速，需要判断寿命是否满足目标小时数。',
      '需要比较轴承型号、额定动载 C、工况系数、预紧或配对方式对寿命的影响。',
    ],
    inputs: [
      {
        name: 'C / C0',
        meaning: '额定动载荷和额定静载荷，是寿命和静载安全的基础。',
        source: '轴承样本、厂家数据表或标准目录。',
      },
      {
        name: 'Fr / Fa',
        meaning: '径向载荷与轴向载荷，决定当量动载荷 P。',
        source: '轴系受力分析、齿轮/皮带/链传动载荷、测试或上游仿真。',
      },
      {
        name: 'X / Y 或轴承系列',
        meaning: '把 Fr/Fa 合成为 P 的载荷系数。',
        source: '完整模式按系列查表；简化模式需按样本或标准手动填写。',
      },
      {
        name: '转速 n 与目标寿命',
        meaning: '把“百万转寿命”换算成小时寿命，并形成判据。',
        source: '设备转速、工作制度、维护周期或任务书要求。',
      },
      {
        name: '安装方式与预紧',
        meaning: 'DB/DF/DT 和轴向预紧会改变等效载荷、额定载荷或刚度。',
        source: '轴承布置方案、预紧设计值、厂家推荐值。',
      },
    ],
    outputs: [
      {
        name: 'P 当量动载荷',
        meaning: '寿命公式中真正参与计算的综合载荷。',
        judgement: 'P 越大寿命急剧下降；先复核载荷方向和 X/Y。',
      },
      {
        name: 'L10 / L10h',
        meaning: '90% 可靠度基本额定寿命，单位为百万转或小时。',
        judgement: 'L10h ≥ 目标寿命才通过；可靠度要求更高时寿命会折减。',
      },
      {
        name: 'S0 静载安全',
        meaning: 'C0 与静当量载荷的比值。',
        judgement: '冲击或低速重载场景不能只看寿命，必须看 S0。',
      },
      {
        name: '刚度估计',
        meaning: '专业模式下的径向刚度粗估，用于比较预紧/配对方案。',
        judgement: '这是方案比较指标，不替代厂家刚度曲线。',
      },
    ],
    reliability: [
      '寿命基于 ISO 281 额定寿命模型；真实寿命还受润滑、污染、安装误差、温度、冲击和密封影响。',
      'X/Y 查表和系列选择必须正确；角接触配对、预紧和载荷方向不清楚时，应查厂家样本。',
      'L10 是概率寿命，不代表每个轴承都能运行到该小时数。',
    ],
    beginnerTips: [
      '先用完整模式选轴承系列，让工具自动查 X/Y。',
      '结果不通过时，通常优先减小 P 或增大 C；因为寿命对 C/P 是三次方量级。',
    ],
    professionalChecks: [
      '复核载荷谱、等效载荷、可靠度要求、润滑黏度比、污染等级和温度系数。',
      '对预紧轴承，确认热膨胀导致的预紧变化和高速发热风险。',
    ],
  },
  shaft: {
    useCases: [
      '校核传递扭矩的轴径是否足够，或反算最小轴径。',
      '做轴系设计链的第一步，为轴承和键连接提供共享轴径。',
    ],
    inputs: [
      {
        name: '扭矩 T',
        meaning: '轴传递功率时产生的主要载荷。',
        source: '由功率和转速换算，或来自电机/减速器输出扭矩。',
      },
      {
        name: '轴径 d',
        meaning: '决定抗扭截面模量，影响应力最敏感。',
        source: '初步结构尺寸、标准轴径或反算结果圆整。',
      },
      {
        name: '材料屈服强度',
        meaning: '判断是否屈服的强度基准。',
        source: '材料牌号和热处理状态；优先用许用应力或企业规范。',
      },
      {
        name: '弯矩/长度（完整模式）',
        meaning: '用于弯扭合成，不只按纯扭转判断。',
        source: '轴承支承反力、齿轮/带轮/链轮载荷和受力简图。',
      },
    ],
    outputs: [
      {
        name: '剪应力 / 等效应力',
        meaning: '工作载荷下轴截面的名义应力。',
        judgement: '应低于许用值，并考虑键槽、台阶等应力集中。',
      },
      {
        name: '安全系数',
        meaning: '材料强度或许用应力相对工作应力的裕度。',
        judgement: '越接近 1 越危险；冲击、疲劳或重要件需更高安全系数。',
      },
      {
        name: '推荐轴径',
        meaning: '反算得到满足目标的理论尺寸。',
        judgement: '应向上圆整到标准轴径，并考虑配合、轴承内径和键槽削弱。',
      },
    ],
    reliability: [
      '纯扭转模型适合快速初算；实际轴常有弯矩、台阶、键槽、疲劳和挠度要求。',
      '强度通过不代表刚度、临界转速或疲劳寿命通过。',
    ],
  },
  'bolt-preload': {
    useCases: [
      '已知目标预紧力，估算需要的拧紧扭矩。',
      '已知扭矩，反推可能产生的预紧力，并判断是否防分离。',
    ],
    inputs: [
      {
        name: '螺栓直径/螺距/等级',
        meaning: '决定应力截面、强度和螺纹升角。',
        source: '标准件规格、图纸或选型表。',
      },
      {
        name: '摩擦系数 μG / μK',
        meaning: '决定扭矩有多少转化为预紧力，是最大不确定因素。',
        source: '润滑状态、表面处理、试验数据；无数据时用保守范围分析。',
      },
      {
        name: '夹紧长度与外载',
        meaning: '决定连接刚度分配和是否分离。',
        source: '装配结构尺寸、受力分析和工况载荷。',
      },
    ],
    outputs: [
      {
        name: '预紧力 / 扭矩',
        meaning: '装配控制所需的目标值。',
        judgement: '必须同时满足不分离和不过载。',
      },
      {
        name: '工作应力',
        meaning: '预紧加外载后螺栓承受的应力。',
        judgement: '不能超过材料许用或屈服限制。',
      },
      {
        name: '防分离结论',
        meaning: '被连接件在外载下是否仍保持压紧。',
        judgement: '分离会导致疲劳、松动或密封失效，应优先避免。',
      },
    ],
    reliability: [
      '扭矩法预紧离散性很大，同一扭矩下实际预紧力可能有明显波动。',
      '重要连接应结合 VDI 2230、摩擦试验、扭矩-转角法或直接拉伸法复核。',
    ],
  },
  key: {
    inputs: [
      {
        name: 'T、d、b、h、L',
        meaning: '扭矩、轴径、键宽、键高、键长共同决定剪切和挤压应力。',
        source: '轴系设计、标准键规格和轮毂长度。',
      },
      {
        name: '许用剪应力/挤压应力',
        meaning: '判断键和轮毂材料是否足够的基准。',
        source: '材料手册、企业规范或课程给定许用值。',
      },
    ],
    outputs: [
      {
        name: '剪切应力',
        meaning: '键被扭矩沿截面剪断的风险。',
        judgement: '剪切应力应低于许用剪应力。',
      },
      {
        name: '挤压应力',
        meaning: '键侧面与轮毂/轴槽之间的接触压应力。',
        judgement: '多数平键问题中挤压往往更控制。',
      },
    ],
    reliability: [
      '公式为名义应力简化，假设键长方向载荷均匀；键过长时实际载荷不均匀。',
      '还需检查键槽削弱轴强度、轮毂壁厚和装配配合。',
    ],
  },
  weld: {
    inputs: [
      {
        name: '焊脚/焊缝长度',
        meaning: '决定有效焊喉面积。',
        source: '焊接图纸或结构初设；角焊缝常用焊喉约 0.7hf。',
      },
      {
        name: '载荷与偏心',
        meaning: '决定焊缝承受的剪力和附加弯矩。',
        source: '结构受力分析、连接位置和力臂。',
      },
      {
        name: '钢材/许用应力',
        meaning: '判断焊缝强度的基准。',
        source: '母材、焊材、焊接规范或企业许用表。',
      },
    ],
    outputs: [
      {
        name: '焊缝应力',
        meaning: '有效焊喉上的名义应力。',
        judgement: '应低于许用值，并考虑焊缝等级和载荷类型。',
      },
      {
        name: '通过/不通过',
        meaning: '按当前简化规范判据得到的初步校核结论。',
        judgement: '不通过时可增大焊脚、延长焊缝或改变结构布置。',
      },
    ],
    reliability: [
      '焊缝计算不能代替焊接工艺评定、探伤和疲劳校核。',
      '动载、低温、厚板约束和缺陷敏感结构应按更完整规范复核。',
    ],
  },
  'interference-fit': {
    inputs: [
      {
        name: '轴径 d / 孔径 D',
        meaning: '结合面尺寸；过盈 $i=d-D$ 自动计算，须为正。',
        source: '图纸名义尺寸 + 公差；建议先用 /fit 查 H7/p6 等极限过盈（μm）。',
      },
      {
        name: '轮毂外径 D_A',
        meaning: '决定轮毂柔度与孔壁应力放大；过小 → 薄壁警告。',
        source: '结构图；推荐约 $1.8d$（页内按钮）。',
      },
      {
        name: '配合长度 L、摩擦 μ',
        meaning: '有效结合长度与摩擦系数，直接影响 $F$、$T$。',
        source: '轮毂轴向尺寸；μ 查 DIN 7190 或工艺经验（压装约 0.1～0.2）。',
      },
      {
        name: 'E、ν 与轴内径 d_i',
        meaning: '弹性常数；$d_i>0$ 为空心轴（完整/专业），$p$ 低于实心。',
        source: '材料手册；钢 $E\\approx210$ GPa，$\\nu\\approx0.3$。',
      },
      {
        name: '许用切向应力',
        meaning: '完整/专业 hoopPass 判据；默认 350 MPa 需按材料屈服/安全系数调整。',
        source: '材料强度、热处理状态、企业规范。',
      },
      {
        name: 'ΔT、α（专业）',
        meaning: '温升修正 $i\'$；异种材料 α 不同会改变有效过盈。',
        source: '/thermal-expansion；钢 α≈$11.5\\times10^{-6}$/°C。',
      },
    ],
    outputs: [
      {
        name: '接触压力 p',
        meaning: '结合面径向压力 (MPa)，Lame 主结果。',
        judgement: '过大 → 塑性/压装困难；过小 → 扭矩不足。',
      },
      {
        name: '切向应力 / hoopPass',
        meaning: '孔壁 $\\sigma_{t,h}$ / 轴 $\\sigma_{t,s}$；完整/专业显示 ✓/✗。',
        judgement: '任一侧超许用则 hoopPass=false，pass 失败。',
      },
      {
        name: '压装力 F',
        meaning: '沿轴向压入所需力 (N)。',
        judgement: '与压机、导向、润滑能力比较。',
      },
      {
        name: '传递扭矩 T',
        meaning: '摩擦可传扭矩 (N·m)。',
        judgement: '须 $\\ge$ 设计工况扭矩（含安全系数）。',
      },
      {
        name: 'releaseBlocked',
        meaning: '完整/专业未确认关键输入时的流程门禁：总判待复核；数值结果仍显示。',
        judgement: '非算错；琥珀色边框与 * 标出待确认项，逐项编辑后解除。简化模式无此门禁但 pass 恒 false。',
      },
    ],
    reliability: [
      'Lame 平面应力弹性解，未含塑性、微动、疲劳与三维效应。',
      'μ 为常数；粗糙度、润滑未分项建模（专业文案中的粗糙度修正尚未实现）。',
      '关键输入门禁防止默认值未核对即放行；切换模式会清空确认状态。',
    ],
    professionalChecks: [
      '过盈量与 /fit 查表对照：μm 级正常，mm 级先查孔径是否填错。',
      '完整/专业：确认全部关键字段后再看 pass；或先用简化模式浏览数量级。',
      '温变工况：专业模式 α 勿填 0（本页为物理 α）；异种材料须分别取 α。',
      '薄壁警告时增大 $D_A$ 或复核厚壁公式适用性。',
      '压装力、扭矩与设备/工况比较后，仍须按企业规范做工艺试验或 DIN 7190 完整校核。',
    ],
  },
  'gdt-stack': {
    inputs: [
      {
        name: '计算模式',
        meaning: '简化仅主栈；完整加贡献与基准；专业加极值裕度。有基准时勿仅用简化放行。',
        source: '按设计阶段与风险选择；功能件建议专业模式。',
      },
      {
        name: '形位公差类型',
        meaning: '决定栈模型：2d-position / form-direct / radial / form-linear / 1d-weighted。',
        source: '图纸 GD&T 框格、功能要求（装配间隙、同轴、贴合等）。',
      },
      {
        name: '封闭环上限',
        meaning: '图样允许的最大合成形位公差 $T_{closed}$；下界固定为 0（预算带）。',
        source: '位置度框格值、功能分析给出的总预算，或企业公差分配结果。',
      },
      {
        name: '组成环与 factor',
        meaning: '各误差源公差、增/减方向（位置度 X/Y）、传递系数 sensitivity。',
        source: '各工序能力、检具重复性、定位尺寸公差、轴承游隙等。',
      },
      {
        name: '基准（可选）',
        meaning: '各基准面 flatness/perpendicularity 及优先级（主/次/三）。',
        source: '图纸基准体系 A|B|C 及对应形位公差。',
      },
      {
        name: '材料条件与 FOS',
        meaning: 'RFS / MMC / LMC；孔/轴须标 sizeTolerance 才参与自动奖励。',
        source: '框格修饰符 M/L/S 与孔轴尺寸公差带。',
      },
    ],
    outputs: [
      {
        name: '叠加公差',
        meaning: '主栈 RSS/极值合成结果 $T_{stack}$。',
        judgement: '须 $\\le T_{closed}$；位置度为直径公差带量级。',
      },
      {
        name: '贡献度',
        meaning: '各环占合成方差（或极值份额）的百分比，条越长越敏感。',
        judgement: '优先收紧排序靠前的环；2D 位置度 Y/X 通常主导。',
      },
      {
        name: '含基准累积',
        meaning: '$\\sqrt{T_{stack}^2+T_{datum}^2}$，反映基准面误差叠加后的总预算。',
        judgement: '完整/专业模式须同时满足；基准裕度常先于主栈耗尽。',
      },
      {
        name: '极值裕度',
        meaning: '专业模式：$T_{closed}-T_{stack}^{worst}$。',
        judgement: '须 $\\ge 0$；RSS 通过但裕度为负时仍判不通过。',
      },
      {
        name: '奖励公差 / 有效公差',
        meaning: 'MMC/LMC 下从栈中扣除的 bonus 及 $T_{eff}$。',
        judgement: '自动奖励为保守估计；正式判定用实测尺寸与 MMC 偏离。',
      },
    ],
    reliability: [
      '公式与栈模型在页面和本帮助中可查；结果为显式工程近似，非 AI 推断。',
      '基准累积、MMC 自动奖励、孔径 factor 均为简化模型，与 ASME Y14.5 完整仿真存在差距。',
      'RSS 假设各误差独立同分布；强相关误差源（同一工序、同一基准面）会低估或高估风险，须工程师判断。',
      '从编辑器导入的环方向与 typeId 须人工核对是否与图纸 GD&T 一致。',
    ],
    professionalChecks: [
      '功能件或单件必过：必须看专业模式极值裕度，不能仅看 RSS 叠加。',
      '有基准输入时：确认完整/专业模式下含基准累积仍通过；简化模式结果不可直接放行。',
      'MMC 标注时：用实测孔/轴尺寸验证 bonus，勿盲信自动全额奖励。',
      '位置度孔组：本工具不处理 pattern / simultaneous；多孔须按标准单独分析或专用软件。',
      '优化后回到尺寸链编辑器或批量验证，确认与 1D 尺寸链预算一致。',
    ],
  },
  fatigue: {
    inputs: [
      {
        name: '材料',
        meaning: '5 种内置 Basquin S-N（sf, b, σ₋₁, Nref）。',
        source: '近似匹配零件材料；正式件用试验 S-N。',
      },
      {
        name: '应力幅 Sa',
        meaning: '交变应力幅 (MPa)；输入下限 σ₋₁，上限对应 N=10² 端点。',
        source: 'FEA、名义应力×Kt、或实测载荷换算。',
      },
      {
        name: 'Miner 载荷谱',
        meaning: '完整/专业：每行 $S_a,n$；有谱时 **综合通过判定只看 $D<1$**。',
        source: '工况循环统计；专业模式各级做 Goodman/Soderberg 并相对 Se′ 查 Nf。',
      },
      {
        name: 'Sm、ka、kb、N_target（专业）',
        meaning: 'Goodman/Soderberg 平均应力；Se′=ka·kb·σ₋₁；N_target 驱动右栏单级判定。',
        source: '静力平均应力；表面/尺寸手册系数；设计寿命目标。',
      },
    ],
    outputs: [
      {
        name: '估算寿命 N',
        meaning: '单级 Basquin 寿命；Sa≤σ₋₁（完整）或 Sa,eff≤Se′（专业膝点）可为无限。',
        judgement: '有 Miner 时不驱动综合 pass；右栏单级对照用。',
      },
      {
        name: 'Miner 损伤 D',
        meaning: 'Σ nᵢ/Nf,i；D<1 通过，0.8≤D<1 预警仍 pass。',
        judgement: '有载荷谱时 **综合通过判定主依据**。',
      },
      {
        name: '单级判定 / goodmanPass',
        meaning: '右栏：N≥N_target 且（专业）Sa,eff≤Se′；与左栏 Sa 对应。',
        judgement: '**不驱动**有载荷谱时的综合通过判定；可与 Miner 结论相反。',
      },
      {
        name: '占 D 比例',
        meaning: 'Miner 表各行 n/Nf 占总 D 的百分比。',
        judgement: '定位主导损伤档位；非绝对损伤预算分额。',
      },
    ],
    reliability: [
      'Basquin + Miner 为经典简化；无 Kt、无加载次序；专业 Miner 假定恒定 Sm。',
      '完整 Miner 用原始 Sa + σ₋₁；专业用 Sa,eff + Se′——同谱 D 可差数倍。',
      'assessComponentFatigue（轴/梁/键）与本页 analyzeFatigue 勿混用 pass。',
      '简化 pass 恒 false；Sa 下限为 σ₋₁，专业单级判 Se′ 时 ka·kb<1 常无法在 UI 下限下单级 ✓。',
    ],
    professionalChecks: [
      '有 Miner 谱时以 D 为准，勿只看左侧单级寿命或右栏单级 ✓/✗。',
      '完整通过、专业未通过时：检查 Sm、ka·kb 是否已纳入——属预期差异，非 bug。',
      'D 在 0.8～1 之间仍可能 pass，但应视为预警并加安全系数或试验。',
      '右栏单级 ✗ 但 D<1：若设计以谱为准可接受；左栏 Sa 宜与谱同级或更危险工况一致。',
    ],
  },
  'monte-carlo': {
    useCases: [
      'RSS 假设不够放心，想用随机模拟观察封闭环分布。',
      '组成环分布不是简单正态，或想估计合格率和敏感度。',
    ],
    inputs: [
      {
        name: '组成环分布',
        meaning: '每个尺寸在生产中的随机波动模型。',
        source: '过程能力数据、测量记录；没有数据时只能假设正态或均匀分布。',
      },
      {
        name: '迭代次数',
        meaning: '随机抽样数量，越多越稳定但计算越慢。',
        source: '入门用 10000；尾部概率很小时需更多样本。',
      },
      {
        name: '规格上下限',
        meaning: '判定每次模拟是否合格的目标边界。',
        source: '封闭环 min/max 或图纸要求。',
      },
    ],
    outputs: [
      {
        name: '分布图/直方图',
        meaning: '展示封闭环结果集中在哪些范围。',
        judgement: '分布中心越接近目标中心、尾部越少越稳健。',
      },
      {
        name: '合格率/PPM',
        meaning: '模拟样本中落在规格内的比例。',
        judgement: '这是基于假设分布的估计，不等于真实批量保证。',
      },
      {
        name: '敏感度排序',
        meaning: '显示哪些输入波动最影响封闭环。',
        judgement: '优先控制排序靠前的参数。',
      },
    ],
    reliability: [
      'Monte Carlo 的可信度主要取决于输入分布是否贴近真实制造过程。',
      '随机模拟适合处理非线性和非正态，但不能弥补错误模型或错误数据。',
    ],
  },
  statistics: {
    inputs: [
      {
        name: '公差 T / 标准差 σ',
        meaning: '把图纸公差和过程波动联系起来。',
        source: '图纸公差、测量数据或过程能力报告。',
      },
      {
        name: '规格限 USL/LSL 与均值 μ',
        meaning: '用于判断过程是否居中及能力是否足够。',
        source: '图纸上下限与实测样本统计。',
      },
    ],
    outputs: [
      {
        name: 'C / Cpk',
        meaning: '过程能力指标，Cpk 同时考虑波动和偏移。',
        judgement: '常见要求 Cpk ≥ 1.33，但以企业/客户要求为准。',
      },
      {
        name: '合格率',
        meaning: '正态假设下落入规格内的概率。',
        judgement: '数据不正态或样本太少时不要过度相信。',
      },
    ],
  },
  'design-powertrain': {
    reliability: [
      '设计链把多个单工具串起来，保证共享参数一致；每一步的计算依据仍来自对应单工具。',
      '链级“全部通过”只说明轴、轴承、键三个简化校核通过，不代表整机振动、热、疲劳、装配全部通过。',
    ],
    professionalChecks: [
      '复核轴承载荷是否来自完整受力分析，键槽削弱是否反馈到轴强度。',
      '检查轴承布置、预紧、润滑、密封、临界转速和疲劳寿命。',
    ],
  },
  'design-bolt-joint': {
    reliability: [
      '设计链保证预紧、螺栓组和焊缝之间参数同步，但各步仍是简化工程模型。',
      '链级通过不等于连接不会松动或疲劳失效，关键连接需按完整规范和试验验证。',
    ],
    professionalChecks: [
      '复核摩擦系数分散、载荷路径、接触刚度、剪切滑移和疲劳载荷谱。',
      '确认焊缝计算与螺栓连接的载荷分配假设一致。',
    ],
  },
}

import { localizeHelpArticle } from '@/i18n/tool-help-en'

function withHelpDetails(article, locale = 'zh') {
  if (!article) return null
  const detail = DETAIL_OVERRIDES[article.id] ?? {}
  const merged = {
    ...article,
    useCases: detail.useCases ?? article.useCases ?? COMMON_HELP_DETAILS.useCases,
    inputs: detail.inputs ?? article.inputs ?? COMMON_HELP_DETAILS.inputs,
    outputs: detail.outputs ?? article.outputs ?? COMMON_HELP_DETAILS.outputs,
    reliability: detail.reliability ?? article.reliability ?? COMMON_HELP_DETAILS.reliability,
    beginnerTips: detail.beginnerTips ?? article.beginnerTips ?? COMMON_HELP_DETAILS.beginnerTips,
    professionalChecks:
      detail.professionalChecks ?? article.professionalChecks ?? COMMON_HELP_DETAILS.professionalChecks,
    keywords: [...(article.keywords ?? []), ...(detail.keywords ?? [])],
  }
  return localizeHelpArticle(merged, locale)
}

export function getHelpArticle(id, locale = 'zh') {
  return withHelpDetails(TOOL_HELP_ARTICLES.find((a) => a.id === id) ?? null, locale)
}

export function getHelpByPath(path, locale = 'zh') {
  const norm = (path ?? '').replace(/\/$/, '') || '/help'
  return withHelpDetails(TOOL_HELP_ARTICLES.find((a) => a.path === norm) ?? null, locale)
}

export function searchHelpArticles(query, locale = 'zh') {
  const q = String(query ?? '').trim().toLowerCase()
  const articles = TOOL_HELP_ARTICLES.map((a) => withHelpDetails(a, locale))
  if (!q) return articles
  return articles.filter((a) => {
    const hay = [
      a.title,
      a.summary,
      a.principle,
      ...(a.useCases ?? []),
      ...(a.steps ?? []),
      ...(a.inputs ?? []).flatMap((x) => [x.name, x.meaning, x.source]),
      ...(a.outputs ?? []).flatMap((x) => [x.name, x.meaning, x.judgement]),
      ...(a.notes ?? []),
      ...(a.reliability ?? []),
      ...(a.beginnerTips ?? []),
      ...(a.professionalChecks ?? []),
      ...(a.keywords ?? []),
      ...(a.standards ?? []),
    ]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}

export const HELP_GROUP_ORDER = [
  'intro',
  'design-chain',
  'chain',
  'drive',
  'material',
  'stat',
]
