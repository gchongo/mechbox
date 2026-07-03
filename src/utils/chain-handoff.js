/**
 * 设计链 → 工具页参数交接（sessionStorage，一次性消费）
 */

const STORAGE_KEY = 'mechbox.chainHandoff'

function canUseSession() {
  return typeof sessionStorage !== 'undefined'
}

/** 从设计链打开工具页前写入交接包 */
export function writeChainHandoff({ chainId, chainType, stepKey, toolId, inputs }) {
  if (!canUseSession() || !toolId) return
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        chainId: chainId ?? null,
        chainType: chainType ?? null,
        stepKey: stepKey ?? null,
        toolId,
        inputs: inputs && typeof inputs === 'object' ? { ...inputs } : {},
        at: Date.now(),
      }),
    )
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * 工具页挂载时消费交接包（匹配 toolId 后清除）
 * @returns {{ chainId, chainType, stepKey, toolId, inputs, at } | null}
 */
export function consumeChainHandoff(toolId) {
  if (!canUseSession() || !toolId) return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || data.toolId !== toolId) return null
    sessionStorage.removeItem(STORAGE_KEY)
    return data
  } catch {
    return null
  }
}

/** 仅把 form 上已有的键从 inputs 写入，返回已应用的键名 */
export function applyHandoffInputs(form, inputs) {
  if (!form || !inputs || typeof inputs !== 'object') return []
  const applied = []
  for (const [key, value] of Object.entries(inputs)) {
    if (!(key in form) || value == null) continue
    const t = typeof value
    if (t !== 'number' && t !== 'string' && t !== 'boolean') continue
    if (t === 'number' && !Number.isFinite(value)) continue
    form[key] = value
    applied.push(key)
  }
  return applied
}

export function peekChainHandoff() {
  if (!canUseSession()) return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearChainHandoff() {
  if (!canUseSession()) return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
