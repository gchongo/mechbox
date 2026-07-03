<template>
  <div>
    <h1 class="page-title">公差分配优化</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">
      给定封闭环 RSS 目标公差，将公差合理分配到各组成环（解析法 / 遗传算法 / 多目标 Pareto）
    </p>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">分配参数</h2>
        <el-form label-width="120px">
          <el-form-item label="目标 RSS 公差">
            <el-input-number v-model="targetTolerance" :min="0.001" :precision="4" :step="0.01" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </el-form-item>
          <el-form-item label="分配方法">
            <el-select v-model="methodId" class="w-full">
              <el-option
                v-for="m in methodOptions"
                :key="m.id"
                :label="m.label"
                :value="m.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <p class="mb-4 text-xs text-gray-500">{{ currentMethodDesc }}</p>

        <h3 class="mb-2 text-sm font-medium">组成环</h3>
        <div class="space-y-3">
          <div
            v-for="(ring, i) in rings"
            :key="i"
            class="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-medium">环 {{ i + 1 }}</span>
              <el-button
                v-if="rings.length > 2"
                type="danger"
                link
                size="small"
                @click="removeRing(i)"
              >
                删除
              </el-button>
            </div>
            <el-form label-width="80px" size="small">
              <el-form-item label="名称">
                <el-input v-model="ring.name" />
              </el-form-item>
              <el-form-item label="传递系数">
                <el-input-number v-model="ring.factor" :min="0" :max="10" :precision="2" :step="0.1" />
              </el-form-item>
              <el-form-item label="名义尺寸">
                <el-input-number v-model="ring.nominal" :min="0.001" :precision="3" :step="1" />
              </el-form-item>
              <el-form-item v-if="methodId === 'min-cost' || isAdvancedMethod" label="成本系数">
                <el-input-number v-model="ring.cost" :min="0.1" :precision="2" :step="0.5" />
              </el-form-item>
              <el-form-item v-if="needsSensitivity" label="灵敏度 s">
                <el-input-number v-model="ring.sensitivity" :min="0.001" :precision="3" :step="0.1" />
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <el-button plain :disabled="rings.length >= 20" @click="addRing">+ 添加环</el-button>
          <el-button type="primary" @click="run">计算分配</el-button>
          <el-button @click="loadSample">加载示例</el-button>
          <el-button
            v-if="result"
            plain
            @click="applyToEditor"
          >
            应用到编辑器
          </el-button>
        </div>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">分配结果</h2>
        <div v-if="result" class="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">分配方法</dt>
            <dd class="mt-1 font-medium">{{ result.method }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">RSS 验算</dt>
            <dd class="mt-1 font-mono text-lg">{{ displayVerify.stacked.toFixed(4) }} mm</dd>
          </div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">目标公差</dt>
            <dd class="mt-1 font-mono text-lg">{{ targetTolerance.toFixed(4) }} mm</dd>
          </div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">利用率</dt>
            <dd
              class="mt-1 font-mono text-lg"
              :class="displayVerify.pass ? 'text-success' : 'text-error'"
            >
              {{ displayVerify.utilization.toFixed(1) }}%
              {{ displayVerify.pass ? '✓' : '✗' }}
            </dd>
          </div>
          <div v-if="result.totalCost != null" class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">总成本指数</dt>
            <dd class="mt-1 font-mono text-lg">{{ result.totalCost.toFixed(2) }}</dd>
          </div>
        </div>
        <el-empty v-else-if="!paretoResult?.pareto?.length" description="设置参数后点击「计算分配」" />

        <el-table v-if="result?.allocated" :data="result.allocated" border class="mt-4">
          <el-table-column prop="name" label="组成环" min-width="100" />
          <el-table-column label="传递系数" width="90">
            <template #default="{ row }">{{ row.factor }}</template>
          </el-table-column>
          <el-table-column label="分配公差 (mm)" width="120">
            <template #default="{ row }">{{ row.tolerance.toFixed(4) }}</template>
          </el-table-column>
          <el-table-column label="± 半公差" width="100">
            <template #default="{ row }">{{ (row.tolerance / 2).toFixed(4) }}</template>
          </el-table-column>
        </el-table>

        <section v-if="paretoResult?.pareto?.length" class="mt-6">
          <h3 class="mb-3 font-semibold">Pareto 前沿（成本 vs 利用率）</h3>
          <p class="mb-2 text-xs text-gray-500">共 {{ paretoResult.pareto.length }} 个非支配解，点击行应用</p>
          <el-table
            :data="paretoResult.pareto"
            border
            size="small"
            highlight-current-row
            @row-click="applyPareto"
          >
            <el-table-column prop="id" label="#" width="50" />
            <el-table-column label="RSS (mm)">
              <template #default="{ row }">{{ row.stacked.toFixed(4) }}</template>
            </el-table-column>
            <el-table-column label="利用率">
              <template #default="{ row }">{{ (row.utilization * 100).toFixed(1) }}%</template>
            </el-table-column>
            <el-table-column label="成本指数">
              <template #default="{ row }">{{ row.cost.toFixed(2) }}</template>
            </el-table-column>
          </el-table>
          <div ref="paretoChartRef" class="mt-4 min-h-[300px]" />
        </section>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ALLOCATION_METHODS, runToleranceAllocation } from '@/utils/tolerance-allocation'
