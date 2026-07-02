<template>
  <div>
    <h1 class="page-title">公差分配优化</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">
      给定封闭环 RSS 目标公差，将公差合理分配到各组成环（等贡献 / 等公差 / 比例 / 最小成本）
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
              <el-form-item v-if="methodId === 'min-cost'" label="成本系数">
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
            <dd class="mt-1 font-mono text-lg">{{ result.verify.stacked.toFixed(4) }} mm</dd>
          </div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">目标公差</dt>
            <dd class="mt-1 font-mono text-lg">{{ targetTolerance.toFixed(4) }} mm</dd>
          </div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">利用率</dt>
            <dd
              class="mt-1 font-mono text-lg"
              :class="result.verify.pass ? 'text-success' : 'text-error'"
            >
              {{ result.verify.utilization.toFixed(1) }}%
              {{ result.verify.pass ? '✓' : '✗' }}
            </dd>
          </div>
        </div>
        <el-empty v-else description="设置参数后点击「计算分配」" />

        <el-table v-if="result" :data="result.allocated" border class="mt-4">
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
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ALLOCATION_METHODS, runToleranceAllocation } from '@/utils/tolerance-allocation'
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

const methodOptions = Object.values(ALLOCATION_METHODS)
const currentMethodDesc = computed(() => ALLOCATION_METHODS[methodId.value]?.desc ?? '')
const needsSensitivity = computed(
  () => methodId.value === 'sensitivity' || methodId.value === 'sensitivity-iter',
)

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
  result.value = runToleranceAllocation(methodId.value, targetTolerance.value, rings.value)
}

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
