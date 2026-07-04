<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="calcMode" page-key="fatigue" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pf('materialAndStress') }}</h2>
        <el-form label-width="120px">
          <CalcFormItem :label="pf('material')">
            <el-select v-model="material" class="w-full" @change="markConfirmed('material')">
              <el-option v-for="(m, k) in snMaterials" :key="k" :label="m.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('stressAmplitude')">
            <el-input-number
              v-model="stressAmplitude"
              :min="saBounds.saMin"
              :max="saBounds.saMax"
              :precision="1"
              class="fatigue-sa-input"
              @change="markConfirmed('stressAmplitude')"
            />
            <span class="ml-2 text-sm text-gray-500">MPa</span>
            <p class="mt-1 text-xs text-gray-400">
              {{ pf('stressAmplitudeRange', { min: saBounds.saMin, max: displaySaMax }) }}
            </p>
          </CalcFormItem>
          <template v-if="calcMode === 'professional'">
            <CalcFormItem :label="pf('meanStress')">
              <el-input-number v-model="meanStress" :min="0" :precision="1" @change="markConfirmed('meanStress')" />
            </CalcFormItem>
            <CalcFormItem :label="pf('surfaceSizeFactor')">
              <el-input-number v-model="surfaceFactor" :min="0.5" :max="1" :step="0.05" :precision="2" class="w-28" @change="markConfirmed('surfaceFactor')" />
              <el-input-number v-model="sizeFactor" :min="0.5" :max="1" :step="0.05" :precision="2" class="ml-2 w-28" />
            </CalcFormItem>
          </template>
        </el-form>

        <FatigueDiagram
          :stress-amplitude="stressAmplitude"
          :endurance-limit="currentMaterial.enduranceLimit"
          :life="diagramLife"
          :sf="currentMaterial.sf"
          :b="currentMaterial.b"
          :cycle-limit="currentMaterial.cycleLimit ?? 1e6"
        />

        <p
          v-if="calcMode === 'professional' && result.effectiveAmplitude > stressAmplitude"
          class="mt-2 text-xs text-gray-500"
        >
          {{ pf('goodmanDiagramNote', { input: stressAmplitude, effective: result.effectiveAmplitude?.toFixed(1) }) }}
        </p>

        <div v-if="stressAmplitude > 0" class="rounded bg-gray-50 p-3 text-sm dark:bg-gray-900">
          <ResultLabel label-class="text-gray-500" :text="pf('estimatedLife')" />
          <dd class="mt-1 font-mono text-lg">{{ lifeDisplay }}</dd>
          <p class="mt-1 text-xs text-gray-500">{{ pf('enduranceLimit') }} = {{ result.enduranceLimit }} MPa</p>
        </div>

        <h3 v-if="calcMode !== 'simple'" class="mb-2 mt-6 text-sm font-semibold">{{ pf('minerSpectrum') }}</h3>
        <p v-if="calcMode !== 'simple'" class="mb-2 text-xs text-gray-500">{{ pf('minerHint') }}</p>
        <el-input v-if="calcMode !== 'simple'" v-model="loadText" type="textarea" :rows="5" placeholder="300,1e4&#10;250,5e4&#10;200,1e5" />
        <el-button v-if="calcMode !== 'simple'" class="mt-2" size="small" @click="loadSample">{{ pf('loadSample') }}</el-button>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ calcMode === 'simple' ? pr('lifeTitle') : pr('minerTitle') }}</h2>
        <el-alert
          v-if="result.releaseBlocked"
          type="warning"
          :closable="false"
          show-icon
          class="mb-3"
          :title="pf('criticalInputsBlocked', { fields: unconfirmedLabelText })"
        />
        <template v-if="calcMode === 'simple'">
          <div class="rounded bg-gray-50 p-4 text-sm dark:bg-gray-900">
            <p>{{ pr('effectiveAmplitude') }}: <span class="font-mono">{{ result.effectiveAmplitude?.toFixed(1) ?? stressAmplitude }}</span> MPa</p>
            <p class="mt-2">{{ pf('estimatedLife') }}: <span class="font-mono text-lg">{{ lifeDisplay }}</span></p>
          </div>
        </template>
        <template v-else-if="result.miner && !result.miner.errorKey">
          <div class="mb-4 grid grid-cols-2 gap-3 text-sm">
            <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('totalDamage')" />
              <dd class="font-mono text-xl" :class="reviewAwareCheckClass(result.miner.pass, result)">
                {{ result.miner.totalDamage?.toFixed(4) }}
              </dd>
            </div>
            <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('status')" />
              <dd class="mt-1">{{ minerStatusText }}</dd>
            </div>
          </div>
          <el-table :data="result.miner.details" size="small" border>
            <el-table-column prop="stress" label="Sa (MPa)" width="90" />
            <el-table-column prop="cycles" label="n" />
            <el-table-column label="Nf">
              <template #default="{ row }">{{ row.lifeAtStress }}</template>
            </el-table-column>
            <el-table-column label="n/Nf">
              <template #default="{ row }">{{ row.damage?.toFixed(4) }}</template>
            </el-table-column>
          </el-table>
        </template>
        <el-empty v-else-if="calcMode !== 'simple'" :description="pr('minerEmpty')" />
      </section>
    </div>

    <section class="card-panel mt-6">
      <h2 class="mb-4 font-semibold">{{ pr('snChart') }}</h2>
      <div ref="chartRef" class="min-h-[360px]" />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  SN_MATERIALS,
  analyzeFatigue,
  parseLoadSpectrum,
  getStressAmplitudeBounds,
  calcLifeFromStress,
} from '@/utils/fatigue-calc'
import FatigueDiagram from '@/components/fatigue/FatigueDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useResultI18n } from '@/composables/useResultI18n'
import { useChartI18n } from '@/composables/useChartI18n'
import { useCriticalInputConfirm } from '@/composables/useCriticalInputConfirm'
import { formatUnconfirmedLabels } from '@/utils/critical-input-guard'
import { isReviewOnlyResult, reviewAwareCheckClass } from '@/utils/calc-result'

