<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="calcMode" page-key="thermal-expansion" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="148px">
          <CalcFormItem :label="pf('material1')">
            <el-select v-model="mat1" class="w-full" @change="onMat1">
              <el-option v-for="(m, k) in thermalMaterials" :key="k" :label="m.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('length1')" unit="mm">
            <el-input-number v-model="form.length" :min="1" :max="10000" />
          </CalcFormItem>
          <CalcFormItem
            :label="pf('deltaT')"
            unit="°C"
            :pending-confirm="isPending('deltaT')"
          >
            <el-input-number v-model="form.deltaT" :min="-300" :max="800" :step="10" @change="markConfirmed('deltaT')" />
          </CalcFormItem>
          <CalcFormItem :label="pf('alpha1')">
            <el-input-number v-model="form.alpha" :min="1" :max="30" :precision="2" :step="0.1" />
            <span class="ml-2 text-xs text-gray-500">{{ pf('alphaHint') }}</span>
          </CalcFormItem>

          <template v-if="calcMode !== 'simple'">
            <el-divider content-position="left">{{ pf('fitChange') }}</el-divider>
            <CalcFormItem :label="pf('material2')">
              <el-select v-model="mat2" class="w-full" @change="onMat2">
                <el-option v-for="(m, k) in thermalMaterials" :key="k" :label="m.label" :value="k" />
              </el-select>
            </CalcFormItem>
            <CalcFormItem
              :label="pf('shaftDiameter')"
              :pending-confirm="isPending('shaftDiameter')"
            >
              <el-input-number v-model="form.shaftDiameter" :min="1" :max="500" :precision="2" @change="markConfirmed('shaftDiameter')" />
            </CalcFormItem>
            <CalcFormItem
              :label="pf('holeDiameter')"
              :pending-confirm="isPending('holeDiameter')"
            >
              <el-input-number v-model="form.holeDiameter" :min="1" :max="500" :precision="2" @change="markConfirmed('holeDiameter')" />
            </CalcFormItem>
            <CalcFormItem :label="pf('alpha2')">
              <el-input-number v-model="form.alpha2" :min="1" :max="30" :precision="2" :step="0.1" />
              <span class="ml-2 text-xs text-gray-500">×10⁻⁶ /°C</span>
            </CalcFormItem>
            <template v-if="calcMode === 'professional'">
              <CalcFormItem
                :label="pf('assemblyDeltaT')"
                unit="°C"
                :pending-confirm="isPending('assemblyDeltaT')"
              >
                <el-input-number v-model="form.assemblyDeltaT" :min="-200" :max="400" :step="10" @change="markConfirmed('assemblyDeltaT')" />
              </CalcFormItem>
              <CalcFormItem
                :label="pf('serviceDeltaT')"
                unit="°C"
                :pending-confirm="isPending('serviceDeltaT')"
              >
                <el-input-number v-model="form.serviceDeltaT" :min="-200" :max="800" :step="10" @change="markConfirmed('serviceDeltaT')" />
              </CalcFormItem>
            </template>
          </template>
        </el-form>

        <ThermalExpansionDiagram
          :length="form.length"
          :delta-t="form.deltaT"
          :alpha="form.alpha"
          :shaft-diameter="form.shaftDiameter"
          :hole-diameter="form.holeDiameter"
          :show-fit="calcMode !== 'simple'"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag
          v-if="calcMode === 'professional' && linearResult.fit"
          class="mb-3"
          :type="fitVerdictType"
        >
          {{ fitVerdictLabel }}
        </el-tag>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pf('deltaL1')" />
            <dd class="font-mono text-lg">{{ linearResult.linearExpansion?.toFixed(4) }} mm</dd>
          </div>
          <template v-if="linearResult.fit">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('initialInterference')" />
              <dd class="font-mono">{{ linearResult.fit.initialInterference?.toFixed(4) }} mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('interferenceChange')" />
              <dd class="font-mono">{{ linearResult.fit.interferenceChange?.toFixed(4) }} mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('finalInterference')" />
              <dd class="font-mono" :class="finalInterferenceClass">
                {{ linearResult.fit.finalInterference?.toFixed(4) }} mm
              </dd>
            </div>
            <div
              v-if="linearResult.fit.becomesClearance"
              class="flex justify-between rounded bg-amber-50 p-3 dark:bg-amber-900/20"
            >
              <ResultLabel :text="pr('becomesClearance')" />
              <dd class="font-mono">{{ linearResult.fit.finalClearance?.toFixed(4) }} mm</dd>
            </div>
            <div
              v-if="linearResult.assemblyFit"
              class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"
            >
              <ResultLabel :text="pr('assemblyInterference')" />
              <dd class="font-mono">{{ linearResult.assemblyFit.finalInterference?.toFixed(4) }} mm</dd>
            </div>
          </template>
        </dl>

        <router-link
          v-if="calcMode !== 'simple'"
          to="/interference-fit"
          class="mt-3 inline-block text-xs text-primary hover:underline"
        >
          {{ pr('linkInterferenceFit') }}
        </router-link>

        <p
          v-if="calcMode === 'professional' && linearResult.alphaTemperatureUsed"
          class="mt-3 text-xs text-amber-700 dark:text-amber-300"
        >
          <MathContent :text="pf('alphaTempNote')" />
        </p>
        <p v-else class="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <MathContent :text="pf('alphaTempNote')" />
        </p>

        <FormulaPanel :columns="1">
          <MathTex expr="\Delta L = \alpha \cdot L \cdot \Delta T" block />
          <MathTex
            v-if="calcMode !== 'simple'"
            expr="\Delta i = d\,\alpha_1\Delta T - D\,\alpha_2\Delta T"
            block
          />
          <MathTex
            v-if="calcMode === 'professional'"
            expr="\alpha(T)=\alpha_{\mathrm{ref}}\,(1+k\cdot\Delta T)"
            block
          />
          <template #hints>
            <ul>
              <li><MathContent :text="pr('thermalHintLinear')" /></li>
              <li v-if="calcMode !== 'simple'"><MathContent :text="pr('thermalHintFit')" /></li>
            </ul>
          </template>
        </FormulaPanel>
      </section>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="thermal-expansion"
        :title="historyTitle"
        :status="saveStatus"
        :summary="historySummary"
        :input="historyInput"
        :result="linearResult"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { analyzeThermalExpansion, THERMAL_MATERIALS } from '@/utils/thermal-expansion-calc'
