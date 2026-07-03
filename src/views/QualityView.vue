<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <el-tabs v-model="activeTab" class="quality-tabs">
      <!-- MSA Gage R&R -->
      <el-tab-pane :label="pt('tabMsa')" name="msa">
        <section class="card-panel mb-6">
          <h2 class="mb-2 font-semibold">{{ pt('sectionMeasureData') }}</h2>
          <p class="mb-3 text-xs text-gray-500">
            {{ pt('hintMsaRows') }}
          </p>
          <el-input
            v-model="msaText"
            type="textarea"
            :rows="8"
            placeholder="A,1,10.02,10.05,10.03&#10;A,2,10.15,10.12,10.14&#10;B,1,10.04,10.01,10.06&#10;..."
          />
          <el-button class="mt-3" size="small" @click="loadMsaSample">{{ pt('loadSample') }}</el-button>
        </section>

        <template v-if="msaResult && !msaResult.errorKey">
          <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <dt class="text-xs text-gray-500">{{ pr('pctGRR') }}</dt>
              <dd class="font-mono text-xl" :class="grrClass">{{ msaResult.pctGRR?.toFixed(1) }}%</dd>
              <p class="mt-1 text-xs">{{ msaRatingLabel }}</p>
            </div>
            <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <dt class="text-xs text-gray-500">{{ pr('repeatability') }}</dt>
              <dd class="font-mono">{{ msaResult.pctEV?.toFixed(1) }}%</dd>
            </div>
            <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <dt class="text-xs text-gray-500">{{ pr('reproducibility') }}</dt>
              <dd class="font-mono">{{ msaResult.pctAV?.toFixed(1) }}%</dd>
            </div>
            <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <dt class="text-xs text-gray-500">{{ pr('ndc') }}</dt>
              <dd class="font-mono">{{ msaResult.ndc === Infinity ? '—' : msaResult.ndc?.toFixed(1) }}</dd>
              <p class="mt-1 text-xs text-gray-500">{{ pt('ndcHint') }}</p>
            </div>
          </div>
          <section class="card-panel">
            <h3 class="mb-3 font-semibold">{{ pt('sectionVarComponents') }}</h3>
            <dl class="grid gap-2 text-sm sm:grid-cols-2">
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>{{ pr('grr') }}</dt><dd class="font-mono">{{ msaResult.GRR?.toFixed(4) }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>{{ pr('partPV') }}</dt><dd class="font-mono">{{ msaResult.PV?.toFixed(4) }} ({{ msaResult.pctPV?.toFixed(1) }}%)</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>{{ pr('totalTV') }}</dt><dd class="font-mono">{{ msaResult.TV?.toFixed(4) }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>{{ pr('config') }}</dt>
                <dd>{{ pr('configValue', { ops: msaResult.nOperators, parts: msaResult.nParts, trials: msaResult.nTrials }) }}</dd>
              </div>
            </dl>
          </section>
        </template>
        <el-alert v-else-if="msaResult?.errorKey" :title="resultError(msaResult)" type="warning" show-icon />
      </el-tab-pane>

      <!-- X-R Chart -->
      <el-tab-pane :label="pt('tabXr')" name="xr">
        <section class="card-panel mb-6">
          <p class="mb-3 text-xs text-gray-500">{{ pt('hintXrRows') }}</p>
          <el-input v-model="xrText" type="textarea" :rows="6" placeholder="10.1,10.3,10.2&#10;10.0,10.4,10.1&#10;10.2,10.2,10.3" />
          <el-button class="mt-3" size="small" @click="loadXrSample">{{ pt('loadSample') }}</el-button>
        </section>
        <template v-if="xrResult && !xrResult.errorKey">
          <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div class="rounded bg-gray-50 p-3 dark:bg-gray-900"><dt class="text-gray-500">X̿</dt><dd class="font-mono">{{ xrResult.xBarBar?.toFixed(4) }}</dd></div>
            <div class="rounded bg-gray-50 p-3 dark:bg-gray-900"><dt class="text-gray-500">R̄</dt><dd class="font-mono">{{ xrResult.rBar?.toFixed(4) }}</dd></div>
            <div class="rounded bg-gray-50 p-3 dark:bg-gray-900"><dt class="text-gray-500">σ</dt><dd class="font-mono">{{ xrResult.sigma?.toFixed(4) }}</dd></div>
            <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">{{ pt('outOfControl') }}</dt>
              <dd>{{ pt('outOfControlCount', { count: outOfControlCount }) }}</dd>
            </div>
          </div>
          <section class="card-panel">
            <XRChart
              :x-bars="xrResult.xBars"
              :ranges="xrResult.ranges"
              :x-bar-bar="xrResult.xBarBar"
              :x-ucl="xrResult.xUcl"
              :x-lcl="xrResult.xLcl"
              :r-bar="xrResult.rBar"
              :r-ucl="xrResult.rUcl"
              :r-lcl="xrResult.rLcl"
            />
          </section>
        </template>
        <el-alert v-else-if="xrResult?.errorKey" :title="resultError(xrResult)" type="warning" show-icon />
      </el-tab-pane>

      <!-- P Chart -->
      <el-tab-pane :label="pt('tabP')" name="p">
        <section class="card-panel mb-6">
          <el-form label-width="120px" class="max-w-xl">
            <el-form-item :label="pf('defects')">
              <el-input v-model="pDefects" placeholder="2,0,3,1,2" />
            </el-form-item>
            <el-form-item :label="pf('sampleSize')">
              <el-input v-model="pSamples" placeholder="100,100,100,100,100" />
            </el-form-item>
          </el-form>
        </section>
        <template v-if="pResult && !pResult.errorKey">
          <div class="mb-4 rounded bg-gray-50 p-3 text-sm dark:bg-gray-900">
            <span class="text-gray-500">{{ pt('pBarLabel') }}</span>
            <span class="font-mono">{{ (pResult.pBar * 100).toFixed(2) }}%</span>
          </div>
          <section class="card-panel">
            <div ref="pChartRef" class="min-h-[360px]" />
          </section>
        </template>
        <el-alert v-else-if="pResult?.errorKey" :title="resultError(pResult)" type="warning" show-icon />
      </el-tab-pane>

      <!-- FMEA -->
      <el-tab-pane :label="pt('tabFmea')" name="fmea">
        <section class="card-panel mb-6">
          <p class="mb-2 text-xs text-gray-500">{{ pt('hintFmeaRows') }}</p>
          <el-input v-model="fmeaText" type="textarea" :rows="8" />
          <el-button class="mt-2" size="small" @click="loadFmeaSample">{{ pt('loadSample') }}</el-button>
        </section>
        <template v-if="fmeaResult && !fmeaResult.errorKey">
          <p class="mb-3 text-sm">{{ pt('fmeaSummary', { count: fmeaResult.count, high: fmeaResult.highRiskCount }) }}</p>
          <el-table :data="fmeaResult.rows" border size="small">
            <el-table-column prop="component" :label="pt('table.component')" width="90" />
            <el-table-column prop="failureMode" :label="pt('table.failureMode')" />
            <el-table-column :label="pt('table.sod')" width="80">
              <template #default="{ row }">{{ row.severity }}/{{ row.occurrence }}/{{ row.detection }}</template>
            </el-table-column>
            <el-table-column :label="pt('table.rpn')" width="70">
              <template #default="{ row }">
                <span :class="row.rpn >= 100 ? 'text-error font-bold' : ''">{{ row.rpn }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="actionPriority" :label="pt('table.ap')" width="50" />
            <el-table-column prop="recommendedAction" :label="pt('table.action')" min-width="120" />
          </el-table>
        </template>
        <el-alert v-else-if="fmeaResult?.errorKey" :title="resultError(fmeaResult)" type="warning" show-icon />
      </el-tab-pane>

      <!-- AQL -->
      <el-tab-pane :label="pt('tabAql')" name="aql">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="100px">
              <el-form-item :label="pf('lotSize')">
                <el-input-number v-model="aqlLot" :min="1" :step="100" />
              </el-form-item>
              <el-form-item :label="pf('aqlLevel')">
                <el-select v-model="aqlLevel" class="w-full">
                  <el-option v-for="a in AQL_LEVELS" :key="a" :label="String(a)" :value="a" />
                </el-select>
              </el-form-item>
              <el-form-item :label="pf('measuredDefects')">
                <el-input-number v-model="aqlDefects" :min="0" />
              </el-form-item>
            </el-form>
          </section>
          <section class="card-panel">
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('sampleCode') }}</dt><dd class="font-mono">{{ aqlPlan.sampleSizeCode }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('sampleN') }}</dt><dd class="font-mono">{{ aqlPlan.sampleSize }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('acRe') }}</dt><dd class="font-mono">{{ aqlPlan.acceptNumber }} / {{ aqlPlan.rejectNumber }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('decision') }}</dt>
                <dd :class="aqlPlan.pass ? 'text-success' : 'text-error'">{{ rm('aql', aqlPlan.decisionKey) }}</dd>
              </div>
            </dl>
          </section>
        </div>
        <section class="card-panel mt-6">
          <div ref="ocChartRef" class="min-h-[300px]" />
        </section>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import XRChart from '@/components/charts/XRChart.vue'
