<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <ChainSyncBanner
      :session="chainSession"
      :chain-name="chainName"
      :dirty="dirty"
      @sync="syncToChain"
      @back="backToChain"
      @dismiss="dismissSession"
    />

    <el-tabs v-model="pageTab">
      <el-tab-pane :label="pf('tabCalc')" name="calc">
    <CalcModePanel v-model="calcModePanel" page-key="bolt-preload" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="148px">
          <CalcFormItem :label="pf('convertDirection')">
            <el-radio-group v-model="form.mode">
              <el-radio value="torque2force">{{ pf('modeTorque2force') }}</el-radio>
              <el-radio value="force2torque">{{ pf('modeForce2torque') }}</el-radio>
            </el-radio-group>
          </CalcFormItem>
          <CalcFormItem :label="pf('nominalDiameter')" unit="">
            <el-input-number v-model="form.diameter" :min="3" :max="48" :step="1" @change="onDiameterChange" />
            <span class="ml-2 text-sm text-gray-500">M{{ form.diameter }}</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('pitch')">
            <el-input-number v-model="form.pitch" :min="0.5" :max="4" :precision="2" :step="0.25" />
            <el-button v-if="suggestedPitch" class="ml-2" size="small" link @click="form.pitch = suggestedPitch">
              {{ fc('standard') }} {{ suggestedPitch }}
            </el-button>
          </CalcFormItem>
          <CalcFormItem :label="pf('grade')">
            <el-select v-model="form.grade" class="w-full">
              <el-option v-for="(g, k) in grades" :key="k" :label="g.label" :value="k" />
            </el-select>
          </CalcFormItem>

          <template v-if="form.calcMode === 'simple'">
            <CalcFormItem :label="pf('frictionCoeff')">
              <el-input-number v-model="form.frictionCoeff" :min="0.1" :max="0.5" :precision="2" :step="0.05" />
            </CalcFormItem>
          </template>
          <template v-else>
            <CalcFormItem :label="pf('muG')">
              <el-input-number v-model="form.muG" :min="0.05" :max="0.5" :precision="2" :step="0.02" />
            </CalcFormItem>
            <CalcFormItem :label="pf('muK')">
              <el-input-number v-model="form.muK" :min="0.05" :max="0.5" :precision="2" :step="0.02" />
            </CalcFormItem>
            <CalcFormItem :label="pf('dKm')">
              <el-input-number v-model="form.dKm" :min="5" :max="80" :precision="2" :step="0.5" />
              <el-button class="ml-1" size="small" link @click="resetDKm">{{ estimatedDKm.toFixed(1) }} mm</el-button>
            </CalcFormItem>
          </template>

          <template v-if="form.calcMode === 'professional'">
            <el-divider content-position="left">{{ pf('dividerGrip') }}</el-divider>
            <CalcFormItem :label="pf('gripLength')">
              <el-input-number v-model="form.gripLength" :min="1" :max="500" :precision="1" />
              <el-button class="ml-1" size="small" link @click="resetGrip">{{ estimatedGrip }} mm</el-button>
            </CalcFormItem>
            <CalcFormItem :label="pf('holeDiameter')">
              <el-input-number v-model="form.holeDiameter" :min="1" :max="60" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('headContact')">
              <el-input-number v-model="form.headContactDiameter" :min="3" :max="80" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('outerDiameter')">
              <el-input-number v-model="form.outerDiameter" :min="5" :max="200" :precision="1" />
              <el-button class="ml-1" size="small" link @click="resetOuter">{{ estimatedOuter.toFixed(1) }} mm</el-button>
            </CalcFormItem>
            <CalcFormItem :label="pf('embedment')">
              <el-select v-model="form.embedmentPreset" class="w-full" @change="onEmbedmentPreset">
                <el-option
                  v-for="(p, key) in embedmentPresets"
                  :key="key"
                  :label="p.label"
                  :value="key"
                />
              </el-select>
            </CalcFormItem>
            <CalcFormItem v-if="form.embedmentPreset === 'custom'" :label="pf('embedmentFZ')" unit="μm">
              <el-input-number v-model="form.embedmentUm" :min="1" :max="50" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('deltaT')">
              <el-input-number v-model="form.deltaT" :min="-200" :max="500" :precision="1" :step="10" />
              <span class="ml-2 text-xs text-gray-500">{{ pf('deltaTHint') }}</span>
            </CalcFormItem>
            <CalcFormItem :label="pf('externalAxial')" unit="N">
              <el-input-number v-model="form.externalAxialLoad" :min="0" :step="500" />
            </CalcFormItem>
          </template>

          <CalcFormItem v-if="form.mode === 'torque2force'" :label="pf('torque')" unit="N·m">
            <el-input-number v-model="form.torque" :min="0" :precision="2" :step="1" />
          </CalcFormItem>
          <CalcFormItem v-else :label="preloadLabel" unit="N">
            <el-input-number v-model="form.preload" :min="0" :step="500" />
          </CalcFormItem>
        </el-form>

        <BoltPreloadDiagram
          :calc-mode="form.calcMode"
          :mode="form.mode"
          :diameter="form.diameter"
          :pitch="form.pitch"
          :grip-length="form.gripLength"
          :hole-diameter="form.holeDiameter"
          :head-contact-diameter="form.headContactDiameter"
          :outer-diameter="form.outerDiameter"
          :d-km="form.dKm"
          :delta-t="form.deltaT"
          :friction-coeff="form.frictionCoeff"
          :mu-g="form.muG"
          :mu-k="form.muK"
          :torque="form.torque"
          :preload="form.preload"
        />
      </section>

      <section ref="resultPanelRef" class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag class="mb-3" :type="overallStatusType">
          {{ pr('overall') }}: {{ overallStatusLabel }}
        </el-tag>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('stressArea')" />
            <dd class="font-mono">{{ result.stressArea.toFixed(2) }} mm²</dd>
          </div>

          <template v-if="form.calcMode !== 'simple'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('pitchDiameter')" />
              <dd class="font-mono">{{ result.pitchDiameter.toFixed(3) }} mm</dd>
            </div>
          </template>

          <template v-if="form.calcMode === 'professional' && result.joint">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('boltStiffness')" />
              <dd class="font-mono">{{ result.joint.kS.toFixed(1) }} N/mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('clampStiffness')" />
              <dd class="font-mono">{{ result.joint.kP.toFixed(1) }} N/mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('loadFactor')" />
              <dd class="font-mono">{{ (result.joint.loadFactor * 100).toFixed(1) }}%</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('embedmentLoss')" />
              <dd class="font-mono text-warning">{{ result.joint.embedmentLoss.toFixed(0) }} N</dd>
            </div>
            <div v-if="form.deltaT" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('thermalDelta')" />
              <dd class="font-mono">{{ result.joint.thermalDelta.toFixed(0) }} N</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('preloadTightening')" />
              <dd class="font-mono">{{ result.preloadTightening.toFixed(0) }} N</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('preloadResidual')" />
              <dd class="font-mono text-primary">{{ result.preloadResidual.toFixed(0) }} N</dd>
            </div>
            <template v-if="result.jointLoad?.externalAxialLoad > 0">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel label-class="text-gray-500" :text="pr('clampingForceRemaining')" />
                <dd class="font-mono" :class="reviewAwareCheckClass(result.jointLoad.separationPass, snapshot)">
                  {{ result.jointLoad.clampingForceRemaining.toFixed(0) }} N
                  {{ reviewAwareCheckMark(result.jointLoad.separationPass, snapshot, reviewMarkText) }}
                </dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel label-class="text-gray-500" :text="pr('maxBoltForce')" />
                <dd class="font-mono">{{ result.jointLoad.maxBoltForce.toFixed(0) }} N</dd>
              </div>
            </template>
          </template>
          <template v-else>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('preload')" />
              <dd class="font-mono">{{ result.preload.toFixed(0) }} N</dd>
            </div>
          </template>

          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('torque')" />
            <dd class="font-mono">{{ result.torque.toFixed(2) }} N·m</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('tensileStress')" />
            <dd class="font-mono" :class="reviewAwareCheckClass(result.stressPass, snapshot)">
              {{ result.stress.toFixed(1) }} MPa {{ reviewAwareCheckMark(result.stressPass, snapshot, reviewMarkText) }}
            </dd>
          </div>
          <div
            v-if="form.calcMode === 'professional'"
            class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"
          >
            <ResultLabel label-class="text-gray-500" :text="pr('stressResidual')" />
            <dd class="font-mono" :class="reviewAwareCheckClass(result.stressResidualPass, snapshot)">
              {{ result.stressResidual.toFixed(1) }} MPa {{ reviewAwareCheckMark(result.stressResidualPass, snapshot, reviewMarkText) }}
            </dd>
          </div>
          <div
            v-if="form.calcMode === 'professional' && result.stressUnderLoad != null"
            class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"
          >
            <ResultLabel label-class="text-gray-500" :text="pr('stressUnderLoad')" />
            <dd class="font-mono" :class="reviewAwareCheckClass(result.stressUnderLoadPass, snapshot)">
              {{ result.stressUnderLoad.toFixed(1) }} MPa {{ reviewAwareCheckMark(result.stressUnderLoadPass, snapshot, reviewMarkText) }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('maxPreload')" />
            <dd class="font-mono">{{ result.maxPreload.toFixed(0) }} N</dd>
          </div>
        </dl>

        <p v-if="reviewOnly" class="mt-3 text-xs text-warning">
          {{ pt('hintSimple') }}
        </p>

        <div v-if="result.breakdown" class="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <p class="mb-2 font-medium">{{ pr('torqueBreakdown') }}</p>
          <dl class="space-y-1.5 font-mono text-xs">
            <div class="flex justify-between">
              <ResultLabel label-class="text-gray-500" :text="pr('threadMoment')" />
              <dd>{{ result.breakdown.thread.toFixed(3) }} N·m</dd>
            </div>
            <div class="flex justify-between">
              <ResultLabel label-class="text-gray-500" :text="pr('headMoment')" />
              <dd>{{ result.breakdown.head.toFixed(3) }} N·m</dd>
            </div>
          </dl>
        </div>

        <p class="mt-3 text-xs text-gray-500">
          <MathContent
            :text="`${pr('compareTorque')} ${rm('boltPreload', `compare_${result.compareLabelKey}`)} ≈ ${result.compareTorque.toFixed(2)} N·m`"
          />
        </p>

        <FormulaPanel :columns="1">
          <MathTex v-if="form.calcMode === 'simple'" expr="T = \dfrac{\mu d F}{1000}" block />
          <MathTex
            v-else-if="form.calcMode === 'vdi2230'"
            expr="M_A = F\left(0.16P + 0.58d_2\mu_G + \dfrac{D_{km}}{2}\mu_K\right)"
            block
          />
          <template v-else>
            <MathTex expr="F_V = F_M + F_Z - \Delta F_{VT}" block />
            <MathTex expr="F_Z = \dfrac{f_Z}{\delta_S + \delta_P}" block />
            <MathTex expr="F_M = F_V - F_Z + \Delta F_{VT}" block />
          </template>
          <MathTex expr="\sigma = F / A_s" block />
          <template #hints>
            <ul>
              <li><MathContent :text="pr('boltHintUnits')" /></li>
              <li v-if="form.calcMode !== 'simple'"><MathContent :text="pr('boltHintVdi')" /></li>
            </ul>
          </template>
        </FormulaPanel>
        <el-button class="mt-4" type="primary" plain @click="exportCalcPdf">{{ fc('exportPdf') }}</el-button>
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
        tool="bolt-preload"
        :title="historyTitle"
        :status="saveStatus"
        :summary="historySummary"
        :input="historyInput"
        :result="snapshot"
      />
    </div>
      </el-tab-pane>

      <el-tab-pane :label="pf('tabWizard')" name="wizard">
        <p class="mb-4 text-xs text-gray-500">
          {{ pf('wizardHint') }}
        </p>
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="140px">
              <CalcFormItem :label="pf('tighteningR0')">
                <el-select v-model="wizardForm.tighteningMethod" class="w-full">
                  <el-option v-for="(m, k) in tighteningMethods" :key="k" :label="m.label" :value="k" />
                </el-select>
              </CalcFormItem>
              <CalcFormItem :label="pf('externalAxial')" unit="N">
                <el-input-number v-model="wizardForm.externalAxialLoad" :min="0" :step="500" />
              </CalcFormItem>
              <CalcFormItem :label="pf('alternatingLoad')">
                <el-input-number v-model="wizardForm.alternatingLoad" :min="0" :step="100" />
              </CalcFormItem>
              <CalcFormItem :label="pf('requiredClamp')">
                <el-input-number v-model="wizardForm.requiredClampLoad" :min="0" :step="500" />
                <span class="ml-2 text-xs text-gray-500">{{ pf('requiredClampHint') }}</span>
              </CalcFormItem>
              <CalcFormItem :label="pf('maxTorque')" unit="N·m">
                <el-input-number v-model="wizardForm.maxTorque" :min="0" :precision="1" />
              </CalcFormItem>
            </el-form>
            <p class="text-xs text-gray-500">{{ pf('wizardSharedHint') }}</p>
          </section>
          <section ref="wizardPanelRef" class="card-panel">
            <el-alert v-if="wizardDisplay?.error" :title="wizardDisplay.error" type="warning" show-icon />
            <template v-else-if="wizardDisplay">
              <el-tag class="mb-3" :type="wizardOverallType">
                {{ pr('overall') }}: {{ wizardOverallLabel }}
              </el-tag>
              <el-collapse accordion>
                <el-collapse-item v-for="s in wizardDisplay.steps" :key="s.id" :name="s.id">
                  <template #title>
                    <span class="mr-2 font-mono text-xs">{{ s.id }}</span>
                    <MathContent class="inline" :text="s.title" />
                    <el-tag class="ml-2" size="small" :type="stepTagType(s.status)">{{ stepStatusLabel(s.status) }}</el-tag>
                  </template>
                  <p class="text-sm"><MathContent :text="s.summary" /></p>
                  <p v-if="s.detail" class="text-xs text-gray-500"><MathContent :text="s.detail" /></p>
                  <p v-if="s.formula" class="mt-1 text-xs text-primary"><MathContent :text="s.formula" /></p>
                </el-collapse-item>
              </el-collapse>
            </template>
          </section>
        </div>
        <el-button class="mt-4" type="primary" plain @click="exportWizardPdf">{{ pf('exportWizardPdf') }}</el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import MathContent from '@/components/common/MathContent.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import BoltPreloadDiagram from '@/components/bolt/BoltPreloadDiagram.vue'
import {
  analyzeBoltPreload,
  THREAD_GRADES,
  METRIC_THREAD_PITCH,
  suggestPitch,
  estimateHeadFrictionDiameter,
  estimateHeadContactDiameter,
  estimateHoleDiameter,
  estimateGripLength,
  estimateReplacementOuterDiameter,
  EMBEDMENT_PRESETS,
} from '@/utils/bolt-preload-calc'
import { runVdi2230Wizard, TIGHTENING_METHODS, buildWizardReportText, localizeVdiWizard } from '@/utils/vdi2230-wizard'
import { exportToolReportPdf } from '@/utils/export'
import { buildEnhancedReport } from '@/utils/enhanced-report'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import DecisionToolsPanel from '@/components/decision/DecisionToolsPanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import ChainSyncBanner from '@/components/design/ChainSyncBanner.vue'
import { adaptBoltPreload } from '@/utils/calc-adapters'
import { getCalcReviewStatus, isReviewOnlyResult, reviewAwareCheckClass, reviewAwareCheckMark } from '@/utils/calc-result'
import { DECISION_PRESETS } from '@/utils/decision-presets'
import { useChainHandoff } from '@/composables/useChainHandoff'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useResultI18n } from '@/composables/useResultI18n'

