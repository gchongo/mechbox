<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>
    <CalcModePanel v-model="form.calcMode" page-key="heat-transfer" />
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="140px">
          <CalcFormItem :label="pf('mode')">
            <el-select v-model="form.mode" class="w-full">
              <el-option :label="pf('modeConduction')" value="conduction" />
              <el-option :label="pf('modeConvection')" value="convection" />
              <el-option :label="pf('modeSeries')" value="series" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem v-if="form.mode !== 'convection'" :label="pf('conductivity')">
            <el-input-number v-model="form.conductivity" :min="0.01" :step="1" />
          </CalcFormItem>
          <CalcFormItem v-if="form.mode !== 'convection'" :label="pf('thickness')">
            <el-input-number v-model="form.thickness" :min="0.0001" :step="0.001" :precision="4" />
          </CalcFormItem>
          <CalcFormItem v-if="form.mode !== 'conduction'" :label="pf('hConv')">
            <el-input-number v-model="form.hConv" :min="1" :step="1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('area')">
            <el-input-number v-model="form.area" :min="0.0001" :step="0.001" :precision="4" />
          </CalcFormItem>
          <CalcFormItem :label="pf('deltaT')">
            <el-input-number v-model="form.deltaT" :step="1" />
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('allowPower')">
              <el-input-number v-model="form.allowPower" :min="1" :step="10" />
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('maxSurfaceRise')">
              <el-input-number v-model="form.maxSurfaceRise" :min="5" :max="120" />
            </CalcFormItem>
          </template>
        </el-form>
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag class="mb-3" :type="overallStatusType">{{ pr('overall') }}: {{ overallStatusLabel }}</el-tag>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('power')" />
            <dd class="font-mono text-lg">{{ result.power.toFixed(1) }} W</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('thermalResistance')" />
            <dd class="font-mono">{{ result.thermalResistance.toFixed(3) }} K/W</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('heatFlux')" />
            <dd class="font-mono">{{ result.heatFlux.toFixed(0) }} W/m²</dd>
          </div>
          <template v-if="form.calcMode === 'professional' && result.equivDeltaT != null">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('equivDeltaT')" />
              <dd class="font-mono" :class="result.tempPass ? 'text-success' : 'text-error'">
                {{ result.equivDeltaT.toFixed(1) }} K
                {{ result.tempPass ? '✓' : '✗' }}
              </dd>
            </div>
          </template>
        </dl>
        <FormulaPanel :columns="1">
          <MathTex expr="Q=k A \Delta T / L" block />
          <MathTex expr="Q=h A \Delta T" block />
          <MathTex expr="R_{\mathrm{th}}=L/(kA)\ \mathrm{or}\ 1/(hA)" block />
        </FormulaPanel>
      </section>
    </div>
    <div class="mt-4 tool-action-bar">
      <SaveHistoryButton
        tool="heat-transfer"
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
import { analyzeHeatTransfer } from '@/utils/heat-transfer-calc'
import { getCalcReviewStatus } from '@/utils/calc-result'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import MathTex from '@/components/common/MathTex.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'

const { pt, ct, pf, pr, fc } = useCalcPage('heat-transfer')
const form = reactive({
  calcMode: 'complete',
  mode: 'conduction',
  conductivity: 50,
  thickness: 0.005,
  area: 0.01,
  hConv: 15,
  deltaT: 40,
  allowPower: 100,
  maxSurfaceRise: 60,
})
const result = computed(() => analyzeHeatTransfer(form))
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
    { label: pr('power'), value: `${result.value.power.toFixed(1)} W` },
    { label: fc('check'), value: overallStatusLabel.value },
  ],
})
useHistoryReplay('heat-transfer', form)
</script>
