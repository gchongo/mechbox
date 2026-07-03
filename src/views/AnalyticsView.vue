<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <el-tabs v-model="tab">
      <el-tab-pane :label="pt('tabRegression')" name="regression">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ pt('sectionDataInput') }}</h2>
            <el-form label-width="100px">
              <CalcFormItem :label="pf('fitType')">
                <el-radio-group v-model="regType">
                  <el-radio value="linear">{{ pf('fitLinear') }}</el-radio>
                  <el-radio value="polynomial">{{ pf('fitPolynomial') }}</el-radio>
                </el-radio-group>
              </CalcFormItem>
            </el-form>
            <p class="mb-2 text-xs text-gray-500">{{ pt('hintXyRows') }}</p>
            <el-input v-model="xyText" type="textarea" :rows="8" placeholder="1,2.1&#10;2,4.2&#10;3,5.8&#10;4,8.1&#10;5,10.2" />
            <el-button class="mt-2" size="small" @click="loadRegSample">{{ pt('loadSample') }}</el-button>
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ pt('sectionFitResult') }}</h2>
            <el-alert v-if="regResult?.errorKey" :title="resultError(regResult)" type="warning" show-icon />
            <template v-else-if="regResult">
              <div class="mb-4 rounded bg-primary/5 p-4">
                <p class="font-mono text-sm">{{ regResult.equation }}</p>
                <p class="mt-2 text-sm">R² = <span class="font-mono">{{ regResult.r2?.toFixed(4) }}</span></p>
              </div>
            </template>
          </section>
        </div>
        <section v-if="regResult && !regResult.errorKey" class="card-panel mt-6">
          <div ref="regChartRef" class="min-h-[360px]" />
        </section>
      </el-tab-pane>

      <el-tab-pane :label="pt('tabDoe')" name="doe">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="100px">
              <CalcFormItem :label="pf('orthogonalArray')">
                <el-select v-model="arrayId" class="w-full">
                  <el-option v-for="(a, k) in orthogonalOptions" :key="k" :label="a.label" :value="k" />
                </el-select>
              </CalcFormItem>
            </el-form>
            <h3 class="mb-2 text-sm font-medium">{{ pf('factorLevels') }}</h3>
            <div v-for="(f, i) in doeFactors" :key="i" class="mb-2 flex flex-wrap items-center gap-2">
              <el-input v-model="f.name" :placeholder="pf('factorName')" class="w-24" size="small" />
              <el-input-number v-model="f.low" size="small" /> ~
              <el-input-number v-model="f.high" size="small" />
            </div>
            <el-button size="small" @click="addFactor">{{ pt('addFactor') }}</el-button>
            <CalcFormItem class="mt-4" :label="pf('responses')">
              <el-input v-model="responseText" />
            </CalcFormItem>
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ pt('sectionMainEffects') }}</h2>
            <el-alert v-if="doeResult?.errorKey" :title="resultError(doeResult)" type="warning" show-icon />
            <template v-else-if="doeResult">
              <p class="mb-3 text-sm">
                {{ pt('grandMeanTop', { mean: doeResult.grandMean?.toFixed(3) }) }}<strong>{{ doeResult.topFactor }}</strong>
              </p>
              <el-table :data="doeResult.effects" size="small" border>
                <el-table-column prop="factor" :label="pr('factor')" />
                <el-table-column :label="pr('effect')">
                  <template #default="{ row }">{{ row.effect?.toFixed(4) }}</template>
                </el-table-column>
                <el-table-column v-if="doeResult.effects[0]?.meanLow != null" :label="pr('meanLow')">
                  <template #default="{ row }">{{ row.meanLow?.toFixed(3) }}</template>
                </el-table-column>
                <el-table-column v-if="doeResult.effects[0]?.meanHigh != null" :label="pr('meanHigh')">
                  <template #default="{ row }">{{ row.meanHigh?.toFixed(3) }}</template>
                </el-table-column>
              </el-table>
            </template>
          </section>
        </div>
        <section v-if="doeRuns.length" class="card-panel mt-6">
          <h3 class="mb-2 font-semibold">{{ pt('sectionTestPlan') }}</h3>
          <el-table :data="doeRuns" size="small" border>
            <el-table-column prop="run" label="#" width="56" />
            <el-table-column
              v-for="(f, i) in doeFactors"
              :key="i"
              :prop="f.name || `F${i + 1}`"
              :label="f.name || `F${i + 1}`"
            />
          </el-table>
        </section>
      </el-tab-pane>

      <el-tab-pane :label="pt('tabRsm')" name="rsm">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ pt('sectionFactorSetup') }}</h2>
            <el-form label-width="80px">
              <CalcFormItem :label="pf('factor1')">
                <el-input v-model="rsmF1.name" :placeholder="pf('name')" class="mb-1" />
                <div class="flex gap-2">
                  <el-input-number v-model="rsmF1.low" :controls="false" :placeholder="pf('low')" />
                  <el-input-number v-model="rsmF1.high" :controls="false" :placeholder="pf('high')" />
                </div>
              </CalcFormItem>
              <CalcFormItem :label="pf('factor2')">
                <el-input v-model="rsmF2.name" :placeholder="pf('name')" class="mb-1" />
                <div class="flex gap-2">
                  <el-input-number v-model="rsmF2.low" :controls="false" :placeholder="pf('low')" />
                  <el-input-number v-model="rsmF2.high" :controls="false" :placeholder="pf('high')" />
                </div>
              </CalcFormItem>
            </el-form>
            <p class="mb-2 text-xs text-gray-500">{{ pt('hintRsmResponses') }}</p>
            <el-input v-model="rsmResponseText" type="textarea" :rows="3" />
            <el-button class="mt-2" size="small" @click="loadRsmSample">{{ pt('loadSample') }}</el-button>
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ pt('sectionQuadModel') }}</h2>
            <el-alert v-if="rsmResult?.errorKey" :title="resultError(rsmResult)" type="warning" show-icon />
            <template v-else-if="rsmResult">
              <div class="mb-4 rounded bg-primary/5 p-4">
                <p class="font-mono text-xs leading-relaxed">{{ rsmResult.fit.equation }}</p>
                <p class="mt-2 text-sm">R² = <span class="font-mono">{{ rsmResult.fit.r2?.toFixed(4) }}</span></p>
              </div>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('optimumCoded')" />
                  <dd class="font-mono">({{ rsmResult.fit.optimum.codedX1 }}, {{ rsmResult.fit.optimum.codedX2 }})</dd>
                </div>
                <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('maxResponse')" />
                  <dd class="font-mono text-primary">{{ rsmResult.fit.optimum.predictedY }}</dd>
                </div>
              </dl>
            </template>
          </section>
        </div>
        <section v-if="rsmResult && !rsmResult.errorKey" class="card-panel mt-6">
          <h3 class="mb-2 font-semibold">{{ pt('sectionContour') }}</h3>
          <div ref="rsmChartRef" class="min-h-[400px]" />
        </section>
        <section v-if="rsmResult?.design?.length" class="card-panel mt-6">
          <h3 class="mb-2 font-semibold">{{ pt('sectionDesign') }}</h3>
          <el-table :data="rsmResult.design" size="small" border />
        </section>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { analyzeRegression, parseXY } from '@/utils/regression-calc'
