<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>
    <CalcModePanel v-model="form.calcMode" page-key="vibration-isolation" />
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="140px">
          <CalcFormItem :label="pf('mass')">
            <el-input-number v-model="form.mass" :min="0.1" :step="1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('stiffness')">
            <el-input-number v-model="form.stiffness" :min="10" :step="1000" />
          </CalcFormItem>
          <CalcFormItem :label="pf('dampingRatio')">
            <el-input-number v-model="form.dampingRatio" :min="0.001" :max="0.5" :step="0.01" :precision="3" />
          </CalcFormItem>
          <CalcFormItem :label="pf('excitationFreq')">
            <el-input-number v-model="form.excitationFreq" :min="0.1" :precision="2" />
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('maxTransmissibility')">
              <el-input-number v-model="form.maxTransmissibility" :min="0.05" :max="1" :step="0.05" :precision="2" />
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('isolationTargetDb')">
              <el-input-number v-model="form.isolationTargetDb" :min="3" :max="40" :step="1" />
            </CalcFormItem>
          </template>
        </el-form>
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag class="mb-3" :type="overallStatusType">{{ pr('overall') }}: {{ overallStatusLabel }}</el-tag>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('naturalFreq')" />
            <dd class="font-mono">{{ result.naturalFreq.toFixed(2) }} Hz</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('frequencyRatio')" />
            <dd class="font-mono">{{ result.frequencyRatio.toFixed(3) }}</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('transmissibility')" />
            <dd class="font-mono">{{ Number.isFinite(result.transmissibility) ? result.transmissibility.toFixed(3) : '∞' }}</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('isolationDb')" />
            <dd class="font-mono">{{ result.isolationDb.toFixed(1) }} dB</dd>
          </div>
          <template v-if="form.calcMode !== 'simple'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('isolationRegion')" />
              <dd :class="result.aboveIsolationRegion ? 'text-success' : 'text-error'">
                {{ result.aboveIsolationRegion ? 'r>√2 ✓' : 'r≤√2 ✗' }}
              </dd>
            </div>
          </template>
          <template v-if="form.calcMode === 'professional' && result.recommendedStiffness">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('recommendedStiffness')" />
              <dd class="font-mono">{{ result.recommendedStiffness.toFixed(0) }} N/m</dd>
            </div>
          </template>
        </dl>
        <FormulaPanel :columns="1">
          <MathTex expr="f_n=\dfrac{1}{2\pi}\sqrt{k/m},\quad r=f/f_n" block />
          <MathTex expr="TR=\dfrac{\sqrt{1+(2\zeta r)^2}}{\sqrt{(1-r^2)^2+(2\zeta r)^2}}" block />
        </FormulaPanel>
      </section>
    </div>
    <div class="mt-4 tool-action-bar">
      <SaveHistoryButton
        tool="vibration-isolation"
        :get-input="() => historyInput"
        :get-result="() => result"
        :title="historyTitle"
        :summary="historySummary"
        :status="saveStatus"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { analyzeVibrationIsolation } from '@/utils/vibration-isolation-calc'
import { getCalcReviewStatus } from '@/utils/calc-result'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import MathTex from '@/components/common/MathTex.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'

const { pt, ct, pf, pr, fc } = useCalcPage('vibration-isolation')
const form = reactive({
  calcMode: 'complete',
  mass: 50,
  stiffness: 20000,
  dampingRatio: 0.05,
  excitationFreq: 25,
  maxTransmissibility: 0.25,
  isolationTargetDb: 10,
})
const result = computed(() => analyzeVibrationIsolation(form))
const overallStatus = computed(() => getCalcReviewStatus(result.value))
const overallStatusType = computed(() =>
  overallStatus.value === 'pass' ? 'success' : overallStatus.value === 'review' ? 'warning' : 'danger',
)
const overallStatusLabel = computed(() => {
  if (overallStatus.value === 'pass') return fc('overallPass')
  if (overallStatus.value === 'review') return fc('overallWarn')
  return fc('overallFail')
})
const { historyInput, saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form,
  result,
  buildTitle: () => pt('title'),
  buildSummary: () => [
    { label: pr('transmissibility'), value: result.value.transmissibility.toFixed(3) },
    { label: fc('check'), value: overallStatusLabel.value },
  ],
})
useHistoryReplay('vibration-isolation', form)
</script>
