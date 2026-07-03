<template>
  <div>
    <h1 class="page-title">疲劳寿命分析</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      S-N 曲线估算与 Miner 线性累积损伤法则
    </p>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">材料与应力</h2>
        <el-form label-width="120px">
          <el-form-item label="材料">
            <el-select v-model="material" class="w-full">
              <el-option v-for="(m, k) in SN_MATERIALS" :key="k" :label="m.label" :value="k" />
            </el-select>
          </el-form-item>
          <el-form-item label="应力幅 Sa">
            <el-input-number v-model="stressAmplitude" :min="0" :precision="1" />
            <span class="ml-2 text-sm text-gray-500">MPa</span>
          </el-form-item>
        </el-form>
        <div v-if="stressAmplitude > 0" class="rounded bg-gray-50 p-3 text-sm dark:bg-gray-900">
          <dt class="text-gray-500">估算寿命 N</dt>
          <dd class="mt-1 font-mono text-lg">{{ lifeDisplay }}</dd>
          <p class="mt-1 text-xs text-gray-500">疲劳极限 σ₋₁ = {{ result.enduranceLimit }} MPa</p>
        </div>

        <h3 class="mb-2 mt-6 text-sm font-semibold">Miner 载荷谱</h3>
        <p class="mb-2 text-xs text-gray-500">每行：应力幅(MPa), 循环次数</p>
        <el-input v-model="loadText" type="textarea" :rows="5" placeholder="300,1e4&#10;250,5e4&#10;200,1e5" />
        <el-button class="mt-2" size="small" @click="loadSample">加载示例</el-button>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">Miner 累积损伤</h2>
        <template v-if="result.miner && !result.miner.error">
          <div class="mb-4 grid grid-cols-2 gap-3 text-sm">
            <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">累积损伤 D</dt>
              <dd class="font-mono text-xl" :class="result.miner.pass ? 'text-success' : 'text-error'">
                {{ result.miner.totalDamage?.toFixed(4) }}
              </dd>
            </div>
            <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">状态</dt>
              <dd class="mt-1">{{ result.miner.status }}</dd>
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
        <el-empty v-else description="输入载荷谱行" />
      </section>
    </div>

    <section class="card-panel mt-6">
      <h2 class="mb-4 font-semibold">S-N 曲线</h2>
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

const material = ref('steel_45')
const stressAmplitude = ref(350)
const loadText = ref('')
const chartRef = ref(null)
let plotly = null

const loads = computed(() => parseLoadSpectrum(loadText.value))

const result = computed(() =>
  analyzeFatigue({
    material: material.value,
    stressAmplitude: stressAmplitude.value,
    loads: loads.value,
  }),
)

const lifeDisplay = computed(() => {
  const n = result.value.life
  if (n === Infinity) return '无限寿命 (≤ 疲劳极限)'
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
      name: '疲劳极限',
      line: { color: '#e74c3c', dash: 'dash' },
    },
  ]

  if (stressAmplitude.value > 0 && result.value.life !== Infinity) {
    traces.push({
      x: [result.value.life],
      y: [stressAmplitude.value],
      type: 'scatter',
      mode: 'markers',
      name: '当前工况',
      marker: { color: '#f39c12', size: 12 },
    })
  }

  await plotly.react(
    chartRef.value,
    traces,
    {
      title: 'S-N 曲线 (Basquin)',
      xaxis: { title: '循环次数 N', type: 'log' },
      yaxis: { title: '应力幅 Sa (MPa)', type: 'log' },
      margin: { t: 40, l: 60, r: 24, b: 48 },
      height: 360,
    },
    { responsive: true, displayModeBar: false },
  )
}

watch([result, material, stressAmplitude], renderChart)

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
