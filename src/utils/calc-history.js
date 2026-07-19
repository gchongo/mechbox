/**
 * 全局计算历史 — 各工具页结果写入统一历史存储
 */
import { getAnalysisById, saveAnalysis } from '@/utils/storage'
import { t, localizedToolLabel, localizedAnalysisType } from '@/i18n'
import { stampHistoryInput } from '@/utils/history-replay'

export const TOOL_META = {
  editor: { label: '尺寸链', route: '/editor' },
  statistics: { label: '过程能力', route: '/statistics' },
  'monte-carlo': { label: '蒙特卡洛', route: '/monte-carlo' },
  batch: { label: '批量分析', route: '/batch' },
  allocation: { label: '公差分配', route: '/allocation' },
  gear: { label: '齿轮强度', route: '/gear' },
  thread: { label: '螺纹计算', route: '/thread' },
  'bolt-preload': { label: '螺栓预紧力', route: '/bolt-preload' },
  bearing: { label: '轴承寿命', route: '/bearing' },
  shaft: { label: '轴强度', route: '/shaft' },
  key: { label: '平键连接', route: '/key' },
  weld: { label: '焊缝强度', route: '/weld' },
  'bolt-group': { label: '螺栓组', route: '/bolt-group' },
  spring: { label: '弹簧设计', route: '/spring' },
  clutch: { label: '离合器', route: '/clutch' },
  belt: { label: '带传动', route: '/belt' },
  chain: { label: '链传动', route: '/chain' },
  'worm-gear': { label: '蜗轮蜗杆', route: '/worm-gear' },
  'bevel-gear': { label: '锥齿轮', route: '/bevel-gear' },
  cylinder: { label: '油缸推力', route: '/cylinder' },
  'interference-fit': { label: '过盈配合', route: '/interference-fit' },
  beam: { label: '梁挠度', route: '/beam' },
  'thermal-expansion': { label: '热膨胀', route: '/thermal-expansion' },
  quality: { label: '质量特性', route: '/quality' },
  'sheet-metal': { label: '钣金展开', route: '/sheet-metal' },
  'o-ring': { label: 'O 形圈密封', route: '/o-ring' },
  fatigue: { label: '疲劳寿命', route: '/fatigue' },
  analytics: { label: '数据分析', route: '/analytics' },
  'pipe-flow': { label: '管路压降', route: '/pipe-flow' },
  'plate-buckling': { label: '薄板屈曲', route: '/plate-buckling' },
  'column-buckling': { label: '柱屈曲', route: '/column-buckling' },
  'pin-retainer': { label: '销 / 挡圈', route: '/pin-retainer' },
  'gasket-flange': { label: '垫片法兰密封', route: '/gasket-flange' },
  'modal-freq': { label: '固有频率', route: '/modal-freq' },
  'vibration-isolation': { label: '隔振传递率', route: '/vibration-isolation' },
  'heat-transfer': { label: '简单换热', route: '/heat-transfer' },
  /** @deprecated 旧合并页；按 input.tab 解析到新路由 */
  structural: { label: '结构分析', route: '/pipe-flow' },
  'material-selection': { label: '选材决策', route: '/material-selection' },
  manufacturing: { label: '制造工艺', route: '/manufacturing' },
  'standards-ref': { label: '标准件速查', route: '/standards-ref' },
  'heat-treatment': { label: '热处理', route: '/heat-treatment' },
  units: { label: '单位换算', route: '/units' },
  fit: { label: 'ISO 286 配合', route: '/fit' },
  'gdt-stack': { label: 'GD&T 公差栈', route: '/gdt-stack' },
}

const INPUT_META_KEYS = new Set(['_schemaVersion', '_savedAt', '_tool'])

export function hasReplayableInput(record) {
  const input = record?.data?.input
  if (!input || typeof input !== 'object') return false
  return Object.keys(input).some((key) => !INPUT_META_KEYS.has(key) && !key.startsWith('_'))
}

/** @deprecated Use hasReplayableInput(record) — replay is input-driven, not tool-whitelisted */
export function toolSupportsReplay(tool) {
  return Boolean(getToolRoute(tool))
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
      input: stampHistoryInput(input, tool),
      result,
    },
  })
}

const STRUCTURAL_TAB_ROUTE = {
  pipe: '/pipe-flow',
  plate: '/plate-buckling',
  modal: '/modal-freq',
}

const STRUCTURAL_TAB_TOOL = {
  pipe: 'pipe-flow',
  plate: 'plate-buckling',
  modal: 'modal-freq',
}

export function getToolRoute(tool, record) {
  if (tool === 'structural') {
    const tab = record?.data?.input?.tab ?? 'pipe'
    return STRUCTURAL_TAB_ROUTE[tab] ?? '/pipe-flow'
  }
  return TOOL_META[tool]?.route ?? null
}

export function buildToolReplayRoute(record) {
  if (!record?.id || (record.source ?? 'editor') !== 'tool') return null
  if (!hasReplayableInput(record)) return null
  const route = getToolRoute(record.tool, record)
  if (!route) return null
  return {
    path: route,
    query: { historyId: String(record.id), replay: 'history' },
  }
}

/**
 * Resolve how a history row should open (editor reload, input replay, or tool page without replay).
 * @returns {{ kind: 'editor', id: string } | { kind: 'replay', route: object } | { kind: 'tool-blank', path: string, tool: string } | { kind: 'summary-only', record: object, reason?: string }}
 */
export function resolveHistoryOpenTarget(record) {
  if (!record?.id) return { kind: 'summary-only', record }
  const source = record.source ?? 'editor'
  if (source !== 'tool') {
    return { kind: 'editor', id: String(record.id) }
  }
  const replayRoute = buildToolReplayRoute(record)
  if (replayRoute) {
    return { kind: 'replay', route: replayRoute }
  }
  const path = getToolRoute(record.tool, record)
  if (path) {
    // Safety-first: never open a blank tool page that could be mistaken for restored state.
    return {
      kind: 'summary-only',
      record,
      reason: hasReplayableInput(record) ? 'replay_unsupported' : 'no_input_snapshot',
    }
  }
  return { kind: 'summary-only', record }
}

export function getToolReplayRecord(historyId, tool) {
  if (!historyId) return null
  const record = getAnalysisById(String(historyId))
  if (!record || record.source !== 'tool') return null
  if (tool && record.tool !== tool) {
    if (record.tool === 'structural') {
      const tab = record.data?.input?.tab ?? 'pipe'
      if (STRUCTURAL_TAB_TOOL[tab] === tool) return record
    }
    return null
  }
  return record
}

export function formatHistorySource(record, locale = 'zh') {
  if (record.source === 'tool') {
    const route = getToolRoute(record.tool, record)
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
    const route = getToolRoute(record.tool, record)
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
    const route = getToolRoute(record.tool, record)
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
