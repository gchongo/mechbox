<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-6 text-gray-600">{{ pt('subtitle') }}</p>

    <el-alert
      v-if="sourceTypeName"
      class="mb-4"
      type="success"
      :closable="false"
      show-icon
      :title="pt('importedTitle', { name: sourceTypeName })"
      :description="pt('importedDesc')"
    />

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- 输入 -->
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pt('sectionParams') }}</h2>
        <el-form label-width="120px">
          <el-form-item :label="pf('closedMin')">
            <el-input-number v-model="closedMin" :precision="3" :step="0.01" />
          </el-form-item>
          <el-form-item :label="pf('closedMax')">
            <el-input-number v-model="closedMax" :precision="3" :step="0.01" />
          </el-form-item>
          <el-form-item :label="pf('toleranceList')">
            <el-input v-model="toleranceList" placeholder="0.06,0.05,0.04" />
          </el-form-item>
          <el-form-item :label="pf('sizeList')">
            <el-input v-model="sizeList" :placeholder="pf('sizeListPh')" />
          </el-form-item>
          <el-form-item :label="pf('typeList')">
            <el-input v-model="typeList" :placeholder="pf('typeListPh')" />
          </el-form-item>>
          <el-form-item :label="pf('distribution')">
            <el-select v-model="distribution" class="w-full">
              <el-option
                v-for="(d, k) in distributions"
                :key="k"
                :label="d.label"
                :value="k"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="pf('customK')">
            <el-input-number v-model="customK" :min="0" :precision="2" :step="0.1" />
            <span class="ml-2 text-xs text-gray-400">{{ pf('customKHint') }}</span>
          </el-form-item>
          <el-form-item :label="pf('iterations')">
            <el-input-number v-model="iterations" :min="1000" :max="100000" :step="1000" />
          </el-form-item>
          <el-button type="primary" :loading="running" @click="runSimulation">
            {{ pt('runSimulation') }}
          </el-button>
          <el-button class="ml-2" @click="loadGearCase">{{ pt('loadGearCase') }}</el-button>
        </el-form>
      </section>

      <!-- 结果统计 -->
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pt('sectionResults') }}</h2>
        <div v-if="simResult" class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">{{ pr('mean') }}</dt>
            <dd class="mt-1 font-mono text-lg">{{ simResult.mean.toFixed(4) }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">{{ pr('std') }}</dt>
            <dd class="mt-1 font-mono text-lg">{{ simResult.std.toFixed(4) }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">{{ pr('min') }}</dt>
            <dd class="mt-1 font-mono text-lg">{{ simResult.min.toFixed(4) }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">{{ pr('max') }}</dt>
            <dd class="mt-1 font-mono text-lg">{{ simResult.max.toFixed(4) }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">{{ pr('percentiles') }}</dt>
            <dd class="mt-1 font-mono text-sm">
              {{ simResult.p05.toFixed(3) }} / {{ simResult.p50.toFixed(3) }} /
              {{ simResult.p95.toFixed(3) }}
            </dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">{{ pr('passRate') }}</dt>
            <dd class="mt-1 font-mono text-lg text-success">
              {{ (simResult.passRate * 100).toFixed(2) }}%
            </dd>
          </div>
        </div>
        <el-empty v-else :description="pt('emptyRun')" />
      </section>
    </div>

    <!-- 图表 -->
    <section v-if="simResult" class="card-panel mt-6">
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <h2 class="font-semibold">{{ pt('sectionChart') }}</h2>
        <el-radio-group v-model="chartType" size="small">
          <el-radio-button value="histogram">{{ pt('chartHistogram') }}</el-radio-button>
          <el-radio-button value="cdf">{{ pt('chartCdf') }}</el-radio-button>
          <el-radio-button value="scatter">{{ pt('chartScatter') }}</el-radio-button>
          <el-radio-button value="box">{{ pt('chartBox') }}</el-radio-button>
        </el-radio-group>
        <el-button size="small" @click="exportChartPng">{{ pt('exportPng') }}</el-button>
      </div>
      <MonteCarloChart
        ref="chartComponentRef"
        :results="simResult.results"
        :min="closedMin"
        :max="closedMax"
        :chart-type="chartType"
      />
    </section>
    <!-- 敏感度龙卷风图 -->
    <section v-if="simResult" class="card-panel mt-6">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="font-semibold">{{ pt('sectionSensitivity') }}</h2>
        <el-button size="small" :loading="sensitivityRunning" @click="runSensitivity">
          {{ sensitivityResult ? pt('reanalyze') : pt('analyzeSensitivity') }}
        </el-button>
      </div>
      <p class="mb-3 text-xs text-gray-500">
        {{ pt('sensitivityHint') }}
      </p>
      <template v-if="sensitivityResult">
        <TornadoChart
          :items="sensitivityResult.items"
          :closed-min="closedMin"
          :closed-max="closedMax"
        />
        <div class="mt-4 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700">
                <th class="py-2 pr-4">{{ pt('table.ring') }}</th>
                <th class="py-2 pr-4">{{ pt('table.tolerance') }}</th>
                <th class="py-2 pr-4">{{ pt('table.spread') }}</th>
                <th class="py-2">{{ pt('table.variance') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in sensitivityResult.items" :key="item.index" class="border-b border-gray-100 dark:border-gray-800">
                <td class="py-2 pr-4">{{ item.name }}</td>
                <td class="py-2 pr-4 font-mono">{{ item.tolerance }}</td>
                <td class="py-2 pr-4 font-mono">{{ item.spread.toFixed(4) }}</td>
                <td class="py-2 font-mono">{{ item.variancePct.toFixed(1) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import MonteCarloChart from '@/components/charts/MonteCarloChart.vue'
import TornadoChart from '@/components/charts/TornadoChart.vue'
import { DISTRIBUTIONS } from '@/utils/size-chain'
import { runMonteCarloSimulation, runSensitivityTornado } from '@/utils/monte-carlo'
import {
  MC_STORAGE_KEY,
  deserializeMonteCarloPayload,
} from '@/constants/editor-bridge'
import { getSettings } from '@/utils/settings'
import { useCalcPage } from '@/composables/useCalcPage'
import { useOptionsI18n } from '@/composables/useOptionsI18n'

const route = useRoute()
const { pt, pf, pr } = useCalcPage('monte-carlo')
const { optionMap } = useOptionsI18n()

const distributions = computed(() => optionMap(DISTRIBUTIONS, 'distributions'))

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
const sensitivityRunning = ref(false)
const sensitivityResult = ref(null)

const RING_MISMATCH = 'RING_MISMATCH'

async function exportChartPng() {
  if (!simResult.value) {
    ElMessage.warning(pt('msgRunFirst'))
    return
  }
  const ok = await chartComponentRef.value?.exportPng?.('monte-carlo-chart.png')
  if (ok) ElMessage.success(pt('msgPngOk'))
  else ElMessage.error(pt('msgExportFail'))
}

function parseList(str) {
  return str.split(/[,，\s]+/).filter(Boolean)
}

function buildRings() {
  const tolerances = parseList(toleranceList.value).map(Number)
  const sizes = parseList(sizeList.value).map(Number)
  const types = parseList(typeList.value)
  if (tolerances.length !== sizes.length || sizes.length !== types.length) {
    throw new Error(RING_MISMATCH)
  }
  return sizes.map((size, i) => ({
    name: pf('ringName', { n: i + 1 }),
    size,
    tolerance: tolerances[i],
    factor: 1,
    type: types[i].toLowerCase().startsWith('inc') ? 'increasing' : 'decreasing',
    direction: types[i].toLowerCase().startsWith('inc') ? 'right' : 'left',
  }))
}

function simErrorMessage(e, fallbackKey) {
  if (e?.message === RING_MISMATCH) return pt('msgRingMismatch')
  return e.message || pt(fallbackKey)
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
      sensitivityResult.value = null
      ElMessage.success(pt('msgSimDone', { n: iterations.value }))
    } catch (e) {
      ElMessage.error(simErrorMessage(e, 'msgSimFail'))
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
    ElMessage.success(pt('msgLoadedEditor'))
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
  ElMessage.info(pt('msgGearLoaded'))
}

function runSensitivity() {
  sensitivityRunning.value = true
  setTimeout(() => {
    try {
      const rings = buildRings()
      sensitivityResult.value = runSensitivityTornado({
        closedRing: { min: closedMin.value, max: closedMax.value },
        componentRings: rings,
        iterations: Math.min(iterations.value, 8000),
        distribution: distribution.value,
        customK: customK.value,
      })
      ElMessage.success(pt('msgSensitivityDone'))
    } catch (e) {
      ElMessage.error(simErrorMessage(e, 'msgSensitivityFail'))
    } finally {
      sensitivityRunning.value = false
    }
  }, 50)
}
</script>
