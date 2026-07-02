<template>
  <div>
    <div class="mb-4 flex items-center gap-4">
      <el-button text @click="router.push('/')">
        <el-icon><ArrowLeft /></el-icon>
        首页
      </el-button>
      <h1 class="page-title !mb-0">尺寸链分析</h1>
    </div>

    <StepProgress :current-step="currentStep" />

    <!-- 步骤 1：选择类型 -->
    <section v-show="currentStep === 1" class="card-panel">
      <h2 class="mb-4 text-lg font-semibold">步骤 1：选择类型</h2>
      <el-tabs v-model="activeGroup">
        <el-tab-pane
          v-for="group in ANALYSIS_GROUPS"
          :key="group.id"
          :label="group.label"
          :name="group.id"
        >
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              v-for="type in group.types"
              :key="type.id"
              class="rounded-lg border-2 p-4 text-left transition-all"
              :class="
                selectedType?.id === type.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/50'
              "
              :title="type.desc"
              @click="selectType(type, group)"
            >
              <p class="font-medium">{{ type.name }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ type.desc }}</p>
            </button>
          </div>
        </el-tab-pane>
      </el-tabs>
      <p v-if="selectedType" class="mt-4 text-sm text-success">
        ✓ 已选择：{{ selectedType.groupLabel }} → {{ selectedType.name }}
      </p>
      <div class="mt-6 flex justify-end">
        <el-button type="primary" :disabled="!selectedType" @click="nextStep">
          下一步 →
        </el-button>
      </div>
    </section>

    <!-- 步骤 2：定义封闭环 -->
    <section v-show="currentStep === 2" class="card-panel">
      <h2 class="mb-4 text-lg font-semibold">步骤 2：定义封闭环</h2>
      <el-form label-width="120px" class="max-w-xl">
        <el-form-item label="名称" required>
          <el-input v-model="closedRing.name" placeholder="如：间隙 L0" maxlength="50" />
        </el-form-item>
        <el-form-item label="最小值 (mm)" required>
          <el-input-number v-model="closedRing.min" :precision="2" :step="0.01" />
        </el-form-item>
        <el-form-item label="最大值 (mm)" required>
          <el-input-number v-model="closedRing.max" :precision="2" :step="0.01" />
        </el-form-item>
        <el-form-item label="公差">
          <span>{{ closedRingTolerance.toFixed(2) }} mm（自动计算）</span>
        </el-form-item>
        <el-form-item label="方向">
          <el-radio-group v-model="closedRing.direction">
            <el-radio-button label="left">←</el-radio-button>
            <el-radio-button label="up">↑</el-radio-button>
            <el-radio-button label="right">→</el-radio-button>
            <el-radio-button label="down">↓</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="单位">
          <el-radio-group v-model="closedRing.unit">
            <el-radio label="mm">mm</el-radio>
            <el-radio label="inch">inch</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div class="mt-6 flex justify-between">
        <el-button @click="clearClosedRing">清除</el-button>
        <div class="flex gap-2">
          <el-button @click="prevStep">← 返回</el-button>
          <el-button type="primary" :disabled="!isClosedRingValid" @click="nextStep">
            下一步 →
          </el-button>
        </div>
      </div>
    </section>

    <!-- 步骤 3：组成环 -->
    <section v-show="currentStep === 3" class="card-panel">
      <h2 class="mb-4 text-lg font-semibold">步骤 3：添加组成环</h2>
      <el-button type="primary" plain :disabled="componentRings.length >= 50" @click="addRing">
        + 添加组成环
      </el-button>
      <p v-if="componentRings.length >= 50" class="mt-2 text-sm text-warning">
        已达最大数量（50）
      </p>

      <el-table :data="componentRings" class="mt-4" empty-text="请添加组成环">
        <el-table-column label="#" width="50">
          <template #default="{ $index }">{{ $index + 1 }}</template>
        </el-table-column>
        <el-table-column label="名称" min-width="120">
          <template #default="{ row }">
            <el-input v-model="row.name" placeholder="如：挡环厚度" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="尺寸 (mm)" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.size" :precision="2" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="公差 (mm)" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.tolerance" :precision="2" :min="0" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="传递系数" width="100">
          <template #default="{ row }">
            <el-input-number v-model="row.factor" :min="0" :max="10" :step="0.1" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'increasing' ? '' : 'success'" size="small">
              {{ row.type === 'increasing' ? '增环' : '减环' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="" width="60">
          <template #default="{ $index }">
            <el-button type="danger" text @click="removeRing($index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-6 flex justify-between">
        <el-button @click="clearRings">清空列表</el-button>
        <div class="flex gap-2">
          <el-button @click="prevStep">← 返回</el-button>
          <el-button type="primary" :disabled="!componentRings.length" @click="nextStep">
            下一步 →
          </el-button>
        </div>
      </div>
    </section>

    <!-- 步骤 4：选择方法 -->
    <section v-show="currentStep === 4" class="card-panel">
      <h2 class="mb-4 text-lg font-semibold">步骤 4：选择计算方法</h2>
      <el-radio-group v-model="method" class="flex flex-col gap-4">
        <el-radio value="worst" border class="!mr-0 !h-auto !p-4">
          <div>
            <p class="font-medium">极值法（最坏情况）</p>
            <p class="text-sm text-gray-500">公式：T = ΣT · 保守，100% 安全</p>
          </div>
        </el-radio>
        <el-radio value="rss" border class="!mr-0 !h-auto !p-4">
          <div>
            <p class="font-medium">RSS 法（概率法）</p>
            <p class="text-sm text-gray-500">公式：T = √(ΣT²) · 合理，95% 合格</p>
          </div>
        </el-radio>
      </el-radio-group>
      <div class="mt-6 flex justify-end gap-2">
        <el-button @click="prevStep">← 返回</el-button>
        <el-button type="primary" @click="nextStep">下一步 →</el-button>
      </div>
    </section>

    <!-- 步骤 5：结果 -->
    <section v-show="currentStep === 5" class="card-panel">
      <h2 class="mb-4 text-lg font-semibold">步骤 5：查看结果</h2>

      <SizeChainCanvas
        :closed-ring="closedRing"
        :component-rings="componentRings"
        class="mb-6"
      />

      <div class="mb-6 rounded-lg bg-gray-50 p-4 font-mono text-sm">
        <p v-for="(line, i) in formulaLines" :key="i">{{ line }}</p>
      </div>

      <el-table :data="resultTable" border class="mb-6">
        <el-table-column prop="method" label="方法" />
        <el-table-column prop="tolerance" label="总公差" />
        <el-table-column prop="upper" label="上限" />
        <el-table-column prop="lower" label="下限" />
        <el-table-column prop="pass" label="合格">
          <template #default="{ row }">
            <span :class="row.pass ? 'text-success' : 'text-error'">
              {{ row.pass ? '✓ 合格' : '✗ 不合格' }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex flex-wrap gap-2">
        <el-button @click="resetAll">← 重置</el-button>
        <el-button type="primary" @click="saveResult">💾 保存</el-button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import StepProgress from '@/components/editor/StepProgress.vue'
import SizeChainCanvas from '@/components/editor/SizeChainCanvas.vue'
import { ANALYSIS_GROUPS, findAnalysisType } from '@/constants/analysis-types'
import { calculateSizeChain, worstCaseMethod, rssMethod } from '@/utils/size-chain'
import { getAnalysisById, saveAnalysis } from '@/utils/storage'

const route = useRoute()
const router = useRouter()

const currentStep = ref(1)
const activeGroup = ref('1d')
const selectedType = ref(null)
const method = ref('rss')

const closedRing = ref({
  name: '',
  min: null,
  max: null,
  direction: 'right',
  unit: 'mm',
})

const componentRings = ref([])

const closedRingTolerance = computed(() => {
  if (closedRing.value.min == null || closedRing.value.max == null) return 0
  return closedRing.value.max - closedRing.value.min
})

const isClosedRingValid = computed(
  () =>
    closedRing.value.name.trim() &&
    closedRing.value.min != null &&
    closedRing.value.max != null &&
    closedRing.value.max > closedRing.value.min,
)

const worstResult = computed(() =>
  calculateSizeChain(
    { min: closedRing.value.min, max: closedRing.value.max },
    componentRings.value,
    'worst',
  ),
)

const rssResult = computed(() =>
  calculateSizeChain(
    { min: closedRing.value.min, max: closedRing.value.max },
    componentRings.value,
    'rss',
  ),
)

const resultTable = computed(() => [
  {
    method: '极值法',
    tolerance: worstResult.value.totalTolerance.toFixed(3),
    upper: worstResult.value.upper.toFixed(3),
    lower: worstResult.value.lower.toFixed(3),
    pass: worstResult.value.pass,
  },
  {
    method: 'RSS 法',
    tolerance: rssResult.value.totalTolerance.toFixed(3),
    upper: rssResult.value.upper.toFixed(3),
    lower: rssResult.value.lower.toFixed(3),
    pass: rssResult.value.pass,
  },
])

const formulaLines = computed(() => {
  const rings = componentRings.value
  if (!rings.length) return ['请添加组成环']
  const inc = rings.filter((r) => r.type === 'increasing')
  const dec = rings.filter((r) => r.type !== 'increasing')
  const incSum = inc.reduce((s, r) => s + r.size, 0)
  const decSum = dec.reduce((s, r) => s + r.size, 0)
  const nominal = incSum - decSum
  const tol = method.value === 'worst' ? worstCaseMethod(rings) : rssMethod(rings)
  return [
    `${closedRing.value.name || 'L0'} = ${inc.map((r) => r.name).join(' + ') || '0'} - (${dec.map((r) => r.name).join(' + ') || '0'})`,
    `  = ${incSum} - ${decSum}`,
    `  = ${nominal.toFixed(2)} mm`,
    `总公差 (${method.value === 'worst' ? '极值法' : 'RSS'}) = ${tol.toFixed(3)} mm`,
  ]
})

onMounted(() => {
  const typeId = route.query.type
  if (typeId) {
    const type = findAnalysisType(typeId)
    if (type) {
      selectedType.value = type
      activeGroup.value = type.groupId
    }
  }
  const id = route.params.id
  if (id) loadFromHistory(id)
})

watch(
  () => route.params.id,
  (id) => {
    if (id) loadFromHistory(id)
  },
)

function loadFromHistory(id) {
  const record = getAnalysisById(id)
  if (!record?.data) return
  const d = record.data
  if (d.selectedType) selectedType.value = d.selectedType
  if (d.closedRing) closedRing.value = { ...closedRing.value, ...d.closedRing }
  if (d.componentRings) componentRings.value = d.componentRings
  if (d.method) method.value = d.method
  if (d.currentStep) currentStep.value = d.currentStep
}

function selectType(type, group) {
  selectedType.value = { ...type, groupId: group.id, groupLabel: group.label }
}

function nextStep() {
  if (currentStep.value < 5) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

function clearClosedRing() {
  closedRing.value = { name: '', min: null, max: null, direction: 'right', unit: 'mm' }
}

function addRing() {
  const index = componentRings.value.length
  componentRings.value.push({
    name: `环 ${index + 1}`,
    size: 0,
    tolerance: 0.05,
    factor: 1,
    type: index % 2 === 0 ? 'decreasing' : 'increasing',
  })
}

function removeRing(index) {
  componentRings.value.splice(index, 1)
}

function clearRings() {
  componentRings.value = []
}

function resetAll() {
  currentStep.value = 1
  selectedType.value = null
  method.value = 'rss'
  clearClosedRing()
  clearRings()
}

function saveResult() {
  const title = `${selectedType.value?.name ?? '分析'} ${closedRing.value.name || 'L0'}`
  const entry = saveAnalysis({
    title,
    status: rssResult.value.pass ? 'pass' : 'fail',
    data: {
      selectedType: selectedType.value,
      closedRing: closedRing.value,
      componentRings: componentRings.value,
      method: method.value,
      currentStep: currentStep.value,
      results: { worst: worstResult.value, rss: rssResult.value },
    },
  })
  ElMessage.success('已保存到本地')
  router.replace({ name: 'editor-detail', params: { id: entry.id } })
}
</script>