const { pt, ct, pf, pr, fc, locale } = useCalcPage('bolt-preload')
const { optionMap } = useOptionsI18n()
const { rm } = useResultI18n()

const calcModePanel = computed({
  get: () => (form.calcMode === 'vdi2230' ? 'complete' : form.calcMode),
  set: (v) => {
    form.calcMode = v === 'complete' ? 'vdi2230' : v
  },
})

const pageTab = ref('calc')
const resultPanelRef = ref(null)
const wizardPanelRef = ref(null)
const tighteningMethods = computed(() => optionMap(TIGHTENING_METHODS, 'tighteningMethods'))

const grades = computed(() => optionMap(THREAD_GRADES, 'threadGrades'))
const embedmentPresets = computed(() => optionMap(EMBEDMENT_PRESETS, 'embedmentPresets'))

const form = reactive({
  calcMode: 'simple',
  mode: 'torque2force',
  diameter: 10,
  pitch: METRIC_THREAD_PITCH[10],
  grade: '8.8',
  frictionCoeff: 0.2,
  muG: 0.12,
  muK: 0.12,
  dKm: estimateHeadFrictionDiameter(10),
  gripLength: estimateGripLength(10),
  holeDiameter: estimateHoleDiameter(10),
  headContactDiameter: estimateHeadContactDiameter(10),
  outerDiameter: estimateReplacementOuterDiameter(estimateHeadContactDiameter(10), estimateGripLength(10)),
  embedmentPreset: 'steel_standard',
  embedmentUm: EMBEDMENT_PRESETS.steel_standard.value,
  deltaT: 0,
  externalAxialLoad: 0,
  torque: 50,
  preload: 25000,
})
const {
  chainSession,
  chainName,
  dirty,
  syncToChain,
  backToChain,
  dismissSession,
} = useChainHandoff('bolt-preload', form)