import ThermalExpansionDiagram from '@/components/thermal/ThermalExpansionDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import MathTex from '@/components/common/MathTex.vue'
import MathContent from '@/components/common/MathContent.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import { snapshotHistoryInput, applyReplayToTarget } from '@/utils/history-replay'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useCriticalInputConfirm } from '@/composables/useCriticalInputConfirm'

const { pt, ct, pf, pr, fc } = useCalcPage('thermal-expansion')
const { optionMap } = useOptionsI18n()

const thermalMaterials = computed(() => optionMap(THERMAL_MATERIALS, 'thermalMaterials'))

const calcMode = ref('simple')
const mat1 = ref('steel')
const mat2 = ref('steel')

const form = reactive({
  length: 100,
  deltaT: 100,
  alpha: 11.5,
  alpha2: 11.5,
  shaftDiameter: 50,
  holeDiameter: 49.975,
  assemblyDeltaT: 80,
  serviceDeltaT: 100,
})

const { markConfirmed, withConfirmed, isPending } = useCriticalInputConfirm(calcMode, 'thermal-expansion')

function onMat1(k) {
  form.alpha = THERMAL_MATERIALS[k].alpha * 1e6
}
function onMat2(k) {
  form.alpha2 = THERMAL_MATERIALS[k].alpha * 1e6
}

const linearResult = computed(() =>
  analyzeThermalExpansion(
    withConfirmed({
      calcMode: calcMode.value,
      length: form.length,
      deltaT: form.deltaT,
      alpha: form.alpha * 1e-6,
      alpha2: form.alpha2 * 1e-6,
      shaftDiameter: calcMode.value === 'simple' ? undefined : form.shaftDiameter,
      holeDiameter: calcMode.value === 'simple' ? undefined : form.holeDiameter,
      assemblyDeltaT: form.assemblyDeltaT,
      serviceDeltaT: form.serviceDeltaT,
    }),
  ),
)

const finalInterferenceClass = computed(() => {
  if (linearResult.value.releaseBlocked || linearResult.value.estimateOnly) return 'text-warning'
  return linearResult.value.fit?.becomesClearance ? 'text-warning' : 'text-success'
})

const fitVerdictType = computed(() => {
  if (linearResult.value.releaseBlocked || linearResult.value.estimateOnly) return 'warning'
  return linearResult.value.pass ? 'success' : 'danger'
})

const fitVerdictLabel = computed(() => {
  if (linearResult.value.releaseBlocked || linearResult.value.estimateOnly) return pr('reviewPending')
  return linearResult.value.pass ? pr('serviceSafe') : pr('mayLoosen')
})

const { saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form,
  result: linearResult,
  buildTitle: () => pt('title'),
  buildSummary: () => {
    const r = linearResult.value
    if (r?.errorKey) return []
    return [
      { label: pf('deltaL1'), value: `${r.linearExpansion?.toFixed(4) ?? '-'} mm` },
      { label: fc('check'), value: fitVerdictLabel.value },
    ]
  },
})
const historyInput = computed(() =>
  snapshotHistoryInput({ calcMode: calcMode.value, mat1: mat1.value, mat2: mat2.value, ...form }),
)

function applyThermalReplay(input) {
  if (!input || typeof input !== 'object') return
  if (input.calcMode != null) calcMode.value = input.calcMode
  if (input.mat1 != null) mat1.value = input.mat1
  if (input.mat2 != null) mat2.value = input.mat2
  applyReplayToTarget(form, input)
}
useHistoryReplay('thermal-expansion', null, { applyFn: applyThermalReplay })
</script>
