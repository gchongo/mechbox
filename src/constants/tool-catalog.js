/**
 * 工具目录 — 首页与工具地图共用
 */

export const STAT_TOOLS = [
  { query: 'convert', label: '公差转换', latexDesc: 'T \\leftrightarrow \\sigma', icon: 'Switch', keywords: ['公差', '转换', 'sigma'] },
  { query: 'rss', label: 'RSS 计算', desc: '基础 + 加权 + 修正', icon: 'DataAnalysis', keywords: ['RSS', '叠加'] },
  { query: 'sigma', label: '西格玛分析', desc: 'C / Cpk / 合格率', icon: 'TrendCharts', keywords: ['Cpk', '西格玛', '合格率'] },
  { query: 'chart', label: '分布曲线', desc: 'Plotly PDF 图', icon: 'PieChart', keywords: ['分布', 'PDF'] },
  { path: '/monte-carlo', label: 'Monte Carlo', desc: '随机模拟 · 龙卷风图', icon: 'Histogram', keywords: ['蒙特卡洛', '模拟', '敏感'] },
  { path: '/quality', label: 'MSA / SPC / FMEA', desc: 'Gage R&R · 控制图 · AQL', icon: 'DataLine', keywords: ['MSA', 'SPC', 'FMEA', 'AQL'] },
  { path: '/analytics', label: '回归 / DOE / RSM', desc: '拟合 · 正交 · 响应面', icon: 'DataAnalysis', keywords: ['回归', 'DOE', 'RSM', '响应面'] },
]

