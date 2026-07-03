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
    title: '批量验证',
    summary: '对多组尺寸链数据一次性做 RSS/极值检验，适合表格化方案对比。',
    steps: [
      '按页面格式准备多行组成环数据（或粘贴表格）。',
      '选择检验方法与封闭环要求。',
      '运行批量计算，查看每行通过/失败。',
      '导出结果做记录。',
    ],
    principle: '与单链编辑器同一套叠加公式，只是输入输出面向多方案批处理。',
    notes: ['批量前先用编辑器验证一条链，确认方向与单位正确。'],
    related: ['editor'],
    keywords: ['批量', '验证'],
  },
  {
    id: 'allocation',
    path: '/allocation',
    groupId: 'chain',
    level: 'intermediate',
    title: '公差分配',
    summary: '在封闭环公差给定时，把公差合理分配到各组成环（等贡献、比例、优化等）。',
    steps: [
      '输入封闭环允许公差与各环名义尺寸/权重。',
      '选择分配方法（等贡献 RSS、比例分配等）。',
      '对比多种方法的结果表，选取可制造的一组公差。',
      '将结果带回尺寸链编辑器验证。',
    ],
    principle:
      '公差分配是尺寸链的逆问题：已知总公差，求各环公差。等贡献法让各环对总方差贡献相近；也可按加工成本或尺寸大小加权。',
    formulas: [
      { latex: 'T_i = \\frac{T_0}{\\sqrt{n}}', note: '等贡献 RSS、n 环且 |ξ|=1 时的简化形式' },
    ],
    notes: [
      '分配结果要圆整到可加工的公差等级（如 IT 级）。',
      '成本敏感环可放宽，易加工环可收紧。',
    ],
    related: ['editor'],
    keywords: ['公差分配', 'Pareto'],
  },
  {
    id: 'fit',
    path: '/fit',
    groupId: 'chain',
    level: 'beginner',
    title: 'ISO 286 配合',
    summary: '按孔/轴公差带代号（如 H7/g6）查上下偏差，并判断间隙或过盈范围。',
    steps: [
      '输入基本尺寸（公称直径）。',
      '选择孔公差带与轴公差带（或常用配合对）。',
      '查看孔、轴的 ES/EI、es/ei 与最大/最小间隙（或过盈）。',
      '根据配合性质（间隙/过渡/过盈）判断是否符合设计意图。',
    ],
    principle:
      'ISO 286 用公差带位置（字母）与等级（数字）定义偏差。孔基制常用 H，轴基制常用 h。配合性质由孔轴公差带相对位置决定。',
    formulas: [
      { latex: 'X_{\\max} = ES - ei', note: '最大间隙（间隙配合）' },
      { latex: 'Y_{\\max} = es - EI', note: '最大过盈（过盈配合，符号约定以工具显示为准）' },
    ],
    notes: [
      '基本尺寸落在不同尺寸段，同一代号的偏差数值不同。',
      '过渡配合可能间隙也可能过盈，装配工艺需考虑。',
    ],
    standards: ['ISO 286'],
    related: ['interference-fit', 'editor'],
    keywords: ['配合', 'H7', 'g6', 'ISO286'],
  },
  {
    id: 'gdt-stack',
    path: '/gdt-stack',
    groupId: 'chain',
    level: 'intermediate',
    title: 'GD&T 公差栈',
    summary: '对位置度、平面度、同轴度等形位公差做叠加，支持 MMC/LMC 奖励公差。',
    steps: [
      '选择 GD&T 模式（位置度、平面度、同轴度等）。',
      '添加各要素公差与方向/系数；尺寸要素标注孔或轴及尺寸公差。',
      '选择材料条件 RFS / MMC / LMC；开启自动奖励时按 FOS 尺寸公差求和。',
      '查看叠加结果是否落在允许带内，并看贡献分解。',
    ],
    principle:
      '形位公差在装配中也会累积。MMC 下，尺寸偏离最大实体时位置度可获得奖励公差，使可装配性判断更符合 ASME Y14.5。',
    formulas: [
      { latex: 'T_{\\text{eff}} = T_{\\text{stack}} + T_{\\text{bonus}}', note: '有效公差带 = 叠加公差 + 奖励' },
    ],
    notes: [
      '非尺寸要素（如单纯平面）不参与尺寸奖励。',
      '自动奖励按尺寸公差全额估计，偏保守/教学向，精密场合请按实际检测状态计算。',
    ],
    standards: ['ASME Y14.5'],
    related: ['editor'],
    keywords: ['GD&T', '位置度', 'MMC'],
  },
  {
    id: 'units',
    path: '/units',
    groupId: 'chain',
    level: 'beginner',
    title: '单位换算',
    summary: '在常用力学与长度单位之间换算，避免混用 MPa 与 psi、mm 与 in。',
    steps: [
      '选择物理量类型（长度、应力、力等）。',
      '输入数值与源单位，选择目标单位。',
      '复制结果到其他计算工具。',
    ],
    principle: '同一物理量在不同单位制下的换算因子是常数（如 1 in = 25.4 mm，1 ksi ≈ 6.895 MPa）。',
    notes: ['工程计算出错最常见原因之一是单位混用，换算后建议心算数量级是否合理。'],
    keywords: ['单位', 'MPa', 'psi'],
  },
  {
    id: 'interference-fit',
    path: '/interference-fit',
    groupId: 'chain',
    level: 'intermediate',
    title: '过盈配合',
    summary: '按厚壁圆筒理论估算过盈产生的接触压力与可传递扭矩（DIN 7190 思路）。',
    steps: [
      '输入孔/轴直径、过盈量、材料弹性模量与泊松比、结合长度。',
      '查看接触压力、应力与可传扭矩。',
      '与设计扭矩比较，判断过盈是否足够或过大（装配困难/塑性风险）。',
    ],
    principle:
      '过盈使结合面产生径向压力，靠摩擦传递扭矩或轴向力。过盈越大压力越大，但装配力与孔壁应力也升高。',
    formulas: [
      { latex: 'T = \\pi p \\mu d^2 L / 2', note: '摩擦可传扭矩（示意）' },
    ],
    notes: [
      '实际还受表面粗糙度、润滑、温度影响。',
      '大过盈需校核塑性与装配工艺（压装/温差装配）。',
    ],
    standards: ['DIN 7190（参考）'],
    related: ['fit', 'thermal-expansion'],
    keywords: ['过盈', '压装'],
  },
  {
    id: 'thermal-expansion',
    path: '/thermal-expansion',
    groupId: 'chain',
    level: 'beginner',
    title: '热膨胀',
    summary: '估算温度变化引起的尺寸变化，以及对间隙/过盈配合的影响。',
    steps: [
      '输入原长、线膨胀系数、温升（或工作温度与装配温度）。',
      '查看伸长量；若分析配合，分别计算孔与轴的热变形差。',
    ],
    principle: '大多数金属受热膨胀，ΔL = α L ΔT。孔与轴材料不同时，温升会改变配合松紧。',
    formulas: [
      { latex: '\\Delta L = \\alpha L \\Delta T', note: '线膨胀量' },
    ],
    notes: ['α 随材料变化，钢材约 1.2×10⁻⁵ /°C 量级。', '高温设备必须把热态间隙纳入尺寸链。'],
    related: ['fit', 'interference-fit'],
    keywords: ['热膨胀', '温度'],
  },
  {
    id: 'fatigue',
    path: '/fatigue',
    groupId: 'chain',
    level: 'intermediate',
    title: '疲劳寿命',
    summary: '基于 S-N 曲线与 Miner 线性损伤累积，估算交变应力下的寿命。',
    steps: [
      '输入材料疲劳参数或选择近似 S-N 数据。',
      '输入应力幅/各级载荷谱与循环次数。',
      '查看预估寿命与 Miner 损伤和 D，判断是否 D < 1。',
    ],
    principle:
      '疲劳破坏由交变应力引起，即使最大应力低于静强度也可能断裂。S-N 曲线给出应力与寿命关系；多级载荷用 Miner 法则累加损伤。',
    formulas: [
      { latex: 'D = \\sum \\frac{n_i}{N_i}', note: 'Miner 损伤和，通常要求 D < 1' },
    ],
    notes: [
      '表面粗糙度、应力集中、腐蚀会显著降低疲劳寿命。',
      'Miner 法则偏简化，安全件需更大裕度或试验验证。',
    ],
    keywords: ['疲劳', 'Miner', 'S-N'],
  },
  {
    id: 'gear',
    path: '/gear',
    groupId: 'chain',
    level: 'advanced',
    title: '齿轮强度',
    summary: '按 ISO 6336 / AGMA 思路校核齿面接触与齿根弯曲强度。',
    steps: [
      '输入模数、齿数、齿宽、功率/扭矩、转速与材料许用应力。',
      '选择标准体系（ISO / AGMA）与计算模式。',
      '查看接触应力、弯曲应力及安全系数是否达标。',
    ],
    principle:
      '齿轮失效常见为点蚀（接触疲劳）与断齿（弯曲疲劳）。需分别校核齿面与齿根，并考虑载荷系数、动载与精度。',
    formulas: [
      { latex: '\\sigma_H \\le \\sigma_{HP}', note: '接触应力不超过许用' },
      { latex: '\\sigma_F \\le \\sigma_{FP}', note: '齿根弯曲应力不超过许用' },
    ],
    notes: [
      '精度等级与安装误差对动载影响大。',
      '润滑不良会显著降低接触疲劳寿命。',
    ],
    standards: ['ISO 6336', 'AGMA'],
    keywords: ['齿轮', '接触', '弯曲'],
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
    id: 'structural',
    path: '/structural',
    groupId: 'drive',
    level: 'intermediate',
    title: '结构/流体',
    summary: '提供压降、压杆屈曲、简单模态等结构与流体估算工具集合。',
    steps: [
      '选择子功能（压降 / 屈曲 / 模态等）。',
      '按提示输入几何与材料参数。',
      '查看临界载荷或压降结果。',
    ],
    principle: '压杆屈曲由欧拉公式描述细长杆稳定性；管路压降与流速、沿程损失系数相关。',
    formulas: [
      { latex: 'F_{cr} = \\frac{\\pi^2 EI}{(\\mu L)^2}', note: '欧拉临界力' },
    ],
    notes: ['欧拉公式适用于细长杆，短粗杆需用其他经验公式。'],
    keywords: ['屈曲', '压降', '模态'],
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
    summary: '估算机加工余量、铸造拔模斜度等工艺参数。',
    steps: [
      '选择工艺类型（机加 / 铸造等）。',
      '输入零件尺寸与精度要求。',
      '得到建议余量或拔模角。',
    ],
    principle: '毛坯需留加工余量以保证最终尺寸与表面质量；铸件拔模斜度便于脱模。',
    notes: ['余量过大会浪费材料与工时，过小则可能留不住黑皮。'],
    keywords: ['余量', '拔模'],
  },
  {
    id: 'cylinder',
    path: '/cylinder',
    groupId: 'material',
    level: 'beginner',
    title: '液压/气缸',
    summary: '计算液压缸推力、速度与所需流量。',
    steps: [
      '输入缸径、杆径、工作压力与流量（或速度）。',
      '查看无杆腔/有杆腔推力与速度。',
    ],
    principle: '推力来自压力作用于活塞有效面积；速度由流量与面积决定。',
    formulas: [
      { latex: 'F = p A', note: '理论推力（未计效率）' },
      { latex: 'v = Q / A', note: '速度与流量关系（注意单位换算）' },
    ],
    notes: ['实际推力需乘缸效率；密封摩擦会降低输出。'],
    keywords: ['液压', '气缸', '推力'],
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
  'gdt-stack': {
    inputs: [
      {
        name: '形位公差类型',
        meaning: '决定是位置度、平面度、同轴度还是其他误差叠加模型。',
        source: '图纸 GD&T 框格和功能要求。',
      },
      {
        name: '基准与组成要素',
        meaning: '定义误差来源和叠加方向。',
        source: '基准体系、定位尺寸、检测方案。',
      },
      {
        name: '材料条件与 FOS',
        meaning: '决定是否有 MMC/LMC 奖励公差。',
        source: '图纸上的 M/L/S 符号和孔/轴尺寸公差。',
      },
    ],
    outputs: [
      {
        name: '叠加公差',
        meaning: '各形位误差按所选方法合成后的总影响。',
        judgement: '与目标公差带比较，判断是否满足功能要求。',
      },
      {
        name: '奖励公差',
        meaning: '尺寸要素偏离 MMC/LMC 时得到的额外可用公差。',
        judgement: '自动奖励只用于早期评估，正式判定看实测尺寸状态。',
      },
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

function withHelpDetails(article) {
  if (!article) return null
  const detail = DETAIL_OVERRIDES[article.id] ?? {}
  return {
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
}

export function getHelpArticle(id) {
  return withHelpDetails(TOOL_HELP_ARTICLES.find((a) => a.id === id) ?? null)
}

export function getHelpByPath(path) {
  const norm = (path ?? '').replace(/\/$/, '') || '/help'
  return withHelpDetails(TOOL_HELP_ARTICLES.find((a) => a.path === norm) ?? null)
}

export function searchHelpArticles(query) {
  const q = String(query ?? '').trim().toLowerCase()
  const articles = TOOL_HELP_ARTICLES.map(withHelpDetails)
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
