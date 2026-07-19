import { getCalcReviewStatus } from '@/utils/calc-result'

/**
 * 设计链上下文 —— 一个"设计链"贯穿多个工具，共享输入并沉淀各步的 CalcResult
 *
 * 存储在 localStorage 的 mechbox.designChains 键中：
 *   [{ id, name, type, sharedInputs, steps: [{ key, toolId, snapshot, notes }], updatedAt }]
 */

const STORAGE_KEY = 'mechbox.designChains'
const MAX_CHAINS = 30

function readStore() {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
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
  return `dc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const CHAIN_TYPES = {
  powertrain: {
    id: 'powertrain',
    label: '轴系设计链',
    description: '轴 → 轴承 → 键 联动分析',
    steps: [
      { key: 'shaft', toolId: 'shaft', label: '轴强度', quickInverse: 'min-diameter-standard' },
      { key: 'bearing', toolId: 'bearing', label: '轴承寿命', quickInverse: 'pick-standard-model' },
      { key: 'key', toolId: 'key', label: '平键连接', quickInverse: 'min-key-length' },
    ],
    sharedInputSchema: {
      torque: { label: '扭矩 T (N·m)', default: 200, min: 0 },
      rpm: { label: '转速 n (rpm)', default: 1500, min: 1 },
      shaftDiameter: { label: '轴径 d (mm)', default: 30, min: 5 },
      yieldStrength: { label: '屈服强度 σ_s (MPa)', default: 235, min: 100 },
      targetHours: { label: '目标寿命 (h)', default: 10000, min: 100 },
      radialLoad: { label: '径向载荷 Fr (N)', default: 5000, min: 0 },
      axialLoad: { label: '轴向载荷 Fa (N)', default: 500, min: 0 },
      dynamicLoad: { label: '轴承动载 C (N)', default: 30000, min: 1000 },
      keyWidth: { label: '键宽 b (mm)', default: 8, min: 2 },
      keyLength: { label: '键长 L (mm)', default: 28, min: 5 },
    },
  },
  'bolt-joint': {
    id: 'bolt-joint',
    label: '螺栓连接设计链',
    description: '螺栓预紧 → 螺栓组 → 焊缝 联动分析',
    steps: [
      { key: 'bolt-preload', toolId: 'bolt-preload', label: '螺栓预紧力', quickInverse: 'no-separation' },
      { key: 'bolt-group', toolId: 'bolt-group', label: '螺栓组', quickInverse: 'min-bolt-count' },
      { key: 'weld', toolId: 'weld', label: '焊缝强度', quickInverse: 'min-leg-size' },
    ],
    sharedInputSchema: {
      diameter: { label: '螺栓直径 M (mm)', default: 10, min: 6 },
      pitch: { label: '螺距 p (mm)', default: 1.5, min: 0.5, step: 0.25, precision: 2 },
      preload: { label: '预紧力 F (N)', default: 25000, min: 1000 },
      externalAxialLoad: { label: '外部轴向载荷 F_A (N)', default: 10000, min: 0 },
      gripLength: { label: '夹紧长度 l_K (mm)', default: 30, min: 5 },
      boltCount: { label: '螺栓数量 n', default: 8, min: 2 },
      boltCircleRadius: { label: '螺栓圆半径 R (mm)', default: 60, min: 10 },
      shearX: { label: '剪切 Fx (N)', default: 5000, min: 0 },
      shearY: { label: '剪切 Fy (N)', default: 2000, min: 0 },
      moment: { label: '弯矩 M (N·mm)', default: 120000, min: 0 },
      allowPerBolt: { label: '单栓许用 (N)', default: 8000, min: 500 },
      legSize: { label: '焊脚 h_f (mm)', default: 6, min: 3 },
      weldLength: { label: '焊缝长 L (mm)', default: 80, min: 10 },
      weldForce: { label: '焊缝载荷 F (N)', default: 12000, min: 100 },
    },
  },
  'flange-seal': {
    id: 'flange-seal',
    label: '法兰密封设计链',
    description: '螺栓预紧 → 螺栓组 → 垫片密封 联动分析',
    steps: [
      { key: 'bolt-preload', toolId: 'bolt-preload', label: '螺栓预紧力', quickInverse: 'no-separation' },
      { key: 'bolt-group', toolId: 'bolt-group', label: '螺栓组', quickInverse: 'min-bolt-count' },
      { key: 'gasket-flange', toolId: 'gasket-flange', label: '垫片密封', quickInverse: null },
    ],
    sharedInputSchema: {
      diameter: { label: '螺栓直径 M (mm)', default: 12, min: 6 },
      pitch: { label: '螺距 p (mm)', default: 1.75, min: 0.5, step: 0.25, precision: 2 },
      preload: { label: '预紧力 F₀ (N)', default: 30000, min: 1000 },
      externalAxialLoad: { label: '外部轴向载荷 F_A (N)', default: 8000, min: 0 },
      gripLength: { label: '夹紧长度 l_K (mm)', default: 40, min: 5 },
      boltCount: { label: '螺栓数量 n', default: 8, min: 2 },
      boltCircleRadius: { label: '螺栓圆半径 R (mm)', default: 70, min: 10 },
      shearX: { label: '剪切 Fx (N)', default: 2000, min: 0 },
      shearY: { label: '剪切 Fy (N)', default: 1000, min: 0 },
      moment: { label: '弯矩 M (N·mm)', default: 80000, min: 0 },
      allowPerBolt: { label: '单栓许用 (N)', default: 10000, min: 500 },
      gasketInner: { label: '垫片内径 Di (mm)', default: 80, min: 10 },
      gasketOuter: { label: '垫片外径 Do (mm)', default: 110, min: 20 },
      pressure: { label: '介质压力 p (MPa)', default: 1.6, min: 0, step: 0.1, precision: 2 },
    },
  },
  gearbox: {
    id: 'gearbox',
    label: '齿轮箱设计链',
    description: '齿轮强度 → 轴 → 轴承 → 键 联动分析',
    steps: [
      { key: 'gear', toolId: 'gear', label: '齿轮强度', quickInverse: null },
      { key: 'shaft', toolId: 'shaft', label: '轴强度', quickInverse: 'min-diameter-standard' },
      { key: 'bearing', toolId: 'bearing', label: '轴承寿命', quickInverse: 'pick-standard-model' },
      { key: 'key', toolId: 'key', label: '平键连接', quickInverse: 'min-key-length' },
    ],
    sharedInputSchema: {
      torque: { label: '扭矩 T (N·m)', default: 200, min: 0 },
      rpm: { label: '转速 n (rpm)', default: 1500, min: 1 },
      module: { label: '模数 m (mm)', default: 2, min: 0.5, step: 0.5, precision: 2 },
      pinionTeeth: { label: '小齿轮齿数 z₁', default: 20, min: 12 },
      gearTeeth: { label: '大齿轮齿数 z₂', default: 40, min: 17 },
      faceWidth: { label: '齿宽 b (mm)', default: 20, min: 5 },
      shaftDiameter: { label: '轴径 d (mm)', default: 30, min: 5 },
      yieldStrength: { label: '屈服强度 σ_s (MPa)', default: 355, min: 100 },
      targetHours: { label: '目标寿命 (h)', default: 10000, min: 100 },
      radialLoad: { label: '径向载荷 Fr (N，0=按齿轮估)', default: 0, min: 0 },
      axialLoad: { label: '轴向载荷 Fa (N)', default: 0, min: 0 },
      dynamicLoad: { label: '轴承动载 C (N)', default: 35000, min: 1000 },
      keyWidth: { label: '键宽 b (mm)', default: 8, min: 2 },
      keyLength: { label: '键长 L (mm)', default: 28, min: 5 },
    },
  },
}

export function listChains(type) {
  const store = readStore()
  return type ? store.filter((c) => c.type === type) : [...store]
}

export function getChain(id) {
  return readStore().find((c) => c.id === id) ?? null
}

export function createChain({ type, name }) {
  const meta = CHAIN_TYPES[type]
  if (!meta) throw new Error(`Unknown chain type: ${type}`)

  const store = readStore()
  const sharedInputs = {}
  for (const [k, spec] of Object.entries(meta.sharedInputSchema)) {
    sharedInputs[k] = spec.default
  }
  const chain = {
    id: makeId(),
    type,
    name: name?.trim() || `${meta.label} ${store.length + 1}`,
    sharedInputs,
    steps: meta.steps.map((s) => ({ key: s.key, toolId: s.toolId, snapshot: null, notes: '' })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  const next = [chain, ...store].slice(0, MAX_CHAINS)
  writeStore(next)
  return chain
}

export function updateSharedInputs(id, patch) {
  const store = readStore()
  const idx = store.findIndex((c) => c.id === id)
  if (idx < 0) return null
  store[idx] = {
    ...store[idx],
    sharedInputs: { ...store[idx].sharedInputs, ...patch },
    updatedAt: Date.now(),
  }
  writeStore(store)
  return store[idx]
}

export function saveStep(chainId, stepKey, { snapshot, notes } = {}) {
  const store = readStore()
  const idx = store.findIndex((c) => c.id === chainId)
  if (idx < 0) return null
  const chain = store[idx]
  const step = chain.steps.find((s) => s.key === stepKey)
  if (!step) return null
  if (snapshot !== undefined) step.snapshot = snapshot
  if (notes !== undefined) step.notes = notes
  chain.updatedAt = Date.now()
  writeStore(store)
  return chain
}

export function renameChain(id, name) {
  const store = readStore()
  const idx = store.findIndex((c) => c.id === id)
  if (idx < 0) return null
  store[idx] = { ...store[idx], name: name?.trim() || store[idx].name, updatedAt: Date.now() }
  writeStore(store)
  return store[idx]
}

export function deleteChain(id) {
  const store = readStore()
  const next = store.filter((c) => c.id !== id)
  if (next.length === store.length) return false
  writeStore(next)
  return true
}

/** 汇总链的整体状态：全部 pass / 部分 fail / 未完成 */
export function chainSummary(chain) {
  if (!chain) return { status: 'unknown', passCount: 0, total: 0 }
  const evaluated = chain.steps.filter((s) => s.snapshot)
  const statuses = evaluated.map((s) => getCalcReviewStatus(s.snapshot))
  const passCount = statuses.filter((s) => s === 'pass').length
  const reviewCount = statuses.filter((s) => s === 'review').length
  const failCount = statuses.filter((s) => s === 'fail').length
  const total = chain.steps.length
  let status
  if (evaluated.length < total) status = 'incomplete'
  else if (failCount > 0) status = 'fail'
  else if (reviewCount > 0) status = 'review'
  else status = 'pass'
  return { status, passCount, reviewCount, total, failCount, evaluatedCount: evaluated.length }
}
