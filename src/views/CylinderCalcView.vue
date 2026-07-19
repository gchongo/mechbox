<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <el-tabs v-model="mode" lazy>
      <el-tab-pane
        v-for="tabMode in tabModes"
        :key="tabMode"
        :label="tabMode === 'hydraulic' ? pf('tabHydraulic') : pf('tabPneumatic')"
        :name="tabMode"
      >
        <CalcModePanel
          v-model="form.calcMode"
          page-key="cylinder"
          :hint-simple="hintFor(tabMode, 'simple')"
          :hint-complete="hintFor(tabMode, 'complete')"
          :hint-professional="hintFor(tabMode, 'professional')"
        />

        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="140px">
              <CalcFormItem :label="pf('boreDiameter')">
                <el-input-number v-model="form.boreDiameter" :min="10" />
              </CalcFormItem>
              <CalcFormItem :label="pf('rodDiameter')">
                <el-input-number v-model="form.rodDiameter" :min="0" />
              </CalcFormItem>
              <CalcFormItem :label="tabMode === 'hydraulic' ? pf('pressureHydraulic') : pf('pressurePneumatic')">
                <el-input-number v-model="form.pressure" :min="0.1" :precision="2" :step="0.1" />
              </CalcFormItem>
              <CalcFormItem :label="pf('flowRate')">
                <el-input-number v-model="form.flowRate" :min="0" :precision="1" />
              </CalcFormItem>
              <CalcFormItem v-if="tabMode === 'pneumatic'" :label="pf('efficiency')">
                <el-input-number v-model="form.efficiency" :min="0.5" :max="1" :precision="2" :step="0.05" />
              </CalcFormItem>
              <template v-if="form.calcMode !== 'simple'">
                <CalcFormItem :label="pf('externalLoad')">
                  <el-input-number v-model="form.externalLoad" :min="0" :step="100" />
                </CalcFormItem>
                <CalcFormItem
                  :label="pf('strokeLength')"
                  :pending-confirm="isPending('strokeLength')"
                >
                  <el-input-number
                    v-model="form.strokeLength"
                    :min="0"
                    :step="50"
                    @change="markConfirmed('strokeLength')"
                  />
                </CalcFormItem>
                <CalcFormItem
                  :label="pf('yieldStrength')"
                  :pending-confirm="isPending('yieldStrength')"
                >
                  <el-input-number
                    v-model="form.yieldStrength"
                    :min="100"
                    :max="1500"
                    :step="10"
                    @change="markConfirmed('yieldStrength')"
                  />
                </CalcFormItem>
                <CalcFormItem
                  :label="pf('endFixity')"
                  :pending-confirm="isPending('endFixity')"
                >
                  <el-select v-model="form.endFixity" class="w-full" @change="markConfirmed('endFixity')">
                    <el-option
                      v-for="(preset, key) in END_FIXITY_PRESETS"
                      :key="key"
                      :label="`${ol('endFixityPresets', key)} (K=${preset.K.toFixed(3)})`"
                      :value="key"
                    />
                  </el-select>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ pf('endFixityHint') }}</p>
                </CalcFormItem>
                <CalcFormItem
                  :label="pf('compressOnRetract')"
                  :pending-confirm="isPending('compressOnRetract')"
                >
                  <el-switch v-model="form.compressOnRetract" @change="markConfirmed('compressOnRetract')" />
                  <span class="ml-2 text-xs text-gray-500">{{ pf('compressOnRetractHint') }}</span>
                </CalcFormItem>
              </template>
              <template v-if="form.calcMode === 'professional'">
                <CalcFormItem
                  :label="pf('loadMass')"
                  :pending-confirm="isPending('loadMass')"
                >
                  <el-input-number
                    v-model="form.loadMass"
                    :min="0"
                    :precision="1"
                    @change="markConfirmed('loadMass')"
                  />
                </CalcFormItem>
                <CalcFormItem :label="pf('acceleration')">
                  <el-input-number v-model="form.acceleration" :min="0" :precision="2" />
                </CalcFormItem>
              </template>
            </el-form>

            <CylinderDiagram
              :variant="tabMode"
              :bore-diameter="form.boreDiameter"
              :rod-diameter="form.rodDiameter"
              :stroke-length="form.strokeLength"
            />
          </section>

          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <el-tag
              v-if="form.calcMode !== 'simple' && result.pass != null"
              class="mb-3"
              :type="overallStatusType"
            >
              {{ pr('overall') }}: {{ overallStatusLabel }}
            </el-tag>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('extendForce')" />
                <dd class="font-mono text-lg">{{ result.extendForce?.toFixed(0) }} N</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('retractForce')" />
                <dd class="font-mono">{{ result.retractForce?.toFixed(0) }} N</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('extendVelocity')" />
                <dd class="font-mono">{{ result.extendVelocity?.toFixed(1) }} mm/s</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('retractVelocity')" />
                <dd class="font-mono">{{ result.retractVelocity?.toFixed(1) }} mm/s</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('extendFlow')" />
                <dd class="font-mono">{{ result.extendFlow?.toFixed(2) }} L/min</dd>
              </div>
              <div v-if="result.bucklingLoad" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('bucklingLoad')" />
                <dd class="font-mono">
                  {{ result.bucklingLoad?.toFixed(0) }} N
                  <template v-if="result.buckling?.checkSkipped"> — {{ pr('bucklingSkipped') }}</template>
                  <template v-else>{{ reviewAwareCheckMark(result.bucklingPass, result) }}</template>
                </dd>
              </div>
              <div
                v-if="result.buckling?.effectiveLengthFactor != null"
                class="rounded bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-400"
              >
                <p>
                  {{
                    pr('bucklingDetail', {
                      k: result.buckling.effectiveLengthFactor.toFixed(3),
                      le: result.buckling.effectiveLength?.toFixed(0),
                      lambda: result.buckling.slenderness?.toFixed(1),
                      mode: bucklingModeLabel,
                    })
                  }}
                </p>
                <p v-if="result.rodCompressiveLoad != null" class="mt-1">
                  {{ pr('rodCompression', { f: result.rodCompressiveLoad.toFixed(0) }) }}
                </p>
                <p v-if="result.buckling?.safetyFactor != null" class="mt-1">
                  {{ pr('bucklingSf', { sf: result.buckling.safetyFactor.toFixed(1) }) }}
                </p>
              </div>
              <div v-if="result.cycleTimeExtend" class="flex justify-between rounded bg-gray-50 p-3">
                <ResultLabel :text="pr('cycleTime')" />
                <dd class="font-mono">
                  {{ result.cycleTimeExtend?.toFixed(2) }} / {{ result.cycleTimeRetract?.toFixed(2) }} s
                </dd>
              </div>
            </dl>
            <FormulaPanel>
              <MathTex expr="F = p \cdot A" block />
              <MathTex expr="v = \dfrac{Q \times 10^{6}}{60 A}" block />
              <template v-if="result.buckling?.governingMode === 'johnson'">
                <MathTex
                  expr="\sigma_{\mathrm{cr}} = \sigma_y - \dfrac{\sigma_y^{2}}{4\pi^{2} E}\lambda^{2}"
                  block
                />
                <MathTex expr="Q = \dfrac{A v \times 60}{10^{6}}" block />
                <MathTex expr="F_{\mathrm{cr}} = A\sigma_{\mathrm{cr}}" block />
              </template>
              <template v-else>
                <MathTex
                  v-if="form.calcMode !== 'simple'"
                  expr="F_{\mathrm{cr}} = \dfrac{\pi^{2} E I}{(K L)^{2}},\quad L_e = K L"
                  block
                />
                <MathTex expr="Q = \dfrac{A v \times 60}{10^{6}}" block />
              </template>
              <template #hints>
                <ul>
                  <li><MathContent :text="pr(tabMode === 'pneumatic' ? 'cylHintForcePneumatic' : 'cylHintForce')" /></li>
                  <li v-if="form.calcMode !== 'simple'"><MathContent :text="pr('cylHintBuckling')" /></li>
                  <li v-if="form.calcMode === 'professional'"><MathContent :text="pr('cylHintDynamic')" /></li>
                </ul>
              </template>
            </FormulaPanel>
          </section>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="cylinder"
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
import { reactive, computed, ref, toRef, watch } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import MathContent from '@/components/common/MathContent.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import { analyzeHydraulicCylinder, analyzePneumaticCylinder, END_FIXITY_PRESETS } from '@/utils/hydraulic-calc'
import CylinderDiagram from '@/components/cylinder/CylinderDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import { snapshotHistoryInput, applyReplayToTarget } from '@/utils/history-replay'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useCriticalInputConfirm } from '@/composables/useCriticalInputConfirm'
import { getCalcReviewStatus, reviewAwareCheckMark } from '@/utils/calc-result'