import { parseGageRRText } from '@/utils/msa-calc'
import { calcXRChart, calcPChart, parseSubgroups } from '@/utils/spc-calc'
import { analyzeFMEA, parseFMEATable } from '@/utils/fmea-calc'
import { designAQLPlan, calcOCCurve, AQL_LEVELS } from '@/utils/aql-calc'
import { useCalcPage } from '@/composables/useCalcPage'
import { useResultI18n } from '@/composables/useResultI18n'

const { pt, pf, pr, locale } = useCalcPage('quality')
const { rm, resultError } = useResultI18n()

const activeTab = ref('msa')
const msaText = ref('')
const xrText = ref('')
const fmeaText = ref('')
const aqlLot = ref(500)
const aqlLevel = ref(2.5)
const aqlDefects = ref(1)
const ocChartRef = ref(null)
const pDefects = ref('2,0,3,1,2,0,1')
const pSamples = ref('100,100,100,100,100,100,100')
const pChartRef = ref(null)
let plotly = null

const msaParsed = computed(() => parseGageRRText(msaText.value))
const msaResult = computed(() => msaParsed.value.result ?? msaParsed.value)

const msaRatingLabel = computed(() => {
  locale.value
  const key = msaResult.value?.ratingKey
  return key ? rm('msa', `rating_${key}`) : ''
})

