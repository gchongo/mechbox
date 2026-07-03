<template>
  <div>
    <h1 class="page-title">回归与实验设计</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      线性/多项式回归、正交试验 DOE 与二因子响应面 RSM
    </p>

    <el-tabs v-model="tab">
      <el-tab-pane label="回归分析" name="regression">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">数据输入</h2>
            <el-form label-width="100px">
              <el-form-item label="拟合类型">
                <el-radio-group v-model="regType">
                  <el-radio value="linear">线性</el-radio>
                  <el-radio value="polynomial">二次多项式</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
            <p class="mb-2 text-xs text-gray-500">每行 x,y</p>
            <el-input v-model="xyText" type="textarea" :rows="8" placeholder="1,2.1&#10;2,4.2&#10;3,5.8&#10;4,8.1&#10;5,10.2" />
            <el-button class="mt-2" size="small" @click="loadRegSample">示例</el-button>
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">拟合结果</h2>
            <el-alert v-if="regResult?.error" :title="regResult.error" type="warning" show-icon />
            <template v-else-if="regResult">
              <div class="mb-4 rounded bg-primary/5 p-4">
                <p class="font-mono text-sm">{{ regResult.equation }}</p>
                <p class="mt-2 text-sm">R² = <span class="font-mono">{{ regResult.r2?.toFixed(4) }}</span></p>
              </div>
            </template>
          </section>
        </div>
        <section v-if="regResult && !regResult.error" class="card-panel mt-6">
          <div ref="regChartRef" class="min-h-[360px]" />
        </section>
      </el-tab-pane>

      <el-tab-pane label="DOE 正交试验" name="doe">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="100px">
              <el-form-item label="正交表">
                <el-select v-model="arrayId" class="w-full">
                  <el-option v-for="(a, k) in ORTHOGONAL_ARRAYS" :key="k" :label="a.label" :value="k" />
                </el-select>
              </el-form-item>
            </el-form>
            <h3 class="mb-2 text-sm font-medium">因子水平</h3>
            <div v-for="(f, i) in doeFactors" :key="i" class="mb-2 flex flex-wrap items-center gap-2">
              <el-input v-model="f.name" placeholder="因子名" class="w-24" size="small" />
              <el-input-number v-model="f.low" size="small" /> ~
              <el-input-number v-model="f.high" size="small" />
            </div>
            <el-button size="small" @click="addFactor">+ 因子</el-button>
            <el-form-item label="响应值" class="mt-4">
              <el-input v-model="responseText" placeholder="逗号分隔，与正交表行数一致" />
            </el-form-item>
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">主效应</h2>
            <el-alert v-if="doeResult?.error" :title="doeResult.error" type="warning" show-icon />
            <template v-else-if="doeResult">
              <p class="mb-3 text-sm">总平均 {{ doeResult.grandMean?.toFixed(3) }} · 最重要因子：<strong>{{ doeResult.topFactor }}</strong></p>
              <el-table :data="doeResult.effects" size="small" border>
                <el-table-column prop="factor" label="因子" />
                <el-table-column label="效应">
                  <template #default="{ row }">{{ row.effect?.toFixed(4) }}</template>
                </el-table-column>
                <el-table-column v-if="doeResult.effects[0]?.meanLow != null" label="低水平均值">
                  <template #default="{ row }">{{ row.meanLow?.toFixed(3) }}</template>
                </el-table-column>
                <el-table-column v-if="doeResult.effects[0]?.meanHigh != null" label="高水平均值">
                  <template #default="{ row }">{{ row.meanHigh?.toFixed(3) }}</template>
                </el-table-column>
              </el-table>
            </template>
          </section>
        </div>
        <section v-if="doeRuns.length" class="card-panel mt-6">
          <h3 class="mb-2 font-semibold">试验方案</h3>
          <el-table :data="doeRuns" size="small" border />
        </section>
      </el-tab-pane>

      <el-tab-pane label="响应面 RSM" name="rsm">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">因子设置（CCD）</h2>
            <el-form label-width="80px">
              <el-form-item label="因子 1">
                <el-input v-model="rsmF1.name" placeholder="名称" class="mb-1" />
                <div class="flex gap-2">
                  <el-input-number v-model="rsmF1.low" :controls="false" placeholder="低" />
                  <el-input-number v-model="rsmF1.high" :controls="false" placeholder="高" />
                </div>
              </el-form-item>
              <el-form-item label="因子 2">
                <el-input v-model="rsmF2.name" placeholder="名称" class="mb-1" />
                <div class="flex gap-2">
                  <el-input-number v-model="rsmF2.low" :controls="false" placeholder="低" />
                  <el-input-number v-model="rsmF2.high" :controls="false" placeholder="高" />
                </div>
              </el-form-item>
            </el-form>
            <p class="mb-2 text-xs text-gray-500">11 个响应值（逗号或换行分隔，与 CCD 试验序一致）</p>
            <el-input v-model="rsmResponseText" type="textarea" :rows="3" />
            <el-button class="mt-2" size="small" @click="loadRsmSample">示例</el-button>
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">二次模型</h2>
            <el-alert v-if="rsmResult?.error" :title="rsmResult.error" type="warning" show-icon />
            <template v-else-if="rsmResult">
              <div class="mb-4 rounded bg-primary/5 p-4">
                <p class="font-mono text-xs leading-relaxed">{{ rsmResult.fit.equation }}</p>
                <p class="mt-2 text-sm">R² = <span class="font-mono">{{ rsmResult.fit.r2?.toFixed(4) }}</span></p>
              </div>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                  <dt>预测最优（编码）</dt>
                  <dd class="font-mono">({{ rsmResult.fit.optimum.codedX1 }}, {{ rsmResult.fit.optimum.codedX2 }})</dd>
                </div>
                <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                  <dt>最大响应 y</dt>
                  <dd class="font-mono text-primary">{{ rsmResult.fit.optimum.predictedY }}</dd>
                </div>
              </dl>
            </template>
          </section>
        </div>
        <section v-if="rsmResult && !rsmResult.error" class="card-panel mt-6">
          <h3 class="mb-2 font-semibold">响应面等高线（编码空间）</h3>
          <div ref="rsmChartRef" class="min-h-[400px]" />
        </section>
        <section v-if="rsmResult?.design?.length" class="card-panel mt-6">
          <h3 class="mb-2 font-semibold">试验设计</h3>
          <el-table :data="rsmResult.design" size="small" border />
        </section>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { analyzeRegression, parseXY } from '@/utils/regression-calc'
