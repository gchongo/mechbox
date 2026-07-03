<template>
  <section class="card-panel mt-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 class="font-semibold">{{ dt('title') }}</h2>
      <div class="flex items-center gap-2">
        <el-tooltip :content="dt('reportTip')" placement="top">
          <el-button size="small" type="primary" plain :disabled="!snapshot" @click="exportReport">
            {{ dt('exportReport') }}
          </el-button>
        </el-tooltip>
      </div>
    </div>
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane :label="dt('tabCompare')" name="compare">
        <ScenarioComparePanel :tool-id="preset.toolId" :snapshot="snapshot" />
      </el-tab-pane>
      <el-tab-pane :label="dt('tabInverse')" name="inverse" :disabled="!preset.inverse?.length">
        <InverseSolverPanel :preset="preset" :base-inputs="baseInputs" @apply="onApply" />
      </el-tab-pane>
      <el-tab-pane :label="dt('tabSensitivity')" name="sensitivity">
        <SensitivityPanel
          :base-inputs="baseInputs"
          :parameters="preset.sensitivity.parameters"
          :metrics="preset.sensitivity.metrics"
          :evaluate="sensitivityEvaluate"
        />
      </el-tab-pane>
    </el-tabs>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import ScenarioComparePanel from '@/components/decision/ScenarioComparePanel.vue'
import InverseSolverPanel from '@/components/decision/InverseSolverPanel.vue'
import SensitivityPanel from '@/components/decision/SensitivityPanel.vue'
import { CALC_ADAPTERS } from '@/utils/calc-adapters'
import { buildEnhancedReport } from '@/utils/enhanced-report'
import { runSensitivityAnalysis } from '@/utils/sensitivity-analysis'
import { exportToolReportPdf } from '@/utils/export'
import { useDecisionI18n } from '@/composables/useDecisionI18n'

const props = defineProps({
  preset: { type: Object, required: true },
  snapshot: { type: Object, default: null },
  baseInputs: { type: Object, required: true },
})

const emit = defineEmits(['apply'])

const { dt } = useDecisionI18n()
const activeTab = ref('compare')

const adapter = computed(() => CALC_ADAPTERS[props.preset.toolId])

function sensitivityEvaluate(inputs) {
  if (!adapter.value) return { metrics: {} }
  const snap = adapter.value(inputs)
  const dict = {}
  for (const m of snap.keyMetrics) {
    if (typeof m.value === 'number' && Number.isFinite(m.value)) dict[m.key] = m.value
  }
  return { metrics: dict }
}

function onApply(payload) {
  emit('apply', payload)
}

async function exportReport() {
  if (!props.snapshot) return
  let sensitivity = null
  try {
    sensitivity = runSensitivityAnalysis({
      baseInputs: props.baseInputs,
      parameters: props.preset.sensitivity.parameters,
      metrics: props.preset.sensitivity.metrics,
      evaluate: sensitivityEvaluate,
      defaultDelta: 0.1,
    })
  } catch (err) {
    console.warn('sensitivity failed', err)
  }
  const report = buildEnhancedReport({
    snapshot: props.snapshot,
    sensitivity,
    primaryMetric: props.preset.primaryMetric,
  })
  await exportToolReportPdf({
    title: report.title,
    subtitle: report.subtitle,
    sections: report.sections,
  })
  ElMessage.success(dt('reportDone'))
}
</script>
