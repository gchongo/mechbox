/**
 * 全局计算历史 — 各工具页结果写入统一历史存储
 */
import { getAnalysisById, saveAnalysis } from '@/utils/storage'
import { t, localizedToolLabel, localizedAnalysisType } from '@/i18n'

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

export function normalizeHistoryStatus(status) {
  if (status === 'pass' || status === 'review' || status === 'fail') return status
  return 'draft'
}

export function saveToolHistory({ tool, title, status = 'pass', summary = [], input = {}, result = {} }) {
  const meta = TOOL_META[tool] ?? { label: tool, route: '/' }
  return saveAnalysis({
    source: 'tool',
    tool,
    title: title ?? `${meta.label} 计算`,
    status: normalizeHistoryStatus(status),
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

export function buildToolReplayRoute(record) {
  const route = getToolRoute(record?.tool)
  if (!route || !record?.id) return null
  return {
    path: route,
    query: { historyId: String(record.id), replay: 'history' },
  }
}

export function getToolReplayRecord(historyId, tool) {
  if (!historyId) return null
  const record = getAnalysisById(String(historyId))
  if (!record || record.source !== 'tool') return null
  if (tool && record.tool !== tool) return null
  return record
}

export function formatHistorySource(record, locale = 'zh') {
  if (record.source === 'tool') {
    const route = getToolRoute(record.tool)
    if (route) return localizedToolLabel(route, locale)
    return record.data?.toolLabel ?? t('content.history.sourceTool', locale)
  }
  return t('content.history.sourceEditor', locale)
}

export function formatHistoryStatus(status, locale = 'zh') {
  if (status === 'pass') return t('content.history.statusPass', locale)
  if (status === 'review') return t('content.history.statusReview', locale)
  if (status === 'fail') return t('content.history.statusFail', locale)
  return t('content.history.statusDraft', locale)
}

export function formatHistoryTitle(record, locale = 'zh') {
  const data = record.data ?? {}
  if (data.selectedType?.id) {
    const typeName = localizedAnalysisType(data.selectedType.id, locale)
    const ringName = data.closedRing?.name ?? 'L0'
    return `${typeName} ${ringName}`
  }
  if (record.source === 'tool' && record.tool) {
    const route = getToolRoute(record.tool)
    const label = route ? localizedToolLabel(route, locale) : record.tool
    return t('content.history.toolCalcTitle', locale, { tool: label })
  }
  return record.title ?? t('content.history.untitled', locale)
}

export function formatHistoryType(record, locale = 'zh') {
  const data = record.data ?? {}
  if (data.selectedType?.id) {
    return localizedAnalysisType(data.selectedType.id, locale)
  }
  if (record.source === 'tool') {
    const route = getToolRoute(record.tool)
    if (route) return localizedToolLabel(route, locale)
    return record.data?.toolLabel ?? record.tool ?? '-'
  }
  return data.selectedType?.name ?? '-'
}

export function buildSummaryRows(record, locale = 'zh') {
  const data = record.data ?? {}
  if (record.source === 'tool') {
    const rows = Array.isArray(data.summary) ? [...data.summary] : []
    const result = data.result
    if (Array.isArray(result?.warnings) && result.warnings.length) {
      rows.push({
        label: t('content.history.summaryWarnings', locale),
        value: result.warnings
          .map((w) => `[${(w.level ?? 'info').toUpperCase()}] ${w.message ?? w.key}`)
          .join('；'),
      })
    }
    if (Array.isArray(result?.assumptions) && result.assumptions.length) {
      rows.push({
        label: t('content.history.summaryAssumptions', locale),
        value: result.assumptions.join('；'),
      })
    }
    return rows
  }
  if (data.closedRing) {
    const rows = [
      { label: t('calc.pages.editor.export.closedRing', locale), value: data.closedRing.name },
      {
        label: t('calc.pages.editor.dashboard.range', locale),
        value: `${data.closedRing.min} ~ ${data.closedRing.max}`,
      },
      { label: t('calc.pages.editor.export.colMethod', locale), value: data.method ?? '-' },
    ]
    const snapshot = data.snapshot
    if (Array.isArray(snapshot?.warnings) && snapshot.warnings.length) {
      rows.push({
        label: t('content.history.summaryWarnings', locale),
        value: snapshot.warnings
          .map((w) => `[${(w.level ?? 'info').toUpperCase()}] ${w.message ?? w.key}`)
          .join('；'),
      })
    }
    if (Array.isArray(snapshot?.assumptions) && snapshot.assumptions.length) {
      rows.push({
        label: t('content.history.summaryAssumptions', locale),
        value: snapshot.assumptions.join('；'),
      })
    }
    return rows
  }
  return []
}
