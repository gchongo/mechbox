<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="pipe-flow" />
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="120px">
          <CalcFormItem :label="pf('fluid')">
            <el-select v-model="fluid" @change="applyFluid">
              <el-option v-for="(f, k) in fluidPresets" :key="k" :label="f.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('innerDiameter')" unit="mm">
            <el-input-number v-model="form.diameter" :min="1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('pipeLength')" unit="m">
            <el-input-number v-model="form.length" :min="0.1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('flowRate')" unit="L/min">
            <el-input-number v-model="form.flowRate" :min="0.1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('roughness')" unit="mm">
            <el-input-number v-model="form.roughness" :min="0.001" :precision="3" />
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('localLossK')">
            <el-input-number v-model="form.localLossK" :min="0" :precision="1" />
            <span class="ml-2 text-xs text-gray-500">{{ pf('localLossKHint') }}</span>
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('lossMethod')">
              <el-radio-group v-model="form.lossMethod" size="small">
                <el-radio-button value="K">{{ pf('lossMethodK') }}</el-radio-button>
                <el-radio-button value="LeD">{{ pf('lossMethodLeD') }}</el-radio-button>
              </el-radio-group>
            </CalcFormItem>
            <h3 class="mb-2 text-sm font-medium">{{ pf('fittingsTitle') }}</h3>
            <div class="mb-3 space-y-2">
              <div
                v-for="(fit, i) in fittings"
                :key="i"
                class="flex flex-wrap items-center gap-2 rounded border border-gray-200 p-2 dark:border-gray-700"
              >
                <el-select v-model="fit.type" class="w-44" size="small">
                  <el-option
                    v-for="(f, k) in fittingOptions"
                    :key="k"
                    :label="f.label"
                    :value="k"
                  />
                </el-select>
                <el-input-number v-model="fit.qty" :min="0" :max="50" size="small" />
                <el-button v-if="fittings.length > 1" type="danger" link size="small" @click="fittings.splice(i, 1)">
                  {{ fc('delete') }}
                </el-button>
              </div>
            </div>
            <el-button size="small" @click="fittings.push({ type: 'elbow_90_std', qty: 1 })">
              {{ pf('addFitting') }}
            </el-button>
          </template>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('hazenC')">
            <el-input-number v-model="form.hazenC" :min="80" :max="150" :precision="0" />
          </CalcFormItem>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('maxVelocity')" unit="m/s">
              <el-input-number v-model="form.maxVelocity" :min="0.5" :max="10" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('maxPressureDrop')" unit="kPa">
              <el-input-number v-model="form.maxPressureDropKPa" :min="1" :max="1000" />
            </CalcFormItem>
          </template>
        </el-form>
        <StructuralDiagram
          variant="pipe"
          :calc-mode="form.calcMode"
          :diameter="form.diameter"
          :length="form.length"
          :roughness="form.roughness"
          :local-loss-k="form.localLossK"
          :flow-rate="form.flowRate"
        />
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag v-if="hasPassFail" class="mb-3" :type="overallStatusType">
          {{ pr('overall') }}: {{ overallStatusLabel }}
          <template v-if="form.calcMode === 'professional'"> · {{ pr('erosion') }} {{ erosionLabel }}</template>
        </el-tag>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('velocity')" /><dd class="font-mono">{{ result.velocity?.toFixed(3) }} m/s</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('reynolds')" />
            <dd class="font-mono">{{ result.reynolds?.toFixed(0) }} ({{ regimeLabel }})</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('frictionFactor')" />
            <dd class="font-mono">{{ result.frictionFactor?.toFixed(4) }}</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('frictionDrop')" /><dd class="font-mono">{{ result.pressureDropKPa?.toFixed(2) }} kPa</dd>
          </div>
          <div v-if="form.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('localLoss')" />
            <dd class="font-mono">{{ ((result.localLoss ?? 0) / 1000).toFixed(2) }} kPa</dd>
          </div>
          <div
            v-if="result.fittingSummary?.items?.length"
            class="rounded bg-gray-50 p-3 text-xs dark:bg-gray-900"
          >
            <p class="mb-1 font-medium">{{ pr('fittingBreakdown') }}</p>
            <ul class="space-y-0.5 text-gray-600 dark:text-gray-400">
              <li v-for="(it, idx) in result.fittingSummary.items" :key="idx">
                {{ it.label }} ×{{ it.qty }}
                <template v-if="form.lossMethod === 'LeD'">
                  · Le≈{{ it.contributionLeM.toFixed(2) }} m
                </template>
                <template v-else>· K={{ it.contributionK.toFixed(2) }}</template>
              </li>
            </ul>
            <p v-if="form.lossMethod === 'LeD'" class="mt-1 text-gray-500">
              {{ pr('effectiveLength') }}: {{ result.effectiveLength?.toFixed(2) }} m
            </p>
          </div>
          <div v-if="result.methodCompare" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('hwCompare')" />
            <dd class="font-mono">
              {{ result.methodCompare.hazenKPa?.toFixed(2) }} kPa
              <span class="text-xs text-gray-500">(Δ {{ result.methodCompare.deltaPercent?.toFixed(1) }}%)</span>
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('totalDrop')" />
            <dd class="font-mono text-lg text-primary">{{ result.totalPressureDropKPa?.toFixed(2) }} kPa</dd>
          </div>
        </dl>
        <FormulaPanel :columns="1">
          <MathTex :expr="formulaDarcy" block />
          <MathTex v-if="form.calcMode !== 'simple'" :expr="formulaLocal" block />
          <template #hints>
            <ul>
              <li><MathContent :text="pr('pipeHintF')" /></li>
              <li v-if="form.calcMode !== 'simple'"><MathContent :text="pr('pipeHintHw')" /></li>
            </ul>
          </template>
        </FormulaPanel>
      </section>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="pipe-flow"
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
import { reactive, ref, computed } from 'vue'
import { analyzePipeFlow, FLUID_PRESETS, PIPE_FITTINGS } from '@/utils/pipe-flow-calc'
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

