<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="calcMode" page-key="fatigue" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pf('materialAndStress') }}</h2>
        <el-form label-width="120px">
          <el-form-item :label="pf('material')">
            <el-select v-model="material" class="w-full">
              <el-option v-for="(m, k) in snMaterials" :key="k" :label="m.label" :value="k" />
            </el-select>
          </el-form-item>
          <el-form-item :label="pf('stressAmplitude')">
            <el-input-number v-model="stressAmplitude" :min="0" :precision="1" />
            <span class="ml-2 text-sm text-gray-500">MPa</span>
          </el-form-item>
          <template v-if="calcMode === 'professional'">
            <el-form-item :label="pf('meanStress')">
              <el-input-number v-model="meanStress" :min="0" :precision="1" />
            </el-form-item>
            <el-form-item :label="pf('surfaceSizeFactor')">
              <el-input-number v-model="surfaceFactor" :min="0.5" :max="1" :step="0.05" :precision="2" class="w-28" />
              <el-input-number v-model="sizeFactor" :min="0.5" :max="1" :step="0.05" :precision="2" class="ml-2 w-28" />
            </el-form-item>
          </template>
        </el-form>

        <FatigueDiagram
          :stress-amplitude="result.effectiveAmplitude ?? stressAmplitude"
          :endurance-limit="result.enduranceLimit"
          :life="result.life"
          :sf="currentMaterial.sf"
          :b="currentMaterial.b"
          :cycle-limit="currentMaterial.cycleLimit ?? 1e6"
        />

        <div v-if="stressAmplitude > 0" class="rounded bg-gray-50 p-3 text-sm dark:bg-gray-900">
          <dt class="text-gray-500">{{ pf('estimatedLife') }}</dt>
          <dd class="mt-1 font-mono text-lg">{{ lifeDisplay }}</dd>
          <p class="mt-1 text-xs text-gray-500">{{ pf('enduranceLimit') }} = {{ result.enduranceLimit }} MPa</p>
        </div>

        <h3 v-if="calcMode !== 'simple'" class="mb-2 mt-6 text-sm font-semibold">{{ pf('minerSpectrum') }}</h3>
        <p v-if="calcMode !== 'simple'" class="mb-2 text-xs text-gray-500">{{ pf('minerHint') }}</p>
        <el-input v-if="calcMode !== 'simple'" v-model="loadText" type="textarea" :rows="5" placeholder="300,1e4&#10;250,5e4&#10;200,1e5" />
        <el-button v-if="calcMode !== 'simple'" class="mt-2" size="small" @click="loadSample">{{ pf('loadSample') }}</el-button>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ calcMode === 'simple' ? pr('lifeTitle') : pr('minerTitle') }}</h2>
        <template v-if="calcMode === 'simple'">
          <div class="rounded bg-gray-50 p-4 text-sm dark:bg-gray-900">
            <p>{{ pr('effectiveAmplitude') }}: <span class="font-mono">{{ result.effectiveAmplitude?.toFixed(1) ?? stressAmplitude }}</span> MPa</p>
            <p class="mt-2">{{ pf('estimatedLife') }}: <span class="font-mono text-lg">{{ lifeDisplay }}</span></p>
          </div>
        </template>
        <template v-else-if="result.miner && !result.miner.errorKey">
          <div class="mb-4 grid grid-cols-2 gap-3 text-sm">
            <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">{{ pr('totalDamage') }}</dt>
              <dd class="font-mono text-xl" :class="result.miner.pass ? 'text-success' : 'text-error'">
                {{ result.miner.totalDamage?.toFixed(4) }}
              </dd>
            </div>
            <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">{{ pr('status') }}</dt>
              <dd class="mt-1">{{ rm('fatigue', `status_${result.miner.statusKey}`) }}</dd>
            </div>
          </div>
          <el-table :data="result.miner.details" size="small" border>
            <el-table-column prop="stress" label="Sa (MPa)" width="90" />
            <el-table-column prop="cycles" label="n" />
            <el-table-column label="Nf">
              <template #default="{ row }">{{ row.lifeAtStress }}</template>
            </el-table-column>
            <el-table-column label="n/Nf">
              <template #default="{ row }">{{ row.damage?.toFixed(4) }}</template>
            </el-table-column>
          </el-table>
        </template>
        <el-empty v-else-if="calcMode !== 'simple'" :description="pr('minerEmpty')" />
      </section>
    </div>

    <section class="card-panel mt-6">
      <h2 class="mb-4 font-semibold">{{ pr('snChart') }}</h2>
      <div ref="chartRef" class="min-h-[360px]" />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  SN_MATERIALS,
  analyzeFatigue,
  parseLoadSpectrum,
} from '@/utils/fatigue-calc'
import FatigueDiagram from '@/components/fatigue/FatigueDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useResultI18n } from '@/composables/useResultI18n'
import { useChartI18n } from '@/composables/useChartI18n'

