/** @typedef {'zh'|'en'} Locale */

import { calcZh, calcEn } from './calc-i18n'
import { fieldsZh, fieldsEn, mergeCalcPageFields } from './calc-fields-i18n'
import { diagramZh, diagramEn } from './diagram-i18n'
import { optionsZh, optionsEn } from './options-i18n'
import { messagesZh, messagesEn } from './results-i18n'
import { chartZh, chartEn } from './chart-i18n'
import { contentZh, contentEn } from './content-i18n'
import { seoRoutesZh, seoRoutesEn } from './seo-routes-i18n'
import { toolDescsZh, toolDescsEn } from './tool-catalog-i18n'
import { decisionZh, decisionEn } from './decision-i18n'
import { designZh, designEn } from './design-i18n'

const zh = {
  appName: '机械工具箱',
  nav: {
    home: '首页',
    editor: '分析',
    stats: '统计',
    mc: '模拟',
    cases: '案例',
    manual: '手册',
    tools: '工具',
    more: '更多',
    tutorial: '教程',
    glossary: '术语',
    faq: 'FAQ',
    help: '帮助',
    quiz: '练习',
    analysis: '分析',
    forum: '社区论坛',
    login: '登录',
    settings: '设置',
    language: '切换语言',
    menu: '菜单',
    menuClose: '关闭菜单',
  },
  home: {
    quickDesc: '尺寸链 · 强度校核 · 传动与工艺计算',
    quickStart: '快速分析',
    toolMap: '工具地图',
    searchTools: '工具与功能',
    searchAnalysis: '分析类型',
    searchGlossary: '术语',
    searchFormulas: '公式手册',
    searchEmpty: '未找到匹配项，可尝试其他关键词',
    searchViewAll: '在工具地图中查看全部结果 →',
    analysisTypes: '分析类型',
    enterEditor: '进入编辑器 →',
    statTools: '统计工具',
    allStats: '全部统计 →',
    mechTools: '机械计算工具',
  },
  product: {
    l1BannerTitle: '产品使用说明',
    l1BannerBody:
      'MechBox 当前为学习与工程辅助版本：结果基于简化模型，不能作为正式设计签核、制造放行或安全认证依据。正式应用前须由工程师按完整标准复核。',
    l1BannerDismiss: '我知道了',
    l1DisclaimerPdf:
      '本报告由 MechBox 生成，仅供学习、估算与工程辅助分析。不能替代完整国家标准、制造商数据、有限元分析或持证工程师审批。涉及人身与设备安全的结构，须按企业规范复核并留档后再用于生产放行。',
  },
  footer: {
    tagline: '尺寸链公差、机械强度与传动工艺一体化工程计算',
    learn: '学习资源',
    shortcuts: '常用入口',
    help: '帮助',
    stackAnalysis: '尺寸链分析',
    statistics: '概率统计',
    cases: '案例库',
    history: '历史记录',
    faq: '常见问题',
    glossary: '术语词典',
    settings: '设置',
    quiz: '练习题',
    manual: '公式手册',
    forum: 'CAX 社区论坛',
    copyright: '© {year} 机械工具箱',
    disclaimer:
      '本工具仅供学习、估算与工程辅助分析，不能替代完整标准复核或正式设计签核。涉及安全关键结构须由持证工程师按企业规范确认。',
  },
  settings: {
    title: '设置',
    theme: '界面主题',
    themeLight: '浅色',
    themeDark: '深色',
    language: '界面语言',
    langZh: '中文',
    langEn: 'English',
    defaultUnit: '默认单位',
    defaultMethod: '默认计算方法',
    mcIterations: 'Monte Carlo 次数',
    precision: '数值精度（小数位）',
    save: '保存设置',
    reset: '恢复默认',
    saved: '设置已保存',
    resetDone: '已恢复默认设置',
    syncTitle: '数据同步',
    syncDesc: '导出完整备份（历史 + 收藏 + 设置），可导入到其他浏览器或设备。',
    exportBackup: '导出完整备份',
    importBackup: '导入备份',
    backupExported: '备份已下载',
    dataTitle: '数据管理',
    dataDesc: '分析历史可在「历史记录」页导出或删除。',
    openHistory: '打开历史记录 →',
  },
  content: contentZh,
  toolGroups: {
    'design-chain': '设计链（联动分析）',
    chain: '尺寸链与强度',
    drive: '传动与结构',
    material: '材料与工艺',
    reference: '参考与文档',
  },
  analysisGroups: {
    '1d': '1D 线性',
    '2d': '2D 平面',
    '3d': '3D 空间',
    gdt: 'GD&T 公差',
  },
  tools: {
    batch: '批量验证',
    allocation: '公差分配',
    fit: 'ISO 286 配合',
    'gdt-stack': 'GD&T 公差栈',
    units: '单位换算',
    fatigue: '疲劳寿命',
    'interference-fit': '过盈配合',
    'thermal-expansion': '热膨胀',
    gear: '齿轮 ISO/AGMA',
    thread: '螺纹强度',
    'thread-table': '螺纹标准表',
    'bolt-preload': '螺栓预紧力',
    bearing: '轴承寿命',
    beam: '梁挠度',
    'sheet-metal': '钣金展开',
    'o-ring': 'O型圈密封',
    shaft: '轴强度',
    key: '平键连接',
    weld: '焊缝强度',
    'bolt-group': '螺栓组',
    spring: '弹簧设计',
    clutch: '离合器',
    belt: '皮带传动',
    chain: '链传动',
    'pipe-flow': '管路压降',
    'plate-buckling': '薄板屈曲',
    'modal-freq': '固有频率',
    analytics: '回归/DOE',
    cylinder: '液压/气缸',
    materials: '材料库',
    'material-selection': '材料选型',
    'heat-treatment': '热处理硬度',
    manufacturing: '制造工艺',
    quality: 'MSA / FMEA',
    editor: '尺寸链编辑器',
    'tool-map': '工具地图',
    history: '历史记录',
    manual: '公式手册',
    glossary: '术语表',
    cases: '案例库',
    tutorial: '教程',
    faq: '常见问题',
    help: '工具帮助',
    'design/projects': '设计项目',
    'design/powertrain': '轴系设计链',
    'design/bolt-joint': '螺栓连接设计链',
  },
  toolDescs: toolDescsZh,
  statTools: {
    convert: { label: '公差转换', desc: 'T ↔ σ' },
    rss: { label: 'RSS 计算', desc: '基础 + 加权 + 修正' },
    sigma: { label: '西格玛分析', desc: 'C / Cpk / 合格率' },
    chart: { label: '分布曲线', desc: 'Plotly PDF 图' },
    'monte-carlo': { label: 'Monte Carlo', desc: '随机模拟 · 龙卷风图' },
    quality: { label: 'MSA / SPC / FMEA', desc: 'Gage R&R · 控制图 · AQL' },
    analytics: { label: '回归 / DOE / RSM', desc: '拟合 · 正交 · 响应面' },
  },
  routes: {
    home: '首页',
    editor: '尺寸链分析',
    'editor-detail': '尺寸链分析',
    statistics: '概率统计',
    tutorial: '教程',
    cases: '案例库',
    quiz: '练习题库',
    manual: '公式手册',
    'monte-carlo': 'Monte Carlo 模拟',
    history: '历史记录',
    settings: '设置',
    glossary: '术语词典',
    account: '账号',
    batch: '批量验证',
    gear: '齿轮强度计算',
    thread: '螺纹强度',
    'thread-table': '螺纹标准表',
    'bolt-preload': '螺栓预紧力',
    bearing: '轴承寿命',
    shaft: '轴强度',
    key: '平键连接',
    weld: '焊缝强度',
    'bolt-group': '螺栓组受力',
    spring: '弹簧设计',
    clutch: '离合器',
    belt: '皮带传动',
    chain: '链传动',
    cylinder: '液压/气缸',
    materials: '材料库',
    allocation: '公差分配',
    'interference-fit': '过盈配合',
    beam: '梁挠度与应力',
    'thermal-expansion': '热膨胀补偿',
    quality: '质量分析',
    'sheet-metal': '钣金展开',
    'o-ring': 'O型圈密封',
    fatigue: '疲劳寿命',
    analytics: '回归与实验设计',
    'pipe-flow': '管路压降',
    'plate-buckling': '薄板屈曲',
    'modal-freq': '固有频率',
    'material-selection': '材料选型',
    manufacturing: '制造工艺',
    'heat-treatment': '热处理硬度',
    tools: '工具地图',
    units: '单位换算',
    fit: 'ISO 286 配合',
    'gdt-stack': 'GD&T 公差栈',
    faq: '常见问题',
    help: '工具帮助文档',
    'help-tool': '工具帮助文档',
  },
  seo: {
    defaultTitle: '机械工具箱 — 尺寸链、强度与传动工艺计算',
    defaultDescription:
      '在线尺寸链公差分析、机械强度校核与传动工艺计算。支持 RSS/极值/GD&T、Monte Carlo，以及齿轮、轴承、螺栓、弹簧、皮带链、液压与热处理等工程工具。',
    pageDescription: '{page} — 在线尺寸链、机械强度与传动工艺计算工具。',
    keywords:
      '机械工具箱,尺寸链,公差分析,尺寸链叠加,RSS法,极值法,GD&T,形位公差,Monte Carlo,概率统计,Cpk,齿轮强度,ISO 6336,轴承寿命,螺纹强度,螺栓预紧力,轴强度,平键连接,焊缝强度,弹簧设计,皮带传动,链条传动,液压缸,热处理,公差分配,机械设计,mechbox',
    routes: seoRoutesZh,
  },
  calc: {
    common: calcZh.common,
    fields: calcZh.fields,
    pages: calcZh.pages,
    diagrams: diagramZh,
    options: optionsZh,
    messages: messagesZh,
    charts: chartZh,
    decision: decisionZh,
    design: designZh,
  },
}

