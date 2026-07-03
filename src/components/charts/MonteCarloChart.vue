<template>
  <div ref="chartRef" class="monte-carlo-chart" />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useChartI18n } from '@/composables/useChartI18n'

const props = defineProps({
  results: { type: Array, default: () => [] },
  min: { type: Number, default: null },
  max: { type: Number, default: null },
  chartType: { type: String, default: 'histogram' },
})

const chartRef = ref(null)
let plotly = null
const { ch, locale } = useChartI18n()

function chartTitle() {
  if (props.chartType === 'cdf') return ch('mcCdf')
  if (props.chartType === 'box') return ch('mcBox')
  if (props.chartType === 'scatter') return ch('mcScatter')
  return ch('mcHistogram')
}

function xAxisTitle() {
  if (props.chartType === 'box') return ''
  if (props.chartType === 'scatter') return ch('mcIteration')
  return ch('mcClosedValue')
}

async function render() {
  if (!chartRef.value || !props.results.length) return
  if (!plotly) plotly = await import('plotly.js-dist-min')

  const shapes = []
  if (props.chartType === 'histogram' || props.chartType === 'cdf') {
    if (props.min != null) {
      shapes.push({
        type: 'line',
        x0: props.min,
        x1: props.min,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: { color: '#e74c3c', dash: 'dash' },
      })
    }
    if (props.max != null) {
      shapes.push({
        type: 'line',
        x0: props.max,
        x1: props.max,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: { color: '#e74c3c', dash: 'dash' },
      })
    }
  }

  let traces = []
  if (props.chartType === 'cdf') {
    const sorted = [...props.results].sort((a, b) => a - b)
    const y = sorted.map((_, i) => (i + 1) / sorted.length)
    traces = [{ x: sorted, y, type: 'scatter', mode: 'lines', name: 'CDF', line: { color: '#3498db' } }]
  } else if (props.chartType === 'scatter') {
    const step = Math.max(1, Math.floor(props.results.length / 2000))
    const x = []
    const y = []
    for (let i = 0; i < props.results.length; i += step) {
      x.push(i + 1)
      y.push(props.results[i])
    }
    traces = [
      {
        x,
        y,
        type: 'scatter',
        mode: 'markers',
        name: ch('mcSamples'),
        marker: { size: 4, color: '#3498db', opacity: 0.45 },
      },
    ]
  } else if (props.chartType === 'box') {
    traces = [{ y: props.results, type: 'box', name: ch('mcDistribution'), marker: { color: '#3498db' } }]
  } else {
    traces = [{ x: props.results, type: 'histogram', name: ch('mcFrequency'), marker: { color: '#3498db' } }]
  }

  await plotly.newPlot(
    chartRef.value,
    traces,
    {
      title: chartTitle(),
      margin: { t: 48, r: 24, b: 48, l: 56 },
      shapes,
      xaxis: { title: xAxisTitle() },
      yaxis: {
        title:
          props.chartType === 'box' || props.chartType === 'scatter'
            ? ch('mcClosedValue')
            : ch('mcFreqProb'),
      },
    },
    { responsive: true, displaylogo: false, displayModeBar: false },
  )
}

watch(() => [props.results, props.min, props.max, props.chartType, locale.value], render, { deep: true })
onMounted(render)
onBeforeUnmount(() => {
  if (chartRef.value && plotly) plotly.purge(chartRef.value)
})

async function exportPng(filename = 'monte-carlo-chart.png') {
  if (!chartRef.value || !plotly) return false
  await plotly.downloadImage(chartRef.value, {
    format: 'png',
    width: 960,
    height: 480,
    filename: filename.replace(/\.png$/i, ''),
  })
  return true
}

defineExpose({ exportPng })
</script>

<style scoped>
.monte-carlo-chart {
  min-height: 360px;
  width: 100%;
}
</style>
