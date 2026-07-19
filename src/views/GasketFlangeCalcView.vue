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

    <CalcModePanel v-model="form.calcMode" page-key="gasket-flange" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="140px">
          <CalcFormItem :label="pf('gasketMaterial')">
            <el-select v-model="form.gasketMaterial" class="w-full">
              <el-option
                v-for="m in materials"
                :key="m.id"
                :label="`${m.label} (m=${m.m}, y=${m.y})`"
                :value="m.id"
              />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('gasketInner')">
            <el-input-number v-model="form.gasketInner" :min="10" :step="5" />
          </CalcFormItem>
          <CalcFormItem :label="pf('gasketOuter')">
            <el-input-number v-model="form.gasketOuter" :min="form.gasketInner + 2" :step="5" />
          </CalcFormItem>
          <CalcFormItem :label="pf('pressure')">
            <el-input-number v-model="form.pressure" :min="0" :precision="2" :step="0.1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('boltCount')">
            <el-input-number v-model="form.boltCount" :min="2" :max="48" />
          </CalcFormItem>
          <CalcFormItem :label="pf('preloadPerBolt')">
            <el-input-number v-model="form.preloadPerBolt" :min="100" :step="1000" />
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('factorM')">
              <el-input-number v-model="form.factorM" :min="0" :max="10" :step="0.1" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('seatingStressY')">
              <el-input-number v-model="form.seatingStressY" :min="0" :step="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('minSafety')">
              <el-input-number v-model="form.minSafety" :min="1" :max="3" :step="0.1" :precision="1" />
            </CalcFormItem>
          </template>
        </el-form>

        <GasketFlangeDiagram
          :gasket-inner="form.gasketInner"
          :gasket-outer="form.gasketOuter"
          :bolt-count="form.boltCount"
          :preload-per-bolt="form.preloadPerBolt"
          :pressure="form.pressure"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag class="mb-3" :type="overallStatusType">
          {{ pr('overall') }}: {{ overallStatusLabel }}
        </el-tag>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('gasketArea')" />
            <dd class="font-mono">{{ result.gasketArea.toFixed(0) }} mm²</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('totalPreload')" />
            <dd class="font-mono">{{ result.totalPreload.toFixed(0) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('seatingStress')" />
            <dd class="font-mono flex flex-wrap items-center justify-end gap-1" :class="result.seatingPass ? 'text-success' : 'text-error'">
              <span>{{ result.seatingStress.toFixed(1) }} MPa</span>
              <MathContent :text="seatingThresholdText" />
              <span>{{ result.seatingPass ? '✓' : '✗' }}</span>
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('operatingStress')" />
            <dd class="font-mono flex flex-wrap items-center justify-end gap-1" :class="result.operatingPass ? 'text-success' : 'text-error'">
              <span>{{ result.operatingStress.toFixed(1) }} MPa</span>
              <MathContent :text="operatingThresholdText" />
              <span>{{ result.operatingPass ? '✓' : '✗' }}</span>
            </dd>
          </div>
          <div v-if="form.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('capacityCheck')" />
            <dd class="font-mono flex flex-wrap items-center justify-end gap-1" :class="result.capacityPass ? 'text-success' : 'text-error'">
              <span>{{ result.totalPreload.toFixed(0) }} / {{ result.capacityRequired.toFixed(0) }} N</span>
              <span>{{ result.capacityPass ? '✓' : '✗' }}</span>
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('requiredPerBolt')" />
            <dd class="font-mono">{{ result.requiredPerBolt.toFixed(0) }} N</dd>
          </div>
          <div v-if="form.calcMode === 'professional' && result.uniformityHint" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('uniformity')" />
            <dd class="font-mono">{{ pr(`uniformity_${result.uniformityHint}`) }}</dd>
          </div>
        </dl>
        <FormulaPanel :columns="1">
          <MathTex :expr="formulaArea" block />
          <MathTex :expr="formulaSeat" block />
          <MathTex :expr="formulaOp" block />
          <template #hints>
            <ul>
              <li><MathContent :text="pr('hintSeal')" /></li>
            </ul>
          </template>
        </FormulaPanel>
      </section>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="gasket-flange"
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
import { reactive, computed, watch } from 'vue'
import { analyzeGasketFlange, GASKET_MATERIALS } from '@/utils/gasket-flange-calc'
import GasketFlangeDiagram from '@/components/seal/GasketFlangeDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import ChainSyncBanner from '@/components/design/ChainSyncBanner.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import MathTex from '@/components/common/MathTex.vue'
import MathContent from '@/components/common/MathContent.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import { getCalcReviewStatus } from '@/utils/calc-result'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import { useChainHandoff } from '@/composables/useChainHandoff'

const { pt, ct, pf, pr, fc } = useCalcPage('gasket-flange')

const formulaArea = String.raw`A_g = \dfrac{\pi}{4}(D_o^2 - D_i^2)`
const formulaSeat = String.raw`\sigma_{\mathrm{seat}} = \dfrac{n F_0}{A_g} \ge y\,n_s`
const formulaOp = String.raw`\sigma_{\mathrm{op}} = \dfrac{n F_0 - p A_i}{A_g} \ge m\,p\,n_s`

const materials = Object.values(GASKET_MATERIALS)

const form = reactive({
  calcMode: 'complete',
  gasketMaterial: 'compressed_fiber',
  gasketInner: 80,
  gasketOuter: 110,
  pressure: 1.6,
  boltCount: 8,
  preloadPerBolt: 25000,
  factorM: 2.0,
  seatingStressY: 11,
  minSafety: 1.2,
})

watch(
  () => form.gasketMaterial,
  (id) => {
    const m = GASKET_MATERIALS[id]
    if (!m) return
    form.factorM = m.m
    form.seatingStressY = m.y
  },
)

const {
  chainSession,
  chainName,
  dirty,
  syncToChain,
  backToChain,
  dismissSession,
} = useChainHandoff('gasket-flange', form)

const result = computed(() => analyzeGasketFlange(form))

const seatingThresholdText = computed(() => {
  const r = result.value
  const y = r.seatingStressY
  if (form.calcMode === 'simple' || !(r.minSafety > 1)) {
    return `$(\\ge y=${y})$`
  }
  return `$(\\ge y\\,n_s=${r.seatingRequired.toFixed(1)})$`
})

const operatingThresholdText = computed(() => {
  const r = result.value
  if (form.calcMode === 'simple' || !(r.minSafety > 1)) {
    return `$(\\ge m p=${r.requiredOpStress.toFixed(1)})$`
  }
  return `$(\\ge m p\\,n_s=${r.operatingRequired.toFixed(1)})$`
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

const { historyInput, saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form,
  result,
  buildTitle: () => pt('title'),
  buildSummary: () => [
    { label: pr('seatingStress'), value: `${result.value.seatingStress.toFixed(1)} MPa` },
    { label: fc('check'), value: overallStatusLabel.value },
  ],
})
useHistoryReplay('gasket-flange', form)
</script>
