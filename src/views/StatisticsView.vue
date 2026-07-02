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
          <el-form-item label="修正 RSS">
            <el-select v-model="modRssDistribution" class="mb-2 w-full" size="small">
              <el-option
                v-for="(d, k) in DISTRIBUTIONS"
                :key="k"
                :label="d.name"
                :value="k"
              />
            </el-select>
            <MathTex :expr="modifiedRssLatexExpr" />
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

    <!-- 假设检验 -->
    <section id="hypothesis" class="card-panel mt-6">
      <h2 class="mb-4 font-semibold">假设检验</h2>
      <el-tabs v-model="hypothesisTab">
        <el-tab-pane label="t 检验" name="t">
          <el-form label-width="100px" class="max-w-2xl">
            <el-form-item label="检验类型">
              <el-radio-group v-model="tTestMode">
                <el-radio value="one">单样本</el-radio>
                <el-radio value="two">双样本</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="tTestMode === 'one'" label="样本数据">
              <el-input v-model="tSample1" placeholder="如：10.1,10.2,10.5,10.3" />
            </el-form-item>
            <el-form-item v-if="tTestMode === 'one'" label="假设均值 μ₀">
              <el-input-number v-model="tMu0" :precision="4" :step="0.1" />
            </el-form-item>
            <el-form-item v-if="tTestMode === 'two'" label="样本 A">
              <el-input v-model="tSample1" placeholder="第一组数据" />
            </el-form-item>
            <el-form-item v-if="tTestMode === 'two'" label="样本 B">
              <el-input v-model="tSample2" placeholder="第二组数据" />
            </el-form-item>
          </el-form>
          <div v-if="tTestResult && !tTestResult.error" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">t 统计量</dt>
              <dd class="mt-1 font-mono">{{ tTestResult.tStatistic?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">p 值</dt>
              <dd class="mt-1 font-mono">{{ tTestResult.pValue?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">显著性 (α=0.05)</dt>
              <dd class="mt-1" :class="tTestResult.significant ? 'text-error' : 'text-success'">
                {{ tTestResult.significant ? '显著' : '不显著' }}
              </dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm sm:col-span-2 lg:col-span-1">
              <dt class="text-gray-500">结论</dt>
              <dd class="mt-1">{{ tTestResult.conclusion }}</dd>
            </div>
          </div>
          <el-alert v-else-if="tTestResult?.error" :title="tTestResult.error" type="warning" show-icon />
        </el-tab-pane>

        <el-tab-pane label="卡方检验" name="chi2">
          <el-form label-width="100px" class="max-w-2xl">
            <el-form-item label="观测频数">
              <el-input v-model="chiObserved" placeholder="如：50,30,20" />
            </el-form-item>
            <el-form-item label="期望频数">
              <el-input v-model="chiExpected" placeholder="如：40,40,20" />
            </el-form-item>
          </el-form>
          <div v-if="chiResult && !chiResult.error" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">χ²</dt>
              <dd class="mt-1 font-mono">{{ chiResult.chi2?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">自由度</dt>
              <dd class="mt-1 font-mono">{{ chiResult.df }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">p 值</dt>
              <dd class="mt-1 font-mono">{{ chiResult.pValue?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">结论</dt>
              <dd class="mt-1">{{ chiResult.conclusion }}</dd>
            </div>
          </div>
          <el-alert v-else-if="chiResult?.error" :title="chiResult.error" type="warning" show-icon />
        </el-tab-pane>

        <el-tab-pane label="ANOVA" name="anova">
          <el-form label-width="100px" class="max-w-2xl">
            <el-form-item label="组 1">
              <el-input v-model="anovaGroup1" placeholder="如：10,11,12" />
            </el-form-item>
            <el-form-item label="组 2">
              <el-input v-model="anovaGroup2" placeholder="如：9,10,11" />
            </el-form-item>
            <el-form-item label="组 3">
              <el-input v-model="anovaGroup3" placeholder="可选第三组" />
            </el-form-item>
          </el-form>
          <div v-if="anovaResult && !anovaResult.error" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">F 统计量</dt>
              <dd class="mt-1 font-mono">{{ anovaResult.fStatistic?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">p 值</dt>
              <dd class="mt-1 font-mono">{{ anovaResult.pValue?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm sm:col-span-2">
              <dt class="text-gray-500">结论</dt>
              <dd class="mt-1">{{ anovaResult.conclusion }}</dd>
            </div>
          </div>
          <el-alert v-else-if="anovaResult?.error" :title="anovaResult.error" type="warning" show-icon />
        </el-tab-pane>

        <el-tab-pane label="相关性" name="corr">
          <el-form label-width="100px" class="max-w-2xl">
            <el-form-item label="变量 X">
              <el-input v-model="corrX" placeholder="如：1,2,3,4,5" />
            </el-form-item>
            <el-form-item label="变量 Y">
              <el-input v-model="corrY" placeholder="如：2,4,5,4,5" />
            </el-form-item>
          </el-form>
          <div v-if="corrResult && !corrResult.error" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">Pearson r</dt>
              <dd class="mt-1 font-mono">{{ corrResult.r?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">p 值</dt>
              <dd class="mt-1 font-mono">{{ corrResult.pValue?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm sm:col-span-2">
              <dt class="text-gray-500">结论</dt>
              <dd class="mt-1">{{ corrResult.conclusion }}</dd>
            </div>
          </div>
          <el-alert v-else-if="corrResult?.error" :title="corrResult.error" type="warning" show-icon />
        </el-tab-pane>
      </el-tabs>
    </section>

    <!-- 控制图 -->
    <section id="control" class="card-panel mt-6">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="font-semibold">控制图 (X Chart)</h2>
        <el-button size="small" @click="exportControlChart">导出 PNG</el-button>
      </div>
      <el-form label-width="100px" class="mb-4 max-w-xl">
        <el-form-item label="测量数据">
          <el-input v-model="controlData" placeholder="如：10.2,10.5,10.1,10.8,10.3" />
        </el-form-item>
        <el-form-item label="目标值">
          <el-input-number v-model="controlTarget" :precision="3" :step="0.1" />
        </el-form-item>
      </el-form>
      <ControlChart
        ref="controlChartRef"
        :values="controlValues"
        :target="controlTarget"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import DistributionChart from '@/components/charts/DistributionChart.vue'
import ControlChart from '@/components/charts/ControlChart.vue'
import { calcSkewness, calcKurtosis, weightedRss } from '@/utils/distribution-pdf'
import {
  parseNumberList,
  oneSampleTTest,
  twoSampleTTest,
  chiSquareTest,
  oneWayAnova,
  pearsonCorrelation,
} from '@/utils/hypothesis-tests'
import {
  DISTRIBUTIONS,
  toleranceToSigma,
  sigmaToTolerance,
  rssMethod,
  modifiedRssMethod,
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
const modRssDistribution = ref('skewed')
const controlData = ref('10.2,10.5,10.1,10.8,10.3,10.4,10.6,10.2')
const controlTarget = ref(10.3)
const controlChartRef = ref(null)

const hypothesisTab = ref('t')
const tTestMode = ref('one')
const tSample1 = ref('10.1,10.2,10.5,10.3,10.4')
const tSample2 = ref('9.8,10.0,10.1,9.9')
const tMu0 = ref(10)
const chiObserved = ref('50,30,20')
const chiExpected = ref('40,40,20')
const anovaGroup1 = ref('10,11,12,11')
const anovaGroup2 = ref('9,10,10,9')
const anovaGroup3 = ref('12,13,12')
const corrX = ref('1,2,3,4,5')
const corrY = ref('2,4,5,4,6')

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

const modifiedRssTotal = computed(() => {
  const tolerances = parseNumbers(toleranceList.value).map((t) => ({ tolerance: t }))
  if (!tolerances.length) return null
  const skew = parseFloat(stats.value.skewness)
  return modifiedRssMethod(tolerances, modRssDistribution.value, isNaN(skew) ? 0 : skew)
})

const modifiedRssLatexExpr = computed(() => {
  const tolerances = parseNumbers(toleranceList.value).map((t) => ({ tolerance: t }))
  if (!tolerances.length || modifiedRssTotal.value == null) {
    return 'T_{\\text{mod}} = \\text{—}'
  }
  const base = rssMethod(tolerances)
  return `T_{\\text{mod}} = ${modifiedRssTotal.value.toFixed(4)} \\approx ${base.toFixed(4)} \\times k`
})

const controlValues = computed(() => parseNumbers(controlData.value))

const tTestResult = computed(() => {
  const s1 = parseNumberList(tSample1.value)
  if (tTestMode.value === 'one') return oneSampleTTest(s1, tMu0.value)
  const s2 = parseNumberList(tSample2.value)
  return twoSampleTTest(s1, s2)
})

const chiResult = computed(() =>
  chiSquareTest(parseNumberList(chiObserved.value), parseNumberList(chiExpected.value)),
)

const anovaResult = computed(() => {
  const groups = [anovaGroup1, anovaGroup2, anovaGroup3]
    .map((g) => parseNumberList(g.value))
    .filter((g) => g.length > 0)
  return oneWayAnova(groups)
})

const corrResult = computed(() =>
  pearsonCorrelation(parseNumberList(corrX.value), parseNumberList(corrY.value)),
)

const passRate = computed(() => {
  if (!actualSigma.value) return '-'
  const level = calculateSigmaLevel(targetTolerance.value, actualSigma.value)
  return `${(calculatePassRate(level) * 100).toFixed(2)}%`
})

function exportChart() {
  chartRef.value?.exportPng(`分布曲线_${distribution.value}.png`)
  ElMessage.success('图表已导出')
}

function exportControlChart() {
  controlChartRef.value?.exportPng('控制图.png')
  ElMessage.success('控制图已导出')
}
</script>
