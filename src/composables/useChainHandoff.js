import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  applyHandoffInputs,
  clearChainSession,
  consumeChainHandoff,
  getChainSession,
} from '@/utils/chain-handoff'
import { syncStepFormToChain } from '@/utils/chain-snapshots'
import { getChain } from '@/utils/design-context'
import { useDecisionI18n } from '@/composables/useDecisionI18n'

const CHAIN_ROUTES = {
  powertrain: '/design/powertrain',
  'bolt-joint': '/design/bolt-joint',
}

/**
 * 设计链 ↔ 工具页双向同步
 * @param {string} toolId
 * @param {object} form reactive form
 * @param {{ afterApply?: (handoff: object, applied: string[]) => void }} [options]
 */
export function useChainHandoff(toolId, form, options = {}) {
  const router = useRouter()
  const { dt } = useDecisionI18n()
  const chainSession = ref(null)
  const dirty = ref(false)

  const chainName = computed(() => {
    const id = chainSession.value?.chainId
    if (!id) return ''
    return getChain(id)?.name ?? ''
  })

  onMounted(() => {
    const handoff = consumeChainHandoff(toolId)
    const session = getChainSession(toolId)
    chainSession.value = session ?? (handoff
      ? {
          chainId: handoff.chainId,
          chainType: handoff.chainType,
          stepKey: handoff.stepKey,
          toolId: handoff.toolId,
          at: handoff.at,
        }
      : null)

    if (handoff?.inputs) {
      const applied = applyHandoffInputs(form, handoff.inputs)
      options.afterApply?.(handoff, applied)
      if (applied.length) {
        ElMessage.success(dt('handoffApplied'))
      }
    }
  })

  watch(
    form,
    () => {
      if (chainSession.value) dirty.value = true
    },
    { deep: true },
  )

  function syncToChain() {
    const s = chainSession.value
    if (!s?.chainId) return false
    const updated = syncStepFormToChain(s.chainId, s.chainType, s.stepKey, form)
    if (updated) {
      dirty.value = false
      ElMessage.success(dt('handoffSynced'))
      return true
    }
    ElMessage.warning(dt('handoffSyncEmpty'))
    return false
  }

  function backToChain() {
    const path = CHAIN_ROUTES[chainSession.value?.chainType]
    if (path) router.push(path)
  }

  function dismissSession() {
    clearChainSession()
    chainSession.value = null
    dirty.value = false
  }

  return {
    chainSession,
    chainName,
    dirty,
    syncToChain,
    backToChain,
    dismissSession,
  }
}