const { pt, ct, pf, pr, locale } = useCalcPage('fatigue')
const { optionMap } = useOptionsI18n()
const { rm, resultError } = useResultI18n()
const { ch } = useChartI18n()

const snMaterials = computed(() => optionMap(SN_MATERIALS, 'snMaterials'))

const currentMaterial = computed(() => SN_MATERIALS[material.value] ?? SN_MATERIALS.steel_45)

const saBounds = computed(() => getStressAmplitudeBounds(material.value))

const displaySaMax = computed(() => Math.round(saBounds.value.saMax * 10) / 10)

const calcMode = ref('complete')
const material = ref('steel_45')
const stressAmplitude = ref(getStressAmplitudeBounds('steel_45').suggest)
const meanStress = ref(100)
const surfaceFactor = ref(0.9)
const sizeFactor = ref(0.85)
const loadText = ref('')
const chartRef = ref(null)
const { markConfirmed, withConfirmed } = useCriticalInputConfirm(calcMode)
let plotly = null

const loads = computed(() => parseLoadSpectrum(loadText.value))

const result = computed(() =>
  analyzeFatigue(
    withConfirmed({
      calcMode: calcMode.value,
      material: material.value,
      stressAmplitude: stressAmplitude.value,
      meanStress: meanStress.value,
      surfaceFactor: surfaceFactor.value,
      sizeFactor: sizeFactor.value,
      loads: loads.value,
    }),
  ),
)

const reviewOnly = computed(() => isReviewOnlyResult(result.value))
const unconfirmedLabelText = computed(() =>
  formatUnconfirmedLabels(result.value.unconfirmedCriticalInputs ?? [], locale.value).join(
    locale.value === 'en' ? ', ' : '、',
  ),
)
const minerStatusText = computed(() => {
  if (!result.value.miner) return ''
  if (reviewOnly.value) return locale.value === 'en' ? 'Review / Not released' : '需复核 / 未放行'
  return rm('fatigue', `status_${result.value.miner.statusKey}`)
})

/** 示意图用材料原始 S-N 曲线寿命（不含 Goodman） */
const diagramLife = computed(() => {
  const Sa = stressAmplitude.value
  const el = currentMaterial.value.enduranceLimit
  if (Sa <= el) return currentMaterial.value.cycleLimit ?? 1e6
  const n = calcLifeFromStress(material.value, Sa)
  return n === Infinity ? currentMaterial.value.cycleLimit ?? 1e6 : n
})

const lifeDisplay = computed(() => {
  locale.value
  const n = result.value.life
  if (n === Infinity) return rm('fatigue', 'infinite_life')
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)} × 10⁶`
  return `${Math.round(n)}`
})

async function renderChart() {
  if (!chartRef.value) return
  if (!plotly) plotly = await import('plotly.js-dist-min')

  const { curve, enduranceLimit } = result.value.snCurve
  const traces = [
    {
      x: curve.map((p) => p.N),
      y: curve.map((p) => p.S),
      type: 'scatter',
      mode: 'lines',
      name: result.value.materialLabel,
      line: { color: '#409EFF' },
    },
    {
      x: [1e2, 1e8],
      y: [enduranceLimit, enduranceLimit],
      type: 'scatter',
      mode: 'lines',
      name: ch('enduranceLimit'),
      line: { color: '#e74c3c', dash: 'dash' },
    },
  ]

  if (stressAmplitude.value > 0) {
    const Sa = stressAmplitude.value
    const el = result.value.enduranceLimit
    const pointY = Sa <= el ? el : Sa
    const pointX = Sa <= el ? (currentMaterial.value.cycleLimit ?? 1e6) : diagramLife.value
    if (Sa > el || pointX !== Infinity) {
      traces.push({
        x: [pointX],
        y: [pointY],
        type: 'scatter',
        mode: 'markers',
        name: ch('currentPoint'),
        marker: { color: '#f39c12', size: 12 },
      })
    }
  }

  await plotly.react(
    chartRef.value,
    traces,
    {
      title: ch('snTitle'),
      xaxis: { title: ch('snCycles'), type: 'log' },
      yaxis: { title: ch('snStress'), type: 'log' },
      margin: { t: 40, l: 60, r: 24, b: 48 },
      height: 360,
    },
    { responsive: true, displayModeBar: false },
  )
}

watch([result, material, stressAmplitude, diagramLife, locale], renderChart)

watch(material, (key) => {
  const b = getStressAmplitudeBounds(key)
  stressAmplitude.value = b.suggest
})

function loadSample() {
  loadText.value = `350,10000
300,50000
250,100000
220,200000`
}

onMounted(() => {
  loadSample()
  renderChart()
})

onBeforeUnmount(() => {
  if (chartRef.value && plotly) plotly.purge(chartRef.value)
})
</script>
