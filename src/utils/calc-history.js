/**
 * 全局计算历史 — 各工具页结果写入统一历史存储
 */
import { saveAnalysis } from '@/utils/storage'

export const TOOL_META = {
  editor: { label: '尺寸链', route: '/editor' },
  'gdt-stack': { label: 'GD&T 公差栈', route: '/gdt-stack' },
  fit: { label: 'ISO 286 配合', route: '/fit' },
  weld: { label: '焊缝强度', route: '/weld' },
  'bolt-preload': { label: '螺栓预紧力', route: '/bolt-preload' },
  units: { label: '单位换算', route: '/units' },
  gear: { label: '齿轮强度', route: '/gear' },
  beam: { label: '梁挠度', route: '/beam' },
}

export function saveToolHistory({ tool, title, status = 'pass', summary = [], input = {}, result = {} }) {
  const meta = TOOL_META[tool] ?? { label: tool, route: '/' }
  return saveAnalysis({
    source: 'tool',
    tool,
    title: title ?? `${meta.label} 计算`,
    status,
    data: {
      tool,
      toolLabel: meta.label,
      summary,
      input,
      result,
    },
  })
}

export function getToolRoute(tool) {
  return TOOL_META[tool]?.route ?? null
}

export function formatHistorySource(record) {
  if (record.source === 'tool') {
    return record.data?.toolLabel ?? TOOL_META[record.tool]?.label ?? '工具'
  }
  return record.data?.selectedType?.name ? '尺寸链' : '尺寸链'
}

export function buildSummaryRows(record) {
  const data = record.data ?? {}
  if (record.source === 'tool' && data.summary?.length) {
    return data.summary
  }
  if (data.closedRing) {
    return [
      { label: '封闭环', value: data.closedRing.name },
      { label: '范围', value: `${data.closedRing.min} ~ ${data.closedRing.max}` },
      { label: '方法', value: data.method ?? '-' },
    ]
  }
  return []
}