import {
  ORTHOGONAL_ARRAYS,
  analyzeMainEffects,
  decodeRuns,
  parseResponses,
} from '@/utils/doe-calc'
import { analyzeRSM, parseRSMResponses } from '@/utils/rsm-calc'
import { useCalcPage } from '@/composables/useCalcPage'
import { useResultI18n } from '@/composables/useResultI18n'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useDemoData } from '@/composables/useDemoData'

const { pt, pf, pr, locale } = useCalcPage('analytics')
const { resultError } = useResultI18n()
const { optionMap } = useOptionsI18n()
const { demo } = useDemoData()

const tab = ref('regression')
const regType = ref('linear')
const xyText = ref('')
const regChartRef = ref(null)
let plotly = null

const orthogonalOptions = computed(() => optionMap(ORTHOGONAL_ARRAYS, 'orthogonalArrays'))

const arrayId = ref('L4')
const doeFactors = ref([])
const responseText = ref('12.1,15.3,14.2,18.5')

const rsmF1 = ref({ name: '', low: 180, high: 220 })
const rsmF2 = ref({ name: '', low: 50, high: 80 })
const rsmResponseText = ref('10.2,12.5,11.8,14.1,11.0,13.2,10.5,12.8,12.0,11.9,12.1')
const rsmChartRef = ref(null)

