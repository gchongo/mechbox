<template>
  <div>
    <h1 class="page-title">概率统计工具</h1>

    <!-- 分布类型卡片 -->
    <section class="card-panel mb-6">
      <h2 class="mb-4 font-semibold">分布类型</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <button
          v-for="(dist, key) in DISTRIBUTIONS"
          :key="key"
          class="rounded-lg border-2 p-4 text-left transition-all"
          :class="
            distribution === key
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-primary/50'
          "
          @click="distribution = key"
        >
          <div class="mb-2 flex items-center gap-2">
            <el-icon :size="20" class="text-primary"><TrendCharts /></el-icon>
            <span class="font-medium">{{ dist.name }}</span>
          </div>
          <dl class="space-y-1 text-xs text-gray-600">
            <div class="flex justify-between"><dt>K</dt><dd class="font-mono">{{ dist.k }}</dd></div>
            <div class="flex justify-between"><dt>cv</dt><dd class="font-mono">{{ dist.cv }}</dd></div>
            <div class="flex justify-between"><dt>覆盖率</dt><dd class="font-mono">{{ (dist.coverage * 100).toFixed(1) }}%</dd></div>
          </dl>
        </button>
      </div>
    </section>

    <!-- Plotly 分布曲线 -->
    <section id="chart" class="card-panel mb-6">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="font-semibold">分布概率密度曲线（PDF）</h2>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500">公差带宽 T (mm)</span>
          <el-input-number v-model="chartTolerance" :min="0.01" :precision="3" :step="0.01" size="small" />
          <el-button size="small" @click="exportChart">导出 PNG</el-button>
        </div>
      </div>
      <DistributionChart
        ref="chartRef"
        :distribution="distribution"
        :tolerance="chartTolerance"
      />
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- 公差转换 -->
      <section id="convert" class="card-panel">
        <h2 class="mb-4 font-semibold">公差 ↔ 标准差转换</h2>
        <el-form label-width="100px">
          <el-form-item label="转换方向">
            <el-radio-group v-model="convertDirection">
              <el-radio value="t2s">T → σ</el-radio>
              <el-radio value="s2t">σ → T</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="分布类型">
            <el-select v-model="distribution" class="w-full">
              <el-option
                v-for="(dist, key) in DISTRIBUTIONS"
                :key="key"
                :label="dist.name"
                :value="key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="输入值">
            <el-input-number v-model="convertInput" :precision="4" :step="0.01" class="w-full" />
          </el-form-item>
          <el-form-item label="输出值">
            <MathTex :expr="convertLatex" />
          </el-form-item>
        </el-form>
      </section>

      <!-- 基础统计 -->
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">基础统计</h2>
        <el-form-item label="输入数据" label-width="80px">
          <el-input
            v-model="dataInput"
            type="textarea"
            :rows="3"
            placeholder="如：10,12,15,18,20（逗号分隔）"
          />
        </el-form-item>
        <dl class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">均值 (μ)</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.mean }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">标准差 (σ)</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.std }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">方差 (σ²)</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.variance }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">极差 (R)</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.range }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">偏度</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.skewness }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">峰度</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.kurtosis }}</dd>
          </div>
        </dl>
      </section>

      <!-- RSS -->
      <section id="rss" class="card-panel">
        <h2 class="mb-4 font-semibold">RSS 计算</h2>
        <el-form label-width="120px">
          <el-form-item label="公差列表">
            <el-input v-model="toleranceList" placeholder="如：0.06,0.05,0.04" />
          </el-form-item>
          <el-form-item label="基础 RSS">
            <MathTex :expr="`T_{\\text{RSS}} = ${rssTotal === '-' ? '\\text{—}' : rssTotal}\\,\\text{mm}`" />
          </el-form-item>
          <el-form-item label="传递系数">
            <el-input v-model="factorList" placeholder="如：1,1,1（与公差一一对应）" />
          </el-form-item>
          <el-form-item label="加权 RSS">
            <MathTex :expr="`T_{\\text{wRSS}} = ${weightedRssTotal === '-' ? '\\text{—}' : weightedRssTotal}\\,\\text{mm}`" />
          </el-form-item>
        </el-form>
      </section>

      <!-- 西格玛 -->
      <section id="sigma" class="card-panel">
        <h2 class="mb-4 font-semibold">西格玛分析</h2>
        <el-form label-width="120px">
          <el-form-item label="目标公差 (mm)">
            <el-input-number v-model="targetTolerance" :precision="3" :step="0.01" />
          </el-form-item>
          <el-form-item label="实际标准差">
            <el-input-number v-model="actualSigma" :precision="4" :step="0.001" />
          </el-form-item>
          <el-form-item label="西格玛水平">
            <MathTex :expr="sigmaLevelLatex" />
          </el-form-item>
          <el-form-item label="合格率">
            <span class="font-mono text-lg text-success">{{ passRate }}</span>
          </el-form-item>
          <el-form-item label="C 值">
            <MathTex :expr="cValueLatex" />
          </el-form-item>
          <el-form-item label="Cpk">
            <span class="font-mono text-lg">{{ cpkValue }}</span>
          </el-form-item>
        </el-form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import DistributionChart from '@/components/charts/DistributionChart.vue'
