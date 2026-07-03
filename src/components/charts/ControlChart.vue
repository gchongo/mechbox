<template>
  <div ref="chartRef" class="control-chart" />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { calcControlLimits } from '@/utils/monte-carlo'
import { useChartI18n } from '@/composables/useChartI18n'

const props = defineProps({
  values: { type: Array, default: () => [] },
  target: { type: Number, default: null },
})

const chartRef = ref(null)
let plotly = null
const { ch, locale } = useChartI18n()

async function render() {
  if (!chartRef.value || !props.values.length) return
  if (!plotly) plotly = await import('plotly.js-dist-min')

  const x = props.values.map((_, i) => i + 1)
  const limits = calcControlLimits(props.values)
  if (!limits) return

  const traces = [
    {
      x,
      y: props.values,
      type: 'scatter',
      mode: 'lines+markers',
      name: ch('measuredValue'),
      line: { color: '#3498db' },
      marker: { size: 6 },
    },
    {
      x: [x[0], x[x.length - 1]],
      y: [limits.mean, limits.mean],
      mode: 'lines',
      name: ch('centerLine'),
      line: { color: '#2ecc71', dash: 'solid' },
    },
    {
      x: [x[0], x[x.length - 1]],
      y: [limits.ucl, limits.ucl],
      mode: 'lines',
      name: 'UCL (+3σ)',
      line: { color: '#e74c3c', dash: 'dash' },
    },
    {
      x: [x[0], x[x.length - 1]],
      y: [limits.lcl, limits.lcl],
      mode: 'lines',
      name: 'LCL (-3σ)',
      line: { color: '#e74c3c', dash: 'dash' },
    },
  ]

  if (props.target != null) {
    traces.push({
      x: [x[0], x[x.length - 1]],
      y: [props.target, props.target],
      mode: 'lines',
      name: ch('targetValue'),
      line: { color: '#f39c12', dash: 'dot' },
    })
  }

  await plotly.newPlot(
    chartRef.value,
    traces,
    {
      title: ch('controlTitle'),
      margin: { t: 48, r: 24, b: 48, l: 56 },
      xaxis: { title: ch('sampleIndex') },
      yaxis: { title: ch('measuredValue') },
      legend: { orientation: 'h', y: -0.2 },
    },
    { responsive: true, displaylogo: false, displayModeBar: false },
  )
}

watch(() => [props.values, props.target, locale.value], render, { deep: true })
onMounted(render)
onBeforeUnmount(() => {
  if (chartRef.value && plotly) plotly.purge(chartRef.value)
})

defineExpose({
  async exportPng(filename) {
    if (!plotly || !chartRef.value) return
    const url = await plotly.toImage(chartRef.value, { format: 'png', width: 1200, height: 600 })
    const link = document.createElement('a')
    link.download = filename ?? ch('controlDefaultFilename')
    link.href = url
    link.click()
  },
})
</script>

<style scoped>
.control-chart {
  min-height: 360px;
  width: 100%;
}
</style>
