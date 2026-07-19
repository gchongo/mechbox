<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="plate-buckling" />
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="120px">
          <CalcFormItem :label="pf('edgeCondition')">
            <el-select v-model="form.edgeCondition" class="w-full">
              <el-option v-for="(e, k) in plateEdgeConditions" :key="k" :label="e.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('plateThickness')"><el-input-number v-model="form.thickness" :min="0.1" /></CalcFormItem>
          <CalcFormItem :label="pf('plateWidth')"><el-input-number v-model="form.width" :min="1" /></CalcFormItem>
          <CalcFormItem :label="pf('plateLength')"><el-input-number v-model="form.length" :min="1" /></CalcFormItem>
          <CalcFormItem :label="pf('appliedStress')"><el-input-number v-model="form.appliedStress" :min="0" /></CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('transverseStress')"><el-input-number v-model="form.appliedStressTransverse" :min="0" /></CalcFormItem>
            <CalcFormItem :label="pf('imperfectionFactor')">
              <el-input-number v-model="form.imperfectionFactor" :min="0.5" :max="1" :step="0.05" :precision="2" />
            </CalcFormItem>
            <CalcFormItem :label="pf('minSafetyPlate')">
              <el-input-number v-model="form.minSafety" :min="1" :max="5" :step="0.1" :precision="1" />
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('inPlaneShear')"><el-input-number v-model="form.appliedShear" :min="0" /></CalcFormItem>
            <CalcFormItem :label="pf('postBucklingFactor')">
              <el-input-number v-model="form.postBucklingFactor" :min="1" :max="3" :step="0.1" :precision="1" />
            </CalcFormItem>
          </template>
        </el-form>
        <StructuralDiagram
          variant="plate"
          :edge-condition="form.edgeCondition"
          :plate-length="form.length"
          :plate-width="form.width"
          :plate-thickness="form.thickness"
        />
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag class="mb-3" :type="overallStatusType">
          {{ pr('overall') }}: {{ overallStatusLabel }}
        </el-tag>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('bucklingCoeff')" />
            <dd class="font-mono">{{ result.bucklingCoeff?.toFixed(2) }}</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('aspectRatio')" />
            <dd class="font-mono">{{ result.aspectRatio?.toFixed(2) }}</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('criticalStress')" /><dd class="font-mono">{{ result.criticalStress?.toFixed(1) }} MPa</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('safetyFactor')" />
            <dd class="font-mono" :class="result.pass ? 'text-success' : 'text-error'">
              {{ result.safetyFactor === Infinity ? '—' : result.safetyFactor?.toFixed(2) }}
              <span class="text-xs text-gray-500"> / {{ pr('requiredSafety') }} {{ result.minSafety?.toFixed?.(1) ?? result.minSafety }}</span>
            </dd>
          </div>
          <div v-if="result.utilization != null" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('utilization')" /><dd class="font-mono">{{ (result.utilization * 100).toFixed(1) }}%</dd>
          </div>
          <div v-if="result.postBucklingCapacity != null" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('postBuckling')" />
            <dd class="font-mono">
              {{ result.postBucklingCapacity?.toFixed(1) }} MPa
              <span class="text-xs text-gray-500">(φ={{ result.postBucklingFactor }})</span>
            </dd>
          </div>
        </dl>
        <FormulaPanel :columns="1">
          <MathTex :expr="formulaCr" block />
          <MathTex :expr="formulaSf" block />
          <MathTex v-if="form.calcMode === 'professional'" :expr="formulaPost" block />
          <template #hints>
            <ul>
              <li><MathContent :text="pr('plateHintMaterial')" /></li>
              <li><MathContent :text="pr('plateHintK')" /></li>
              <li v-if="form.calcMode !== 'simple'"><MathContent :text="pr('plateHintEta')" /></li>
              <li><MathContent :text="pr('plateHintPass')" /></li>
              <li v-if="form.calcMode === 'professional'"><MathContent :text="pr('plateHintPost')" /></li>
            </ul>
          </template>
        </FormulaPanel>
      </section>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="plate-buckling"
        :title="historyTitle"
        :status="saveStatus"
        :summary="historySummary"
        :input="historyInput"
        :result="result"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { calcPlateBucklingStress, PLATE_EDGE_CONDITIONS } from '@/utils/plate-buckling-calc'
import StructuralDiagram from '@/components/structural/StructuralDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import MathContent from '@/components/common/MathContent.vue'
import MathTex from '@/components/common/MathTex.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import { getCalcReviewStatus } from '@/utils/calc-result'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import { snapshotHistoryInput } from '@/utils/history-replay'
import { useOptionsI18n } from '@/composables/useOptionsI18n'

const { pt, ct, pf, pr, fc } = useCalcPage('plate-buckling')
const { optionMap } = useOptionsI18n()

const formulaCr = String.raw`\sigma_{cr} = k\cdot\frac{\pi^{2} E}{12(1-\nu^{2})}\left(\frac{t}{b}\right)^{2}`
const formulaSf = String.raw`SF = \frac{\sigma_{cr}}{\sigma}`
const formulaPost = String.raw`\sigma_{pb} \approx \varphi\cdot\sigma_{cr}`

const plateEdgeConditions = computed(() => optionMap(PLATE_EDGE_CONDITIONS, 'plateEdgeConditions'))

const form = reactive({
  calcMode: 'simple',
  edgeCondition: 'ssss',
  thickness: 2,
  width: 200,
  length: 400,
  appliedStress: 50,
  appliedStressTransverse: 0,
  imperfectionFactor: 0.8,
  minSafety: 2,
  postBucklingFactor: 1.5,
  appliedShear: 0,
})

const result = computed(() => calcPlateBucklingStress(form))
const overallStatus = computed(() => getCalcReviewStatus(result.value))
const overallStatusType = computed(() => {
  if (overallStatus.value === 'pass') return 'success'
  if (overallStatus.value === 'review') return 'warning'
  return 'danger'
})
const overallStatusLabel = computed(() => {
  if (overallStatus.value === 'pass') return fc('overallPass')
  if (overallStatus.value === 'review') return fc('overallWarn')
  return fc('overallFail')
})

const { saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form,
  result,
  buildTitle: () => pt('title'),
  buildSummary: () => [
    { label: pr('criticalStress'), value: `${result.value.criticalStress?.toFixed(1) ?? '-'} MPa` },
    { label: fc('check'), value: overallStatusLabel.value },
  ],
})
const historyInput = computed(() => snapshotHistoryInput({ ...form }))

function applyReplay(input) {
  if (!input || typeof input !== 'object') return
  const src = input.plate && typeof input.plate === 'object' ? input.plate : input
  Object.assign(form, src)
}
useHistoryReplay('plate-buckling', null, { applyFn: applyReplay })
</script>
