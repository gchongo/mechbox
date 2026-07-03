<template>
  <div class="chain-dist">
    <div class="chain-dist__head">
      <h3 class="chain-dist__title">{{ pt('chart.title') }}</h3>
      <el-radio-group v-model="sigmaTab" size="small" class="chain-dist__sigma">
        <el-radio-button :value="3">3σ</el-radio-button>
        <el-radio-button :value="4">4σ</el-radio-button>
        <el-radio-button :value="5">5σ</el-radio-button>
        <el-radio-button :value="6">6σ</el-radio-button>
      </el-radio-group>
    </div>
    <div ref="chartRef" class="chain-dist__chart" />
    <dl class="chain-dist__stats">
      <div class="chain-dist__stat">
        <dt class="chain-dist__stat-label">{{ pt('chart.shiftLabel') }}</dt>
        <dd class="chain-dist__stat-value" :class="shiftClass">{{ shiftLabel }}</dd>
      </div>
      <div class="chain-dist__stat">
        <dt class="chain-dist__stat-label">{{ pt('chart.ppmLabel') }}</dt>
        <dd class="chain-dist__stat-value">{{ stats.ppm.toLocaleString() }}</dd>
      </div>
      <div class="chain-dist__stat">
        <dt class="chain-dist__stat-label">{{ pt('chart.passRateLabel') }}</dt>
        <dd class="chain-dist__stat-value" :class="stats.passRate >= 99 ? 'text-success' : 'text-error'">
          {{ stats.passRate.toFixed(2) }}%
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { normalPdf } from '@/utils/distribution-pdf'
import { useCalcPage } from '@/composables/useCalcPage'
import { useLocale } from '@/composables/useLocale'
import { useDarkMode, applyPlotlyTheme } from '@/composables/useDarkMode'

const props = defineProps({
  mean: { type: Number, required: true },
  processSigma: { type: Number, required: true },
  specMin: { type: Number, required: true },
  specMax: { type: Number, required: true },
})

const { pt } = useCalcPage('editor')
const { locale } = useLocale()
const { isDark } = useDarkMode()

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
  if (abs > 99) {
    const sign = s > 0 ? '>' : '<'
    return pt('chart.shiftExtreme', { sign })
  }
  if (abs < 0.5) return pt('chart.shiftCentered', { s: s.toFixed(2) })
  if (abs < 2) return pt('chart.shiftSlight', { s: s.toFixed(2) })
  return pt('chart.shiftOff', { s: s.toFixed(2) })
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
  const pad = Math.max(half * 0.15, (props.specMax - props.specMin) * 0.08, 0.005)
  const xMin = Math.min(
    props.mean - half,
    props.specMin - pad,
    designCenter.value - pad,
  )
  const xMax = Math.max(
    props.mean + half,
    props.specMax + pad,
    designCenter.value + pad,
  )
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

  const layout = applyPlotlyTheme(
    {
      margin: { t: 28, r: 12, b: 48, l: 48 },
      xaxis: { title: pt('chart.xAxis'), zeroline: false, automargin: true },
      yaxis: { title: pt('chart.yAxis'), rangemode: 'tozero', automargin: true },
      shapes,
      annotations: [
        {
          x: props.mean,
          y: 1.02,
          xref: 'x',
          yref: 'paper',
          text: pt('chart.muAnnot'),
          showarrow: false,
          font: { size: 10, color: '#27ae60' },
        },
        {
          x: designCenter.value,
          y: 0.96,
          xref: 'x',
          yref: 'paper',
          text: pt('chart.designCenter'),
          showarrow: false,
          font: { size: 10, color: '#e67e22' },
        },
      ],
      showlegend: false,
    },
    isDark.value,
  )

  await plotly.newPlot(
    chartRef.value,
    [
      {
        x,
        y,
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy',
        name: pt('chart.distLegend', { n: sigmaTab.value }),
        line: { color: '#3498db', width: 2 },
        fillcolor: 'rgba(52, 152, 219, 0.12)',
      },
    ],
    layout,
    { responsive: true, displaylogo: false, displayModeBar: false },
  )
}

watch(
  () => [props.mean, props.processSigma, props.specMin, props.specMax, sigmaTab.value, locale.value, isDark.value],
  render,
)
onMounted(render)
onBeforeUnmount(() => {
  if (chartRef.value && plotly) plotly.purge(chartRef.value)
})
</script>

<style scoped>
.chain-dist {
  @apply min-w-0;
}

.chain-dist__head {
  @apply mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between;
}

.chain-dist__title {
  @apply font-semibold text-gray-800 dark:text-gray-100;
}

.chain-dist__sigma {
  @apply flex flex-wrap;
}

.chain-dist__chart {
  min-height: 260px;
  width: 100%;
  overflow: hidden;
}

.chain-dist__stats {
  @apply mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3;
}

.chain-dist__stat {
  @apply min-w-0 rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-900;
}

.chain-dist__stat-label {
  @apply text-xs text-gray-500;
}

.chain-dist__stat-value {
  @apply mt-1 break-words font-mono text-sm leading-snug;
}
</style>