const wizardForm = reactive({
  tighteningMethod: 'torque',
  externalAxialLoad: 5000,
  alternatingLoad: 0,
  requiredClampLoad: 0,
  maxTorque: 0,
})

const suggestedPitch = computed(() => suggestPitch(form.diameter))
const estimatedDKm = computed(() => estimateHeadFrictionDiameter(form.diameter))
const estimatedGrip = computed(() => estimateGripLength(form.diameter))
const estimatedOuter = computed(() =>
  estimateReplacementOuterDiameter(form.headContactDiameter, form.gripLength),
)

const preloadLabel = computed(() => {
  locale.value
  return form.calcMode === 'professional' ? pf('preloadTarget') : pf('preload')
})

const result = computed(() => analyzeBoltPreload({ ...form }))

const decisionPreset = DECISION_PRESETS['bolt-preload']
const baseInputs = computed(() => ({ ...form }))
const snapshot = computed(() => adaptBoltPreload({ ...form }))
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
      { label: pf('preload'), value: `${r.preload?.toFixed(0) ?? '-'} N` },
      { label: fc('check'), value: overallStatusLabel.value },
    ]
  },
})
useHistoryReplay('bolt-preload', form)

function onApplyInverse({ variable, value }) {
  if (variable in form && Number.isFinite(value)) {
    form[variable] = Number(value.toFixed ? value.toFixed(3) : value)
  }
}

