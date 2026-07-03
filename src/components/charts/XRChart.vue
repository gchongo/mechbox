<template>
  <div ref="chartRef" class="xr-chart" />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useChartI18n } from '@/composables/useChartI18n'
import { useDarkMode, applyPlotlyTheme } from '@/composables/useDarkMode'

const { ch, locale } = useChartI18n()
const { isDark } = useDarkMode()

const props = defineProps({
  xBars: { type: Array, default: () => [] },
  ranges: { type: Array, default: () => [] },
  xBarBar: { type: Number, default: 0 },
  xUcl: { type: Number, default: 0 },
  xLcl: { type: Number, default: 0 },
  rBar: { type: Number, default: 0 },
  rUcl: { type: Number, default: 0 },
  rLcl: { type: Number, default: 0 },
})

const chartRef = ref(null)
let plotly = null

async function render() {
  if (!chartRef.value || !props.xBars.length) return
  if (!plotly) plotly = await import('plotly.js-dist-min')

  const x = props.xBars.map((_, i) => i + 1)

  const traces = [
    {
      x,
      y: props.xBars,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'X̄',
      xaxis: 'x',
      yaxis: 'y',
      line: { color: '#3498db' },
    },
    {
      x,
      y: props.ranges,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'R',
      xaxis: 'x2',
      yaxis: 'y2',
      line: { color: '#9b59b6' },
    },
  ]

  const layout = applyPlotlyTheme(
    {
      title: ch('xrTitle'),
      grid: { rows: 2, columns: 1, pattern: 'independent', roworder: 'top to bottom' },
      xaxis: { title: ch('subgroup'), domain: [0, 1], anchor: 'y' },
      yaxis: { title: 'X̄', domain: [0.55, 1] },
      xaxis2: { title: ch('subgroup'), domain: [0, 1], anchor: 'y2' },
      yaxis2: { title: 'R', domain: [0, 0.45] },
      shapes: [
        { type: 'line', xref: 'x', yref: 'y', x0: x[0], x1: x[x.length - 1], y0: props.xBarBar, y1: props.xBarBar, line: { color: '#2ecc71' } },
        { type: 'line', xref: 'x', yref: 'y', x0: x[0], x1: x[x.length - 1], y0: props.xUcl, y1: props.xUcl, line: { color: '#e74c3c', dash: 'dash' } },
        { type: 'line', xref: 'x', yref: 'y', x0: x[0], x1: x[x.length - 1], y0: props.xLcl, y1: props.xLcl, line: { color: '#e74c3c', dash: 'dash' } },
        { type: 'line', xref: 'x2', yref: 'y2', x0: x[0], x1: x[x.length - 1], y0: props.rBar, y1: props.rBar, line: { color: '#2ecc71' } },
        { type: 'line', xref: 'x2', yref: 'y2', x0: x[0], x1: x[x.length - 1], y0: props.rUcl, y1: props.rUcl, line: { color: '#e74c3c', dash: 'dash' } },
        { type: 'line', xref: 'x2', yref: 'y2', x0: x[0], x1: x[x.length - 1], y0: props.rLcl, y1: props.rLcl, line: { color: '#e74c3c', dash: 'dash' } },
      ],
      height: 520,
      margin: { t: 40, r: 24, b: 40, l: 56 },
      showlegend: true,
      legend: { orientation: 'h', y: 1.08 },
    },
    isDark.value,
  )

  await plotly.react(chartRef.value, traces, layout, { responsive: true, displayModeBar: false })
}

watch(
  () => [props.xBars, props.ranges, props.xBarBar, props.xUcl, props.xLcl, props.rBar, props.rUcl, props.rLcl, locale.value, isDark.value],
  render,
  { deep: true },
)
onMounted(render)
onBeforeUnmount(() => {
  if (chartRef.value && plotly) plotly.purge(chartRef.value)
})
</script>

<style scoped>
.xr-chart {
  @apply min-h-[520px] w-full;
}
</style>