const regResult = computed(() => {
  const pairs = parseXY(xyText.value)
  if (pairs.length < 2) return null
  return analyzeRegression({
    pairs,
    type: regType.value === 'polynomial' ? 'polynomial' : 'linear',
    degree: 2,
  })
})

const doeResult = computed(() => {
  const responses = parseResponses(responseText.value)
  if (!responses.length) return null
  return analyzeMainEffects(arrayId.value, doeFactors.value, responses)
})

const doeRuns = computed(() => decodeRuns(arrayId.value, doeFactors.value))

const rsmResult = computed(() => {
  const responses = parseRSMResponses(rsmResponseText.value)
  if (responses.length < 6) return null
  return analyzeRSM(rsmF1.value, rsmF2.value, responses)
})

async function renderRegChart() {
  if (!regChartRef.value || !regResult.value || regResult.value.errorKey) return
  if (!plotly) plotly = await import('plotly.js-dist-min')
  const pairs = parseXY(xyText.value)
  const x = pairs.map((p) => p.x)
  const y = pairs.map((p) => p.y)
  const xLine = []
  const yLine = []
  const xmin = Math.min(...x)
  const xmax = Math.max(...x)
  for (let i = 0; i <= 50; i++) {
    const xi = xmin + (i / 50) * (xmax - xmin)
    xLine.push(xi)
    if (regResult.value.type === 'linear') {
      yLine.push(regResult.value.intercept + regResult.value.slope * xi)
    } else {
      yLine.push(regResult.value.coeffs.reduce((s, c, d) => s + c * xi ** d, 0))
    }
  }
  await plotly.react(
    regChartRef.value,
    [
      { x, y, type: 'scatter', mode: 'markers', name: pt('chartData') },
      { x: xLine, y: yLine, type: 'scatter', mode: 'lines', name: pt('chartFit') },
    ],
    { xaxis: { title: 'x' }, yaxis: { title: 'y' }, height: 360, margin: { t: 24, l: 48, b: 40, r: 16 } },
    { responsive: true, displayModeBar: false },
  )
}

watch([regResult, regType, locale], renderRegChart)

async function renderRsmChart() {
  if (!rsmChartRef.value || !rsmResult.value || rsmResult.value.errorKey) return
  if (!plotly) plotly = await import('plotly.js-dist-min')
  const { x1Vals, x2Vals, z } = rsmResult.value.contour
  await plotly.react(
    rsmChartRef.value,
    [
      {
        x: x1Vals,
        y: x2Vals,
        z,
        type: 'contour',
        colorscale: 'Viridis',
        contours: { showlabels: true },
      },
    ],
    {
      xaxis: { title: `${rsmF1.value.name} (coded)` },
      yaxis: { title: `${rsmF2.value.name} (coded)` },
      height: 400,
      margin: { t: 24, l: 48, b: 40, r: 16 },
    },
    { responsive: true, displayModeBar: false },
  )
}

watch([rsmResult, tab, locale], () => {
  if (tab.value === 'rsm') renderRsmChart()
})

function loadRegSample() {
  xyText.value = `1,2.1\n2,4.0\n3,6.2\n4,7.9\n5,10.1\n6,12.3\n7,14.0\n8,16.2`
}

function addFactor() {
  const max = ORTHOGONAL_ARRAYS[arrayId.value]?.factors ?? 3
  if (doeFactors.value.length < max) {
    doeFactors.value.push({ name: `F${doeFactors.value.length + 1}`, low: 0, high: 1 })
  }
}

function applyAnalyticsDemo() {
  doeFactors.value = demo.value.analytics.doeFactors.map((f) => ({ ...f }))
  rsmF1.value = { ...demo.value.analytics.rsmF1 }
  rsmF2.value = { ...demo.value.analytics.rsmF2 }
}

function loadRsmSample() {
  applyAnalyticsDemo()
  rsmResponseText.value = '10.2,12.5,11.8,14.1,11.0,13.2,10.5,12.8,12.0,11.9,12.1'
}

onMounted(() => {
  loadRegSample()
  applyAnalyticsDemo()
})

watch(locale, applyAnalyticsDemo)
onBeforeUnmount(() => {
  if (regChartRef.value && plotly) plotly.purge(regChartRef.value)
  if (rsmChartRef.value && plotly) plotly.purge(rsmChartRef.value)
})
</script>