const wizardResult = computed(() =>
  runVdi2230Wizard({
    ...form,
    ...wizardForm,
    calcMode: 'professional',
    mode: 'force2torque',
  }),
)

const wizardDisplay = computed(() => {
  locale.value
  return localizeVdiWizard(wizardResult.value, locale.value)
})

const wizardOverallType = computed(() => {
  const o = wizardResult.value?.overall
  return { ok: 'success', warn: 'warning', fail: 'danger' }[o] ?? 'info'
})

const wizardOverallLabel = computed(() => {
  locale.value
  const o = wizardResult.value?.overall
  return { ok: fc('overallPass'), warn: fc('overallWarn'), fail: fc('overallFail') }[o] ?? '-'
})

function stepTagType(s) {
  return { ok: 'success', fail: 'danger', warn: 'warning', skip: 'info' }[s] ?? 'info'
}

function stepStatusLabel(s) {
  return { ok: fc('stepPass'), fail: fc('stepFail'), warn: fc('stepWarn'), skip: fc('stepSkip') }[s] ?? s
}

async function exportCalcPdf() {
  const report = buildEnhancedReport({ snapshot: snapshot.value })
  await exportToolReportPdf({
    title: pt('title'),
    subtitle: `M${form.diameter} · ${form.grade} · ${form.calcMode}`,
    sections: report.sections,
    element: resultPanelRef.value,
    filename: `bolt-preload_M${form.diameter}_${Date.now()}.pdf`,
    meta: {
      locale: locale.value,
      trace: {
        toolLabel: pt('title'),
        calcMode: form.calcMode,
        status: overallStatus.value,
        units: 'N, MPa',
        assumptions: snapshot.value?.assumptions,
      },
    },
  })
}

