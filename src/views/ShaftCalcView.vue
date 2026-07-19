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

    <CalcModePanel v-model="form.calcMode" page-key="shaft" />

    <el-tabs v-model="mode" class="mb-6">
      <el-tab-pane :label="pf('tabTorsion')" name="torsion" />
      <el-tab-pane :label="pf('tabCombined')" name="combined" />
    </el-tabs>
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="130px">
          <CalcFormItem v-if="form.calcMode === 'simple'" :label="fc('material')">
            <el-select v-model="form.materialId" class="w-full" filterable>
              <el-option v-for="m in materialOptions" :key="m.id" :label="m.label" :value="m.id" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('diameter')"><el-input-number v-model="form.diameter" :min="1" /></CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('innerDiameter')">
            <el-input-number v-model="form.innerDiameter" :min="0" :max="form.diameter - 1" />
            <span class="ml-2 text-xs text-gray-500">{{ pf('innerDiameterHint') }}</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('torque')"><el-input-number v-model="form.torque" :min="0" :precision="2" /></CalcFormItem>
          <CalcFormItem v-if="mode === 'torsion'" :label="pf('shaftLength')"><el-input-number v-model="form.length" :min="10" :step="50" /></CalcFormItem>
          <CalcFormItem v-if="mode === 'combined'" :label="pf('bendingMoment')"><el-input-number v-model="form.bendingMoment" :min="0" :precision="2" /></CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('yieldStrength')">
            <el-input-number v-model="form.yieldStrength" :min="100" :step="50" />
          </CalcFormItem>
          <CalcFormItem :label="mode === 'combined' ? pf('allowableCombined') : pf('allowableShear')">
            <el-input-number v-model="form.allowable" :min="10" :disabled="form.calcMode === 'simple'" />
          </CalcFormItem>
          <CalcFormItem v-if="mode === 'torsion' && form.calcMode !== 'simple'" :label="pf('maxTwistAngle')">
            <el-input-number v-model="form.maxTwistAngle" :min="0" :precision="3" :step="0.1" />
            <span class="ml-2 text-xs text-gray-500">{{ pf('maxTwistAngleHint') }}</span>
          </CalcFormItem>
          <template v-if="form.calcMode === 'professional' && mode === 'torsion'">
            <CalcFormItem :label="pf('ktTorsion')">
              <el-input-number v-model="form.stressConcentrationTorsion" :min="1" :max="5" :step="0.1" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('torqueAmplitude')">
              <el-input-number v-model="form.torqueAmplitude" :min="0" :precision="2" />
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional' && mode === 'combined'">
            <CalcFormItem :label="pf('ktBending')">
              <el-input-number v-model="form.stressConcentrationBending" :min="1" :max="5" :step="0.1" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('ktTorsion')">
              <el-input-number v-model="form.stressConcentrationTorsion" :min="1" :max="5" :step="0.1" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('bendingAmplitude')">
              <el-input-number v-model="form.bendingAmplitude" :min="0" :precision="2" />
            </CalcFormItem>
            <CalcFormItem :label="pf('torqueAmplitude')">
              <el-input-number v-model="form.torqueAmplitude" :min="0" :precision="2" />
            </CalcFormItem>
          </template>
        </el-form>

        <ShaftDiagram
          :diameter="form.diameter"
          :inner-diameter="form.innerDiameter"
          :mode="mode"
          :length="form.length"
          :torque="form.torque"
          :bending-moment="form.bendingMoment"
        />
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag
          v-if="(mode === 'torsion' && !torsionResult.errorKey) || (mode === 'combined' && !combinedResult.errorKey)"
          class="mb-3"
          :type="overallStatusType"
        >
          {{ pr('overall') }}: {{ shaftVerdictLabel }}
        </el-tag>
        <el-alert v-if="torsionResult.errorKey && mode === 'torsion'" :title="re(torsionResult.errorKey)" type="warning" show-icon class="mb-3" />
        <el-alert v-if="combinedResult.errorKey && mode === 'combined'" :title="re(combinedResult.errorKey)" type="warning" show-icon class="mb-3" />
        <dl v-if="mode === 'torsion' && !torsionResult.errorKey" class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('shearStress')" /><dd class="font-mono" :class="localCheckClass(torsionResult.torsionPass ?? torsionResult.pass)">{{ torsionResult.shearStress.toFixed(2) }} MPa {{ localCheckMark(torsionResult.torsionPass ?? torsionResult.pass) }}</dd></div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <div class="flex justify-between">
              <ResultLabel :text="pr('twistAngle')" />
              <dd class="font-mono" :class="localCheckClass(torsionResult.anglePass)">
                {{ torsionResult.twistAngle.toFixed(4) }}°
                <template v-if="typeof torsionResult.anglePass === 'boolean'">
                  {{ localCheckMark(torsionResult.anglePass) }}
                </template>
              </dd>
            </div>
            <p v-if="torsionResult.angleCriterionMissing" class="mt-1 text-xs text-gray-500">
              {{ pr('twistAngleNoLimit') }}
            </p>
          </div>
          <div v-if="form.calcMode !== 'simple'" class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <div class="flex justify-between gap-2">
              <ResultLabel :text="pr('minDiameter')" />
              <dd class="shrink-0 font-mono">{{ torsionResult.minDiameter?.toFixed(1) }} mm</dd>
            </div>
            <p class="mt-1 text-xs text-gray-500">{{ pr('minDiameterHint') }}</p>
          </div>
          <div v-if="form.calcMode === 'professional' && torsionResult.peakShearStress" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('peakShear')" /><dd class="font-mono" :class="localCheckClass(torsionResult.peakPass)">{{ torsionResult.peakShearStress.toFixed(2) }} MPa {{ localCheckMark(torsionResult.peakPass) }}</dd></div>
          <div v-if="torsionResult.fatigueAmplitude" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('fatigueAmp')" /><dd class="font-mono" :class="localCheckClass(torsionResult.fatiguePass)">{{ torsionResult.fatigueAmplitude?.toFixed(1) }} / {{ torsionResult.fatigueEndurance?.toFixed(0) }} MPa {{ localCheckMark(torsionResult.fatiguePass) }}</dd></div>
        </dl>
        <dl v-else-if="!combinedResult.errorKey" class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('bendingStress')" /><dd class="font-mono">{{ combinedResult.bendingStress.toFixed(2) }} MPa</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('torsionStress')" /><dd class="font-mono">{{ combinedResult.torsionStress.toFixed(2) }} MPa</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('equivalentStress')" /><dd class="font-mono" :class="localCheckClass(combinedResult.combinedPass ?? combinedResult.pass)">{{ combinedResult.equivalentStress.toFixed(2) }} MPa {{ localCheckMark(combinedResult.combinedPass ?? combinedResult.pass) }}</dd></div>
          <div v-if="combinedResult.utilization" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('utilization')" /><dd class="font-mono">{{ (combinedResult.utilization * 100).toFixed(1) }}%</dd></div>
          <template v-if="combinedResult.fatigueAmplitude != null">
            <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <div class="flex justify-between">
                <ResultLabel :text="pr('fatigueAmp')" />
                <dd class="font-mono" :class="localCheckClass(combinedResult.fatiguePass)">
                  {{ combinedResult.fatigueAmplitude?.toFixed(1) }} / {{ combinedResult.fatigueEndurance?.toFixed(0) }} MPa
                  {{ localCheckMark(combinedResult.fatiguePass) }}
                </dd>
              </div>
              <p class="mt-1 text-xs text-gray-500">{{ pr('fatigueAmpHint') }}</p>
            </div>
            <div
              v-if="combinedResult.fatigueBendingAmplitude != null"
              class="flex justify-between rounded bg-gray-50 p-3 text-xs dark:bg-gray-900"
            >
              <ResultLabel :text="pr('fatigueBendingAmp')" />
              <dd class="font-mono">{{ combinedResult.fatigueBendingAmplitude.toFixed(2) }} MPa</dd>
            </div>
            <div
              v-if="combinedResult.fatigueTorsionAmplitude != null"
              class="flex justify-between rounded bg-gray-50 p-3 text-xs dark:bg-gray-900"
            >
              <ResultLabel :text="pr('fatigueTorsionAmp')" />
              <dd class="font-mono">{{ combinedResult.fatigueTorsionAmplitude.toFixed(2) }} MPa</dd>
            </div>
          </template>
        </dl>
        <FormulaPanel :columns="1">
          <MathTex v-if="mode === 'combined'" expr="\sigma_{eq} = \sqrt{\sigma^2 + 3\tau^2}" block />
          <MathTex v-else expr="\tau = \frac{16T}{\pi d^3}" block />
          <template #hints>
            <ul>
              <li><MathContent :text="pr('unitNote')" /></li>
            </ul>
          </template>
        </FormulaPanel>
      </section>
    </div>

    <DecisionToolsPanel
      v-if="mode === 'torsion'"
      :preset="decisionPreset"
      :snapshot="snapshot"
      :base-inputs="baseInputs"
      @apply="onApplyInverse"
    />

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="shaft"
        :title="historyTitle"
        :status="saveStatus"
        :summary="historySummary"
        :input="historyInput"
        :result="currentSnapshot"
      />
    </div>
  </div>