const en = {
  appName: 'MechBox',
  nav: {
    home: 'Home',
    editor: 'Analysis',
    stats: 'Statistics',
    mc: 'Simulation',
    cases: 'Cases',
    manual: 'Manual',
    tools: 'Tools',
    more: 'More',
    tutorial: 'Tutorials',
    glossary: 'Glossary',
    faq: 'FAQ',
    help: 'Help',
    quiz: 'Quiz',
    analysis: 'Analysis',
    forum: 'Community',
    login: 'Sign in',
    settings: 'Settings',
    language: 'Switch language',
    menu: 'Menu',
    menuClose: 'Close menu',
  },
  home: {
    quickDesc: 'Tolerance stacks · Strength · Drives & process',
    quickStart: 'Quick analysis',
    toolMap: 'Tool map',
    searchTools: 'Tools & features',
    searchAnalysis: 'Analysis types',
    searchGlossary: 'Glossary',
    searchFormulas: 'Formula handbook',
    searchEmpty: 'No matches — try another keyword',
    searchViewAll: 'View all results in tool map →',
    analysisTypes: 'Analysis types',
    enterEditor: 'Open editor →',
    statTools: 'Statistics tools',
    allStats: 'All statistics →',
    mechTools: 'Mechanical calculators',
  },
  product: {
    l1BannerTitle: 'Product notice',
    l1BannerBody:
      'MechBox is for learning and engineering assistance. Results use simplified models and must not be used as formal design sign-off, manufacturing release, or safety certification. Verify against full standards before production use.',
    l1BannerDismiss: 'Got it',
    l1DisclaimerPdf:
      'Generated by MechBox for learning, estimation, and engineering assistance only. Not a substitute for full standards, manufacturer data, FEA, or sign-off by a qualified engineer. Safety-critical structures require company review and documentation before production release.',
  },
  footer: {
    tagline: 'Tolerance stacks, strength checks, and drive & process engineering calculators',
    learn: 'Learning',
    shortcuts: 'Shortcuts',
    help: 'Help',
    stackAnalysis: 'Stack analysis',
    statistics: 'Statistics',
    cases: 'Case library',
    history: 'History',
    faq: 'FAQ',
    glossary: 'Glossary',
    settings: 'Settings',
    quiz: 'Quiz',
    manual: 'Formula manual',
    forum: 'CAX community forum',
    copyright: '© {year} MechBox',
    disclaimer:
      'For learning, estimation, and engineering assistance only — not a substitute for full standard review or formal design release. Safety-critical designs require qualified engineer sign-off.',
  },
  settings: {
    title: 'Settings',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
    langZh: '中文',
    langEn: 'English',
    defaultUnit: 'Default unit',
    defaultMethod: 'Default stack method',
    mcIterations: 'Monte Carlo iterations',
    precision: 'Decimal places',
    save: 'Save settings',
    reset: 'Reset defaults',
    saved: 'Settings saved',
    resetDone: 'Defaults restored',
    syncTitle: 'Data sync',
    syncDesc: 'Export a full backup (history, favorites, settings) and import on another device.',
    exportBackup: 'Export backup',
    importBackup: 'Import backup',
    backupExported: 'Backup downloaded',
    dataTitle: 'Data management',
    dataDesc: 'Analysis history can be exported or deleted on the History page.',
    openHistory: 'Open history →',
  },
  content: contentEn,
  toolGroups: {
    'design-chain': 'Design chains (linked analysis)',
    chain: 'Tolerance stack & strength',
    drive: 'Drives & structures',
    material: 'Materials & process',
    reference: 'Reference',
  },
  analysisGroups: {
    '1d': '1D linear',
    '2d': '2D planar',
    '3d': '3D spatial',
    gdt: 'GD&T',
  },
  tools: {
    batch: 'Batch verification',
    allocation: 'Tolerance allocation',
    fit: 'ISO 286 fits',
    'gdt-stack': 'GD&T stack-up',
    units: 'Unit converter',
    fatigue: 'Fatigue life',
    'interference-fit': 'Interference fit',
    'thermal-expansion': 'Thermal expansion',
    gear: 'Gear ISO/AGMA',
    thread: 'Thread strength',
    'thread-table': 'Thread standards',
    'bolt-preload': 'Bolt preload',
    bearing: 'Bearing life',
    beam: 'Beam deflection',
    'sheet-metal': 'Sheet metal unfold',
    'o-ring': 'O-ring seal',
    shaft: 'Shaft strength',
    key: 'Keyway connection',
    weld: 'Weld strength',
    'bolt-group': 'Bolt group',
    spring: 'Spring design',
    clutch: 'Clutch torque',
    belt: 'Belt drive',
    chain: 'Roller chain',
    'pipe-flow': 'Pipe pressure drop',
    'plate-buckling': 'Plate buckling',
    'modal-freq': 'Natural frequency',
    analytics: 'Regression / DOE',
    cylinder: 'Hydraulic cylinder',
    materials: 'Material library',
    'material-selection': 'Material selection',
    'heat-treatment': 'Heat treatment',
    manufacturing: 'Manufacturing',
    quality: 'MSA / FMEA',
    editor: 'Stack editor',
    'tool-map': 'Tool map',
    history: 'History',
    manual: 'Formula manual',
    glossary: 'Glossary',
    cases: 'Case library',
    tutorial: 'Tutorials',
    faq: 'FAQ',
    help: 'Tool help',
    'design/projects': 'Design projects',
    'design/powertrain': 'Powertrain design chain',
    'design/bolt-joint': 'Bolt-joint design chain',
  },
  toolDescs: toolDescsEn,
  statTools: {
    convert: { label: 'Tolerance conversion', desc: 'T ↔ σ' },
    rss: { label: 'RSS calculator', desc: 'Basic + weighted + modified' },
    sigma: { label: 'Sigma analysis', desc: 'C / Cpk / yield rate' },
    chart: { label: 'Distribution curve', desc: 'Plotly PDF chart' },
    'monte-carlo': { label: 'Monte Carlo', desc: 'Random simulation · tornado chart' },
    quality: { label: 'MSA / SPC / FMEA', desc: 'Gage R&R · control charts · AQL' },
    analytics: { label: 'Regression / DOE / RSM', desc: 'Fit · orthogonal · response surface' },
  },
  routes: {
    home: 'Home',
    editor: 'Tolerance stack analysis',
    'editor-detail': 'Tolerance stack analysis',
    statistics: 'Statistics',
    tutorial: 'Tutorials',
    cases: 'Case library',
    quiz: 'Practice quiz',
    manual: 'Formula manual',
    'monte-carlo': 'Monte Carlo simulation',
    history: 'History',
    settings: 'Settings',
    glossary: 'GD&T glossary',
    account: 'Account',
    batch: 'Batch verification',
    gear: 'Gear strength',
    thread: 'Thread strength',
    'thread-table': 'Thread standards',
    'bolt-preload': 'Bolt preload',
    bearing: 'Bearing life',
    shaft: 'Shaft strength',
    key: 'Keyway connection',
    weld: 'Weld strength',
    'bolt-group': 'Bolt group loading',
    spring: 'Spring design',
    clutch: 'Clutch torque',
    belt: 'Belt drive',
    chain: 'Roller chain drive',
    cylinder: 'Hydraulic cylinder',
    materials: 'Material library',
    allocation: 'Tolerance allocation',
    'interference-fit': 'Interference fit',
    beam: 'Beam deflection & stress',
    'thermal-expansion': 'Thermal expansion',
    quality: 'Quality analysis',
    'sheet-metal': 'Sheet metal unfold',
    'o-ring': 'O-ring seal design',
    fatigue: 'Fatigue life',
    analytics: 'Regression & DOE',
    'pipe-flow': 'Pipe pressure drop',
    'plate-buckling': 'Plate buckling',
    'modal-freq': 'Natural frequency',
    'material-selection': 'Material selection',
    manufacturing: 'Manufacturing',
    'heat-treatment': 'Heat treatment hardness',
    tools: 'Tool map',
    units: 'Unit converter',
    fit: 'ISO 286 fits',
    'gdt-stack': 'GD&T tolerance stack',
    faq: 'FAQ',
    help: 'Tool help',
    'help-tool': 'Tool help',
  },
  seo: {
    defaultTitle: 'MechBox — Tolerance, Strength & Drive Calculators',
    defaultDescription:
      'Online tolerance stacks, mechanical strength checks, and drive/process calculators. RSS/worst-case/GD&T, Monte Carlo, plus gears, bearings, bolts, springs, belts, chains, hydraulics, heat treatment, and more.',
    pageDescription: '{page} — Online tolerance, strength, and drive/process engineering calculator.',
    keywords:
      'MechBox,tolerance stack,stack-up analysis,RSS,worst-case,GD&T,geometric dimensioning,Monte Carlo,Cpk,gear strength,ISO 6336,bearing life L₁₀,L10,thread strength,bolt preload,shaft strength,keyway,weld strength,spring design,belt drive,chain drive,hydraulic cylinder,heat treatment,mechanical engineering calculator',
    routes: seoRoutesEn,
  },
  calc: {
    common: calcEn.common,
    fields: calcEn.fields,
    pages: calcEn.pages,
    diagrams: diagramEn,
    options: optionsEn,
    messages: messagesEn,
    charts: chartEn,
    decision: decisionEn,
    design: designEn,
  },
}

