import { reactive, watch, isRef } from 'vue'

/** 用户编辑关键字段时标记 confirmedFields[key]=true；切换 calcMode 时重置 */
export function useCriticalInputConfirm(calcModeSource) {
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

  return { confirmedFields, markConfirmed, resetConfirmations, withConfirmed }
}
