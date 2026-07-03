<template>
  <section class="card-panel">
    <div class="mb-3 flex items-center justify-between">
      <div>
        <h3 class="font-semibold">{{ meta?.label ?? step.key }}</h3>
        <p class="text-xs text-gray-500">{{ meta?.toolId }}</p>
      </div>
      <el-tag :type="statusType">{{ statusLabel }}</el-tag>
    </div>

    <template v-if="snapshot">
      <dl class="space-y-2 text-sm">
        <div
          v-for="m in topMetrics"
          :key="m.key"
          class="flex items-baseline justify-between gap-2 rounded bg-gray-50 p-2 dark:bg-gray-900"
        >
          <span class="text-xs text-gray-500">{{ m.label }}</span>
          <span
            class="font-mono text-sm"
            :class="m.status === 'pass' ? 'text-success' : m.status === 'fail' ? 'text-error' : ''"
          >
            {{ formatValue(m.value) }}
            <span v-if="m.unit" class="text-xs text-gray-400"> {{ m.unit }}</span>
          </span>
        </div>
      </dl>

      <div v-if="snapshot.suggestions?.length" class="mt-3 rounded bg-warning/10 p-2 text-xs text-warning">
        <div v-for="(s, i) in snapshot.suggestions.slice(0, 2)" :key="i">• {{ s }}</div>
      </div>
    </template>

    <div class="mt-3 flex flex-wrap gap-2">
      <el-button
        v-if="meta?.quickInverse"
        size="small"
        type="primary"
        plain
        :loading="solving"
        @click="runQuickInverse"
      >
        {{ dt('quickInverse') }}
      </el-button>
      <el-button size="small" plain @click="$emit('open-tool', meta?.toolId)">
        {{ dt('openTool') }} →
      </el-button>
    </div>

    <div v-if="inverseHint" class="mt-2 rounded bg-primary/5 px-2 py-1 text-xs text-primary">
      {{ inverseHint }}
    </div>

    <div class="mt-3">
      <el-input
        :model-value="step.notes"
        type="textarea"
        :rows="2"
        size="small"
        :placeholder="dt('notesPlaceholder')"
        @update:model-value="$emit('update-notes', $event)"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { DECISION_PRESETS, runPresetInverse } from '@/utils/decision-presets'
import { buildStepInputs, CHAIN_INVERSE_APPLY, resolveInverseApply } from '@/utils/chain-snapshots'
import { useDecisionI18n } from '@/composables/useDecisionI18n'

const props = defineProps({
  step: { type: Object, required: true },
  snapshot: { type: Object, default: null },
  meta: { type: Object, default: null },
  chainType: { type: String, default: '' },
  sharedInputs: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['open-tool', 'update-notes', 'apply-shared'])
const { dt } = useDecisionI18n()
const solving = ref(false)
const inverseHint = ref('')

const topMetrics = computed(() => (props.snapshot?.keyMetrics ?? []).slice(0, 4))

const statusLabel = computed(() => {
  if (!props.snapshot) return dt('notEvaluated')
  return props.snapshot.pass ? dt('stepPass') : dt('stepFail')
})

const statusType = computed(() => {
  if (!props.snapshot) return 'info'
  return props.snapshot.pass ? 'success' : 'danger'
})

async function runQuickInverse() {
  const invId = props.meta?.quickInverse
  const toolId = props.meta?.toolId
  if (!invId || !toolId) return
  const preset = DECISION_PRESETS[toolId]
  if (!preset) return

  solving.value = true
  inverseHint.value = ''
  try {
    const baseInputs = buildStepInputs(props.chainType, props.step.key, props.sharedInputs)
    const result = runPresetInverse(preset, invId, baseInputs)
    if (!result.converged) {
      ElMessage.warning(dt('noSolutionTitle'))
      return
    }

    const applySpec = CHAIN_INVERSE_APPLY[props.chainType]?.[props.step.key]?.[invId]
    const applied = resolveInverseApply(applySpec, result)
    const shown = result.strategy === 'catalog'
      ? `${result.solution} (C=${result.solutionRow?.C})`
      : formatValue(result.solution)

    if (applied) {
      emit('apply-shared', applied)
      inverseHint.value = `${dt('applied')}: ${applied.field} = ${formatValue(applied.value)}`
      if (result.strategy === 'catalog') {
        inverseHint.value += ` · ${shown}`
      }
    } else {
      inverseHint.value = `${dt('solution')}: ${shown}`
      ElMessage.info(inverseHint.value)
    }
  } finally {
    solving.value = false
  }
}

function formatValue(v) {
  if (v == null) return '-'
  if (typeof v !== 'number') return String(v)
  if (!Number.isFinite(v)) return '∞'
  const abs = Math.abs(v)
  return abs >= 1000 ? v.toFixed(0) : abs >= 10 ? v.toFixed(1) : v.toFixed(3)
}
</script>
