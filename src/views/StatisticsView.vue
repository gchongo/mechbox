<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>

    <section class="card-panel mb-6">
      <h2 class="mb-4 font-semibold">{{ pt('sectionDistributions') }}</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <button
          v-for="(dist, key) in distributions"
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
            <span class="font-medium">{{ dist.label }}</span>
          </div>
          <dl class="space-y-1 text-xs text-gray-600">
            <div class="flex justify-between"><dt>K</dt><dd class="font-mono">{{ dist.k }}</dd></div>
            <div class="flex justify-between"><dt>cv</dt><dd class="font-mono">{{ dist.cv }}</dd></div>
            <div class="flex justify-between">
              <dt>{{ pt('coverage') }}</dt>
              <dd class="font-mono">{{ (dist.coverage * 100).toFixed(1) }}%</dd>
            </div>
          </dl>
        </button>
      </div>
    </section>

    <section id="chart" class="card-panel mb-6">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="font-semibold">{{ pt('sectionPdf') }}</h2>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500">{{ pt('toleranceBand') }}</span>
          <el-input-number v-model="chartTolerance" :min="0.01" :precision="3" :step="0.01" size="small" />
          <el-button size="small" @click="exportChart">{{ pt('exportPng') }}</el-button>
        </div>
      </div>
      <DistributionChart
        :key="locale"
        ref="chartRef"
        :distribution="distribution"
        :tolerance="chartTolerance"
      />
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section id="convert" class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pt('sectionConvert') }}</h2>
        <el-form label-width="100px">
          <CalcFormItem :label="pf('convertDirection')">
            <el-radio-group v-model="convertDirection">
              <el-radio value="t2s"><MathTex expr="T \to \sigma" /></el-radio>
              <el-radio value="s2t"><MathTex expr="\sigma \to T" /></el-radio>
            </el-radio-group>
          </CalcFormItem>
          <CalcFormItem :label="pf('distribution')">
            <el-select v-model="distribution" class="w-full">
              <el-option
                v-for="(dist, key) in distributions"
                :key="key"
                :label="dist.label"
                :value="key"
              />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('inputValue')">
            <el-input-number v-model="convertInput" :precision="4" :step="0.01" class="w-full" />
          </CalcFormItem>
          <CalcFormItem :label="pf('outputValue')">
            <MathTex :expr="convertLatex" />
          </CalcFormItem>
        </el-form>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pt('sectionBasicStats') }}</h2>
        <CalcFormItem label-width="80px" :label="pf('inputData')">
          <el-input
            v-model="dataInput"
            type="textarea"
            :rows="3"
            placeholder="10,12,15,18,20"
          />
        </CalcFormItem>
        <dl class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">{{ pr('mean') }}</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.mean }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">{{ pr('std') }}</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.std }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">{{ pr('variance') }}</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.variance }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">{{ pr('range') }}</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.range }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">{{ pr('skewness') }}</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.skewness }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">{{ pr('kurtosis') }}</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.kurtosis }}</dd>
          </div>
        </dl>
      </section>

      <section id="rss" class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pt('sectionRss') }}</h2>
        <el-form label-width="120px">
          <CalcFormItem :label="pf('toleranceList')">
            <el-input v-model="toleranceList" placeholder="0.06,0.05,0.04" />
          </CalcFormItem>
          <CalcFormItem :label="pf('baseRss')">
            <MathTex :expr="`T_{\\text{RSS}} = ${rssTotal === '-' ? '\\text{—}' : rssTotal}\\,\\text{mm}`" />
          </CalcFormItem>
          <CalcFormItem :label="pf('sensitivityFactors')">
            <el-input v-model="factorList" placeholder="1,1,1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('weightedRss')">
            <MathTex :expr="`T_{\\text{wRSS}} = ${weightedRssTotal === '-' ? '\\text{—}' : weightedRssTotal}\\,\\text{mm}`" />
          </CalcFormItem>
          <CalcFormItem :label="pf('modifiedRss')">
            <el-select v-model="modRssDistribution" class="mb-2 w-full" size="small">
              <el-option
                v-for="(d, k) in distributions"
                :key="k"
                :label="d.label"
                :value="k"
              />
            </el-select>
            <MathTex :expr="modifiedRssLatexExpr" />
          </CalcFormItem>
        </el-form>
      </section>

      <section id="sigma" class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pt('sectionSigma') }}</h2>
        <el-form label-width="120px">
          <CalcFormItem :label="pf('specLower')">
            <el-input-number v-model="specLower" :precision="4" :step="0.01" class="w-full" />
          </CalcFormItem>
          <CalcFormItem :label="pf('specUpper')">
            <el-input-number v-model="specUpper" :precision="4" :step="0.01" class="w-full" />
          </CalcFormItem>
          <CalcFormItem :label="pf('processMean')">
            <el-input-number v-model="processMean" :precision="4" :step="0.01" class="w-full" />
            <el-button class="mt-2" size="small" @click="applySampleToProcess">
              {{ pt('applySampleStats') }}
            </el-button>
          </CalcFormItem>
          <CalcFormItem :label="pf('processSigma')">
            <el-input-number v-model="processSigma" :precision="4" :step="0.001" class="w-full" />
          </CalcFormItem>
          <CalcFormItem :label="pf('sigmaLevel')">
            <MathTex :expr="sigmaLevelLatex" />
          </CalcFormItem>
          <CalcFormItem :label="pf('passRate')">
            <span class="font-mono text-lg" :class="capabilityPassRateOk ? 'text-success' : 'text-error'">
              {{ passRateDisplay }}
            </span>
          </CalcFormItem>
          <CalcFormItem :label="pf('cValue')">
            <MathTex :expr="cValueLatex" />
          </CalcFormItem>
          <CalcFormItem :label="pf('cpk')">
            <span class="font-mono text-lg" :class="capabilityCpkOk ? 'text-success' : 'text-warning'">
              {{ cpkDisplay }}
            </span>
          </CalcFormItem>
          <CalcFormItem :label="pf('dppm')">
            <span class="font-mono">{{ capability?.dppm ?? '—' }}</span>
          </CalcFormItem>
        </el-form>
      </section>
    </div>

    <section id="hypothesis" class="card-panel mt-6">
      <h2 class="mb-4 font-semibold">{{ pt('sectionHypothesis') }}</h2>
      <el-tabs v-model="hypothesisTab">
        <el-tab-pane :label="pt('tabT')" name="t">
          <el-form label-width="100px" class="max-w-2xl">
            <CalcFormItem :label="pf('testType')">
              <el-radio-group v-model="tTestMode">
                <el-radio value="one">{{ pf('tOneSample') }}</el-radio>
                <el-radio value="two">{{ pf('tTwoSample') }}</el-radio>
              </el-radio-group>
            </CalcFormItem>
            <CalcFormItem v-if="tTestMode === 'one'" :label="pf('sampleData')">
              <el-input v-model="tSample1" placeholder="10.1,10.2,10.5,10.3" />
            </CalcFormItem>
            <CalcFormItem v-if="tTestMode === 'one'" :label="pf('mu0')">
              <el-input-number v-model="tMu0" :precision="4" :step="0.1" />
            </CalcFormItem>
            <CalcFormItem v-if="tTestMode === 'two'" :label="pf('sampleA')">
              <el-input v-model="tSample1" placeholder="10.1,10.2,10.5,10.3" />
            </CalcFormItem>
            <CalcFormItem v-if="tTestMode === 'two'" :label="pf('sampleB')">
              <el-input v-model="tSample2" placeholder="9.8,10.0,10.1,9.9" />
            </CalcFormItem>
          </el-form>
          <div v-if="tTestResult && !tTestResult.errorKey" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">{{ pr('tStat') }}</dt>
              <dd class="mt-1 font-mono">{{ tTestResult.tStatistic?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">{{ pr('pValue') }}</dt>
              <dd class="mt-1 font-mono">{{ tTestResult.pValue?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">{{ pr('significance') }}</dt>
              <dd class="mt-1" :class="tTestResult.significant ? 'text-error' : 'text-success'">
                {{ tTestResult.significant ? pr('significant') : pr('notSignificant') }}
              </dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm sm:col-span-2 lg:col-span-1">
              <dt class="text-gray-500">{{ pr('conclusion') }}</dt>
              <dd class="mt-1">{{ rm('hypothesis', tTestResult.conclusionKey) }}</dd>
            </div>
          </div>
          <el-alert v-else-if="tTestResult?.errorKey" :title="resultError(tTestResult)" type="warning" show-icon />
        </el-tab-pane>

        <el-tab-pane :label="pt('tabChi2')" name="chi2">
          <el-form label-width="100px" class="max-w-2xl">
            <CalcFormItem :label="pf('observed')">
              <el-input v-model="chiObserved" placeholder="50,30,20" />
            </CalcFormItem>
            <CalcFormItem :label="pf('expected')">
              <el-input v-model="chiExpected" placeholder="40,40,20" />
            </CalcFormItem>
          </el-form>
          <div v-if="chiResult && !chiResult.errorKey" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">{{ pr('chi2') }}</dt>
              <dd class="mt-1 font-mono">{{ chiResult.chi2?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">{{ pr('df') }}</dt>
              <dd class="mt-1 font-mono">{{ chiResult.df }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">{{ pr('pValue') }}</dt>
              <dd class="mt-1 font-mono">{{ chiResult.pValue?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">{{ pr('conclusion') }}</dt>
              <dd class="mt-1">{{ rm('hypothesis', chiResult.conclusionKey) }}</dd>
            </div>
          </div>
          <el-alert v-else-if="chiResult?.errorKey" :title="resultError(chiResult)" type="warning" show-icon />
        </el-tab-pane>

        <el-tab-pane :label="pt('tabAnova')" name="anova">
          <el-form label-width="100px" class="max-w-2xl">
            <CalcFormItem :label="pf('group1')">
              <el-input v-model="anovaGroup1" placeholder="10,11,12" />
            </CalcFormItem>
            <CalcFormItem :label="pf('group2')">
              <el-input v-model="anovaGroup2" placeholder="9,10,11" />
            </CalcFormItem>
            <CalcFormItem :label="pf('group3')">
              <el-input v-model="anovaGroup3" placeholder="12,13,12" />
            </CalcFormItem>
          </el-form>
          <div v-if="anovaResult && !anovaResult.errorKey" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">{{ pr('fStat') }}</dt>
              <dd class="mt-1 font-mono">{{ anovaResult.fStatistic?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">{{ pr('pValue') }}</dt>
              <dd class="mt-1 font-mono">{{ anovaResult.pValue?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm sm:col-span-2">
              <dt class="text-gray-500">{{ pr('conclusion') }}</dt>
              <dd class="mt-1">{{ rm('hypothesis', anovaResult.conclusionKey) }}</dd>
            </div>
          </div>
          <el-alert v-else-if="anovaResult?.errorKey" :title="resultError(anovaResult)" type="warning" show-icon />
        </el-tab-pane>

        <el-tab-pane :label="pt('tabCorr')" name="corr">
          <el-form label-width="100px" class="max-w-2xl">
            <CalcFormItem :label="pf('varX')">
              <el-input v-model="corrX" placeholder="1,2,3,4,5" />
            </CalcFormItem>
            <CalcFormItem :label="pf('varY')">
              <el-input v-model="corrY" placeholder="2,4,5,4,5" />
            </CalcFormItem>
          </el-form>
          <div v-if="corrResult && !corrResult.errorKey" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">{{ pr('pearsonR') }}</dt>
              <dd class="mt-1 font-mono">{{ corrResult.r?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm">
              <dt class="text-gray-500">{{ pr('pValue') }}</dt>
              <dd class="mt-1 font-mono">{{ corrResult.pValue?.toFixed(4) }}</dd>
            </div>
            <div class="rounded bg-gray-50 p-3 text-sm sm:col-span-2">
              <dt class="text-gray-500">{{ pr('conclusion') }}</dt>
              <dd class="mt-1">{{ rm('hypothesis', corrResult.conclusionKey) }}</dd>
            </div>
          </div>
          <el-alert v-else-if="corrResult?.errorKey" :title="resultError(corrResult)" type="warning" show-icon />
        </el-tab-pane>
      </el-tabs>
    </section>

    <section id="control" class="card-panel mt-6">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="font-semibold">{{ pt('sectionControl') }}</h2>
        <el-button size="small" @click="exportControlChart">{{ pt('exportControlPng') }}</el-button>
      </div>
      <el-form label-width="100px" class="mb-4 max-w-xl">
        <CalcFormItem :label="pf('measureData')">
          <el-input v-model="controlData" placeholder="10.2,10.5,10.1,10.8,10.3" />
        </CalcFormItem>
        <CalcFormItem :label="pf('target')">
          <el-input-number v-model="controlTarget" :precision="3" :step="0.1" />
        </CalcFormItem>
      </el-form>
      <ControlChart
        :key="locale"
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
import MathTex from '@/components/common/MathTex.vue'
import { calcSkewness, calcKurtosis, weightedRss } from '@/utils/distribution-pdf'
import { calcProcessCapability } from '@/utils/process-capability'
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
} from '@/utils/size-chain'
import { useCalcPage } from '@/composables/useCalcPage'
import { useResultI18n } from '@/composables/useResultI18n'
import { useOptionsI18n } from '@/composables/useOptionsI18n'

const route = useRoute()
const { pt, pf, pr, locale } = useCalcPage('statistics')
const { resultError, rm } = useResultI18n()
const { optionMap, ol } = useOptionsI18n()

const distributions = computed(() => optionMap(DISTRIBUTIONS, 'distributions'))

const chartRef = ref(null)

const distribution = ref('normal')
const convertDirection = ref('t2s')
const convertInput = ref(0.25)
const dataInput = ref('10,12,15,18,20')
const toleranceList = ref('0.06,0.05,0.04')
const factorList = ref('1,1,1')
const specLower = ref(9.875)
const specUpper = ref(10.125)
const processMean = ref(10)
const processSigma = ref(0.042)
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
  locale.value
  const val = convertInput.value ?? 0
  const dist = ol('distributions', distribution.value)
  if (convertDirection.value === 't2s') {
    const s = toleranceToSigma(val, distribution.value)
    return `\\sigma = ${s.toFixed(4)} \\quad (\\text{${dist}})`
  }
  const t = sigmaToTolerance(val, distribution.value)
  return `T = ${t.toFixed(4)} \\quad (\\text{${dist}})`
})

const sigmaLevelLatex = computed(() => {
  locale.value
  const sub = locale.value === 'en' ? 'level' : '水平'
  if (!capability.value) return `\\sigma_{\\text{${sub}}} = \\text{—}`
  return `\\sigma_{\\text{${sub}}} = ${capability.value.sigmaLevel.toFixed(2)}\\sigma`
})

const cValueLatex = computed(() => {
  if (!capability.value) return 'C = \\text{—}'
  return `C = ${capability.value.c.toFixed(2)}`
})

const capability = computed(() => {
  if (!processSigma.value || specUpper.value <= specLower.value) return null
  return calcProcessCapability({
    lsl: specLower.value,
    usl: specUpper.value,
    mean: processMean.value,
    sigma: processSigma.value,
  })
})

const passRateDisplay = computed(() => {
  if (!capability.value) return '—'
  return `${(capability.value.passRate * 100).toFixed(2)}%`
})

const cpkDisplay = computed(() => {
  if (!capability.value) return '—'
  return capability.value.cpk.toFixed(2)
})

const capabilityPassRateOk = computed(() => capability.value && capability.value.passRate >= 0.9973)

const capabilityCpkOk = computed(() => capability.value && capability.value.cpk > 1.33)

function applySampleToProcess() {
  const nums = parseNumbers(dataInput.value)
  if (!nums.length) return
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length
  const variance = nums.reduce((s, x) => s + (x - mean) ** 2, 0) / nums.length
  processMean.value = Number(mean.toFixed(4))
  processSigma.value = Number(Math.sqrt(variance).toFixed(4))
}

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

function exportChart() {
  chartRef.value?.exportPng(`distribution_${distribution.value}.png`)
  ElMessage.success(pt('chartExported'))
}

function exportControlChart() {
  controlChartRef.value?.exportPng('control_chart.png')
  ElMessage.success(pt('controlExported'))
}
</script>
