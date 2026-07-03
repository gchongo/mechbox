<template>
  <div ref="chartRef" class="distribution-chart" />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { buildDistributionCurve } from '@/utils/distribution-pdf'
import { useChartI18n } from '@/composables/useChartI18n'
import { useOptionsI18n } from '@/composables/useOptionsI18n'

const props = defineProps({
  distribution: { type: String, default: 'normal' },
  tolerance: { type: Number, default: 0.25 },
})

const chartRef = ref(null)
let plotly = null
const { ch, locale } = useChartI18n()
const { ol } = useOptionsI18n()

async function render() {
  if (!chartRef.value) return
  if (!plotly) {
    plotly = await import('plotly.js-dist-min')
  }
  const { x, y } = buildDistributionCurve(props.distribution, props.tolerance)
  const distLabel = ol('distributions', props.distribution)
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
      title: { text: ch('distributionPdfTitle', { dist: distLabel }), font: { size: 14 } },
      margin: { t: 48, r: 24, b: 48, l: 56 },
      xaxis: { title: ch('deviationX'), zeroline: true },
      yaxis: { title: 'f(x)', rangemode: 'tozero' },
      paper_bgcolor: '#fafafa',
      plot_bgcolor: '#ffffff',
    },
    { responsive: true, displaylogo: false, displayModeBar: false },
  )
}

async function exportPng(filename) {
  if (!plotly || !chartRef.value) return
  const url = await plotly.toImage(chartRef.value, { format: 'png', width: 1200, height: 600 })
  const link = document.createElement('a')
  link.download = filename ?? ch('pdfDefaultFilename')
  link.href = url
  link.click()
}

watch(() => [props.distribution, props.tolerance, locale.value], render)
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
