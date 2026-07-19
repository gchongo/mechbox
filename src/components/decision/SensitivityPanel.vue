<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ dt('trackMetric') }}:</span>
      <el-select v-model="selectedMetric" size="small" class="!w-56">
        <template #label="{ value }">
          <MathContent :text="metricLabel(toolId, value)" />
        </template>
        <el-option
          v-for="m in metricOptions"
          :key="m"
          :label="metricLabel(toolId, m)"
          :value="m"
        >
          <MathContent :text="metricLabel(toolId, m)" />
        </el-option>
      </el-select>
      <el-slider
        v-model="deltaPct"
        :min="5"
        :max="30"
        :step="5"
        :marks="{ 10: '10%', 20: '20%' }"
        class="!w-56"
      />
      <span class="text-xs text-gray-500">±{{ deltaPct }}%</span>
      <el-button size="small" type="primary" :disabled="!canRun" :loading="running" @click="run">
        {{ dt('runAnalysis') }}
      </el-button>
    </div>

    <div v-if="!analysis" class="rounded bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
      {{ canRun ? dt('emptySensitivity', { pct: deltaPct }) : dt('noSensitivityParams') }}
    </div>

    <template v-else>
      <div class="mb-2 text-xs text-gray-500">
        {{ dt('baseValue') }}:
        <span class="font-mono">{{ formatValue(analysis.baseMetrics[selectedMetric]) }}</span>
      </div>
      <el-table :data="tornadoRows" size="small" border>
        <el-table-column :label="dt('parameter')" min-width="140">
          <template #default="{ row }">
            <MathContent :text="row.label" />
          </template>
        </el-table-column>
        <el-table-column :label="dt('swingPercent')" min-width="220">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <div class="h-3 flex-1 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                <div
                  class="h-full bg-primary"
                  :style="{ width: barWidth(row.swingPercent) + '%' }"
                />
              </div>
              <span class="w-16 text-right font-mono text-xs">
                {{ row.swingPercent.toFixed(1) }}%
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="dt('low')" min-width="100">
          <template #default="{ row }">
            <span class="font-mono text-xs">{{ formatValue(row.lowMetric) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="dt('high')" min-width="100">
          <template #default="{ row }">
            <span class="font-mono text-xs">{{ formatValue(row.highMetric) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { runSensitivityAnalysis } from '@/utils/sensitivity-analysis'
import { useDecisionI18n } from '@/composables/useDecisionI18n'

const props = defineProps({
  toolId: { type: String, default: '' },
  baseInputs: { type: Object, required: true },
  parameters: { type: Array, required: true },
  metrics: { type: Array, required: true },
  evaluate: { type: Function, required: true },
})

const { dt, metricLabel, paramLabel } = useDecisionI18n()
const deltaPct = ref(10)
const selectedMetric = ref(props.metrics[0])
const analysis = ref(null)
const running = ref(false)

const metricOptions = computed(() => props.metrics)
const canRun = computed(
  () =>
    Array.isArray(props.parameters) &&
    props.parameters.length > 0 &&
    props.baseInputs != null &&
    typeof props.evaluate === 'function',
)

function run() {
  if (!canRun.value) return
  running.value = true
  try {
    analysis.value = runSensitivityAnalysis({
      baseInputs: props.baseInputs,
      parameters: props.parameters,
      metrics: props.metrics,
      evaluate: props.evaluate,
      defaultDelta: deltaPct.value / 100,
    })
  } finally {
    running.value = false
  }
}

watch(() => props.metrics, () => {
  if (!props.metrics.includes(selectedMetric.value)) {
    selectedMetric.value = props.metrics[0]
  }
})

const tornadoRows = computed(() => {
  if (!analysis.value) return []
  return analysis.value.rows
    .map((r) => {
      const eff = r.effects[selectedMetric.value] ?? {}
      return {
        parameter: r.parameter,
        label: paramLabel(props.toolId, r.parameter, r.label, props.baseInputs),
        swingPercent: Math.abs(eff.swingPercent ?? 0),
        lowMetric: eff.low,
        highMetric: eff.high,
      }
    })
    .sort((a, b) => b.swingPercent - a.swingPercent)
})

const maxSwing = computed(() => {
  return Math.max(1, ...tornadoRows.value.map((r) => r.swingPercent))
})

function barWidth(v) {
  return Math.min(100, (v / maxSwing.value) * 100)
}

function formatValue(v) {
  if (v == null || !Number.isFinite(v)) return '-'
  const abs = Math.abs(v)
  return abs >= 1000 ? v.toFixed(0) : abs >= 10 ? v.toFixed(1) : v.toFixed(3)
}
</script>
