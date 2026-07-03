<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="calcMode" page-key="heat-treatment" />

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
              <el-form-item v-for="el in elements" :key="el.key" :label="el.label">
                <el-input-number v-model="comp[el.key]" :min="0" :max="5" :step="0.01" :precision="2" />
                <span class="ml-2 text-xs text-gray-500">%</span>
              </el-form-item>
              <CalcFormItem v-if="calcMode !== 'simple'" :label="pf('austeniteGrain')">
                <el-input-number v-model="grainSize" :min="1" :max="8" />
                <span class="ml-2 text-xs text-gray-500">ASTM</span>
              </CalcFormItem>
              <CalcFormItem v-if="calcMode !== 'simple'" :label="pf('partDiameter')">
                <el-input-number v-model="partDiameter" :min="5" :max="300" />
                <span class="ml-2 text-xs text-gray-500">mm</span>
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
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-primary/5 p-3">
                <dt>{{ pr('carbonEquivalent') }}</dt>
                <dd class="font-mono text-lg text-primary">{{ result.carbonEquivalent }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('weldability')" />
                <dd>{{ rm('heatTreatment', `weldability_${result.weldabilityKey}`) }}</dd>
              </div>
              <div v-if="calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('idealCriticalDiameter') }}</dt>
                <dd class="font-mono">{{ result.hardenability?.idealCriticalDiameter }} mm</dd>
              </div>
              <div v-if="calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('surfaceHRC') }}</dt>
                <dd class="font-mono">{{ result.hardenability?.surfaceHRC }}</dd>
              </div>
              <div v-if="calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('coreHRC') }}</dt>
                <dd class="font-mono">{{ result.hardenability?.estimatedCoreHRC }}</dd>
              </div>
              <div v-if="calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('hardenabilityVerdict') }}</dt>
                <dd>{{ rm('heatTreatment', `verdict_${result.hardenability?.verdictKey}`) }}</dd>
              </div>
              <div v-if="calcMode === 'complete' || calcMode === 'professional'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('preheatAdvice') }}</dt>
                <dd>{{ result.preheatRequired ? `${result.preheatTemp}°C` : fc('notRequired') }}</dd>
              </div>
              <el-tag v-if="calcMode === 'professional'" class="mt-2" :type="result.pass ? 'success' : 'warning'">
                {{ result.pass ? pr('hardnessTargetOk') : pr('hardnessAdjust') }}
              </el-tag>
            </dl>
          </section>
        </div>

        <section v-if="calcMode !== 'simple'" class="card-panel mt-6">
          <h3 class="mb-2 font-semibold">{{ pf('jominyChart') }}</h3>
          <div ref="jominyChartRef" class="min-h-[360px]" />
        </section>
      </el-tab-pane>

      <el-tab-pane v-if="calcMode !== 'simple'" :label="pf('tabTemper')" name="temper">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="120px">
              <CalcFormItem :label="pf('asQuenchedHRC')">
                <el-input-number v-model="asQuenchedHRC" :min="20" :max="65" :precision="1" />
              </CalcFormItem>
              <CalcFormItem :label="pf('temperTemp')">
                <el-input-number v-model="temperTemp" :min="150" :max="700" />
                <span class="ml-2 text-xs text-gray-500">°C</span>
              </CalcFormItem>
              <CalcFormItem :label="pf('temperTime')">
                <el-input-number v-model="temperTime" :min="0.1" :max="24" :step="0.5" :precision="1" />
                <span class="ml-2 text-xs text-gray-500">h</span>
              </CalcFormItem>
            </el-form>
            <p class="text-xs text-gray-500">{{ pf('temperHint') }}</p>
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-primary/5 p-3">
                <dt>{{ pr('temperedHRC') }}</dt>
                <dd class="font-mono text-lg text-primary">{{ temperResult.temperedHRC }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('hardnessDrop')" />
                <dd class="font-mono">{{ temperResult.hardnessDrop }} HRC</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('hollomonJaffe')" />
                <dd class="font-mono">{{ temperResult.hollomonJaffe }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('temperState')" />
                <dd>{{ temperResult.temperState }}</dd>
              </div>
            </dl>
          </section>
        </div>
      </el-tab-pane>
    </el-tabs>
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
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useResultI18n } from '@/composables/useResultI18n'

const { pt, ct, pf, pr, fc } = useCalcPage('heat-treatment')
const { optionMap } = useOptionsI18n()
const { rm } = useResultI18n()

const steelPresets = computed(() => optionMap(STEEL_PRESETS, 'steelPresets'))

const tab = ref('hardenability')
const calcMode = ref('complete')
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
    calcMode: calcMode.value,
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