const grrClass = computed(() => {
  const p = msaResult.value?.pctGRR ?? 100
  if (p < 10) return 'text-success'
  if (p < 30) return 'text-warning'
  return 'text-error'
})

const xrResult = computed(() => {
  const groups = parseSubgroups(xrText.value)
  if (!groups.length) return null
  return calcXRChart(groups)
})

const outOfControlCount = computed(() => {
  if (!xrResult.value || xrResult.value.errorKey) return 0
  const x = xrResult.value.xOutOfControl.filter(Boolean).length
  const r = xrResult.value.rOutOfControl.filter(Boolean).length
  return Math.max(x, r)
})

function parseNumList(str) {
  return String(str).split(/[,，\s]+/).filter(Boolean).map(Number).filter((n) => !Number.isNaN(n))
}

const pResult = computed(() => {
  const d = parseNumList(pDefects.value)
  const s = parseNumList(pSamples.value)
  if (!d.length) return null
  return calcPChart(d, s)
})

const fmeaResult = computed(() => {
  const items = parseFMEATable(fmeaText.value)
  if (!items.length) return null
  return analyzeFMEA(items)
})

const aqlPlan = computed(() =>
  designAQLPlan({ lotSize: aqlLot.value, aql: aqlLevel.value, defectCount: aqlDefects.value }),
)

