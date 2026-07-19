const fs = require('fs')
const md = fs.readFileSync('d:/Tolerance/knowledge-research/04-standards-catalog.md', 'utf8')
const lines = md.split(/\r?\n/)

const sectionMeta = {
  '优先级定义': { id: 'priority', kind: 'priority' },
  '1. ISO GPS 总体系与基础原则': { id: 'gps', kind: 'standards' },
  '2. 尺寸、公差与配合': { id: 'fits', kind: 'standards' },
  '3. GD&T / ISO 几何公差': { id: 'gdt', kind: 'standards' },
  '4. 表面纹理与表面完整性': { id: 'surface', kind: 'standards' },
  '5. 计量、验证、不确定度与判定': { id: 'metrology', kind: 'standards' },
  '6. ASME Y14 图样、GD&T 与 MBD': { id: 'asme-y14', kind: 'standards' },
  '7. ASME B89 与尺寸计量': { id: 'asme-b89', kind: 'standards' },
  '8. 数字化产品定义、STEP、QIF 与数据交换': { id: 'mbd', kind: 'standards' },
  '9. 技术产品文件与工程图通用标准': { id: 'drawings', kind: 'standards' },
  '10. 质量管理、SPC、MSA、APQP、FMEA': { id: 'quality', kind: 'standards' },
  '11. 制造、材料、连接与可靠性': { id: 'mfg', kind: 'standards' },
  '12. GB/T、DIN、JIS 等采用关系': { id: 'adopt', kind: 'adopt' },
  '13. 建议建立的标准页第一批': { id: 'first-batch', kind: 'batch' },
  '14. 内容开发时的硬规则': { id: 'rules', kind: 'rules' },
  '15. 工程图与文档体系补全': { id: 'drawings-ext', kind: 'standards' },
  '16. 测量、量具、CMM 与实验室能力补全': { id: 'metrology-ext', kind: 'standards' },
  '17. 表面纹理、焊接、铸件、NDT 与增材': { id: 'surface-ext', kind: 'standards' },
  '18. 质量统计、抽样、能力、风险与改进': { id: 'quality-ext', kind: 'standards' },
  '19. 材料、紧固件、轴承、密封与环境试验': { id: 'parts-ext', kind: 'standards' },
  '20. 旧版、采用版与待核验映射': { id: 'legacy', kind: 'legacy' },
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

const sections = []
let cur = null

for (const line of lines) {
  const h2 = line.match(/^##\s+(.+)/)
  if (h2) {
    const title = h2[1].trim()
    const meta = sectionMeta[title] || { id: slug(title), kind: 'standards' }
    cur = {
      id: meta.id,
      kind: meta.kind,
      titleZh: title.replace(/^\d+\.\s*/, ''),
      noteZh: '',
      items: [],
    }
    sections.push(cur)
    continue
  }
  if (!cur) continue
  if (line.startsWith('>')) {
    const t = line.replace(/^>\s?/, '').trim()
    if (t) cur.noteZh = (cur.noteZh ? `${cur.noteZh} ` : '') + t
    continue
  }
  if (cur.kind === 'batch') {
    const m = line.match(/^\d+\.\s+(.+)/)
    if (m) {
      const parts = m[1].split(' - ')
      cur.items.push({
        id: `batch-${slug(parts[0])}`,
        code: parts[0].trim(),
        topicZh: (parts[1] || '').trim(),
        priority: 'P0',
        useZh: '建议优先建立标准导航页',
      })
    }
    continue
  }
  if (cur.kind === 'rules') {
    if (line.startsWith('- ')) cur.items.push({ textZh: line.slice(2).trim() })
    continue
  }
  if (!line.startsWith('|') || line.includes('---')) continue
  const cells = line
    .split('|')
    .map((s) => s.trim())
    .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
  if (!cells.length) continue
  if (['优先级', '主题', '标准', '标准/指南', '标准/手册', '候选标准'].includes(cells[0])) continue

  if (cur.kind === 'priority') {
    cur.items.push({ priority: cells[0], labelZh: cells[1], handleZh: cells[2] })
  } else if (cur.kind === 'legacy') {
    cur.items.push({
      id: `${cur.id}-${slug(cells[0])}`,
      topicZh: cells[0],
      legacyZh: cells[1],
      currentZh: cells[2],
      noteZh: cells[3] || '',
      priority: '待核验',
      code: cells[2],
      useZh: cells[3] || '',
    })
  } else if (cur.kind === 'adopt') {
    cur.items.push({
      id: `${cur.id}-${slug(cells[1])}`,
      priority: cells[0],
      code: cells[1],
      topicZh: cells[2],
      useZh: cells[3] || '',
    })
  } else {
    cur.items.push({
      id: `${cur.id}-${slug(cells[1])}`,
      priority: cells[0],
      code: cells[1],
      topicZh: cells[2],
      useZh: cells[3] || '',
    })
  }
}

const out = `/**
 * Tolerance / GPS 相关标准目录（导航母表）
 * 来源：Tolerance Hub 04-standards-catalog.md（2026-07-18）
 * 不复制标准正文；版本须以官方页为准。
 */

export const STANDARDS_CATALOG_META = {
  updated: '2026-07-18',
  sourceZh: 'Tolerance Hub 标准导航母表',
  disclaimerZh:
    '本页仅作标准体系导航与主题索引，不替代标准购买、阅读与企业合规审核。正式引用前请再次核对官方标准页版本。',
  disclaimerEn:
    'Navigation index only — not a substitute for purchasing/reading standards or compliance review. Re-check official editions before citing.',
}

export const STANDARDS_CATALOG_SECTIONS = ${JSON.stringify(sections, null, 2)}

export function listAllStandards() {
  return STANDARDS_CATALOG_SECTIONS.flatMap((sec) => {
    if (sec.kind === 'priority' || sec.kind === 'rules') return []
    return sec.items.map((it) => ({
      ...it,
      sectionId: sec.id,
      sectionTitleZh: sec.titleZh,
      kind: sec.kind,
    }))
  })
}

export function searchStandardsCatalog({ query = '', priority = 'all', sectionId = 'all' } = {}) {
  const q = String(query).trim().toLowerCase()
  return listAllStandards().filter((it) => {
    if (priority !== 'all' && it.priority !== priority) return false
    if (sectionId !== 'all' && it.sectionId !== sectionId) return false
    if (!q) return true
    const hay = [it.code, it.topicZh, it.useZh, it.legacyZh, it.currentZh, it.noteZh, it.sectionTitleZh]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}

export function countByPriority() {
  const all = listAllStandards()
  const map = { P0: 0, P1: 0, P2: 0, 待核验: 0, other: 0 }
  for (const it of all) {
    if (map[it.priority] != null) map[it.priority] += 1
    else map.other += 1
  }
  return { ...map, total: all.length }
}
`

fs.writeFileSync('src/constants/standards-catalog.js', out, 'utf8')
const n = sections.reduce((a, s) => a + s.items.length, 0)
console.log('sections', sections.length, 'items', n)