</template>
<script setup>
import { reactive, computed, ref, watch } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import MathContent from '@/components/common/MathContent.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import { analyzeShaftTorsion } from '@/utils/shaft-calc'
import { analyzeShaftCombined } from '@/utils/shaft-combined'
import { MATERIALS, findMaterial } from '@/constants/materials'
import { materialsEn } from '@/i18n/materials-i18n'
import ShaftDiagram from '@/components/shaft/ShaftDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import DecisionToolsPanel from '@/components/decision/DecisionToolsPanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import ChainSyncBanner from '@/components/design/ChainSyncBanner.vue'
import { adaptShaftCombined, adaptShaftTorsion } from '@/utils/calc-adapters'
import { getCalcReviewStatus, reviewAwareCheckClass, reviewAwareCheckMark } from '@/utils/calc-result'
import { DECISION_PRESETS } from '@/utils/decision-presets'
import { useChainHandoff } from '@/composables/useChainHandoff'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import { snapshotHistoryInput, applyReplayToTarget } from '@/utils/history-replay'
import { useResultI18n } from '@/composables/useResultI18n'
import { useLocale } from '@/composables/useLocale'

const { pt, ct, pf, pr, fc } = useCalcPage('shaft')
const { re } = useResultI18n()
const { locale } = useLocale()
const mode = ref('torsion')
const form = reactive({
  calcMode: 'simple',
  materialId: 'q235',
  diameter: 30,
  innerDiameter: 0,
  torque: 200,
  length: 500,
  bendingMoment: 150,
  allowable: 94,
  yieldStrength: 235,
  stressConcentrationBending: 1.5,
  stressConcentrationTorsion: 1.3,
  torqueAmplitude: 80,
  bendingAmplitude: 60,
  maxTwistAngle: null,
})
const {
  chainSession,
  chainName,
  dirty,
  syncToChain,
  backToChain,
  dismissSession,
} = useChainHandoff('shaft', form)

