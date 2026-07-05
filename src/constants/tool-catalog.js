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
      { path: '/shaft', label: '轴强度', desc: '扭转 / 弯扭合成', icon: 'Sort', keywords: ['轴', '扭转'] },
      { path: '/key', label: '平键连接', desc: '挤压 / 剪切', icon: 'Key', keywords: ['平键'] },
      { path: '/weld', label: '焊缝强度', desc: '角焊 / 对接焊', icon: 'Medal', keywords: ['焊缝', '焊接'] },
      { path: '/bolt-group', label: '螺栓组', desc: '偏心载荷分配', icon: 'Grid', keywords: ['螺栓组'] },
      { path: '/spring', label: '弹簧设计', desc: '刚度 / 切应力', icon: 'Refresh', keywords: ['弹簧'] },
      { path: '/clutch', label: '离合器', desc: '摩擦扭矩', icon: 'Connection', keywords: ['离合器'] },
      { path: '/belt', label: '皮带传动', desc: '链长 / 张力', icon: 'Minus', keywords: ['皮带'] },
      { path: '/chain', label: '链传动', desc: '节距 / 链张力', icon: 'Link', keywords: ['链传动'] },
      { path: '/structural', label: '结构/流体', desc: '压降 · 屈曲 · 模态', icon: 'Odometer', keywords: ['压降', '屈曲', '模态'] },
    ],
  },
  {
    id: 'material',
    label: '材料与工艺',
    tools: [
      { path: '/material-selection', label: '材料选型', desc: '强度/成本/重量', icon: 'Reading', keywords: ['材料选型', '评分'] },
      { path: '/heat-treatment', label: '热处理硬度', desc: 'Jominy · 碳当量 · 回火', icon: 'Sunny', keywords: ['热处理', 'Jominy', '淬硬', '回火'] },
      { path: '/manufacturing', label: '制造工艺', desc: '余量 / 拔模斜度', icon: 'SetUp', keywords: ['机加工', '铸造', '拔模'] },
      { path: '/cylinder', label: '液压/气缸', desc: '推力 / 流量', icon: 'Odometer', keywords: ['液压', '气缸'] },
      { path: '/materials', label: '材料库', desc: '常用材料强度', icon: 'Reading', keywords: ['材料库'] },
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
