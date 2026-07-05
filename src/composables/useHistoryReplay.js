import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getToolReplayRecord } from '@/utils/calc-history'
import { applyReplayToTarget } from '@/utils/history-replay'
import { useLocale } from '@/composables/useLocale'

/**
 * Restore tool inputs from ?historyId= query (history page replay).
 * @param {string} tool
 * @param {object|null} target Reactive form; omit when using applyFn
 * @param {{ applyFn?: Function, skipKeys?: string[], showMessage?: boolean }} options
 */
export function useHistoryReplay(tool, target, options = {}) {
  const route = useRoute()
  const router = useRouter()
  const { t } = useLocale()
  const replayed = ref(false)
  const replayRecord = ref(null)

  function consumeHistoryReplay() {
    const historyId = route.query.historyId
    if (!historyId) return false

    const record = getToolReplayRecord(historyId, tool)
    if (!record?.data?.input) return false

    replayRecord.value = record
    if (typeof options.applyFn === 'function') {
      options.applyFn(record.data.input, record)
    } else if (target) {
      applyReplayToTarget(target, record.data.input, options)
    } else {
      return false
    }

    replayed.value = true
    if (options.showMessage !== false) {
      ElMessage.success(t('content.history.replayRestored'))
    }

    const nextQuery = { ...route.query }
    delete nextQuery.historyId
    delete nextQuery.replay
    router.replace({ query: nextQuery })
    return true
  }

  onMounted(() => {
    if (options.deferMount) return
    consumeHistoryReplay()
  })

  watch(
    () => route.query.historyId,
    () => consumeHistoryReplay(),
  )

  return { replayed, replayRecord, consumeHistoryReplay }
}
