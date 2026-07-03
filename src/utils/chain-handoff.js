/**
 * 设计链 → 工具页参数交接（sessionStorage，一次性消费）
 */

const HANDOFF_KEY = 'mechbox.chainHandoff'
const SESSION_KEY = 'mechbox.chainSession'

function canUseSession() {
  return typeof sessionStorage !== 'undefined'
}

/** 从设计链打开工具页前写入交接包 + 持久会话（供反向同步） */
export function writeChainHandoff({ chainId, chainType, stepKey, toolId, inputs }) {
  if (!canUseSession() || !toolId) return
  const at = Date.now()
  const session = {
    chainId: chainId ?? null,
    chainType: chainType ?? null,
    stepKey: stepKey ?? null,
    toolId,
    at,
  }
  try {
    sessionStorage.setItem(
      HANDOFF_KEY,
      JSON.stringify({
        ...session,
        inputs: inputs && typeof inputs === 'object' ? { ...inputs } : {},
      }),
    )
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * 工具页挂载时消费一次性输入包（会话保留供写回）
 * @returns {{ chainId, chainType, stepKey, toolId, inputs, at } | null}
 */
export function consumeChainHandoff(toolId) {
  if (!canUseSession() || !toolId) return null
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || data.toolId !== toolId) return null
    sessionStorage.removeItem(HANDOFF_KEY)
    return data
  } catch {
    return null
  }
}

/** 获取当前工具页关联的设计链会话 */
export function getChainSession(toolId) {
  if (!canUseSession() || !toolId) return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return data?.toolId === toolId ? data : null
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
    const raw = sessionStorage.getItem(HANDOFF_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearChainSession() {
  if (!canUseSession()) return
  try {
    sessionStorage.removeItem(HANDOFF_KEY)
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

/** @deprecated use clearChainSession */
export function clearChainHandoff() {
  clearChainSession()
}