async function exportWizardPdf() {
  const w = wizardResult.value
  if (!w || w.errorKey) return
  await exportToolReportPdf({
    title: pf('tabWizard'),
    subtitle: `M${form.diameter} · ${form.grade}`,
    sections: [
      {
        heading: pr('keyResults'),
        rows: [
          { label: 'F_M (N)', value: w.keyResults.FM.toFixed(0) },
          { label: 'F_V (N)', value: w.keyResults.FV.toFixed(0) },
          { label: 'T (N·m)', value: w.keyResults.torque.toFixed(2) },
          { label: 'σ (MPa)', value: w.keyResults.sigmaRed.toFixed(1) },
        ],
      },
      {
        heading: pr('stepDetails'),
        text: buildWizardReportText(w, locale.value),
      },
    ],
    element: wizardPanelRef.value,
    filename: `VDI2230_M${form.diameter}_${Date.now()}.pdf`,
    meta: {
      locale: locale.value,
      trace: {
        toolLabel: pt('title'),
        calcMode: form.calcMode,
        status: overallStatus.value,
        units: 'N, MPa',
        assumptions: snapshot.value?.assumptions,
      },
    },
  })
}

function onDiameterChange() {
  const d = form.diameter
  const p = suggestPitch(d)
  if (p) form.pitch = p
  form.dKm = estimateHeadFrictionDiameter(d)
  form.gripLength = estimateGripLength(d)
  form.holeDiameter = estimateHoleDiameter(d)
  form.headContactDiameter = estimateHeadContactDiameter(d)
  form.outerDiameter = estimateReplacementOuterDiameter(form.headContactDiameter, form.gripLength)
}

function resetDKm() {
  form.dKm = estimatedDKm.value
}

function resetGrip() {
  form.gripLength = estimatedGrip.value
  form.outerDiameter = estimatedOuter.value
}

function resetOuter() {
  form.outerDiameter = estimatedOuter.value
}

function onEmbedmentPreset(key) {
  const v = EMBEDMENT_PRESETS[key]?.value
  if (v != null) form.embedmentUm = v
}
</script>

<style scoped>
@media (max-width: 640px) {
  .bolt-mode-group :deep(.el-radio-button__inner) {
    padding: 8px 10px;
    font-size: 12px;
  }
}
</style>
