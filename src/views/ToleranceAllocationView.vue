<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pt('sectionParams') }}</h2>
        <el-form label-width="120px">
          <el-form-item :label="pf('targetRss')">
            <el-input-number v-model="targetTolerance" :min="0.001" :precision="4" :step="0.01" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </el-form-item>
          <el-form-item :label="pf('method')">
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

        <h3 class="mb-2 text-sm font-medium">{{ pt('sectionRings') }}</h3>
        <div class="space-y-3">
          <div
            v-for="(ring, i) in rings"
            :key="i"
            class="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-medium">{{ pt('ringN', { n: i + 1 }) }}</span>
              <el-button
                v-if="rings.length > 2"
                type="danger"
                link
                size="small"
                @click="removeRing(i)"
              >
                {{ fc('delete') }}
              </el-button>
            </div>
            <el-form label-width="80px" size="small">
              <el-form-item :label="pf('name')">
                <el-input v-model="ring.name" />
              </el-form-item>
              <el-form-item :label="pf('factor')">
                <el-input-number v-model="ring.factor" :min="0" :max="10" :precision="2" :step="0.1" />
              </el-form-item>
              <el-form-item :label="pf('nominal')">
                <el-input-number v-model="ring.nominal" :min="0.001" :precision="3" :step="1" />
              </el-form-item>
              <el-form-item v-if="methodId === 'min-cost' || isAdvancedMethod" :label="pf('cost')">
                <el-input-number v-model="ring.cost" :min="0.1" :precision="2" :step="0.5" />
              </el-form-item>
              <el-form-item v-if="needsSensitivity" :label="pf('sensitivity')">
                <el-input-number v-model="ring.sensitivity" :min="0.001" :precision="3" :step="0.1" />
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <el-button plain :disabled="rings.length >= 20" @click="addRing">{{ pt('addRing') }}</el-button>
          <el-button type="primary" @click="run">{{ pt('run') }}</el-button>
          <el-button @click="loadSample">{{ pt('loadSample') }}</el-button>
          <el-button v-if="result" plain @click="applyToEditor">{{ pt('applyEditor') }}</el-button>
        </div>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pt('sectionResults') }}</h2>
        <div v-if="result" class="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">{{ pr('method') }}</dt>
            <dd class="mt-1 font-medium">{{ methodLabel(result.methodId) }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">{{ pr('rssVerify') }}</dt>
            <dd class="mt-1 font-mono text-lg">{{ displayVerify.stacked.toFixed(4) }} mm</dd>
          </div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">{{ pr('target') }}</dt>
            <dd class="mt-1 font-mono text-lg">{{ targetTolerance.toFixed(4) }} mm</dd>
          </div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">{{ pr('utilization') }}</dt>
            <dd
              class="mt-1 font-mono text-lg"
              :class="displayVerify.pass ? 'text-success' : 'text-error'"
            >
              {{ displayVerify.utilization.toFixed(1) }}%
              {{ displayVerify.pass ? '✓' : '✗' }}
            </dd>
          </div>
          <div v-if="result.totalCost != null" class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">{{ pr('totalCost') }}</dt>
            <dd class="mt-1 font-mono text-lg">{{ result.totalCost.toFixed(2) }}</dd>
          </div>
        </div>
        <el-empty v-else-if="!paretoResult?.pareto?.length" :description="pt('emptyHint')" />

        <el-table v-if="result?.allocated" :data="result.allocated" border class="mt-4">
          <el-table-column prop="name" :label="pr('ring')" min-width="100" />
          <el-table-column :label="pf('factor')" width="90">
            <template #default="{ row }">{{ row.factor }}</template>
          </el-table-column>
          <el-table-column :label="pr('allocatedTol')" width="120">
            <template #default="{ row }">{{ row.tolerance.toFixed(4) }}</template>
          </el-table-column>
          <el-table-column :label="pr('halfTol')" width="100">
            <template #default="{ row }">{{ (row.tolerance / 2).toFixed(4) }}</template>
          </el-table-column>
        </el-table>

        <section v-if="paretoResult?.pareto?.length" class="mt-6">
          <h3 class="mb-3 font-semibold">{{ pt('sectionPareto') }}</h3>
          <p class="mb-2 text-xs text-gray-500">{{ pt('paretoHint', { count: paretoResult.pareto.length }) }}</p>
          <el-table
            :data="paretoResult.pareto"
            border
            size="small"
            highlight-current-row
            @row-click="applyPareto"
          >
            <el-table-column prop="id" label="#" width="50" />
            <el-table-column :label="pr('rssMm')">
              <template #default="{ row }">{{ row.stacked.toFixed(4) }}</template>
            </el-table-column>
            <el-table-column :label="pr('utilization')">
              <template #default="{ row }">{{ (row.utilization * 100).toFixed(1) }}%</template>
            </el-table-column>
            <el-table-column :label="pr('costIndex')">
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
import { useCalcPage } from '@/composables/useCalcPage'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useDemoData } from '@/composables/useDemoData'