export const TOOL_GROUPS = [
  {
    id: 'design-chain',
    label: '设计链（联动分析）',
    tools: [
      { path: '/design/projects', label: '设计项目', desc: '多链归档 · 方案管理', icon: 'FolderOpened', keywords: ['设计项目', '项目', '归档'] },
      { path: '/design/powertrain', label: '轴系设计链', desc: '轴 → 轴承 → 键 联动 + 链级报告', icon: 'Connection', keywords: ['设计链', '轴系', '联动', 'powertrain'] },
      { path: '/design/bolt-joint', label: '螺栓连接设计链', desc: '预紧 → 螺栓组 → 焊缝 联动', icon: 'Grid', keywords: ['设计链', '螺栓', '焊缝', 'bolt'] },
      { path: '/design/flange-seal', label: '法兰密封设计链', desc: '预紧 → 螺栓组 → 垫片密封', icon: 'CircleCheck', keywords: ['设计链', '法兰', '垫片', '密封'] },
      { path: '/design/gearbox', label: '齿轮箱设计链', desc: '齿轮 → 轴 → 轴承 → 键', icon: 'SetUp', keywords: ['设计链', '齿轮箱', 'gearbox'] },
    ],
  },
  {
    id: 'chain',
    label: '尺寸链与强度',
    tools: [
      { path: '/editor', label: '尺寸链编辑器', desc: 'RSS / 极值 / GD&T', icon: 'Edit', keywords: ['尺寸链', '编辑器'] },
      { path: '/batch', label: '批量验证', desc: 'RSS/极值批量检验', icon: 'List', keywords: ['批量'] },
      { path: '/allocation', label: '公差分配', desc: '遗传算法 / Pareto', icon: 'ScaleToOriginal', keywords: ['公差', '遗传', 'Pareto'] },
      { path: '/fit', label: 'ISO 286 配合', desc: '轴孔公差带 / 间隙', icon: 'ScaleToOriginal', keywords: ['ISO286', '配合', 'H7', 'g6'] },
      { path: '/gdt-stack', label: 'GD&T 公差栈', desc: '形位公差叠加 / 贡献度', icon: 'Aim', keywords: ['GD&T', '形位', '位置度', '基准'] },
      { path: '/gdt-symbols', label: '形位公差符号', desc: 'GD&T 符号 / 修饰符图解', icon: 'Collection', keywords: ['GD&T', '形位公差', '符号', 'Y14.5'] },
      { path: '/units', label: '单位换算', desc: 'MPa/psi · mm/in', icon: 'Switch', keywords: ['单位', '换算', 'MPa', 'psi'] },
      { path: '/interference-fit', label: '过盈配合', desc: 'DIN 7190 压装/扭矩', icon: 'Coin', keywords: ['过盈', '配合', 'DIN7190'] },
      { path: '/thermal-expansion', label: '热膨胀', desc: '间隙/过盈温变', icon: 'Sunrise', keywords: ['热膨胀', '温度'] },
      { path: '/fatigue', label: '疲劳寿命', desc: 'S-N · Miner 损伤', icon: 'TrendCharts', keywords: ['疲劳', 'Miner', 'SN'] },
      { path: '/gear', label: '齿轮强度', desc: 'ISO 6336 / AGMA', icon: 'SetUp', keywords: ['齿轮', 'ISO6336', 'AGMA'] },
      { path: '/thread', label: '螺纹强度', desc: '拉剪应力 / 扭矩', icon: 'Link', keywords: ['螺纹'] },
      { path: '/thread-table', label: '螺纹标准表', desc: '规格库 · 设计制造 · 解析对照', icon: 'List', keywords: ['螺纹', 'ISO724', 'UNC', 'NPT', 'BSP', 'Tr', 'Acme', '标准表', '公差', '啮合'] },
      { path: '/bolt-preload', label: '螺栓预紧力', desc: '扭矩 ↔ 预紧力', icon: 'TurnOff', keywords: ['螺栓', '预紧', 'VDI'] },
      { path: '/bearing', label: '轴承寿命', desc: 'X/Y 查表 ISO 281', icon: 'Help', keywords: ['轴承', 'ISO281'] },
    ],
  },
  {
    id: 'drive',
    label: '传动与结构',
    tools: [
      { path: '/beam', label: '梁挠度', desc: '简支/悬臂 FEA 前置', icon: 'Minus', keywords: ['梁', '挠度'] },
      { path: '/sheet-metal', label: '钣金展开', desc: 'K 因子 / 折弯扣除', icon: 'Crop', keywords: ['钣金', 'K因子'] },
      { path: '/o-ring', label: 'O 型圈密封', desc: '压缩率 / 填充率', icon: 'CircleCheck', keywords: ['O型圈', '密封'] },
      { path: '/gasket-flange', label: '垫片法兰密封', desc: '坐落比压 / 工况密封', icon: 'Coin', keywords: ['垫片', '法兰', '密封', '比压'] },
      { path: '/shaft', label: '轴强度', desc: '扭转 / 弯扭合成', icon: 'Sort', keywords: ['轴', '扭转'] },
      { path: '/key', label: '平键连接', desc: '挤压 / 剪切', icon: 'Key', keywords: ['平键'] },
      { path: '/weld', label: '焊缝强度', desc: '角焊 / 对接焊', icon: 'Medal', keywords: ['焊缝', '焊接'] },
      { path: '/bolt-group', label: '螺栓组', desc: '偏心载荷分配', icon: 'Grid', keywords: ['螺栓组'] },
      { path: '/spring', label: '弹簧设计', desc: '刚度 / 切应力', icon: 'Refresh', keywords: ['弹簧'] },
      { path: '/clutch', label: '离合器', desc: '摩擦扭矩', icon: 'Connection', keywords: ['离合器'] },
      { path: '/belt', label: '皮带传动', desc: '链长 / 张力', icon: 'Minus', keywords: ['皮带'] },
      { path: '/chain', label: '链传动', desc: '节距 / 链张力', icon: 'Link', keywords: ['链传动'] },
      { path: '/worm-gear', label: '蜗轮蜗杆', desc: '简化 / 完整 / 专业', icon: 'RefreshRight', keywords: ['蜗轮', '蜗杆', 'worm'] },
      { path: '/bevel-gear', label: '锥齿轮', desc: 'Σ=90° · 力分解 · 粗强度', icon: 'SetUp', keywords: ['锥齿轮', '伞齿轮', 'bevel'] },
      { path: '/pipe-flow', label: '管路压降', desc: 'Darcy · 局部损失', icon: 'Odometer', keywords: ['压降', '管路', 'Darcy'] },
      { path: '/plate-buckling', label: '薄板屈曲', desc: '临界应力 · 安全系数', icon: 'Grid', keywords: ['屈曲', '薄板'] },
      { path: '/column-buckling', label: '柱屈曲', desc: '欧拉 · Rankine 压杆', icon: 'Sort', keywords: ['柱屈曲', '压杆', '欧拉'] },
      { path: '/pin-retainer', label: '销 / 挡圈', desc: '剪切挤压 · 卡簧轴向力', icon: 'Key', keywords: ['销', '挡圈', '卡簧', '弹性挡圈'] },
      { path: '/modal-freq', label: '固有频率', desc: '梁/SDOF · 共振裕度', icon: 'TrendCharts', keywords: ['固有频率', '模态', '共振'] },
      { path: '/vibration-isolation', label: '隔振传递率', desc: 'SDOF · TR · 隔振区', icon: 'TrendCharts', keywords: ['隔振', '传递率', '减振'] },
      { path: '/heat-transfer', label: '简单换热', desc: '导热 / 对流 / 热阻', icon: 'Sunny', keywords: ['换热', '导热', '对流', '热阻'] },
    ],
  },
  {
    id: 'material',
    label: '材料与工艺',
    tools: [
      { path: '/material-selection', label: '材料选型', desc: '强度/成本/重量', icon: 'Reading', keywords: ['材料选型', '评分'] },
      { path: '/heat-treatment', label: '热处理硬度', desc: 'Jominy · 碳当量 · 回火', icon: 'Sunny', keywords: ['热处理', 'Jominy', '淬硬', '回火'] },
      { path: '/manufacturing', label: '制造工艺', desc: '余量 / 切削 / DFM', icon: 'SetUp', keywords: ['机加工', '铸造', '切削', '粗糙度', '注塑'] },
      { path: '/cylinder', label: '液压/气动缸', desc: '液压推力 / 气动效率', icon: 'Odometer', keywords: ['液压', '气缸', '气动'] },
      { path: '/materials', label: '材料库', desc: '常用材料强度', icon: 'Reading', keywords: ['材料库'] },
      { path: '/standards-ref', label: '标准件速查', desc: '键槽 / 销 / O 圈', icon: 'Collection', keywords: ['键槽', '销', 'O型圈'] },
    ],
  },
  {
    id: 'reference',
    label: '参考与文档',
    tools: [
      { path: '/help', label: '工具帮助', desc: '步骤 · 原理 · 公式 · 注意点', icon: 'Reading', keywords: ['帮助', '文档', '入门', '学生', '教程'] },
      { path: '/manual', label: '公式手册', desc: '常用公式速查', icon: 'Notebook', keywords: ['公式', '手册'] },
      { path: '/glossary', label: '术语表', desc: '机械术语解释', icon: 'Collection', keywords: ['术语', 'glossary'] },
      { path: '/cases', label: '案例库', desc: '尺寸链示例', icon: 'FolderOpened', keywords: ['案例'] },
      { path: '/tutorial', label: '教程', desc: '使用指南', icon: 'Guide', keywords: ['教程'] },
      { path: '/faq', label: '常见问题', desc: 'FAQ', icon: 'QuestionFilled', keywords: ['FAQ'] },
      { path: '/history', label: '历史记录', desc: '分析历史', icon: 'Clock', keywords: ['历史'] },
    ],
  },
]

export function getAllToolsFlat() {
  const stats = STAT_TOOLS.map((t) => ({
    ...t,
    category: '统计工具',
    categoryId: 'stat',
    route: t.path ?? `/statistics?tool=${t.query}`,
  }))
  const mech = TOOL_GROUPS.flatMap((g) =>
    g.tools.map((t) => ({ ...t, category: g.label, categoryId: g.id, route: t.path })),
  )
  return [...stats, ...mech]
}

export function searchTools(query) {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return getAllToolsFlat()
  return getAllToolsFlat().filter((t) => {
    const hay = [t.label, t.desc, t.category, ...(t.keywords ?? [])].join(' ').toLowerCase()
    return hay.includes(q)
  })
}