const materialOptions = computed(() =>
  MATERIALS.map((m) => ({
    id: m.id,
    label: locale.value === 'en' ? (materialsEn[m.id]?.name ?? m.name) : m.name,
  })),
)

function applyShaftMaterial(id) {
  const mat = findMaterial(id)
  if (!mat) return
  form.yieldStrength = mat.sigmaS || mat.sigmaAllow * 1.5
  form.allowable = mode.value === 'combined' ? mat.sigmaAllow : mat.tauAllow
}

watch(
  () => [form.materialId, mode.value],
  ([id]) => {
    if (form.calcMode === 'simple') applyShaftMaterial(id)
  },
  { immediate: true },
)

const torsionResult = computed(() =>
  analyzeShaftTorsion({
    ...form,
    allowableShear: form.calcMode === 'simple' ? form.allowable : undefined,
  }),
)
const combinedResult = computed(() =>
  analyzeShaftCombined({
    ...form,
    allowableStress: form.calcMode === 'simple' ? form.allowable : undefined,
  }),
)

const decisionPreset = DECISION_PRESETS.shaft
const baseInputs = computed(() => ({
  ...form,
  allowableShear: form.calcMode === 'simple' ? form.allowable : undefined,
}))
const torsionSnapshot = computed(() => adaptShaftTorsion(baseInputs.value))
const combinedSnapshot = computed(() =>
  adaptShaftCombined({
    ...form,
    allowableStress: form.calcMode === 'simple' ? form.allowable : undefined,
  }),
)
const snapshot = computed(() => torsionSnapshot.value)
const currentSnapshot = computed(() => (mode.value === 'combined' ? combinedSnapshot.value : torsionSnapshot.value))
const overallStatus = computed(() => getCalcReviewStatus(currentSnapshot.value))
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
const shaftVerdictLabel = computed(() => {
  const r = mode.value === 'combined' ? combinedResult.value : torsionResult.value
  if (r?.errorKey) return overallStatusLabel.value
  if (form.calcMode === 'professional' || form.calcMode === 'complete') {
    if (r?.staticPass || r?.combinedPass || r?.torsionPass) {
      if (overallStatus.value === 'fail') return pr('verdictNeedAdjust')
      return pr('verdictStaticOk')
    }
  }
  return overallStatusLabel.value
})
const reviewMarkText = computed(() => (locale.value === 'en' ? '(Review)' : '（待复核）'))

const { saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form,
  result: currentSnapshot,
  buildTitle: () => pt('title'),
  buildSummary: () => {
    const r = mode.value === 'combined' ? combinedResult.value : torsionResult.value
    if (r?.errorKey) return []
    return [
      { label: mode.value === 'combined' ? pr('equivalentStress') : pr('shearStress'), value: `${(mode.value === 'combined' ? r.equivalentStress : r.shearStress)?.toFixed(1) ?? '-'} MPa` },
      { label: fc('check'), value: overallStatusLabel.value },
    ]
  },
})
const historyInput = computed(() => snapshotHistoryInput({ mode: mode.value, ...form }))

function applyShaftReplay(input) {
  if (!input || typeof input !== 'object') return
  if (input.mode != null) mode.value = input.mode
  applyReplayToTarget(form, input)
}
useHistoryReplay('shaft', null, { applyFn: applyShaftReplay })

function localCheckClass(passFlag) {
  return typeof passFlag === 'boolean' ? reviewAwareCheckClass(passFlag, currentSnapshot.value) : ''
}

function localCheckMark(passFlag) {
  return typeof passFlag === 'boolean' ? reviewAwareCheckMark(passFlag, currentSnapshot.value, reviewMarkText.value) : ''
}

function onApplyInverse({ variable, value }) {
  if (variable in form && Number.isFinite(value)) {
    form[variable] = Number(value.toFixed ? value.toFixed(3) : value)
  }
}
</script>
