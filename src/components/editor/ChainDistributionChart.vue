<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 class="font-semibold text-gray-800 dark:text-gray-100">尺寸分布与设计范围</h3>
      <el-radio-group v-model="sigmaTab" size="small">
        <el-radio-button :value="3">3σ</el-radio-button>
        <el-radio-button :value="4">4σ</el-radio-button>
        <el-radio-button :value="5">5σ</el-radio-button>
        <el-radio-button :value="6">6σ</el-radio-button>
      </el-radio-group>
    </div>
    <div ref="chartRef" class="chain-dist-chart" />
    <div class="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
      <div class="rounded bg-gray-50 p-2 dark:bg-gray-900">
        <dt class="text-xs text-gray-500">设计中心偏移</dt>
        <dd class="font-mono" :class="shiftClass">{{ shiftLabel }}</dd>
      </div>
      <div class="rounded bg-gray-50 p-2 dark:bg-gray-900">
        <dt class="text-xs text-gray-500">预估不良 PPM</dt>
        <dd class="font-mono">{{ stats.ppm.toLocaleString() }}</dd>
      </div>
      <div class="rounded bg-gray-50 p-2 dark:bg-gray-900">
        <dt class="text-xs text-gray-500">合格率</dt>
        <dd class="font-mono" :class="stats.passRate >= 99 ? 'text-success' : 'text-error'">
          {{ stats.passRate.toFixed(2) }}%
        </dd>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { normalPdf } from '@/utils/distribution-pdf'

const props = defineProps({
  mean: { type: Number, required: true },
  processSigma: { type: Number, required: true },
  specMin: { type: Number, required: true },
  specMax: { type: Number, required: true },
})

const chartRef = ref(null)
const sigmaTab = ref(5)
let plotly = null

function cdfNormal(x, mu, sigma) {
  if (sigma <= 0) return x >= mu ? 1 : 0
  const z = (x - mu) / sigma
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp((-z * z) / 2)
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z > 0 ? 1 - p : p
}

const designCenter = computed(() => (props.specMin + props.specMax) / 2)

const stats = computed(() => {
  const sigma = props.processSigma || 0.001
  const pass =
    cdfNormal(props.specMax, props.mean, sigma) - cdfNormal(props.specMin, props.mean, sigma)
  const passRate = Math.max(0, Math.min(1, pass)) * 100
  return {
    passRate,
    ppm: Math.round((100 - passRate) * 10000),
  }
})

const shiftSigma = computed(() => {
  const sigma = props.processSigma || 0.001
  return (props.mean - designCenter.value) / sigma
})

const shiftLabel = computed(() => {
  const s = shiftSigma.value
  const abs = Math.abs(s)
  if (abs < 0.5) return `${s.toFixed(2)}σ · ✓ 居中`
  if (abs < 2) return `${s.toFixed(2)}σ · 轻微偏离`
  return `${s.toFixed(2)}σ · ✗ 明显偏离`
})

const shiftClass = computed(() => {
  const abs = Math.abs(shiftSigma.value)
  if (abs < 0.5) return 'text-success'
  if (abs < 2) return 'text-warning'
  return 'text-error'
})

async function render() {
  if (!chartRef.value) return
  if (!plotly) plotly = await import('plotly.js-dist-min')

  const sigma = props.processSigma || 0.001
  const half = sigma * sigmaTab.value
  const span = Math.max(half * 2.2, (props.specMax - props.specMin) * 1.5, 0.01)
  const xMin = props.mean - span / 2
  const xMax = props.mean + span / 2
  const points = 160
  const x = []
  const y = []
  for (let i = 0; i <= points; i++) {
    const xi = xMin + ((xMax - xMin) * i) / points
    x.push(xi)
    y.push(normalPdf(xi, props.mean, sigma))
  }

  const shapes = [
    {
      type: 'line',
      x0: props.mean,
      x1: props.mean,
      y0: 0,
      y1: 1,
      yref: 'paper',
      line: { color: '#27ae60', width: 2, dash: 'solid' },
    },
    {
      type: 'line',
      x0: designCenter.value,
      x1: designCenter.value,
      y0: 0,
      y1: 1,
      yref: 'paper',
      line: { color: '#e67e22', width: 2, dash: 'dot' },
    },
    {
      type: 'line',
      x0: props.specMin,
      x1: props.specMin,
      y0: 0,
      y1: 1,
      yref: 'paper',
      line: { color: '#e74c3c', width: 1.5, dash: 'dash' },
    },
    {
      type: 'line',
      x0: props.specMax,
      x1: props.specMax,
      y0: 0,
      y1: 1,
      yref: 'paper',
      line: { color: '#e74c3c', width: 1.5, dash: 'dash' },
    },
  ]

  await plotly.newPlot(
    chartRef.value,
    [
      {
        x,
        y,
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy',
        name: `±${sigmaTab.value}σ 分布`,
        line: { color: '#3498db', width: 2 },
        fillcolor: 'rgba(52, 152, 219, 0.12)',
      },
    ],
    {
      margin: { t: 24, r: 16, b: 48, l: 48 },
      xaxis: { title: '封闭环尺寸', zeroline: false },
      yaxis: { title: '概率密度', rangemode: 'tozero' },
      shapes,
      annotations: [
        { x: props.mean, y: 1.02, yref: 'paper', text: '分布中心 μ', showarrow: false, font: { size: 10, color: '#27ae60' } },
        { x: designCenter.value, y: 0.96, yref: 'paper', text: '设计中心', showarrow: false, font: { size: 10, color: '#e67e22' } },
      ],
      showlegend: false,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
    },
    { responsive: true, displaylogo: false, displayModeBar: false },
  )
}

watch(
  () => [props.mean, props.processSigma, props.specMin, props.specMax, sigmaTab.value],
  render,
)
onMounted(render)
onBeforeUnmount(() => {
  if (chartRef.value && plotly) plotly.purge(chartRef.value)
})
</script>

<style scoped>
.chain-dist-chart {
  min-height: 280px;
  width: 100%;
}
</style>