async function renderPChart() {
  if (!pChartRef.value || !pResult.value || pResult.value.errorKey) return
  if (!plotly) plotly = await import('plotly.js-dist-min')
  const r = pResult.value
  const x = r.pValues.map((_, i) => i + 1)
  await plotly.react(
    pChartRef.value,
    [
      { x, y: r.pValues, type: 'scatter', mode: 'lines+markers', name: 'p', line: { color: '#3498db' } },
      { x, y: r.ucl, type: 'scatter', mode: 'lines', name: 'UCL', line: { color: '#e74c3c', dash: 'dash' } },
      { x, y: r.lcl, type: 'scatter', mode: 'lines', name: 'LCL', line: { color: '#e74c3c', dash: 'dash' } },
      { x: [x[0], x[x.length - 1]], y: [r.pBar, r.pBar], type: 'scatter', mode: 'lines', name: 'p̄', line: { color: '#2ecc71' } },
    ],
    {
      title: pt('charts.pTitle'),
      xaxis: { title: pt('charts.pX') },
      yaxis: { title: pt('charts.pY'), tickformat: '.1%' },
      margin: { t: 40, b: 48, l: 56, r: 24 },
      height: 360,
    },
    { responsive: true, displayModeBar: false },
  )
}

watch([pResult, activeTab, locale], () => {
  if (activeTab.value === 'p') renderPChart()
  if (activeTab.value === 'aql') renderOCChart()
})

async function renderOCChart() {
  if (!ocChartRef.value || activeTab.value !== 'aql') return
  if (!plotly) plotly = await import('plotly.js-dist-min')
  const p = aqlPlan.value
  const curve = calcOCCurve(aqlLot.value, aqlLevel.value, p.sampleSize, p.acceptNumber)
  await plotly.react(
    ocChartRef.value,
    [{
      x: curve.map((c) => c.defectRate * 100),
      y: curve.map((c) => c.acceptProb * 100),
      type: 'scatter',
      mode: 'lines',
      name: pt('charts.ocName'),
      line: { color: '#409EFF' },
    }],
    {
      title: pt('charts.ocTitle', { aql: aqlLevel.value, n: p.sampleSize }),
      xaxis: { title: pt('charts.ocX') },
      yaxis: { title: pt('charts.ocY') },
      height: 300,
      margin: { t: 40, l: 56, b: 48, r: 16 },
    },
    { responsive: true, displayModeBar: false },
  )
}

watch([aqlLot, aqlLevel, aqlDefects, locale], () => {
  if (activeTab.value === 'aql') renderOCChart()
})

function loadMsaSample() {
  msaText.value = `A,1,10.02,10.05,10.03
A,2,10.15,10.12,10.14
A,3,10.08,10.10,10.09
B,1,10.04,10.01,10.06
B,2,10.18,10.16,10.17
B,3,10.11,10.09,10.12
C,1,10.00,10.03,10.02
C,2,10.14,10.13,10.15
C,3,10.07,10.08,10.06`
}

function loadXrSample() {
  xrText.value = `10.1,10.3,10.2
10.0,10.4,10.1
10.2,10.2,10.3
10.15,10.25,10.2
10.05,10.1,10.08
10.3,10.2,10.25`
}

function loadFmeaSample() {
  fmeaText.value = `螺栓,断裂,连接失效,预紧力不足,8,4,3,增加扭矩监控
密封圈,泄漏,污染,压缩率不足,7,5,4,沟槽尺寸管控
轴承,异响,停机,润滑不良,6,3,5,定期换油`
}

onMounted(() => {
  loadMsaSample()
  loadXrSample()
  loadFmeaSample()
})

onBeforeUnmount(() => {
  if (pChartRef.value && plotly) plotly.purge(pChartRef.value)
  if (ocChartRef.value && plotly) plotly.purge(ocChartRef.value)
})
</script>