export const messages = { zh, en }

/** @param {string} path e.g. /bolt-preload */
export function toolKeyFromPath(path) {
  if (!path || path === '/') return ''
  return path.replace(/^\//, '')
}

/**
 * @param {string} key dot path
 * @param {Locale} locale
 * @param {Record<string, string|number>} [params]
 */
export function t(key, locale = 'zh', params) {
  const parts = key.split('.')
  let node = messages[locale] ?? messages.zh
  for (const p of parts) {
    node = node?.[p]
  }
  if (node == null) {
    node = messages.zh
    for (const p of parts) {
      node = node?.[p]
    }
  }
  let text = node ?? key
  if (params && typeof text === 'string') {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }
  return text
}

export function localizedToolLabel(path, locale = 'zh', fallback) {
  const key = toolKeyFromPath(path)
  const labelKey = `tools.${key}`
  const label = t(labelKey, locale)
  if (label !== labelKey) return label
  return fallback ?? path
}

/** Localize label + desc for a catalog tool (path-based or stat query tool). */
export function localizedTool(tool, locale = 'zh') {
  const key = tool.path ? toolKeyFromPath(tool.path) : tool.query
  const statNode = messages[locale]?.statTools?.[key] ?? messages.zh?.statTools?.[key]
  if (statNode) {
    return localizedStatTool(tool, locale)
  }
  const label = localizedToolLabel(tool.path, locale, tool.label)
  const descKey = `toolDescs.${key}`
  const desc = t(descKey, locale)
  return {
    ...tool,
    label,
    desc: desc !== descKey ? desc : tool.desc,
  }
}

export function localizedStatTool(tool, locale = 'zh') {
  const key = tool.path ? toolKeyFromPath(tool.path) : tool.query
  const node = messages[locale]?.statTools?.[key] ?? messages.zh?.statTools?.[key]
  if (!node) return tool
  return {
    ...tool,
    label: node.label ?? tool.label,
    desc: node.desc ?? tool.desc,
  }
}

export function localizedAnalysisType(typeId, locale = 'zh', field = 'name') {
  const path = `calc.pages.editor.analysisTypes.${typeId}.${field}`
  const val = t(path, locale)
  return val !== path ? val : typeId
}