const { pt, ct, pf, pr, fc } = useCalcPage('cylinder')
const { ol } = useOptionsI18n()

const tabModes = ['hydraulic', 'pneumatic']
const mode = ref('hydraulic')

const form = reactive({
  calcMode: 'simple',
  boreDiameter: 50,
  rodDiameter: 20,
  pressure: 16,
  flowRate: 20,
  efficiency: 0.85,
  externalLoad: 8000,
  strokeLength: 300,
  endFixity: 'pinned_pinned',
  compressOnRetract: true,
  yieldStrength: 235,
  loadMass: 500,
  acceleration: 0.5,
})

/** 切换液压/气动时给合理默认压力（仅当仍是另一侧典型值时） */
watch(mode, (next, prev) => {
  if (next === 'pneumatic' && prev === 'hydraulic' && form.pressure >= 5) {
    form.pressure = 0.6
  } else if (next === 'hydraulic' && prev === 'pneumatic' && form.pressure <= 2) {
    form.pressure = 16
  }
})

function hintFor(tabMode, level) {
  if (tabMode === 'pneumatic') {
    if (level === 'simple') return pf('hintSimplePneumatic')
    if (level === 'complete') return pf('hintCompletePneumatic')
    return pf('hintProfessionalPneumatic')
  }
  return ''
}

const { markConfirmed, withConfirmed, isPending } = useCriticalInputConfirm(
  toRef(form, 'calcMode'),
  'cylinder',
)
const result = computed(() => {
  const payload = withConfirmed(form)
  return mode.value === 'pneumatic'
    ? analyzePneumaticCylinder(payload)
    : analyzeHydraulicCylinder(payload)
})
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
const bucklingModeLabel = computed(() => {
  const gm = result.value.buckling?.governingMode
  if (!gm) return '—'
  const key = `bucklingMode_${gm}`
  const label = pr(key)
  return label === key ? gm : label
})

const { saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form,
  result,
  buildTitle: () => pt('title'),
  buildSummary: () => {
    const r = result.value
    if (r?.errorKey) return []
    return [
      { label: pr('extendForce'), value: `${r.extendForce?.toFixed(0) ?? '-'} N` },
      { label: fc('check'), value: overallStatusLabel.value },
    ]
  },
})
const historyInput = computed(() => snapshotHistoryInput({ mode: mode.value, ...form }))

function applyCylinderReplay(input) {
  if (!input || typeof input !== 'object') return
  if (input.mode != null) mode.value = input.mode
  applyReplayToTarget(form, input)
}
useHistoryReplay('cylinder', null, { applyFn: applyCylinderReplay })
</script>
