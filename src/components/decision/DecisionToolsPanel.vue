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
          :base-inputs="sensitivityBaseInputs"
          :parameters="sensitivityParameters"
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

const sensitivityParameters = computed(() => {
  const sens = props.preset.sensitivity
  if (typeof sens?.buildParameters === 'function') {
    return sens.buildParameters(props.baseInputs)
  }
  return sens?.parameters ?? []
})

/** 为动态参数（如 tol_i）补齐基线值，供扰动分析读取 */
const sensitivityBaseInputs = computed(() => {
  const base = { ...props.baseInputs }
  const sens = props.preset.sensitivity
  if (typeof sens?.buildParameters === 'function') {
    const rings = base.componentRings ?? []
    rings.forEach((r, i) => {
      if (base[`tol_${i}`] == null && r?.tolerance != null) {
        base[`tol_${i}`] = r.tolerance
      }
    })
  }
  return base
})

function sensitivityEvaluate(inputs) {
  if (!adapter.value) return { metrics: {} }
  const prepared = props.preset.sensitivity?.remapInputs?.(inputs) ?? inputs
  const snap = adapter.value(prepared)
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
      baseInputs: sensitivityBaseInputs.value,
      parameters: sensitivityParameters.value,
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
  const ok = await exportToolReportPdf({
    title: report.title,
    subtitle: report.subtitle,
    sections: report.sections,
  })
  if (ok) ElMessage.success(dt('reportDone'))
}
</script>
