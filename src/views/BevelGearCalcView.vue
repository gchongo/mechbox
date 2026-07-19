<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>
    <CalcModePanel v-model="form.calcMode" page-key="bevel-gear" />
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="140px">
          <CalcFormItem :label="pf('module')">
            <el-input-number v-model="form.module" :min="0.5" :step="0.5" :precision="2" />
          </CalcFormItem>
          <CalcFormItem :label="pf('pinionTeeth')">
            <el-input-number v-model="form.pinionTeeth" :min="12" />
          </CalcFormItem>
          <CalcFormItem :label="pf('gearTeeth')">
            <el-input-number v-model="form.gearTeeth" :min="14" />
          </CalcFormItem>
          <CalcFormItem :label="pf('torquePinion')">
            <el-input-number v-model="form.torquePinion" :min="0" :precision="2" />
          </CalcFormItem>
          <CalcFormItem :label="pf('rpmPinion')">
            <el-input-number v-model="form.rpmPinion" :min="0" :step="50" />
          </CalcFormItem>
          <CalcFormItem :label="pf('power')">
            <el-input-number v-model="form.power" :min="0" :precision="2" />
            <p class="mt-1 text-xs text-gray-500">{{ pf('powerHint') }}</p>
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('faceWidth')">
              <el-input-number v-model="form.faceWidth" :min="1" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('pressureAngle')">
              <el-input-number v-model="form.pressureAngle" :min="14.5" :max="25" :step="0.5" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('allowBending')">
              <el-input-number v-model="form.allowBending" :min="10" :step="10" />
            </CalcFormItem>
            <CalcFormItem :label="pf('allowContact')">
              <el-input-number v-model="form.allowContact" :min="50" :step="10" />
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('serviceFactor')">
              <el-input-number v-model="form.serviceFactor" :min="1" :max="2.5" :step="0.05" :precision="2" />
            </CalcFormItem>
            <CalcFormItem :label="pf('maxPitchSpeed')">
              <el-input-number v-model="form.maxPitchSpeed" :min="1" :max="30" :step="0.5" :precision="1" />
            </CalcFormItem>
          </template>
        </el-form>
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag class="mb-3" :type="overallStatusType">{{ pr('overall') }}: {{ overallStatusLabel }}</el-tag>
        <p v-if="form.calcMode === 'simple'" class="mb-3 text-xs text-gray-500">{{ pr('simpleNote') }}</p>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('ratio')" /><dd class="font-mono">{{ result.ratio.toFixed(3) }}</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('delta1')" /><dd class="font-mono">{{ result.delta1.toFixed(2) }}°</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('delta2')" /><dd class="font-mono">{{ result.delta2.toFixed(2) }}°</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('coneDistance')" /><dd class="font-mono">{{ result.coneDistance.toFixed(2) }} mm</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('outerDiameters')" />
            <dd class="font-mono">{{ result.outerDiameter1.toFixed(1) }} / {{ result.outerDiameter2.toFixed(1) }} mm</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('tangentialForce')" /><dd class="font-mono">{{ result.tangentialForce.toFixed(0) }} N</dd>
          </div>
          <template v-if="form.calcMode !== 'simple'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('forcesPinion')" />
              <dd class="font-mono text-right">
                Fr {{ result.radialForcePinion.toFixed(0) }} · Fa {{ result.axialForcePinion.toFixed(0) }} N
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('bendingStress')" />
              <dd class="font-mono" :class="result.bendingPass ? 'text-success' : 'text-error'">
                {{ result.bendingStress.toFixed(1) }} / {{ result.allowBending }} MPa
                {{ result.bendingPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('contactStress')" />
              <dd class="font-mono" :class="result.contactPass ? 'text-success' : 'text-error'">
                {{ result.contactStress.toFixed(1) }} / {{ result.allowContact }} MPa
                {{ result.contactPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('virtualTeeth')" />
              <dd class="font-mono">{{ result.virtualTeeth1.toFixed(1) }} / {{ result.virtualTeeth2.toFixed(1) }}</dd>
            </div>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('pitchSpeed')" />
              <dd class="font-mono" :class="result.speedPass ? 'text-success' : 'text-error'">
                {{ result.pitchSpeed.toFixed(2) }} / {{ result.maxPitchSpeed }} m/s
                {{ result.speedPass ? '✓' : '✗' }}
              </dd>
            </div>
          </template>
        </dl>
        <FormulaPanel :columns="1">
          <MathTex expr="\tan\delta_1=z_1/z_2,\quad \delta_2=90°-\delta_1" block />
          <MathTex expr="R=\dfrac{m}{2}\sqrt{z_1^2+z_2^2},\quad d_{m}=d(1-\tfrac{b}{2R})" block />
          <MathTex expr="F_t=\dfrac{2000 T}{d_m},\ F_r=F_t\tan\alpha\cos\delta,\ F_a=F_t\tan\alpha\sin\delta" block />
          <MathTex v-if="form.calcMode !== 'simple'" expr="\sigma_F=F_t/(b m Y_F),\ \sigma_H=Z_E\sqrt{F_t/(d_m b)}" block />
        </FormulaPanel>
      </section>
    </div>
    <RelatedToolsPanel tool-id="bevel-gear" class="mt-4" />
    <div class="mt-4 tool-action-bar">
      <SaveHistoryButton
        tool="bevel-gear"
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
import { analyzeBevelGear } from '@/utils/bevel-gear-calc'
import { getCalcReviewStatus } from '@/utils/calc-result'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import MathTex from '@/components/common/MathTex.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import RelatedToolsPanel from '@/components/calc/RelatedToolsPanel.vue'

const { pt, ct, pf, pr, fc } = useCalcPage('bevel-gear')
const form = reactive({
  calcMode: 'complete',
  module: 4,
  pinionTeeth: 20,
  gearTeeth: 40,
  torquePinion: 40,
  rpmPinion: 800,
  power: 0,
  faceWidth: 0,
  pressureAngle: 20,
  allowBending: 180,
  allowContact: 700,
  serviceFactor: 1.25,
  maxPitchSpeed: 8,
})
const result = computed(() => analyzeBevelGear(form))
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
    { label: pr('ratio'), value: result.value.ratio.toFixed(2) },
    { label: pr('tangentialForce'), value: `${result.value.tangentialForce.toFixed(0)} N` },
    { label: fc('check'), value: overallStatusLabel.value },
  ],
})
useHistoryReplay('bevel-gear', form)
</script>
