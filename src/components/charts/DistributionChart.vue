<template>
  <div ref="chartRef" class="distribution-chart" />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { buildDistributionCurve } from '@/utils/distribution-pdf'

const props = defineProps({
  distribution: { type: String, default: 'normal' },
  tolerance: { type: Number, default: 0.25 },
})

const chartRef = ref(null)
let plotly = null

async function render() {
  if (!chartRef.value) return
  if (!plotly) {
    plotly = await import('plotly.js-dist-min')
  }
  const { x, y, title } = buildDistributionCurve(props.distribution, props.tolerance)
  await plotly.newPlot(
    chartRef.value,
    [
      {
        x,
        y,
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy',
        name: 'PDF',
        line: { color: '#3498db', width: 2 },
        fillcolor: 'rgba(52, 152, 219, 0.15)',
      },
    ],
    {
      title: { text: `${title} 概率密度曲线`, font: { size: 14 } },
      margin: { t: 48, r: 24, b: 48, l: 56 },
      xaxis: { title: '偏差 x', zeroline: true },
      yaxis: { title: 'f(x)', rangemode: 'tozero' },
      paper_bgcolor: '#fafafa',
      plot_bgcolor: '#ffffff',
    },
    { responsive: true, displaylogo: false, displayModeBar: false },
  )
}

async function exportPng(filename = '分布曲线.png') {
  if (!plotly || !chartRef.value) return
  const url = await plotly.toImage(chartRef.value, { format: 'png', width: 1200, height: 600 })
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
}

watch(() => [props.distribution, props.tolerance], render)
onMounted(render)
onBeforeUnmount(() => {
  if (chartRef.value && plotly) plotly.purge(chartRef.value)
})

defineExpose({ exportPng })
</script>

<style scoped>
.distribution-chart {
  min-height: 360px;
  width: 100%;
}
</style>