import {
  ORTHOGONAL_ARRAYS,
  analyzeMainEffects,
  decodeRuns,
  parseResponses,
} from '@/utils/doe-calc'
import { analyzeRSM, parseRSMResponses } from '@/utils/rsm-calc'

const tab = ref('regression')
const regType = ref('linear')
const xyText = ref('')
const regChartRef = ref(null)
let plotly = null

const arrayId = ref('L4')
const doeFactors = ref([
  { name: '温度', low: 180, high: 220 },
  { name: '压力', low: 50, high: 80 },
  { name: '时间', low: 10, high: 30 },
])
const responseText = ref('12.1,15.3,14.2,18.5')

const rsmF1 = ref({ name: '温度', low: 180, high: 220 })
const rsmF2 = ref({ name: '压力', low: 50, high: 80 })
const rsmResponseText = ref('10.2,12.5,11.8,14.1,11.0,13.2,10.5,12.8,12.0,11.9,12.1')
const rsmChartRef = ref(null)

const regResult = computed(() => {
  const pairs = parseXY(xyText.value)
  if (pairs.length < 2) return null
  return analyzeRegression({
    pairs,
    type: regType.value === 'polynomial' ? 'polynomial' : 'linear',
    degree: 2,
  })
})

const doeResult = computed(() => {
  const responses = parseResponses(responseText.value)
  if (!responses.length) return null
  return analyzeMainEffects(arrayId.value, doeFactors.value, responses)
})

const doeRuns = computed(() => decodeRuns(arrayId.value, doeFactors.value))

const rsmResult = computed(() => {
  const responses = parseRSMResponses(rsmResponseText.value)
  if (responses.length < 6) return null
  return analyzeRSM(rsmF1.value, rsmF2.value, responses)
})

async function renderRegChart() {
  if (!regChartRef.value || !regResult.value || regResult.value.error) return
  if (!plotly) plotly = await import('plotly.js-dist-min')
  const pairs = parseXY(xyText.value)
  const x = pairs.map((p) => p.x)
  const y = pairs.map((p) => p.y)
  const xLine = []
  const yLine = []
  const xmin = Math.min(...x)
  const xmax = Math.max(...x)
  for (let i = 0; i <= 50; i++) {
    const xi = xmin + (i / 50) * (xmax - xmin)
    xLine.push(xi)
    if (regResult.value.type === 'linear') {
      yLine.push(regResult.value.intercept + regResult.value.slope * xi)
    } else {
      yLine.push(regResult.value.coeffs.reduce((s, c, d) => s + c * xi ** d, 0))
    }
  }
  await plotly.react(
    regChartRef.value,
    [
      { x, y, type: 'scatter', mode: 'markers', name: '数据' },
      { x: xLine, y: yLine, type: 'scatter', mode: 'lines', name: '拟合' },
    ],
    { xaxis: { title: 'x' }, yaxis: { title: 'y' }, height: 360, margin: { t: 24, l: 48, b: 40, r: 16 } },
    { responsive: true, displayModeBar: false },
  )
}

watch([regResult, regType], renderRegChart)

async function renderRsmChart() {
  if (!rsmChartRef.value || !rsmResult.value || rsmResult.value.error) return
  if (!plotly) plotly = await import('plotly.js-dist-min')
  const { x1Vals, x2Vals, z } = rsmResult.value.contour
  await plotly.react(
    rsmChartRef.value,
    [
      {
        x: x1Vals,
        y: x2Vals,
        z,
        type: 'contour',
        colorscale: 'Viridis',
        contours: { showlabels: true },
      },
    ],
    {
      xaxis: { title: `${rsmF1.value.name} (编码)` },
      yaxis: { title: `${rsmF2.value.name} (编码)` },
      height: 400,
      margin: { t: 24, l: 48, b: 40, r: 16 },
    },
    { responsive: true, displayModeBar: false },
  )
}

watch([rsmResult, tab], () => {
  if (tab.value === 'rsm') renderRsmChart()
})

function loadRegSample() {
  xyText.value = `1,2.1\n2,4.0\n3,6.2\n4,7.9\n5,10.1\n6,12.3\n7,14.0\n8,16.2`
}

function addFactor() {
  const max = ORTHOGONAL_ARRAYS[arrayId.value]?.factors ?? 3
  if (doeFactors.value.length < max) {
    doeFactors.value.push({ name: `因子${doeFactors.value.length + 1}`, low: 0, high: 1 })
  }
}

function loadRsmSample() {
  rsmF1.value = { name: '温度', low: 180, high: 220 }
  rsmF2.value = { name: '压力', low: 50, high: 80 }
  rsmResponseText.value = '10.2,12.5,11.8,14.1,11.0,13.2,10.5,12.8,12.0,11.9,12.1'
}

onMounted(loadRegSample)
onBeforeUnmount(() => {
  if (regChartRef.value && plotly) plotly.purge(regChartRef.value)
  if (rsmChartRef.value && plotly) plotly.purge(rsmChartRef.value)
})
</script>
