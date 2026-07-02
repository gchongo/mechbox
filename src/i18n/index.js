export const messages = {
  zh: {
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
      quiz: '练习',
    },
  },
  en: {
    appName: 'Mechanical Toolbox',
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
      quiz: 'Quiz',
    },
  },
}

export function t(key, locale = 'zh') {
  const parts = key.split('.')
  let node = messages[locale] ?? messages.zh
  for (const p of parts) {
    node = node?.[p]
  }
  return node ?? key
}