const router = useRouter()
const { pt, pf, pr, fc, locale } = useCalcPage('allocation')
const { ol, optionEntries } = useOptionsI18n()
const { demo } = useDemoData()

const targetTolerance = ref(0.1)
const methodId = ref('equal-effect')
const rings = ref([])
const result = ref(null)
const paretoResult = ref(null)
const paretoChartRef = ref(null)
let plotly = null

const methodOptions = computed(() =>
  optionEntries({ ...ALLOCATION_METHODS, genetic: { id: 'genetic' }, pareto: { id: 'pareto' } }, 'allocationMethods'),
)

function methodLabel(id) {
  if (id === 'pareto' && result.value?.method?.startsWith?.('Pareto')) {
    const match = result.value.method.match(/#(\d+)/)
    if (match) return pt('paretoSolution', { id: match[1] })
  }
  return ol('allocationMethods', id)
}

const currentMethodDesc = computed(() => ol('allocationMethods', methodId.value, 'desc'))

const isAdvancedMethod = computed(() => methodId.value === 'genetic' || methodId.value === 'pareto')
const needsSensitivity = computed(
  () => methodId.value === 'sensitivity' || methodId.value === 'sensitivity-iter',
)

const displayVerify = computed(() => result.value?.verify ?? { stacked: 0, pass: false, utilization: 0 })

function addRing() {
  rings.value.push({
    name: `${pr('ring')} ${rings.value.length + 1}`,
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
  rings.value = demo.value.allocation.sampleRings.map((r) => ({ ...r }))
  run()
}

watch(locale, loadSample)

function run() {
  if (rings.value.length < 2) {
    ElMessage.warning(pt('needMinRings'))
    return
  }
  paretoResult.value = null
  result.value = null

  if (methodId.value === 'genetic') {
    const ga = geneticAlgorithmAllocation(targetTolerance.value, rings.value)
    result.value = {
      method: ol('allocationMethods', 'genetic'),
      methodId: 'genetic',
      allocated: ga.allocated,
      verify: ga.verify,
      totalCost: ga.totalCost,
    }
    ElMessage.success(ga.feasible ? pt('gaConverged') : pt('gaApprox'))
    return
  }

  if (methodId.value === 'pareto') {
    paretoResult.value = multiObjectivePareto(targetTolerance.value, rings.value)
    if (paretoResult.value.pareto.length) {
      applyPareto(paretoResult.value.pareto[0])
      renderParetoChart()
    } else {
      ElMessage.warning(pt('noPareto'))
    }
    return
  }

  const alloc = runToleranceAllocation(methodId.value, targetTolerance.value, rings.value)
  result.value = { ...alloc, methodId: alloc.methodId ?? methodId.value }
}

function applyPareto(row) {
  result.value = {
    method: pt('paretoSolution', { id: row.id }),
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
      title: pt('chartParetoTitle'),
      xaxis: { title: pt('chartCostX') },
      yaxis: { title: pt('chartUtilY') },
      height: 300,
      margin: { t: 40, l: 56, r: 24, b: 48 },
    },
    { responsive: true, displayModeBar: false },
  )
}

watch([paretoResult, locale], () => {
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
        name: demo.value.allocation.closedRingName,
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
  ElMessage.success(pt('appliedEditor'))
  router.push({ name: 'editor', query: { case: 'allocation' } })
}

loadSample()
</script>
