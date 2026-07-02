<template>
  <div>
    <h1 class="page-title">Monte Carlo 模拟</h1>
    <p class="mb-6 text-gray-600">随机模拟尺寸链封闭环分布，评估合格率与统计特征</p>

    <el-alert
      v-if="sourceTypeName"
      class="mb-4"
      type="success"
      :closable="false"
      show-icon
      :title="`来自编辑器：${sourceTypeName}`"
      description="已载入组成环公差与分布参数，含传递系数加权采样"
    />

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- 输入 -->
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">模拟参数</h2>
        <el-form label-width="120px">
          <el-form-item label="封闭环 min">
            <el-input-number v-model="closedMin" :precision="3" :step="0.01" />
          </el-form-item>
          <el-form-item label="封闭环 max">
            <el-input-number v-model="closedMax" :precision="3" :step="0.01" />
          </el-form-item>
          <el-form-item label="公差列表">
            <el-input v-model="toleranceList" placeholder="0.06,0.05,0.04" />
          </el-form-item>
          <el-form-item label="尺寸列表">
            <el-input v-model="sizeList" placeholder="40,15,55.25（增+/减- 见类型）" />
          </el-form-item>
          <el-form-item label="环类型">
            <el-input v-model="typeList" placeholder="dec,dec,inc（dec=减环,inc=增环）" />
          </el-form-item>
          <el-form-item label="误差分布">
            <el-select v-model="distribution" class="w-full">
              <el-option
                v-for="(d, k) in DISTRIBUTIONS"
                :key="k"
                :label="d.name"
                :value="k"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="自定义 K">
            <el-input-number v-model="customK" :min="0" :precision="2" :step="0.1" />
            <span class="ml-2 text-xs text-gray-400">可选，覆盖分布 K</span>
          </el-form-item>
          <el-form-item label="模拟次数">
            <el-input-number v-model="iterations" :min="1000" :max="100000" :step="1000" />
          </el-form-item>
          <el-button type="primary" :loading="running" @click="runSimulation">
            开始模拟
          </el-button>
          <el-button class="ml-2" @click="loadGearCase">加载齿轮案例</el-button>
        </el-form>
      </section>

      <!-- 结果统计 -->
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">模拟结果</h2>
        <div v-if="simResult" class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">均值</dt>
            <dd class="mt-1 font-mono text-lg">{{ simResult.mean.toFixed(4) }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">标准差</dt>
            <dd class="mt-1 font-mono text-lg">{{ simResult.std.toFixed(4) }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">最小值</dt>
            <dd class="mt-1 font-mono text-lg">{{ simResult.min.toFixed(4) }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">最大值</dt>
            <dd class="mt-1 font-mono text-lg">{{ simResult.max.toFixed(4) }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">P5 / P50 / P95</dt>
            <dd class="mt-1 font-mono text-sm">
              {{ simResult.p05.toFixed(3) }} / {{ simResult.p50.toFixed(3) }} /
              {{ simResult.p95.toFixed(3) }}
            </dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">合格率</dt>
            <dd class="mt-1 font-mono text-lg text-success">
              {{ (simResult.passRate * 100).toFixed(2) }}%
            </dd>
          </div>
        </div>
        <el-empty v-else description="点击「开始模拟」运行" />
      </section>
    </div>

    <!-- 图表 -->
    <section v-if="simResult" class="card-panel mt-6">
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <h2 class="font-semibold">模拟分布图</h2>
        <el-radio-group v-model="chartType" size="small">
          <el-radio-button value="histogram">直方图</el-radio-button>
          <el-radio-button value="cdf">CDF</el-radio-button>
          <el-radio-button value="scatter">散点图</el-radio-button>
          <el-radio-button value="box">箱线图</el-radio-button>
        </el-radio-group>
        <el-button size="small" @click="exportChartPng">导出 PNG</el-button>
      </div>
      <MonteCarloChart
        ref="chartComponentRef"
        :results="simResult.results"
        :min="closedMin"
        :max="closedMax"
        :chart-type="chartType"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import MonteCarloChart from '@/components/charts/MonteCarloChart.vue'
import { DISTRIBUTIONS } from '@/utils/size-chain'
import { runMonteCarloSimulation } from '@/utils/monte-carlo'
import {
  MC_STORAGE_KEY,
  deserializeMonteCarloPayload,
} from '@/constants/editor-bridge'
import { getSettings } from '@/utils/settings'

const route = useRoute()

const closedMin = ref(0.1)
const closedMax = ref(0.35)
const toleranceList = ref('0.06,0.05,0.04')
const sizeList = ref('40,15,55.25')
const typeList = ref('dec,dec,inc')
const distribution = ref('normal')
const customK = ref(0)
const iterations = ref(10000)
const running = ref(false)
const simResult = ref(null)
const chartType = ref('histogram')
const chartComponentRef = ref(null)
const sourceTypeName = ref('')

async function exportChartPng() {
  if (!simResult.value) {
    ElMessage.warning('请先运行模拟')
    return
  }
  const ok = await chartComponentRef.value?.exportPng?.('monte-carlo-chart.png')
  if (ok) ElMessage.success('PNG 已下载')
  else ElMessage.error('导出失败，请稍后重试')
}

function parseList(str) {
  return str.split(/[,，\s]+/).filter(Boolean)
}

function buildRings() {
  const tolerances = parseList(toleranceList.value).map(Number)
  const sizes = parseList(sizeList.value).map(Number)
  const types = parseList(typeList.value)
  if (tolerances.length !== sizes.length || sizes.length !== types.length) {
    throw new Error('公差、尺寸、类型数量须一致')
  }
  return sizes.map((size, i) => ({
    name: `环${i + 1}`,
    size,
    tolerance: tolerances[i],
    factor: 1,
    type: types[i].toLowerCase().startsWith('inc') ? 'increasing' : 'decreasing',
    direction: types[i].toLowerCase().startsWith('inc') ? 'right' : 'left',
  }))
}

function runSimulation() {
  running.value = true
  setTimeout(() => {
    try {
      const rings = buildRings()
      simResult.value = runMonteCarloSimulation({
        closedRing: { min: closedMin.value, max: closedMax.value },
        componentRings: rings,
        iterations: iterations.value,
        distribution: distribution.value,
        customK: customK.value,
      })
      ElMessage.success(`模拟完成：${iterations.value} 次`)
    } catch (e) {
      ElMessage.error(e.message || '模拟失败')
    } finally {
      running.value = false
    }
  }, 50)
}

function loadFromEditor() {
  const raw = sessionStorage.getItem(MC_STORAGE_KEY)
  if (!raw) return false
  try {
    const payload = JSON.parse(raw)
    const fields = deserializeMonteCarloPayload(payload)
    closedMin.value = fields.closedMin
    closedMax.value = fields.closedMax
    toleranceList.value = fields.toleranceList
    sizeList.value = fields.sizeList
    typeList.value = fields.typeList
    distribution.value = fields.distribution
    customK.value = fields.customK
    iterations.value = fields.iterations
    sourceTypeName.value = fields.typeName ?? ''
    sessionStorage.removeItem(MC_STORAGE_KEY)
    ElMessage.success('已从尺寸链编辑器加载数据')
    return true
  } catch {
    return false
  }
}

onMounted(() => {
  iterations.value = getSettings().mcIterations
  if (route.query.from === 'editor') {
    loadFromEditor()
  }
})

function loadGearCase() {
  closedMin.value = 0.1
  closedMax.value = 0.35
  toleranceList.value = '0.06,0.05,0.04'
  sizeList.value = '40,15,55.25'
  typeList.value = 'dec,dec,inc'
  distribution.value = 'normal'
  ElMessage.info('已加载齿轮案例参数')
}
</script>