const { pt, ct, pf, pr, fc } = useCalcPage('pipe-flow')
const { optionMap } = useOptionsI18n()

const formulaDarcy = String.raw`\Delta p = f\cdot\frac{L}{D}\cdot\frac{\rho v^{2}}{2}`
const formulaLocal = String.raw`\Delta p_{\mathrm{local}} = K\cdot\frac{\rho v^{2}}{2}`

const fluidPresets = computed(() => optionMap(FLUID_PRESETS, 'fluidPresets'))
const fittingOptions = computed(() => optionMap(PIPE_FITTINGS, 'pipeFittings'))
const fluid = ref('water')

const fittings = reactive([
  { type: 'elbow_90_std', qty: 2 },
  { type: 'gate_open', qty: 1 },
])

const form = reactive({
  calcMode: 'simple',
  diameter: 25,
  length: 10,
  flowRate: 20,
  density: 998,
  viscosity: 1.002e-3,
  roughness: 0.045,
  localLossK: 0,
  lossMethod: 'K',
  hazenC: 130,
  maxVelocity: 3,
  maxPressureDropKPa: 200,
})

function applyFluid(k) {
  const f = FLUID_PRESETS[k]
  if (f) {
    form.density = f.density
    form.viscosity = f.viscosity
  }
}

const result = computed(() =>
  analyzePipeFlow({
    ...form,
    fittings: form.calcMode === 'simple' ? [] : fittings,
  }),
)
const regimeLabel = computed(() => {
  const key = result.value.flowRegimeKey
  return key ? pr(`regime_${key}`) : result.value.flowRegime
})
const erosionLabel = computed(() => {
  const key = result.value.erosionRiskKey
  return key ? pr(`erosion_${key}`) : result.value.erosionRisk
})
const hasPassFail = computed(() => typeof result.value.pass === 'boolean')
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
    { label: pr('totalDrop'), value: `${result.value.totalPressureDropKPa?.toFixed(1) ?? '-'} kPa` },
    { label: fc('check'), value: hasPassFail.value ? overallStatusLabel.value : '—' },
  ],
})
const historyInput = computed(() => snapshotHistoryInput({ ...form, fittings: [...fittings] }))

function applyReplay(input) {
  if (!input || typeof input !== 'object') return
  const src = input.pipe && typeof input.pipe === 'object' ? input.pipe : input
  Object.assign(form, src)
  if (Array.isArray(src.fittings)) {
    fittings.splice(0, fittings.length, ...src.fittings.map((f) => ({ ...f })))
  }
}
useHistoryReplay('pipe-flow', null, { applyFn: applyReplay })
</script>
