import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { consumeChainHandoff, applyHandoffInputs } from '@/utils/chain-handoff'
import { useDecisionI18n } from '@/composables/useDecisionI18n'

/**
 * 工具页挂载时从设计链交接包预填 form
 * @param {string} toolId
 * @param {object} form reactive form
 * @param {{ afterApply?: (handoff: object, applied: string[]) => void }} [options]
 */
export function useChainHandoff(toolId, form, options = {}) {
  const { dt } = useDecisionI18n()

  onMounted(() => {
    const handoff = consumeChainHandoff(toolId)
    if (!handoff?.inputs) return
    const applied = applyHandoffInputs(form, handoff.inputs)
    options.afterApply?.(handoff, applied)
    if (applied.length) {
      ElMessage.success(dt('handoffApplied'))
    }
  })
}
