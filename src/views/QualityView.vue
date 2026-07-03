<template>
  <div>
    <h1 class="page-title">质量分析工具</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      测量系统分析 (MSA) 与统计过程控制 (SPC) 控制图
    </p>

    <el-tabs v-model="activeTab" class="quality-tabs">
      <!-- MSA Gage R&R -->
      <el-tab-pane label="Gage R&R (MSA)" name="msa">
        <section class="card-panel mb-6">
          <h2 class="mb-2 font-semibold">测量数据</h2>
          <p class="mb-3 text-xs text-gray-500">
            每行：操作员, 零件号, 重复测量1, 重复测量2, …（至少 2 名操作员 × 2 零件 × 2 次）
          </p>
          <el-input
            v-model="msaText"
            type="textarea"
            :rows="8"
            placeholder="A,1,10.02,10.05,10.03&#10;A,2,10.15,10.12,10.14&#10;B,1,10.04,10.01,10.06&#10;..."
          />
          <el-button class="mt-3" size="small" @click="loadMsaSample">加载示例</el-button>
        </section>

        <template v-if="msaResult && !msaResult.error">
          <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <dt class="text-xs text-gray-500">%GRR</dt>
              <dd class="font-mono text-xl" :class="grrClass">{{ msaResult.pctGRR?.toFixed(1) }}%</dd>
              <p class="mt-1 text-xs">{{ msaResult.rating }}</p>
            </div>
            <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <dt class="text-xs text-gray-500">重复性 EV</dt>
              <dd class="font-mono">{{ msaResult.pctEV?.toFixed(1) }}%</dd>
            </div>
            <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <dt class="text-xs text-gray-500">再现性 AV</dt>
              <dd class="font-mono">{{ msaResult.pctAV?.toFixed(1) }}%</dd>
            </div>
            <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <dt class="text-xs text-gray-500">ndc</dt>
              <dd class="font-mono">{{ msaResult.ndc === Infinity ? '—' : msaResult.ndc?.toFixed(1) }}</dd>
              <p class="mt-1 text-xs text-gray-500">≥ 5 可区分类别</p>
            </div>
          </div>
          <section class="card-panel">
            <h3 class="mb-3 font-semibold">变异分量</h3>
            <dl class="grid gap-2 text-sm sm:grid-cols-2">
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>GRR</dt><dd class="font-mono">{{ msaResult.GRR?.toFixed(4) }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>零件 PV</dt><dd class="font-mono">{{ msaResult.PV?.toFixed(4) }} ({{ msaResult.pctPV?.toFixed(1) }}%)</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>总变异 TV</dt><dd class="font-mono">{{ msaResult.TV?.toFixed(4) }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>配置</dt><dd>{{ msaResult.nOperators }} 人 × {{ msaResult.nParts }} 件 × {{ msaResult.nTrials }} 次</dd>
              </div>
            </dl>
          </section>
        </template>
        <el-alert v-else-if="msaResult?.error" :title="msaResult.error" type="warning" show-icon />
      </el-tab-pane>

      <!-- X-R Chart -->
      <el-tab-pane label="X-R 控制图" name="xr">
        <section class="card-panel mb-6">
          <p class="mb-3 text-xs text-gray-500">每行一个子组，逗号分隔同组测量值（子组大小 2–10，各组须相同）</p>
          <el-input v-model="xrText" type="textarea" :rows="6" placeholder="10.1,10.3,10.2&#10;10.0,10.4,10.1&#10;10.2,10.2,10.3" />
          <el-button class="mt-3" size="small" @click="loadXrSample">加载示例</el-button>
        </section>
        <template v-if="xrResult && !xrResult.error">
          <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div class="rounded bg-gray-50 p-3 dark:bg-gray-900"><dt class="text-gray-500">X̿</dt><dd class="font-mono">{{ xrResult.xBarBar?.toFixed(4) }}</dd></div>
            <div class="rounded bg-gray-50 p-3 dark:bg-gray-900"><dt class="text-gray-500">R̄</dt><dd class="font-mono">{{ xrResult.rBar?.toFixed(4) }}</dd></div>
            <div class="rounded bg-gray-50 p-3 dark:bg-gray-900"><dt class="text-gray-500">σ 估计</dt><dd class="font-mono">{{ xrResult.sigma?.toFixed(4) }}</dd></div>
            <div class="rounded bg-gray-50 p-3 dark:bg-gray-900"><dt class="text-gray-500">失控子组</dt><dd>{{ outOfControlCount }} 个</dd></div>
          </div>
          <section class="card-panel">
            <XRChart
              :x-bars="xrResult.xBars"
              :ranges="xrResult.ranges"
              :x-bar-bar="xrResult.xBarBar"
              :x-ucl="xrResult.xUcl"
              :x-lcl="xrResult.xLcl"
              :r-bar="xrResult.rBar"
              :r-ucl="xrResult.rUcl"
              :r-lcl="xrResult.rLcl"
            />
          </section>
        </template>
        <el-alert v-else-if="xrResult?.error" :title="xrResult.error" type="warning" show-icon />
      </el-tab-pane>

      <!-- P Chart -->
      <el-tab-pane label="P 控制图" name="p">
        <section class="card-panel mb-6">
          <el-form label-width="120px" class="max-w-xl">
            <el-form-item label="缺陷数">
              <el-input v-model="pDefects" placeholder="如：2,0,3,1,2" />
            </el-form-item>
            <el-form-item label="样本量">
              <el-input v-model="pSamples" placeholder="如：100,100,100,100,100" />
            </el-form-item>
          </el-form>
        </section>
        <template v-if="pResult && !pResult.error">
          <div class="mb-4 rounded bg-gray-50 p-3 text-sm dark:bg-gray-900">
            <span class="text-gray-500">平均不合格率 p̄ = </span>
            <span class="font-mono">{{ (pResult.pBar * 100).toFixed(2) }}%</span>
          </div>
          <section class="card-panel">
            <div ref="pChartRef" class="min-h-[360px]" />
          </section>
        </template>
        <el-alert v-else-if="pResult?.error" :title="pResult.error" type="warning" show-icon />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import XRChart from '@/components/charts/XRChart.vue'
import { parseGageRRText } from '@/utils/msa-calc'
import { calcXRChart, calcPChart, parseSubgroups } from '@/utils/spc-calc'

const activeTab = ref('msa')
const msaText = ref('')
const xrText = ref('')
const pDefects = ref('2,0,3,1,2,0,1')
const pSamples = ref('100,100,100,100,100,100,100')
const pChartRef = ref(null)
let plotly = null

const msaParsed = computed(() => parseGageRRText(msaText.value))
const msaResult = computed(() => msaParsed.value.result ?? msaParsed.value)

const grrClass = computed(() => {
  const p = msaResult.value?.pctGRR ?? 100
  if (p < 10) return 'text-success'
  if (p < 30) return 'text-warning'
  return 'text-error'
})

const xrResult = computed(() => {
  const groups = parseSubgroups(xrText.value)
  if (!groups.length) return null
  return calcXRChart(groups)
})

const outOfControlCount = computed(() => {
  if (!xrResult.value || xrResult.value.error) return 0
  const x = xrResult.value.xOutOfControl.filter(Boolean).length
  const r = xrResult.value.rOutOfControl.filter(Boolean).length
  return Math.max(x, r)
})

function parseNumList(str) {
  return String(str).split(/[,，\s]+/).filter(Boolean).map(Number).filter((n) => !Number.isNaN(n))
}

const pResult = computed(() => {
  const d = parseNumList(pDefects.value)
  const s = parseNumList(pSamples.value)
  if (!d.length) return null
  return calcPChart(d, s)
})

async function renderPChart() {
  if (!pChartRef.value || !pResult.value || pResult.value.error) return
  if (!plotly) plotly = await import('plotly.js-dist-min')
  const r = pResult.value
  const x = r.pValues.map((_, i) => i + 1)
  await plotly.react(
    pChartRef.value,
    [
      { x, y: r.pValues, type: 'scatter', mode: 'lines+markers', name: 'p', line: { color: '#3498db' } },
      { x, y: r.ucl, type: 'scatter', mode: 'lines', name: 'UCL', line: { color: '#e74c3c', dash: 'dash' } },
      { x, y: r.lcl, type: 'scatter', mode: 'lines', name: 'LCL', line: { color: '#e74c3c', dash: 'dash' } },
      { x: [x[0], x[x.length - 1]], y: [r.pBar, r.pBar], type: 'scatter', mode: 'lines', name: 'p̄', line: { color: '#2ecc71' } },
    ],
    {
      title: 'P 控制图（不合格率）',
      xaxis: { title: '样本序号' },
      yaxis: { title: '不合格率 p', tickformat: '.1%' },
      margin: { t: 40, b: 48, l: 56, r: 24 },
      height: 360,
    },
    { responsive: true, displayModeBar: false },
  )
}

watch([pResult, activeTab], () => {
  if (activeTab.value === 'p') renderPChart()
})

function loadMsaSample() {
  msaText.value = `A,1,10.02,10.05,10.03
A,2,10.15,10.12,10.14
A,3,10.08,10.10,10.09
B,1,10.04,10.01,10.06
B,2,10.18,10.16,10.17
B,3,10.11,10.09,10.12
C,1,10.00,10.03,10.02
C,2,10.14,10.13,10.15
C,3,10.07,10.08,10.06`
}

function loadXrSample() {
  xrText.value = `10.1,10.3,10.2
10.0,10.4,10.1
10.2,10.2,10.3
10.15,10.25,10.2
10.05,10.1,10.08
10.3,10.2,10.25`
}

onMounted(() => {
  loadMsaSample()
  loadXrSample()
})

onBeforeUnmount(() => {
  if (pChartRef.value && plotly) plotly.purge(pChartRef.value)
})
</script>
