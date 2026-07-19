<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <el-tabs v-model="tab">
      <el-tab-pane :label="pf('tabHardenability')" name="hardenability">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="100px">
              <CalcFormItem :label="pf('steelPreset')">
                <el-select v-model="preset" class="w-full" @change="applyPreset">
                  <el-option v-for="(p, k) in steelPresets" :key="k" :label="p.label" :value="k" />
                </el-select>
              </CalcFormItem>
              <CalcFormItem v-for="el in elements" :key="el.key" :label="el.label" unit="%">
                <el-input-number v-model="comp[el.key]" :min="0" :max="5" :step="0.01" :precision="2" />
              </CalcFormItem>
              <CalcFormItem :label="pf('austeniteGrain')" unit="ASTM">
                <el-input-number v-model="grainSize" :min="1" :max="8" />
              </CalcFormItem>
              <CalcFormItem :label="pf('partDiameter')" unit="mm">
                <el-input-number v-model="partDiameter" :min="5" :max="300" />
              </CalcFormItem>
            </el-form>

            <HeatTreatmentDiagram
              :part-diameter="partDiameter"
              :carbon-equivalent="parseFloat(result.carbonEquivalent) || 0"
              :surface-hrc="parseFloat(result.hardenability?.surfaceHRC) || 55"
              :core-hrc="parseFloat(result.hardenability?.estimatedCoreHRC) || 35"
            />
          </section>

          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <el-tag class="mb-3" :type="overallStatusType">
              {{ pr('overall') }}: {{ overallStatusLabel }}
            </el-tag>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-primary/5 p-3">
                <ResultLabel :text="pr('carbonEquivalent')" />
                <dd class="font-mono text-lg text-primary">{{ result.carbonEquivalent }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('weldability')" />
                <dd>{{ rm('heatTreatment', `weldability_${result.weldabilityKey}`) }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('idealCriticalDiameter')" />
                <dd class="font-mono">{{ result.hardenability?.idealCriticalDiameter }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('surfaceHRC')" />
                <dd class="font-mono">{{ result.hardenability?.surfaceHRC }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('coreHRC')" />
                <dd class="font-mono">{{ result.hardenability?.estimatedCoreHRC }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('hardenabilityVerdict')" />
                <dd>{{ rm('heatTreatment', `verdict_${result.hardenability?.verdictKey}`) }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('preheatAdvice')" />
                <dd>{{ result.preheatRequired ? `${result.preheatTemp}°C` : fc('notRequired') }}</dd>
              </div>
            </dl>
            <FormulaPanel :columns="1">
              <MathTex :expr="formulaCe" block />
              <MathTex :expr="formulaDi" block />
              <template #hints>
                <ul>
                  <li><MathContent :text="pr('hardenabilityHintCe')" /></li>
                  <li><MathContent :text="pr('hardenabilityHintDi')" /></li>
                  <li><MathContent :text="pr('hardenabilityHintHrc')" /></li>
                </ul>
              </template>
            </FormulaPanel>
          </section>
        </div>

        <section class="card-panel mt-6">
          <h3 class="mb-2 font-semibold">{{ pf('jominyChart') }}</h3>
          <div ref="jominyChartRef" class="min-h-[360px]" />
        </section>
      </el-tab-pane>

      <el-tab-pane :label="pf('tabTemper')" name="temper">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="120px">
              <CalcFormItem :label="pf('asQuenchedHRC')">
                <el-input-number v-model="asQuenchedHRC" :min="20" :max="65" :precision="1" />
              </CalcFormItem>
              <CalcFormItem :label="pf('temperTemp')" unit="°C">
                <el-input-number v-model="temperTemp" :min="150" :max="700" />
              </CalcFormItem>
              <CalcFormItem :label="pf('temperTime')" unit="h">
                <el-input-number v-model="temperTime" :min="0.1" :max="24" :step="0.5" :precision="1" />
              </CalcFormItem>
            </el-form>
            <p class="mt-2 text-xs text-gray-500"><MathContent :text="pf('temperHint')" /></p>
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-primary/5 p-3">
                <ResultLabel :text="pr('temperedHRC')" />
                <dd class="font-mono text-lg text-primary">{{ temperResult.temperedHRC }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('hardnessDrop')" />
                <dd class="font-mono">{{ temperResult.hardnessDrop }} HRC</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('hollomonJaffe')" />
                <dd class="font-mono">{{ temperResult.hollomonJaffe }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('temperState')" />
                <dd>{{ temperStateLabel }}</dd>
              </div>
            </dl>
            <FormulaPanel :columns="1">
              <MathTex :expr="formulaHj" block />
              <MathTex :expr="formulaTemperDrop" block />
              <template #hints>
                <ul>
                  <li><MathContent :text="pr('temperHintHj')" /></li>
                </ul>
              </template>
            </FormulaPanel>
          </section>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="heat-treatment"
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  STEEL_PRESETS,
  analyzeHeatTreatment,
  calcTemperedHardness,
} from '@/utils/heat-treatment-calc'
import HeatTreatmentDiagram from '@/components/heat/HeatTreatmentDiagram.vue'
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

const { pt, ct, pf, pr, fc } = useCalcPage('heat-treatment')
const { optionMap } = useOptionsI18n()
const { rm } = useResultI18n()

const formulaCe = String.raw`CE = C + \frac{Mn}{6} + \frac{Cr+Mo+V}{5} + \frac{Ni+Cu}{15}`
const formulaDi = String.raw`D_I \approx 25\left(1-e^{-1.8\,CE}\right)\ \mathrm{mm}`
const formulaHj = String.raw`P = T_K\left(20+\log_{10} t_s\right)`
const formulaTemperDrop = String.raw`\Delta\mathrm{HRC} = \mathrm{HRC}_q\cdot\left(\frac{T}{600}\right)^{1.4}\cdot(\log_{10}(t_h+0.1)+1)\cdot 0.35`

const steelPresets = computed(() => optionMap(STEEL_PRESETS, 'steelPresets'))

const tab = ref('hardenability')
const preset = ref('4140')
const comp = ref({ ...STEEL_PRESETS['4140'] })
const grainSize = ref(7)
const partDiameter = ref(50)
const asQuenchedHRC = ref(55)
const temperTemp = ref(550)
const temperTime = ref(2)
const jominyChartRef = ref(null)
let plotly = null

const elements = [
  { key: 'C', label: 'C' },
  { key: 'Mn', label: 'Mn' },
  { key: 'Cr', label: 'Cr' },
  { key: 'Mo', label: 'Mo' },
  { key: 'V', label: 'V' },
  { key: 'Ni', label: 'Ni' },
  { key: 'Cu', label: 'Cu' },
]

const result = computed(() =>
  analyzeHeatTreatment({
    composition: comp.value,
    grainSize: grainSize.value,
    partDiameter: partDiameter.value,
    temperTemp: temperTemp.value,
    temperTime: temperTime.value,
  }),
)

const temperResult = computed(() => {
  const hrc = asQuenchedHRC.value || result.value.hardenability?.surfaceHRC || 55
  return calcTemperedHardness(hrc, temperTemp.value, temperTime.value)
})
const temperStateLabel = computed(() => {
  const key = temperResult.value.temperStateKey
  return key ? rm('heatTreatment', `temper_${key}`) : temperResult.value.temperState
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

const { saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form: comp,
  result,
  buildTitle: () => pt('title'),
  buildSummary: () => {
    const r = result.value
    if (r?.errorKey) return []
    if (tab.value === 'temper') {
      return [
        { label: pr('temperedHRC'), value: `${temperResult.value.temperedHRC?.toFixed?.(1) ?? temperResult.value.temperedHRC ?? '-'}` },
        { label: pr('temperState'), value: temperResult.value.temperState ?? '-' },
      ]
    }
    return [
      { label: pr('surfaceHRC'), value: `${r.hardenability?.surfaceHRC ?? '-'}` },
      { label: pr('coreHRC'), value: `${r.hardenability?.estimatedCoreHRC ?? '-'}` },
    ]
  },
})
const historyInput = computed(() =>
  snapshotHistoryInput({
    tab: tab.value,
    preset: preset.value,
    comp: { ...comp.value },
    grainSize: grainSize.value,
    partDiameter: partDiameter.value,
    asQuenchedHRC: asQuenchedHRC.value,
    temperTemp: temperTemp.value,
    temperTime: temperTime.value,
  }),
)

function applyHeatTreatmentReplay(input) {
  if (!input || typeof input !== 'object') return
  if (input.tab != null) tab.value = input.tab
  if (input.preset != null) preset.value = input.preset
  if (input.comp && typeof input.comp === 'object') comp.value = { ...input.comp }
  if (input.grainSize != null) grainSize.value = input.grainSize
  if (input.partDiameter != null) partDiameter.value = input.partDiameter
  if (input.asQuenchedHRC != null) asQuenchedHRC.value = input.asQuenchedHRC
  if (input.temperTemp != null) temperTemp.value = input.temperTemp
  if (input.temperTime != null) temperTime.value = input.temperTime
}
useHistoryReplay('heat-treatment', null, { applyFn: applyHeatTreatmentReplay })

function applyPreset(key) {
  const p = STEEL_PRESETS[key]
  if (p) comp.value = { ...p }
}

async function renderJominyChart() {
  if (!jominyChartRef.value) return
  const curve = result.value.jominyCurve ?? []
  if (!curve.length) return
  if (!plotly) plotly = await import('plotly.js-dist-min')
  await plotly.react(
    jominyChartRef.value,
    [
      {
        x: curve.map((p) => p.distance),
        y: curve.map((p) => p.hrc),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'HRC',
        line: { color: '#409eff' },
      },
    ],
    {
      xaxis: { title: pf('jominyX') },
      yaxis: { title: 'HRC' },
      height: 360,
      margin: { t: 24, l: 48, b: 40, r: 16 },
    },
    { responsive: true, displayModeBar: false },
  )
}

watch([result, tab], () => {
  if (tab.value === 'hardenability') renderJominyChart()
})

watch(
  () => result.value.hardenability?.surfaceHRC,
  (v) => {
    if (v) asQuenchedHRC.value = v
  },
  { immediate: true },
)

onMounted(renderJominyChart)
onBeforeUnmount(() => {
  if (jominyChartRef.value && plotly) plotly.purge(jominyChartRef.value)
})
</script>
