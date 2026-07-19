import { reactive, watch, isRef, computed } from 'vue'
import { CRITICAL_INPUT_SPECS } from '@/utils/critical-input-guard'

/** 用户编辑关键字段时标记 confirmedFields[key]=true；切换 calcMode 时重置 */
export function useCriticalInputConfirm(calcModeSource, moduleId) {
  const confirmedFields = reactive({})

  function markConfirmed(key) {
    if (key) confirmedFields[key] = true
  }

  function resetConfirmations() {
    for (const k of Object.keys(confirmedFields)) delete confirmedFields[k]
  }

  function withConfirmed(input) {
    return {
      ...input,
      enforceCriticalConfirm: true,
      confirmedFields: { ...confirmedFields },
    }
  }

  const modeRef = isRef(calcModeSource) ? calcModeSource : null
  if (modeRef) {
    watch(modeRef, () => resetConfirmations())
  }

  const criticalKeys = computed(() => {
    if (!moduleId || !modeRef) return []
    const mode = modeRef.value
    const spec = CRITICAL_INPUT_SPECS[moduleId] ?? {}
    return spec[mode] ?? []
  })

  /** 当前模式下该字段是否为待核对关键输入（简化模式不门禁，不高亮） */
  function isPending(key) {
    if (!key || !modeRef || modeRef.value === 'simple') return false
    if (!criticalKeys.value.includes(key)) return false
    return !confirmedFields[key]
  }

  return { confirmedFields, markConfirmed, resetConfirmations, withConfirmed, isPending, criticalKeys }
}