import { geneticAlgorithmAllocation, multiObjectivePareto } from '@/utils/tolerance-optimization'
import { CASE_STORAGE_KEY } from '@/constants/cases'
import { findAnalysisType } from '@/constants/analysis-types'

const router = useRouter()

const targetTolerance = ref(0.1)
const methodId = ref('equal-effect')
const rings = ref([
  { name: '挡环厚度', factor: 1, nominal: 40, cost: 1, sensitivity: 1 },
  { name: '齿轮宽度', factor: 1, nominal: 15, cost: 1.2, sensitivity: 1 },
  { name: '轴径', factor: 1, nominal: 55, cost: 2, sensitivity: 1 },
])
const result = ref(null)
const paretoResult = ref(null)
const paretoChartRef = ref(null)
let plotly = null

const ADVANCED_METHODS = {
  genetic: {
    id: 'genetic',
    label: '遗传算法（最小成本）',
    desc: '在 RSS ≤ 目标约束下最小化制造成本指数',
  },
  pareto: {
    id: 'pareto',
    label: '多目标 Pareto',
    desc: '成本与 RSS 利用率权衡，展示非支配解集',
  },
}

const methodOptions = computed(() => [
  ...Object.values(ALLOCATION_METHODS),
  ...Object.values(ADVANCED_METHODS),
])

const currentMethodDesc = computed(() => {
  if (ADVANCED_METHODS[methodId.value]) return ADVANCED_METHODS[methodId.value].desc
  return ALLOCATION_METHODS[methodId.value]?.desc ?? ''
})

const isAdvancedMethod = computed(() => methodId.value === 'genetic' || methodId.value === 'pareto')
const needsSensitivity = computed(
  () => methodId.value === 'sensitivity' || methodId.value === 'sensitivity-iter',
)

const displayVerify = computed(() => result.value?.verify ?? { stacked: 0, pass: false, utilization: 0 })

function addRing() {
  rings.value.push({
    name: `环 ${rings.value.length + 1}`,
    factor: 1,
    nominal: 10,
    cost: 1,
    sensitivity: 1,
  })
}

function removeRing(index) {
  rings.value.splice(index, 1)
}

function loadSample() {
  targetTolerance.value = 0.1
  methodId.value = 'equal-effect'
  rings.value = [
    { name: '挡环厚度', factor: 1, nominal: 40, cost: 1, sensitivity: 1 },
    { name: '齿轮宽度', factor: 1, nominal: 15, cost: 1.5, sensitivity: 1.2 },
    { name: '轴径', factor: 1, nominal: 55.25, cost: 2.5, sensitivity: 0.8 },
  ]
  run()
}