import { calcSkewness, calcKurtosis, weightedRss } from '@/utils/distribution-pdf'
import {
  DISTRIBUTIONS,
  toleranceToSigma,
  sigmaToTolerance,
  rssMethod,
  calculateSigmaLevel,
  calculatePassRate,
  calculateCpk,
} from '@/utils/size-chain'

const route = useRoute()
const chartRef = ref(null)

const distribution = ref('normal')
const convertDirection = ref('t2s')
const convertInput = ref(0.25)
const dataInput = ref('10,12,15,18,20')
const toleranceList = ref('0.06,0.05,0.04')
const factorList = ref('1,1,1')
const targetTolerance = ref(0.25)
const actualSigma = ref(0.042)
const chartTolerance = ref(0.25)

onMounted(() => {
  const tool = route.query.tool
  if (tool) {
    setTimeout(() => {
      document.getElementById(String(tool))?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }
})

function parseNumbers(str) {
  return str
    .split(/[,，\s]+/)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
}

const convertLatex = computed(() => {
  const val = convertInput.value ?? 0
  const dist = DISTRIBUTIONS[distribution.value].name
  if (convertDirection.value === 't2s') {
    const s = toleranceToSigma(val, distribution.value)
    return `\\sigma = ${s.toFixed(4)} \\quad (\\text{${dist}})`
  }
  const t = sigmaToTolerance(val, distribution.value)
  return `T = ${t.toFixed(4)} \\quad (\\text{${dist}})`
})

const sigmaLevelLatex = computed(() => {
  if (!actualSigma.value) return '\\sigma_{\\text{水平}} = \\text{—}'
  const level = calculateSigmaLevel(targetTolerance.value, actualSigma.value).toFixed(2)
  return `\\sigma_{\\text{水平}} = ${level}\\sigma`
})

const cValueLatex = computed(() => {
  if (!actualSigma.value) return 'C = \\text{—}'
  const c = (targetTolerance.value / (6 * actualSigma.value)).toFixed(2)
  return `C = ${c}`
})

const cpkValue = computed(() => {
  if (!actualSigma.value) return '—'
  const mean = targetTolerance.value / 2
  return calculateCpk(targetTolerance.value, 0, mean, actualSigma.value).toFixed(2)
})

const stats = computed(() => {
  const nums = parseNumbers(dataInput.value)
  if (!nums.length) {
    return {
      mean: '-',
      std: '-',
      variance: '-',
      range: '-',
      skewness: '-',
      kurtosis: '-',
    }
  }
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length
  const variance = nums.reduce((s, x) => s + (x - mean) ** 2, 0) / nums.length
  const std = Math.sqrt(variance)
  const skew = calcSkewness(nums)
  const kurt = calcKurtosis(nums)
  return {
    mean: mean.toFixed(2),
    std: std.toFixed(3),
    variance: variance.toFixed(3),
    range: (Math.max(...nums) - Math.min(...nums)).toFixed(2),
    skewness: skew == null ? '-' : skew.toFixed(3),
    kurtosis: kurt == null ? '-' : kurt.toFixed(3),
  }
})

const rssTotal = computed(() => {
  const tolerances = parseNumbers(toleranceList.value).map((t) => ({ tolerance: t }))
  if (!tolerances.length) return '-'
  return rssMethod(tolerances).toFixed(4)
})

const weightedRssTotal = computed(() => {
  const tolerances = parseNumbers(toleranceList.value)
  const factors = parseNumbers(factorList.value)
  if (!tolerances.length) return '-'
  const f = tolerances.map((_, i) => factors[i] ?? 1)
  return weightedRss(tolerances, f).toFixed(4)
})

const passRate = computed(() => {
  if (!actualSigma.value) return '-'
  const level = calculateSigmaLevel(targetTolerance.value, actualSigma.value)
  return `${(calculatePassRate(level) * 100).toFixed(2)}%`
})

function exportChart() {
  chartRef.value?.exportPng(`分布曲线_${distribution.value}.png`)
  ElMessage.success('图表已导出')
}
</script>