const { pt, ct, pf, pr, locale } = useCalcPage('fatigue')
const { optionMap } = useOptionsI18n()
const { rm, resultError } = useResultI18n()
const { ch } = useChartI18n()

const snMaterials = computed(() => optionMap(SN_MATERIALS, 'snMaterials'))

const currentMaterial = computed(() => SN_MATERIALS[material.value] ?? SN_MATERIALS.steel_45)

const calcMode = ref('complete')
const material = ref('steel_45')
const stressAmplitude = ref(350)
const meanStress = ref(100)
const surfaceFactor = ref(0.9)
const sizeFactor = ref(0.85)
const loadText = ref('')
const chartRef = ref(null)
let plotly = null

const loads = computed(() => parseLoadSpectrum(loadText.value))

const result = computed(() =>
  analyzeFatigue({
    calcMode: calcMode.value,
    material: material.value,
    stressAmplitude: stressAmplitude.value,
    meanStress: meanStress.value,
    surfaceFactor: surfaceFactor.value,
    sizeFactor: sizeFactor.value,
    loads: loads.value,
  }),
)

const lifeDisplay = computed(() => {
  locale.value
  const n = result.value.life
  if (n === Infinity) return rm('fatigue', 'infinite_life')
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)} × 10⁶`
  return `${Math.round(n)}`
})

async function renderChart() {
  if (!chartRef.value) return
  if (!plotly) plotly = await import('plotly.js-dist-min')

  const { curve, enduranceLimit } = result.value.snCurve
  const traces = [
    {
      x: curve.map((p) => p.N),
      y: curve.map((p) => p.S),
      type: 'scatter',
      mode: 'lines',
      name: result.value.materialLabel,
      line: { color: '#409EFF' },
    },
    {
      x: [1e2, 1e8],
      y: [enduranceLimit, enduranceLimit],
      type: 'scatter',
      mode: 'lines',
      name: ch('enduranceLimit'),
      line: { color: '#e74c3c', dash: 'dash' },
    },
  ]

  if (stressAmplitude.value > 0 && result.value.life !== Infinity) {
    traces.push({
      x: [result.value.life],
      y: [stressAmplitude.value],
      type: 'scatter',
      mode: 'markers',
      name: ch('currentPoint'),
      marker: { color: '#f39c12', size: 12 },
    })
  }

  await plotly.react(
    chartRef.value,
    traces,
    {
      title: ch('snTitle'),
      xaxis: { title: ch('snCycles'), type: 'log' },
      yaxis: { title: ch('snStress'), type: 'log' },
      margin: { t: 40, l: 60, r: 24, b: 48 },
      height: 360,
    },
    { responsive: true, displayModeBar: false },
  )
}

watch([result, material, stressAmplitude, locale], renderChart)

function loadSample() {
  loadText.value = `350,10000
300,50000
250,100000
220,200000`
}

onMounted(() => {
  loadSample()
  renderChart()
})

onBeforeUnmount(() => {
  if (chartRef.value && plotly) plotly.purge(chartRef.value)
})
</script>