function run() {
  if (rings.value.length < 2) {
    ElMessage.warning('至少需要 2 个组成环')
    return
  }
  paretoResult.value = null
  result.value = null

  if (methodId.value === 'genetic') {
    const ga = geneticAlgorithmAllocation(targetTolerance.value, rings.value)
    result.value = {
      method: ADVANCED_METHODS.genetic.label,
      methodId: 'genetic',
      allocated: ga.allocated,
      verify: ga.verify,
      totalCost: ga.totalCost,
    }
    ElMessage.success(ga.feasible ? '遗传算法收敛' : '未找到完全可行解，显示最优近似')
    return
  }

  if (methodId.value === 'pareto') {
    paretoResult.value = multiObjectivePareto(targetTolerance.value, rings.value)
    if (paretoResult.value.pareto.length) {
      applyPareto(paretoResult.value.pareto[0])
      renderParetoChart()
    } else {
      ElMessage.warning('未找到可行 Pareto 解，请放宽成本或目标公差')
    }
    return
  }

  result.value = runToleranceAllocation(methodId.value, targetTolerance.value, rings.value)
}

function applyPareto(row) {
  result.value = {
    method: 'Pareto 解 #' + row.id,
    methodId: 'pareto',
    allocated: row.allocated,
    verify: {
      stacked: row.stacked,
      pass: row.stacked <= targetTolerance.value + 1e-9,
      utilization: targetTolerance.value > 0 ? (row.stacked / targetTolerance.value) * 100 : 0,
    },
    totalCost: row.cost,
  }
}

async function renderParetoChart() {
  if (!paretoChartRef.value || !paretoResult.value?.pareto?.length) return
  if (!plotly) plotly = await import('plotly.js-dist-min')
  const pts = paretoResult.value.pareto
  await plotly.react(
    paretoChartRef.value,
    [{
      x: pts.map((p) => p.cost),
      y: pts.map((p) => p.utilization * 100),
      text: pts.map((p) => `#${p.id}`),
      type: 'scatter',
      mode: 'markers+text',
      textposition: 'top center',
      marker: { size: 10, color: '#409EFF' },
    }],
    {
      title: 'Pareto 前沿',
      xaxis: { title: '成本指数（越低越好）' },
      yaxis: { title: 'RSS 利用率 %（越高越好）' },
      height: 300,
      margin: { t: 40, l: 56, r: 24, b: 48 },
    },
    { responsive: true, displayModeBar: false },
  )
}

watch(paretoResult, () => {
  if (paretoResult.value?.pareto?.length) renderParetoChart()
})

onBeforeUnmount(() => {
  if (paretoChartRef.value && plotly) plotly.purge(paretoChartRef.value)
})

function applyToEditor() {
  if (!result.value) return
  const type = findAnalysisType('gear-gap')
  const closedDirection = 'right'
  const componentRings = result.value.allocated.map((row, i) => {
    const direction = i % 2 === 0 ? 'left' : closedDirection
    return {
      uid: crypto.randomUUID(),
      name: row.name,
      size: rings.value[i]?.nominal ?? 0,
      tolerance: row.tolerance,
      factor: row.factor,
      direction,
      type: direction === closedDirection ? 'increasing' : 'decreasing',
    }
  })
  sessionStorage.setItem(
    CASE_STORAGE_KEY,
    JSON.stringify({
      selectedType: type,
      activeGroup: type?.groupId ?? '1d',
      closedRing: {
        name: '间隙 L0',
        min: 0.1,
        max: 0.35,
        direction: closedDirection,
        unit: 'mm',
      },
      componentRings,
      method: 'rss',
      currentStep: 3,
    }),
  )
  ElMessage.success('已载入编辑器，请继续完善组成环')
  router.push({ name: 'editor', query: { case: 'allocation' } })
}

loadSample()
</script>
