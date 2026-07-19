<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="column-buckling" />
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="130px">
          <CalcFormItem :label="pf('endCondition')">
            <el-select v-model="form.endCondition" class="w-full">
              <el-option v-for="(e, k) in endConditions" :key="k" :label="e.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('sectionType')">
            <el-select v-model="form.section" class="w-full">
              <el-option v-for="(s, k) in sections" :key="k" :label="s.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('columnLength')">
            <el-input-number v-model="form.length" :min="10" />
          </CalcFormItem>
          <CalcFormItem v-if="form.section === 'circular'" :label="pf('diameter')">
            <el-input-number v-model="form.diameter" :min="1" />
          </CalcFormItem>
          <template v-else-if="form.section === 'rectangular'">
            <CalcFormItem :label="pf('rectWidth')">
              <el-input-number v-model="form.width" :min="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('rectHeight')">
              <el-input-number v-model="form.height" :min="1" />
            </CalcFormItem>
          </template>
          <template v-else>
            <CalcFormItem :label="pf('outerDiameter')">
              <el-input-number v-model="form.outerDiameter" :min="2" />
            </CalcFormItem>
            <CalcFormItem :label="pf('wallThickness')">
              <el-input-number v-model="form.wallThickness" :min="0.5" :max="form.outerDiameter / 2 - 0.1" />
            </CalcFormItem>
          </template>
          <CalcFormItem :label="pf('appliedForce')">
            <el-input-number v-model="form.appliedForce" :min="0" />
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('yieldStrength')">
              <el-input-number v-model="form.yieldStrength" :min="50" />
            </CalcFormItem>
            <CalcFormItem :label="pf('minSafety')">
              <el-input-number v-model="form.minSafety" :min="1" :max="5" :step="0.1" :precision="1" />
            </CalcFormItem>
          </template>
          <CalcFormItem v-if="form.calcMode === 'professional'" :label="pf('eccentricity')">
            <el-input-number v-model="form.eccentricity" :min="0" :step="0.1" :precision="2" />
          </CalcFormItem>
        </el-form>
        <ColumnBucklingDiagram
          :end-condition="form.endCondition"
          :section="form.section"
          :length="form.length"
          :diameter="form.diameter"
          :width="form.width"
          :height="form.height"
          :outer-diameter="form.outerDiameter"
          :wall-thickness="form.wallThickness"
          :eccentricity="form.calcMode === 'professional' ? form.eccentricity : 0"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag class="mb-3" :type="overallStatusType">
          {{ pr('overall') }}: {{ overallStatusLabel }}
        </el-tag>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900/60">
            <ResultLabel label-class="text-gray-500 dark:text-gray-400" :text="pr('slenderness')" />
            <dd class="font-mono text-gray-900 dark:text-gray-100">{{ result.slenderness?.toFixed(1) }}</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900/60">
            <ResultLabel label-class="text-gray-500 dark:text-gray-400" :text="pr('criticalLoad')" />
            <dd class="font-mono text-gray-900 dark:text-gray-100">{{ (result.criticalLoad / 1000)?.toFixed(2) }} kN</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900/60">
            <ResultLabel label-class="text-gray-500 dark:text-gray-400" :text="pr('criticalStress')" />
            <dd class="font-mono text-gray-900 dark:text-gray-100">{{ result.criticalStress?.toFixed(1) }} MPa</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900/60">
            <ResultLabel label-class="text-gray-500 dark:text-gray-400" :text="pr('safetyFactor')" />
            <dd class="font-mono" :class="result.pass ? 'text-success' : 'text-error'">
              {{ result.safetyFactor === Infinity ? '—' : result.safetyFactor?.toFixed(2) }}
            </dd>
          </div>
          <div v-if="result.regime" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900/60">
            <ResultLabel label-class="text-gray-500 dark:text-gray-400" :text="pr('regime')" />
            <dd class="font-mono text-gray-900 dark:text-gray-100">{{ pr(`regime_${result.regime}`) }}</dd>
          </div>
          <div v-if="result.maxBendingStress != null" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900/60">
            <ResultLabel label-class="text-gray-500 dark:text-gray-400" :text="pr('maxStress')" />
            <dd class="font-mono text-gray-900 dark:text-gray-100">{{ result.maxBendingStress?.toFixed(1) }} MPa</dd>
          </div>
        </dl>
        <p v-if="form.calcMode === 'simple'" class="mt-3 text-xs text-warning">
          <MathContent :text="pt('hintSimple')" />
        </p>
        <FormulaPanel :columns="1">
          <MathTex :expr="formulaPe" block />
          <MathTex :expr="formulaLambda" block />
          <MathTex v-if="form.calcMode !== 'simple'" :expr="formulaRankine" block />
          <template #hints>
            <ul>
              <li><MathContent :text="pr('colHintMu')" /></li>
              <li><MathContent :text="pr('colHintPass')" /></li>
              <li v-if="form.calcMode !== 'simple'"><MathContent :text="pr('colHintRankine')" /></li>
              <li v-if="form.calcMode === 'professional'"><MathContent :text="pr('colHintEcc')" /></li>
            </ul>
          </template>
        </FormulaPanel>
      </section>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="column-buckling"
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
import {
  calcColumnBuckling,
  COLUMN_END_CONDITIONS,
  COLUMN_SECTIONS,
} from '@/utils/column-buckling-calc'
import ColumnBucklingDiagram from '@/components/structural/ColumnBucklingDiagram.vue'
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

const { pt, ct, pf, pr, fc } = useCalcPage('column-buckling')
const { optionMap } = useOptionsI18n()

const formulaPe = String.raw`P_e = \frac{\pi^{2} E I}{(\mu L)^{2}}`
const formulaLambda = String.raw`\lambda = \frac{\mu L}{i},\quad i=\sqrt{I/A}`
const formulaRankine = String.raw`\frac{1}{\sigma_r}=\frac{1}{f_y}+\frac{1}{\sigma_E}`

const endConditions = computed(() => optionMap(COLUMN_END_CONDITIONS, 'columnEndConditions'))
const sections = computed(() => optionMap(COLUMN_SECTIONS, 'columnSections'))

const form = reactive({
  calcMode: 'simple',
  endCondition: 'pinned_pinned',
  section: 'circular',
  length: 800,
  diameter: 20,
  width: 20,
  height: 40,
  outerDiameter: 40,
  wallThickness: 3,
  appliedForce: 20000,
  yieldStrength: 235,
  minSafety: 2,
  eccentricity: 0,
})

const result = computed(() => calcColumnBuckling(form))
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
    { label: pr('criticalLoad'), value: `${(result.value.criticalLoad / 1000)?.toFixed(2) ?? '-'} kN` },
    { label: fc('check'), value: overallStatusLabel.value },
  ],
})
const historyInput = computed(() => snapshotHistoryInput({ ...form }))

function applyReplay(input) {
  if (!input || typeof input !== 'object') return
  Object.assign(form, input)
}
useHistoryReplay('column-buckling', null, { applyFn: applyReplay })
</script>
