import { computed, unref } from 'vue'
import { getCalcReviewStatus } from '@/utils/calc-result'
import { snapshotHistoryInput } from '@/utils/history-replay'

/**
 * Standard history save bindings for engineering calc pages with a reactive form.
 */
export function useCalcHistorySave({ form, result, buildTitle, buildSummary }) {
  const historyInput = computed(() => snapshotHistoryInput(unref(form)))
  const saveStatus = computed(() => getCalcReviewStatus(unref(result)))
  const historyTitle = computed(() => {
    const title = buildTitle?.()
    return title ?? 'calc'
  })
  const historySummary = computed(() => buildSummary?.() ?? [])
  return { historyInput, saveStatus, historyTitle, historySummary }
}
