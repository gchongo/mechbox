<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="modal-freq" />
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="120px">
          <CalcFormItem :label="pf('modelCase')">
            <el-select v-model="form.caseId" class="w-full">
              <el-option v-for="(c, k) in modalCases" :key="k" :label="c.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <template v-if="form.caseId === 'sdof'">
            <CalcFormItem :label="pf('stiffness')"><el-input-number v-model="form.stiffness" :min="1" /></CalcFormItem>
            <CalcFormItem :label="pf('mass')"><el-input-number v-model="form.mass" :min="0.001" :step="0.1" /></CalcFormItem>
          </template>
          <template v-else>
            <CalcFormItem :label="pf('spanLength')"><el-input-number v-model="form.spanLength" :min="10" /></CalcFormItem>
            <CalcFormItem :label="pf('diameter')"><el-input-number v-model="form.diameter" :min="1" /></CalcFormItem>
          </template>
          <CalcFormItem v-if="form.calcMode === 'professional'" :label="pf('dampingRatio')">
            <el-input-number v-model="form.dampingRatio" :min="0.001" :max="0.2" :step="0.005" :precision="3" />
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="fc('rpm')">
            <el-input-number v-model="form.rpm" :min="0" :step="100" />
            <span class="ml-2 text-xs text-gray-500">{{ pf('rpmOptional') }}</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('excitationFreq')">
            <el-input-number v-model="form.excitationFreq" :min="0" :precision="1" />
            <span class="ml-2 text-xs text-gray-500">{{ pf('hzOptional') }}</span>
          </CalcFormItem>
        </el-form>
        <StructuralDiagram
          variant="modal"
          :case-id="form.caseId"
          :excitation-freq="form.excitationFreq"
        />
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag v-if="hasPassFail" class="mb-3" :type="overallStatusType">
          {{ pr('overall') }}: {{ overallStatusLabel }}
        </el-tag>
        <div class="rounded bg-primary/5 p-4 text-center">
          <ResultLabel label-class="text-sm text-gray-500" :text="pr('naturalFreq')" />
          <dd class="font-mono text-3xl text-primary">{{ result.modal?.fn?.toFixed(2) ?? '—' }} Hz</dd>
          <p class="mt-1 text-xs">{{ rm('modal', `mode_${result.modal?.modeKey}`) }}</p>
        </div>
        <dl class="mt-4 space-y-2 text-sm">
          <div
            v-if="result.criticalSpeed != null"
            class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"
          >
            <ResultLabel :text="pr('criticalSpeed')" />
            <dd class="font-mono">{{ result.criticalSpeed?.toFixed(0) }} rpm</dd>
          </div>
          <template v-if="result.resonance && !result.resonance.errorKey">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('resonanceMargin')" />
              <dd class="font-mono">{{ result.resonance.marginPercent?.toFixed(1) }}%</dd>
            </div>
            <div
              v-if="result.amplificationFactor != null"
              class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"
            >
              <ResultLabel :text="pr('amplification')" />
              <dd class="font-mono">
                {{ result.amplificationFactor?.toFixed(2) }}
                <span class="text-xs text-gray-500">(r={{ result.frequencyRatio?.toFixed(3) }})</span>
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('assessment')" />
              <dd :class="result.resonance.pass ? 'text-success' : 'text-error'">
                {{ rm('modal', `assessment_${result.resonance.assessmentKey}`) }}
              </dd>
            </div>
          </template>
        </dl>
        <FormulaPanel :columns="1">
          <MathTex :expr="formulaFn" block />
          <MathTex v-if="form.calcMode === 'professional' && result.resonance" :expr="formulaH" block />
          <template #hints>
            <ul>
              <li><MathContent :text="pr('modalHintMaterial')" /></li>
              <li><MathContent :text="pr('modalHintMargin')" /></li>
              <li v-if="form.calcMode !== 'simple'"><MathContent :text="pr('modalHintRpm')" /></li>
              <li v-if="form.calcMode === 'professional'"><MathContent :text="pr('modalHintH')" /></li>
            </ul>
          </template>
        </FormulaPanel>
      </section>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="modal-freq"
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
import { analyzeModal, MODAL_CASES } from '@/utils/modal-calc'
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
import { useResultI18n } from '@/composables/useResultI18n'

const { pt, ct, pf, pr, fc } = useCalcPage('modal-freq')
const { optionMap } = useOptionsI18n()
const { rm } = useResultI18n()

const formulaSdof = String.raw`f_n = \frac{1}{2\pi}\sqrt{\frac{k}{m}}`
const formulaBeamSs = String.raw`f_n = \frac{\pi}{2L^{2}}\sqrt{\frac{EI}{\rho A}}`
const formulaBeamCant = String.raw`f_n = \frac{1.875^{2}}{2\pi L^{2}}\sqrt{\frac{EI}{\rho A}}`
const formulaH = String.raw`H(r)=\frac{1}{\sqrt{(1-r^{2})^{2}+(2\zeta r)^{2}}},\quad r=\frac{f_{\mathrm{exc}}}{f_n}`

const modalCases = computed(() => optionMap(MODAL_CASES, 'modalCases'))

const form = reactive({
  calcMode: 'simple',
  caseId: 'beam_ss',
  stiffness: 10000,
  mass: 5,
  spanLength: 500,
  diameter: 30,
  excitationFreq: 45,
  rpm: 2700,
  dampingRatio: 0.02,
})

const formulaFn = computed(() => {
  if (form.caseId === 'beam_ss') return formulaBeamSs
  if (form.caseId === 'beam_cant') return formulaBeamCant
  return formulaSdof
})

const result = computed(() => analyzeModal(form))
const reviewSnapshot = computed(() => ({
  pass: result.value.pass ?? result.value.resonance?.pass,
}))
const hasPassFail = computed(() => typeof reviewSnapshot.value.pass === 'boolean')
const overallStatus = computed(() => getCalcReviewStatus(reviewSnapshot.value))
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
    { label: pr('naturalFreq'), value: `${result.value.modal?.fn?.toFixed(2) ?? '-'} Hz` },
    { label: fc('check'), value: hasPassFail.value ? overallStatusLabel.value : '—' },
  ],
})
const historyInput = computed(() => snapshotHistoryInput({ ...form }))

function applyReplay(input) {
  if (!input || typeof input !== 'object') return
  const src = input.modal && typeof input.modal === 'object' ? input.modal : input
  Object.assign(form, src)
}
useHistoryReplay('modal-freq', null, { applyFn: applyReplay })
</script>
