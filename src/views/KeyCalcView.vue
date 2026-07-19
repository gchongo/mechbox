<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <ChainSyncBanner
      :session="chainSession"
      :chain-name="chainName"
      :dirty="dirty"
      @sync="syncToChain"
      @back="backToChain"
      @dismiss="dismissSession"
    />

    <CalcModePanel v-model="form.calcMode" page-key="key" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="140px">
          <CalcFormItem :label="pf('torque')"><el-input-number v-model="form.torque" :min="0" /></CalcFormItem>
          <CalcFormItem :label="pf('shaftDiameter')"><el-input-number v-model="form.shaftDiameter" :min="10" /></CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('stdKey')">
            <span class="font-mono text-sm">{{ stdKey.width }} × {{ stdKey.height }} mm</span>
            <el-button class="ml-2" size="small" link @click="applyStdKey">{{ fc('apply') }}</el-button>
          </CalcFormItem>
          <CalcFormItem :label="pf('keyWidth')"><el-input-number v-model="form.keyWidth" :min="2" /></CalcFormItem>
          <CalcFormItem :label="pf('keyLength')"><el-input-number v-model="form.keyLength" :min="5" /></CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('hubLength')">
            <el-input-number v-model="form.hubLength" :min="5" />
          </CalcFormItem>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('keyCount')">
              <el-input-number v-model="form.keyCount" :min="1" :max="2" />
            </CalcFormItem>
            <CalcFormItem :label="pf('torqueAmplitude')">
              <el-input-number v-model="form.torqueAmplitude" :min="0" />
            </CalcFormItem>
          </template>
        </el-form>

        <KeyConnectionDiagram
          :shaft-diameter="form.shaftDiameter"
          :key-width="form.keyWidth"
          :key-length="form.keyLength"
          :key-height="result.keyHeight ?? stdKey.height"
          :torque="form.torque"
          :hub-length="form.calcMode !== 'simple' ? form.hubLength : 0"
        />
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag class="mb-3" :type="overallStatusType">
          {{ pr('overall') }}: {{ overallStatusLabel }}
        </el-tag>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('tangentialForce')" /><dd class="font-mono">{{ result.tangentialForce.toFixed(0) }} N</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('shearStress')" /><dd class="font-mono" :class="reviewAwareCheckClass(result.shearPass, snapshot)">{{ result.shearStress.toFixed(1) }} MPa {{ reviewAwareCheckMark(result.shearPass, snapshot, reviewMarkText) }}</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('crushStress')" /><dd class="font-mono" :class="reviewAwareCheckClass(result.crushPass, snapshot)">{{ result.crushStress.toFixed(1) }} MPa {{ reviewAwareCheckMark(result.crushPass, snapshot, reviewMarkText) }}</dd></div>
          <div v-if="result.recommendedLength" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('recommendedLength')" /><dd class="font-mono">{{ result.recommendedLength.toFixed(1) }} mm</dd></div>
          <div v-if="result.shearAmplitude" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('shearAmplitude')" /><dd class="font-mono">{{ result.shearAmplitude?.toFixed(1) }} MPa</dd></div>
        </dl>
        <p v-if="reviewOnly" class="mt-3 text-xs text-warning">{{ pt('hintSimple') }}</p>

        <FormulaPanel>
          <MathTex :expr="formulaForce" block />
          <MathTex :expr="formulaShear" block />
          <MathTex :expr="formulaCrush" block />
          <MathTex v-if="form.calcMode !== 'simple'" :expr="formulaMinL" block />
          <MathTex v-if="form.calcMode === 'professional'" :expr="formulaAmp" block />
          <template #hints>
            <ul>
              <li><MathContent :text="pr('keyHintForce')" /></li>
              <li><MathContent :text="pr('keyHintStress')" /></li>
              <li v-if="form.calcMode !== 'simple'"><MathContent :text="pr('keyHintLength')" /></li>
              <li v-if="form.calcMode === 'professional'"><MathContent :text="pr('keyHintPro')" /></li>
            </ul>
          </template>
        </FormulaPanel>
      </section>
    </div>

    <DecisionToolsPanel
      :preset="decisionPreset"
      :snapshot="snapshot"
      :base-inputs="baseInputs"
      @apply="onApplyInverse"
    />

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="key"
        :title="historyTitle"
        :status="saveStatus"
        :summary="historySummary"
        :input="historyInput"
        :result="snapshot"
      />
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import MathContent from '@/components/common/MathContent.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import { analyzeKeyConnection, lookupKeySize } from '@/utils/key-calc'
import KeyConnectionDiagram from '@/components/key/KeyConnectionDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import DecisionToolsPanel from '@/components/decision/DecisionToolsPanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import ChainSyncBanner from '@/components/design/ChainSyncBanner.vue'
import { adaptKeyConnection } from '@/utils/calc-adapters'
import { getCalcReviewStatus, isReviewOnlyResult, reviewAwareCheckClass, reviewAwareCheckMark } from '@/utils/calc-result'
import { DECISION_PRESETS } from '@/utils/decision-presets'
import { useChainHandoff } from '@/composables/useChainHandoff'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'

const { pt, ct, pf, pr, fc, locale } = useCalcPage('key')

const form = reactive({
  calcMode: 'simple',
  torque: 200,
  shaftDiameter: 30,
  keyWidth: 8,
  keyLength: 28,
  hubLength: 28,
  keyCount: 1,
  torqueAmplitude: 80,
})
const {
  chainSession,
  chainName,
  dirty,
  syncToChain,
  backToChain,
  dismissSession,
} = useChainHandoff('key', form)

const stdKey = computed(() => lookupKeySize(form.shaftDiameter))
const result = computed(() => analyzeKeyConnection(form))

const formulaForce = String.raw`F = \dfrac{2000\,T}{d}`
const formulaShear = String.raw`\tau = \dfrac{F}{n\,b\,L}`
const formulaCrush = String.raw`\sigma_c = \dfrac{2F}{n\,h\,L_h}`
const formulaMinL = String.raw`L_{\min} = \max\!\left(\dfrac{F}{n\,b\,[\tau]},\,\dfrac{2F}{n\,h\,[\sigma_c]}\right)`
const formulaAmp = String.raw`\tau_a = \dfrac{2000\,T_a}{n\,b\,L\,d}`

function applyStdKey() {
  form.keyWidth = stdKey.value.width
  form.keyLength = Math.round(stdKey.value.width * 3.5)
}

const decisionPreset = DECISION_PRESETS.key
const baseInputs = computed(() => ({ ...form }))
const snapshot = computed(() => adaptKeyConnection(form))
const overallStatus = computed(() => getCalcReviewStatus(snapshot.value))
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
const reviewOnly = computed(() => isReviewOnlyResult(snapshot.value))
const reviewMarkText = computed(() => (locale.value === 'en' ? '(Review)' : '（待复核）'))

const { historyInput, saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form,
  result: snapshot,
  buildTitle: () => pt('title'),
  buildSummary: () => {
    const r = result.value
    if (r?.errorKey) return []
    return [
      { label: pr('shearStress'), value: `${r.shearStress?.toFixed(1) ?? '-'} MPa` },
      { label: fc('check'), value: overallStatusLabel.value },
    ]
  },
})
useHistoryReplay('key', form)

function onApplyInverse({ variable, value }) {
  if (variable in form && Number.isFinite(value)) {
    form[variable] = Number(value.toFixed ? value.toFixed(1) : value)
    if (variable === 'keyLength') form.hubLength = form.keyLength
  }
}
</script>
