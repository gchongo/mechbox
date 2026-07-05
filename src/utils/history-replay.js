import { toRaw } from 'vue'

export const HISTORY_INPUT_SCHEMA_VERSION = 1

const DEFAULT_SKIP_KEYS = new Set(['_schemaVersion', '_savedAt', '_tool'])

/**
 * Deep-clone reactive/plain input for history persistence (JSON-safe).
 */
export function snapshotHistoryInput(source) {
  if (source == null || typeof source !== 'object') return {}
  try {
    return JSON.parse(JSON.stringify(toRaw(source)))
  } catch {
    return { ...toRaw(source) }
  }
}

/**
 * Merge saved history input into a reactive form object.
 * Arrays are replaced wholesale to preserve replay fidelity.
 */
export function applyReplayToTarget(target, input, options = {}) {
  const skip = new Set(options.skipKeys ?? DEFAULT_SKIP_KEYS)
  if (!target || !input || typeof input !== 'object') {
    return { applied: false, fieldsApplied: 0 }
  }

  function merge(dst, src) {
    if (src === null || typeof src !== 'object') return 0
    let count = 0
    for (const key of Object.keys(src)) {
      if (skip.has(key)) continue
      if (!(key in dst)) continue
      const sv = src[key]
      const dv = dst[key]
      if (Array.isArray(sv) && Array.isArray(dv)) {
        dst[key] = structuredClone(sv)
        count += 1
      } else if (
        sv &&
        typeof sv === 'object' &&
        !Array.isArray(sv) &&
        dv &&
        typeof dv === 'object' &&
        !Array.isArray(dv)
      ) {
        count += merge(dv, sv)
      } else if (sv !== undefined) {
        dst[key] = sv
        count += 1
      }
    }
    return count
  }

  const fieldsApplied = merge(target, input)
  return { applied: fieldsApplied > 0, fieldsApplied }
}

export function stampHistoryInput(input, tool) {
  return {
    _schemaVersion: HISTORY_INPUT_SCHEMA_VERSION,
    _savedAt: new Date().toISOString(),
    ...(tool ? { _tool: tool } : {}),
    ...snapshotHistoryInput(input),
  }
}
