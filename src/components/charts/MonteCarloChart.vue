<template>
  <div ref="chartRef" class="monte-carlo-chart" />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  results: { type: Array, default: () => [] },
  min: { type: Number, default: null },
  max: { type: Number, default: null },
  chartType: { type: String, default: 'histogram' },
})

const chartRef = ref(null)
let plotly = null

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
        name: '抽样点',
        marker: { size: 4, color: '#3498db', opacity: 0.45 },
      },
    ]
  } else if (props.chartType === 'box') {
    traces = [{ y: props.results, type: 'box', name: '分布', marker: { color: '#3498db' } }]
  } else {
    traces = [{ x: props.results, type: 'histogram', name: '频数', marker: { color: '#3498db' } }]
  }

  await plotly.newPlot(
    chartRef.value,
    traces,
    {
      title:
        props.chartType === 'cdf'
          ? '累积分布 CDF'
          : props.chartType === 'box'
            ? '箱线图'
            : props.chartType === 'scatter'
              ? '散点图（迭代抽样）'
              : '直方图',
      margin: { t: 48, r: 24, b: 48, l: 56 },
      shapes,
      xaxis: {
        title:
          props.chartType === 'box'
            ? ''
            : props.chartType === 'scatter'
              ? '迭代序号'
              : '封闭环值',
      },
      yaxis: { title: props.chartType === 'box' ? '封闭环值' : props.chartType === 'scatter' ? '封闭环值' : '频数 / 概率' },
    },
    { responsive: true, displaylogo: false, displayModeBar: false },
  )
}

watch(() => [props.results, props.min, props.max, props.chartType], render, { deep: true })
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
