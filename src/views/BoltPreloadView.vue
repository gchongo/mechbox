<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

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
          <CalcFormItem :label="pf('nominalDiameter')">
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
            <CalcFormItem v-if="form.embedmentPreset === 'custom'" :label="pf('embedmentFZ')">
              <el-input-number v-model="form.embedmentUm" :min="1" :max="50" :precision="1" />
              <span class="ml-2 text-sm text-gray-500">μm</span>
            </CalcFormItem>
            <CalcFormItem :label="pf('deltaT')">
              <el-input-number v-model="form.deltaT" :min="-200" :max="500" :precision="1" :step="10" />
              <span class="ml-2 text-xs text-gray-500">{{ pf('deltaTHint') }}</span>
            </CalcFormItem>
          </template>

          <CalcFormItem v-if="form.mode === 'torque2force'" :label="pf('torque')">
            <el-input-number v-model="form.torque" :min="0" :precision="2" :step="1" />
            <span class="ml-2 text-sm text-gray-500">N·m</span>
          </CalcFormItem>
          <CalcFormItem v-else :label="preloadLabel">
            <el-input-number v-model="form.preload" :min="0" :step="500" />
            <span class="ml-2 text-sm text-gray-500">N</span>
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
        />
      </section>

      <section ref="resultPanelRef" class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">{{ pr('stressArea') }} <MathTex expr="A_s" /></dt>
            <dd class="font-mono">{{ result.stressArea.toFixed(2) }} mm²</dd>
          </div>

          <template v-if="form.calcMode !== 'simple'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">{{ pr('pitchDiameter') }} <MathTex expr="d_2" /></dt>
              <dd class="font-mono">{{ result.pitchDiameter.toFixed(3) }} mm</dd>
            </div>
          </template>

          <template v-if="form.calcMode === 'professional' && result.joint">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">{{ pr('boltStiffness') }} <MathTex expr="k_S" /></dt>
              <dd class="font-mono">{{ result.joint.kS.toFixed(1) }} N/mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">{{ pr('clampStiffness') }} <MathTex expr="k_P" /></dt>
              <dd class="font-mono">{{ result.joint.kP.toFixed(1) }} N/mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">{{ pr('loadFactor') }} <MathTex expr="\Phi" /></dt>
              <dd class="font-mono">{{ (result.joint.loadFactor * 100).toFixed(1) }}%</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">{{ pr('embedmentLoss') }} <MathTex expr="F_Z" /></dt>
              <dd class="font-mono text-warning">{{ result.joint.embedmentLoss.toFixed(0) }} N</dd>
            </div>
            <div v-if="form.deltaT" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">{{ pr('thermalDelta') }} <MathTex expr="\Delta F_{VT}" /></dt>
              <dd class="font-mono">{{ result.joint.thermalDelta.toFixed(0) }} N</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">{{ pr('preloadTightening') }} <MathTex expr="F_V" /></dt>
              <dd class="font-mono">{{ result.preloadTightening.toFixed(0) }} N</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">{{ pr('preloadResidual') }} <MathTex expr="F_M" /></dt>
              <dd class="font-mono text-primary">{{ result.preloadResidual.toFixed(0) }} N</dd>
            </div>
          </template>
          <template v-else>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">{{ pr('preload') }} <MathTex expr="F" /></dt>
              <dd class="font-mono">{{ result.preload.toFixed(0) }} N</dd>
            </div>
          </template>

          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">{{ pr('torque') }} <MathTex expr="T" /></dt>
            <dd class="font-mono">{{ result.torque.toFixed(2) }} N·m</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">{{ pr('tensileStress') }} <MathTex expr="\sigma" /></dt>
            <dd class="font-mono" :class="result.pass ? 'text-success' : 'text-error'">
              {{ result.stress.toFixed(1) }} MPa {{ result.pass ? '✓' : '✗' }}
            </dd>
          </div>
          <div
            v-if="form.calcMode === 'professional'"
            class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"
          >
            <dt class="text-gray-500">{{ pr('stressResidual') }} <MathTex expr="\sigma_M" /></dt>
            <dd class="font-mono" :class="result.passResidual ? 'text-success' : 'text-error'">
              {{ result.stressResidual.toFixed(1) }} MPa {{ result.passResidual ? '✓' : '✗' }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">{{ pr('maxPreload') }}</dt>
            <dd class="font-mono">{{ result.maxPreload.toFixed(0) }} N</dd>
          </div>
        </dl>

        <div v-if="result.breakdown" class="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <p class="mb-2 font-medium">{{ pr('torqueBreakdown') }}</p>
          <dl class="space-y-1.5 font-mono text-xs">
            <div class="flex justify-between">
              <dt class="text-gray-500">{{ pr('threadMoment') }}</dt>
              <dd>{{ result.breakdown.thread.toFixed(3) }} N·m</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">{{ pr('headMoment') }}</dt>
              <dd>{{ result.breakdown.head.toFixed(3) }} N·m</dd>
            </div>
          </dl>
        </div>

        <p class="mt-3 text-xs text-gray-500">
          {{ pr('compareTorque') }} {{ rm('boltPreload', `compare_${result.compareLabelKey}`) }} ≈ {{ result.compareTorque.toFixed(2) }} N·m
        </p>

        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <template v-if="form.calcMode === 'simple'">
            <MathTex expr="T = \dfrac{\mu d F}{1000}" block />
          </template>
          <template v-else-if="form.calcMode === 'vdi2230'">
            <MathTex expr="M_A = F\left(0.16P + 0.58d_2\mu_G + \dfrac{D_{km}}{2}\mu_K\right)" block />
          </template>
          <template v-else>
            <MathTex expr="F_V = F_M + F_Z - \Delta F_{VT}" block />
            <MathTex expr="F_Z = \dfrac{f_Z}{\delta_S + \delta_P}" block />
            <MathTex expr="F_M = F_V - F_Z + \Delta F_{VT}" block />
          </template>
          <MathTex expr="\sigma = F / A_s" block />
        </div>
        <el-button class="mt-4" type="primary" plain @click="exportCalcPdf">{{ fc('exportPdf') }}</el-button>
      </section>
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
              <CalcFormItem :label="pf('externalAxial')">
                <el-input-number v-model="wizardForm.externalAxialLoad" :min="0" :step="500" />
                <span class="ml-2 text-xs text-gray-500">N</span>
              </CalcFormItem>
              <CalcFormItem :label="pf('alternatingLoad')">
                <el-input-number v-model="wizardForm.alternatingLoad" :min="0" :step="100" />
              </CalcFormItem>
              <CalcFormItem :label="pf('requiredClamp')">
                <el-input-number v-model="wizardForm.requiredClampLoad" :min="0" :step="500" />
                <span class="ml-2 text-xs text-gray-500">{{ pf('requiredClampHint') }}</span>
              </CalcFormItem>
              <CalcFormItem :label="pf('maxTorque')">
                <el-input-number v-model="wizardForm.maxTorque" :min="0" :precision="1" />
                <span class="ml-2 text-xs text-gray-500">N·m</span>
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
                    <span>{{ s.title }}</span>
                    <el-tag class="ml-2" size="small" :type="stepTagType(s.status)">{{ stepStatusLabel(s.status) }}</el-tag>
                  </template>
                  <p class="text-sm">{{ s.summary }}</p>
                  <p v-if="s.detail" class="text-xs text-gray-500">{{ s.detail }}</p>
                  <p v-if="s.formula" class="mt-1 font-mono text-xs text-primary">{{ s.formula }}</p>
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
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
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
  torque: 50,
  preload: 25000,
})

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
  const r = result.value
  await exportToolReportPdf({
    title: pt('title'),
    subtitle: `M${form.diameter} · ${form.grade} · ${form.calcMode}`,
    sections: [
      {
        heading: ct('results'),
        rows: [
          { label: `${pf('preload')} (N)`, value: r.preload.toFixed(0) },
          { label: `${pf('torque')} (N·m)`, value: r.torque.toFixed(2) },
          { label: `${pr('tensileStress')} (MPa)`, value: r.stress.toFixed(1) },
          { label: fc('check'), value: r.pass ? fc('pass') : fc('fail') },
        ],
      },
    ],
    element: resultPanelRef.value,
    filename: `bolt-preload_M${form.diameter}_${Date.now()}.pdf`,
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
