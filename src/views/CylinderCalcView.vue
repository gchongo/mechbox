<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="cylinder" />

    <el-tabs v-model="mode" class="mb-6">
      <el-tab-pane :label="pf('tabHydraulic')" name="hydraulic" />
      <el-tab-pane :label="pf('tabPneumatic')" name="pneumatic" />
    </el-tabs>
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="140px">
          <CalcFormItem :label="pf('boreDiameter')"><el-input-number v-model="form.boreDiameter" :min="10" /></CalcFormItem>
          <CalcFormItem :label="pf('rodDiameter')"><el-input-number v-model="form.rodDiameter" :min="0" /></CalcFormItem>
          <el-form-item :label="mode === 'hydraulic' ? pf('pressureHydraulic') : pf('pressurePneumatic')">
            <el-input-number v-model="form.pressure" :min="0.1" :precision="2" :step="0.1" />
          </el-form-item>
          <CalcFormItem :label="pf('flowRate')"><el-input-number v-model="form.flowRate" :min="0" :precision="1" /></CalcFormItem>
          <CalcFormItem v-if="mode === 'pneumatic'" :label="pf('efficiency')">
            <el-input-number v-model="form.efficiency" :min="0.5" :max="1" :precision="2" :step="0.05" />
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('externalLoad')"><el-input-number v-model="form.externalLoad" :min="0" :step="100" /></CalcFormItem>
            <CalcFormItem :label="pf('strokeLength')">
              <el-input-number v-model="form.strokeLength" :min="0" :step="50" @change="markConfirmed('strokeLength')" />
            </CalcFormItem>
            <CalcFormItem :label="pf('yieldStrength')">
              <el-input-number v-model="form.yieldStrength" :min="100" :max="1500" :step="10" @change="markConfirmed('yieldStrength')" />
            </CalcFormItem>
            <CalcFormItem :label="pf('endFixity')">
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
            <CalcFormItem :label="pf('compressOnRetract')">
              <el-switch v-model="form.compressOnRetract" @change="markConfirmed('compressOnRetract')" />
              <span class="ml-2 text-xs text-gray-500">{{ pf('compressOnRetractHint') }}</span>
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('loadMass')">
              <el-input-number v-model="form.loadMass" :min="0" :precision="1" @change="markConfirmed('loadMass')" />
            </CalcFormItem>
            <CalcFormItem :label="pf('acceleration')"><el-input-number v-model="form.acceleration" :min="0" :precision="2" /></CalcFormItem>
          </template>
        </el-form>

        <CylinderDiagram
          :variant="mode"
          :bore-diameter="form.boreDiameter"
          :rod-diameter="form.rodDiameter"
          :stroke-length="form.strokeLength"
        />
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-alert
          v-if="result.releaseBlocked"
          type="warning"
          :closable="false"
          show-icon
          class="mb-3"
          :title="pf('criticalInputsBlocked', { fields: unconfirmedLabelText })"
        />
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('extendForce')" /><dd class="font-mono text-lg">{{ result.extendForce.toFixed(0) }} N</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('retractForce')" /><dd class="font-mono">{{ result.retractForce.toFixed(0) }} N</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('extendVelocity')" /><dd class="font-mono">{{ result.extendVelocity.toFixed(1) }} mm/s</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('retractVelocity')" /><dd class="font-mono">{{ result.retractVelocity.toFixed(1) }} mm/s</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('extendFlow')" /><dd class="font-mono">{{ result.extendFlow.toFixed(2) }} L/min</dd></div>
          <div v-if="result.bucklingLoad" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('bucklingLoad')" />
            <dd class="font-mono">
              {{ result.bucklingLoad?.toFixed(0) }} N
              <template v-if="result.buckling?.checkSkipped"> — {{ pr('bucklingSkipped') }}</template>
              <template v-else>{{ reviewAwareCheckMark(result.bucklingPass, result) }}</template>
            </dd>
          </div>
          <div v-if="result.buckling?.effectiveLengthFactor != null" class="rounded bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-400">
            <p>{{ pr('bucklingDetail', {
              k: result.buckling.effectiveLengthFactor.toFixed(3),
              le: result.buckling.effectiveLength?.toFixed(0),
              lambda: result.buckling.slenderness?.toFixed(1),
              mode: result.buckling.governingMode ?? '—',
            }) }}</p>
            <p v-if="result.rodCompressiveLoad != null" class="mt-1">{{ pr('rodCompression', { f: result.rodCompressiveLoad.toFixed(0) }) }}</p>
          </div>
          <div v-if="result.cycleTimeExtend" class="flex justify-between rounded bg-gray-50 p-3"><ResultLabel :text="pr('cycleTime')" /><dd class="font-mono">{{ result.cycleTimeExtend?.toFixed(2) }} / {{ result.cycleTimeRetract?.toFixed(2) }} s</dd></div>
          <div v-if="form.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="fc('checkResults')" />
            <dd class="font-mono" :class="reviewOnly ? 'text-warning' : result.pass ? 'text-success' : 'text-error'">
              {{ reviewOnly ? overallReviewText : result.pass ? '✓' : '✗' }}
              <span v-if="result.estimateOnly" class="text-xs text-amber-600">（估算/未放行）</span>
            </dd>
          </div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex expr="F = p \cdot A" />
          <MathTex expr="F_{cr} = \frac{\pi^2 E I}{(K L)^2},\quad L_e = K L" />
          <MathTex expr="v = \frac{Q \times 10^6}{60 A},\quad Q = \frac{A v \times 60}{10^6}" />
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed, ref, toRef } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import { analyzeHydraulicCylinder, analyzePneumaticCylinder, END_FIXITY_PRESETS } from '@/utils/hydraulic-calc'
import CylinderDiagram from '@/components/cylinder/CylinderDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useCriticalInputConfirm } from '@/composables/useCriticalInputConfirm'
import { formatUnconfirmedLabels } from '@/utils/critical-input-guard'
import { isReviewOnlyResult, reviewAwareCheckMark } from '@/utils/calc-result'

const { pt, ct, pf, pr, fc, locale } = useCalcPage('cylinder')
const { ol } = useOptionsI18n()
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
const { markConfirmed, withConfirmed } = useCriticalInputConfirm(toRef(form, 'calcMode'))
const result = computed(() => {
  const payload = withConfirmed(form)
  return mode.value === 'pneumatic'
    ? analyzePneumaticCylinder(payload)
    : analyzeHydraulicCylinder(payload)
})
const reviewOnly = computed(() => isReviewOnlyResult(result.value))
const overallReviewText = computed(() => (locale.value === 'en' ? 'Review' : '待复核'))
const unconfirmedLabelText = computed(() =>
  formatUnconfirmedLabels(result.value.unconfirmedCriticalInputs ?? [], locale.value).join(
    locale.value === 'en' ? ', ' : '、',
  ),
)
</script>
