/**
 * 方案对比 —— 同一工具下多组 CalcResult 的横向比较
 *
 * 存储在 localStorage 的 mechbox.scenarios 键中，按 toolId 分组：
 *   { [toolId]: [ { id, name, note, snapshot: CalcResult } ] }
 */

import { diffPercent, getCalcReviewStatus, isImprovement } from '@/utils/calc-result'

const STORAGE_KEY = 'mechbox.scenarios'
const MAX_PER_TOOL = 20

function readStore() {
  if (typeof localStorage === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') ?? {}
  } catch {
    return {}
  }
}

function writeStore(store) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* ignore quota */
  }
}

function makeId() {
  return `sc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function listScenarios(toolId) {
  const store = readStore()
  return [...(store[toolId] ?? [])]
}

export function saveScenario(toolId, { name, note, snapshot }) {
  if (!toolId || !snapshot) return null
  const store = readStore()
  const list = store[toolId] ?? []
  const entry = {
    id: makeId(),
    name: name?.trim() || defaultName(list.length),
    note: note ?? '',
    createdAt: Date.now(),
    snapshot,
  }
  list.push(entry)
  while (list.length > MAX_PER_TOOL) list.shift()
  store[toolId] = list
  writeStore(store)
  return entry
}

export function updateScenario(toolId, id, patch) {
  const store = readStore()
  const list = store[toolId] ?? []
  const idx = list.findIndex((s) => s.id === id)
  if (idx < 0) return null
  list[idx] = { ...list[idx], ...patch }
  store[toolId] = list
  writeStore(store)
  return list[idx]
}

export function removeScenario(toolId, id) {
  const store = readStore()
  const list = store[toolId] ?? []
  const next = list.filter((s) => s.id !== id)
  if (next.length === list.length) return false
  store[toolId] = next
  writeStore(store)
  return true
}

export function clearScenarios(toolId) {
  const store = readStore()
  delete store[toolId]
  writeStore(store)
}

function defaultName(index) {
  return `方案 ${String.fromCharCode(65 + (index % 26))}`
}

/**
 * 生成对比矩阵：每个 metric 一行，每个方案一列
 */
export function buildComparison(scenarios) {
  if (!scenarios?.length) return { metrics: [], scenarios: [] }
  const scenariosSlim = scenarios.map((s) => ({
    id: s.id,
    name: s.name,
    note: s.note,
    calcMode: s.snapshot?.calcMode,
    pass: !!s.snapshot?.pass,
    reviewStatus: getCalcReviewStatus(s.snapshot),
  }))

  const metricMap = new Map()
  for (const s of scenarios) {
    for (const m of s.snapshot?.keyMetrics ?? []) {
      if (!metricMap.has(m.key)) {
        metricMap.set(m.key, {
          key: m.key,
          label: m.label,
          unit: m.unit,
          direction: m.direction,
          values: {},
        })
      }
      metricMap.get(m.key).values[s.id] = m
    }
  }

  const baseId = scenarios[0].id
  const metrics = [...metricMap.values()].map((row) => {
    const baseValue = row.values[baseId]?.value
    const columns = {}
    for (const s of scenarios) {
      const val = row.values[s.id]?.value
      const diff = diffPercent(baseValue, val)
      const improved = isImprovement(row.direction, baseValue, val)
      columns[s.id] = {
        value: val,
        diffPercent: diff,
        improved,
        status: row.values[s.id]?.status,
        reviewStatus: getCalcReviewStatus(s.snapshot),
      }
    }
    return { ...row, columns }
  })

  return { metrics, scenarios: scenariosSlim, baseId }
}
