<template>
  <div ref="chartRef" class="tornado-chart" />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  closedMin: { type: Number, default: null },
  closedMax: { type: Number, default: null },
})

const chartRef = ref(null)
let plotly = null

async function render() {
  if (!chartRef.value || !props.items.length) return
  if (!plotly) plotly = await import('plotly.js-dist-min')

  const nominal = props.items[0]?.mean ?? 0
  const sorted = [...props.items].sort((a, b) => a.spread - b.spread)
  const names = sorted.map((x) => x.name)
  const low = sorted.map((x) => x.p05 - nominal)
  const high = sorted.map((x) => x.p95 - nominal)

  const shapes = []
  if (props.closedMin != null) {
    shapes.push({
      type: 'line',
      x0: props.closedMin - nominal,
      x1: props.closedMin - nominal,
      y0: -0.5,
      y1: names.length - 0.5,
      line: { color: '#e74c3c', dash: 'dash', width: 1.5 },
    })
  }
  if (props.closedMax != null) {
    shapes.push({
      type: 'line',
      x0: props.closedMax - nominal,
      x1: props.closedMax - nominal,
      y0: -0.5,
      y1: names.length - 0.5,
      line: { color: '#e74c3c', dash: 'dash', width: 1.5 },
    })
  }

  const traces = [
    {
      type: 'bar',
      orientation: 'h',
      y: names,
      x: low,
      name: 'P5 偏差',
      marker: { color: '#3498db' },
      hovertemplate: '%{y}<br>P5 偏差: %{x:.4f}<extra></extra>',
    },
    {
      type: 'bar',
      orientation: 'h',
      y: names,
      x: high,
      name: 'P95 偏差',
      marker: { color: '#409EFF' },
      hovertemplate: '%{y}<br>P95 偏差: %{x:.4f}<extra></extra>',
    },
  ]

  const layout = {
    barmode: 'overlay',
    title: { text: '敏感度龙卷风图（相对名义值偏差）', font: { size: 14 } },
    xaxis: { title: '封闭环偏差', zeroline: true, zerolinecolor: '#999' },
    yaxis: { automargin: true },
    shapes,
    margin: { l: 100, r: 30, t: 40, b: 50 },
    height: Math.max(280, names.length * 36 + 80),
    showlegend: true,
    legend: { orientation: 'h', y: 1.12 },
  }

  await plotly.react(chartRef.value, traces, layout, { responsive: true, displayModeBar: false })
}

watch(() => [props.items, props.closedMin, props.closedMax], render, { deep: true })

onMounted(render)
onBeforeUnmount(() => {
  if (chartRef.value && plotly) plotly.purge(chartRef.value)
})

defineExpose({
  async exportPng(filename = 'tornado-chart.png') {
    if (!chartRef.value || !plotly) return false
    try {
      await plotly.downloadImage(chartRef.value, { format: 'png', filename, width: 900, height: 500 })
      return true
    } catch {
      return false
    }
  },
})
</script>

<style scoped>
.tornado-chart {
  @apply min-h-[280px] w-full;
}
</style>
