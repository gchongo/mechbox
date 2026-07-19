<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="calcMode" page-key="fatigue" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="120px">
          <CalcFormItem :label="pf('material')" :pending-confirm="isPending('material')">
            <el-select v-model="material" class="w-full" @change="markConfirmed('material')">
              <el-option v-for="(m, k) in snMaterials" :key="k" :label="m.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('stressAmplitude')" unit="MPa" :pending-confirm="isPending('stressAmplitude')">
            <el-input-number
              v-model="stressAmplitude"
              :min="saBounds.saMin"
              :max="saBounds.saMax"
              :precision="1"
              class="fatigue-sa-input"
              @change="markConfirmed('stressAmplitude')"
            />
            <p class="mt-1 text-xs text-gray-400">
              {{ pf('stressAmplitudeRange', { min: saBounds.saMin, max: displaySaMax }) }}
            </p>
          </CalcFormItem>
          <CalcFormItem
            v-if="calcMode !== 'simple'"
            :label="pf('targetLife')"
            :pending-confirm="isPending('targetLife')"
          >
            <el-input-number
              v-model="targetLife"
              :min="1e3"
              :max="1e10"
              :step="1e5"
              @change="markConfirmed('targetLife')"
            />
          </CalcFormItem>
          <template v-if="calcMode === 'professional'">
            <CalcFormItem :label="pf('meanStress')" :pending-confirm="isPending('meanStress')">
              <el-input-number
                v-model="meanStress"
                :min="0"
                :precision="1"
                @change="markConfirmed('meanStress')"
              />
            </CalcFormItem>
            <CalcFormItem :label="pf('meanStressMethod')" :pending-confirm="isPending('meanStressMethod')">
              <el-select v-model="meanStressMethod" class="w-full" @change="markConfirmed('meanStressMethod')">
                <el-option value="goodman" :label="pf('meanStressGoodman')" />
                <el-option value="soderberg" :label="pf('meanStressSoderberg')" />
              </el-select>
            </CalcFormItem>
            <CalcFormItem
              :label="pf('surfaceSizeFactor')"
              :pending-confirm="isPending('surfaceFactor') || isPending('sizeFactor')"
            >
              <el-input-number
                v-model="surfaceFactor"
                :min="0.5"
                :max="1"
                :step="0.05"
                :precision="2"
                class="w-28"
                @change="markConfirmed('surfaceFactor')"
              />
              <el-input-number
                v-model="sizeFactor"
                :min="0.5"
                :max="1"
                :step="0.05"
                :precision="2"
                class="ml-2 w-28"
                @change="markConfirmed('sizeFactor')"
              />
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
          <p class="mt-1 text-xs text-gray-500">
            {{ pf('enduranceLimit') }} = {{ result.enduranceLimit }} MPa
            <template v-if="calcMode === 'professional'">
              · {{ pf('adjustedEndurance') }} = {{ result.adjustedEndurance }} MPa
            </template>
          </p>
        </div>

        <h3 v-if="calcMode !== 'simple'" class="mb-2 mt-6 text-sm font-semibold">{{ pf('minerSpectrum') }}</h3>
        <p v-if="calcMode !== 'simple'" class="mb-2 text-xs text-gray-500">{{ pf('minerHint') }}</p>
        <el-input v-if="calcMode !== 'simple'" v-model="loadText" type="textarea" :rows="5" placeholder="300,1e4&#10;250,5e4&#10;200,1e5" />
        <el-button v-if="calcMode !== 'simple'" class="mt-2" size="small" @click="loadSample">{{ pf('loadSample') }}</el-button>
      </section>

      <section ref="resultRef" class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag v-if="calcMode !== 'simple'" class="mb-3" :type="overallStatusType">
          {{ pr('overall') }}: {{ overallStatusLabel }}
        </el-tag>

        <template v-if="calcMode === 'simple'">
          <div class="rounded bg-gray-50 p-4 text-sm dark:bg-gray-900">
            <p>{{ pr('effectiveAmplitude') }}: <span class="font-mono">{{ result.effectiveAmplitude?.toFixed(1) ?? stressAmplitude }}</span> MPa</p>
            <p class="mt-2">{{ pf('estimatedLife') }}: <span class="font-mono text-lg">{{ lifeDisplay }}</span></p>
          </div>
        </template>

        <template v-else>
          <el-alert
            type="info"
            :closable="false"
            show-icon
            class="mb-3"
            :title="correctionBannerText"
          />
          <p class="mb-3 text-xs text-gray-500">{{ modeVerdictHint }}</p>

          <div class="mb-4 rounded border border-gray-100 p-3 dark:border-gray-800">
            <h3 class="mb-1 text-sm font-semibold">{{ pr('singleLevelTitle') }}</h3>
            <p class="mb-2 text-xs text-gray-500">{{ modeSingleLevelHint }}</p>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel label-class="text-gray-500" :text="pf('estimatedLife')" />
                <dd class="font-mono text-lg">{{ lifeDisplay }}</dd>
              </div>
              <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel label-class="text-gray-500" :text="pr('singleLevelPass')" />
                <dd :class="reviewAwareCheckClass(result.singleLevelPass, result)">
                  {{ reviewAwareCheckMark(result.singleLevelPass, result) }}
                </dd>
              </div>
            </div>
            <p v-if="calcMode === 'professional' && result.goodmanPass != null" class="mt-2 text-xs text-gray-500">
              {{ pr('goodmanCheck') }}:
              <span :class="reviewAwareCheckClass(result.goodmanPass, result)">
                {{ reviewAwareCheckMark(result.goodmanPass, result) }}
              </span>
              · {{ pr('effectiveAmplitude') }} {{ result.effectiveAmplitude?.toFixed(1) }} MPa
            </p>
          </div>

          <div v-if="result.miner && !result.miner.errorKey">
            <h3 class="mb-1 text-sm font-semibold">{{ pr('minerTitle') }}</h3>
            <div class="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel label-class="text-gray-500" :text="pr('totalDamage')" />
                <dd class="font-mono text-xl" :class="reviewAwareCheckClass(result.miner.pass, result)">
                  {{ result.miner.totalDamage?.toFixed(4) }}
                </dd>
              </div>
              <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel label-class="text-gray-500" :text="pr('minerPass')" />
                <dd :class="reviewAwareCheckClass(result.miner.pass, result)">
                  {{ minerStatusText }}
                </dd>
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
              <el-table-column :label="pr('damageShare')" width="90">
                <template #default="{ row }">
                  {{ Number.isFinite(row.contributionPct) ? `${row.contributionPct.toFixed(1)}%` : '—' }}
                </template>
              </el-table-column>
              <el-table-column v-if="calcMode === 'professional'" label="Sa,eff" width="80">
                <template #default="{ row }">
                  {{ row.effectiveStress != null ? row.effectiveStress : '—' }}
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-else :description="pr('minerEmpty')" />
        </template>
      </section>
    </div>

    <section class="card-panel mt-6">
      <h2 class="mb-4 font-semibold">{{ pr('snChart') }}</h2>
      <div ref="chartRef" class="min-h-[360px]" />
    </section>

    <div v-if="calcMode !== 'simple'" class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <el-button type="primary" plain @click="exportPdf">{{ fc('exportPdfReport') }}</el-button>
      <SaveHistoryButton
        tool="fatigue"
        :title="historyTitle"
        :status="saveStatus"
        :summary="historySummary"
        :input="historyInput"
        :result="result"
      />
    </div>
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
  buildFatigueReportText,
} from '@/utils/fatigue-calc'
import FatigueDiagram from '@/components/fatigue/FatigueDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useContentI18n } from '@/composables/useContentI18n'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useResultI18n } from '@/composables/useResultI18n'
import { useChartI18n } from '@/composables/useChartI18n'
import { exportToolReportPdf } from '@/utils/export'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import { useCriticalInputConfirm } from '@/composables/useCriticalInputConfirm'
import {
  getCalcReviewStatus,
  reviewAwareCheckClass,
  reviewAwareCheckMark,
} from '@/utils/calc-result'
import { useDarkMode, applyPlotlyTheme } from '@/composables/useDarkMode'

const { pt, ct, fc, pf, pr, locale } = useCalcPage('fatigue')
const { exportFilename } = useContentI18n()
const { optionMap } = useOptionsI18n()
const { rm } = useResultI18n()
const { ch } = useChartI18n()
const { isDark } = useDarkMode()

const snMaterials = computed(() => optionMap(SN_MATERIALS, 'snMaterials'))

const currentMaterial = computed(() => SN_MATERIALS[material.value] ?? SN_MATERIALS.steel_45)

const saBounds = computed(() => getStressAmplitudeBounds(material.value))

const displaySaMax = computed(() => Math.round(saBounds.value.saMax * 10) / 10)

const calcMode = ref('complete')
const material = ref('steel_45')
const stressAmplitude = ref(getStressAmplitudeBounds('steel_45').suggest)
const targetLife = ref(1e6)
const meanStress = ref(100)
const meanStressMethod = ref('goodman')
const surfaceFactor = ref(0.9)
const sizeFactor = ref(0.85)
const loadText = ref('')
const chartRef = ref(null)
const resultRef = ref(null)
let plotly = null

const { markConfirmed, withConfirmed, isPending } = useCriticalInputConfirm(calcMode, 'fatigue')

const loads = computed(() => parseLoadSpectrum(loadText.value))

const result = computed(() =>
  analyzeFatigue(
    withConfirmed({
      calcMode: calcMode.value,
      material: material.value,
      stressAmplitude: stressAmplitude.value,
      targetLife: targetLife.value,
      meanStress: meanStress.value,
      meanStressMethod: meanStressMethod.value,
      surfaceFactor: surfaceFactor.value,
      sizeFactor: sizeFactor.value,
      loads: loads.value,
    }),
  ),
)

const overallStatus = computed(() => getCalcReviewStatus(result.value))
const saveStatus = overallStatus
const overallStatusType = computed(() => {
  if (overallStatus.value === 'pass') return 'success'
  if (overallStatus.value === 'review') return 'warning'
  return 'danger'
})
const overallStatusLabel = computed(() => {
  if (overallStatus.value === 'pass') return fc('overallPass')
  if (overallStatus.value === 'review') return fc('overallWarn')
  return fc('overallFail')
})

const modeVerdictHint = computed(() =>
  calcMode.value === 'professional' ? pr('minerVerdictHintProfessional') : pr('minerVerdictHintComplete'),
)

const modeSingleLevelHint = computed(() =>
  calcMode.value === 'professional' ? pr('singleLevelHintProfessional') : pr('singleLevelHintComplete'),
)

const correctionBannerText = computed(() => {
  const cs = result.value.correctionSummary
  if (!cs) return ''
  if (cs.calcMode === 'professional') {
    return pr('correctionBannerProfessional', {
      sm: cs.meanStress ?? 0,
      method: cs.meanStressMethod ?? 'goodman',
      ka: cs.surfaceFactor ?? 1,
      kb: cs.sizeFactor ?? 1,
      se: Math.round((cs.enduranceLimitMpA ?? 0) * 10) / 10,
    })
  }
  return pr('correctionBannerComplete', { se: cs.enduranceLimitMpA ?? result.value.enduranceLimit })
})

const minerStatusText = computed(() => {
  if (!result.value.miner) return ''
  return rm('fatigue', `status_${result.value.miner.statusKey}`)
})

const historyInput = computed(() => ({
  calcMode: calcMode.value,
  material: material.value,
  stressAmplitude: stressAmplitude.value,
  targetLife: targetLife.value,
  meanStress: meanStress.value,
  meanStressMethod: meanStressMethod.value,
  surfaceFactor: surfaceFactor.value,
  sizeFactor: sizeFactor.value,
  loadText: loadText.value,
}))

const historySummary = computed(() => {
  const r = result.value
  return [
    { label: pf('material'), value: r.materialLabel ?? material.value },
    { label: pf('stressAmplitude'), value: `${stressAmplitude.value} MPa` },
    { label: pr('overallVerdict'), value: overallStatusLabel.value },
  ]
})

const historyTitle = computed(() =>
  exportFilename('fatigueHistoryTitle', { material: material.value, sa: stressAmplitude.value }),
)

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
    const chartSa =
      calcMode.value === 'professional' && result.value.effectiveAmplitude > 0
        ? result.value.effectiveAmplitude
        : stressAmplitude.value
    const el = result.value.enduranceLimit
    const seLimit =
      calcMode.value === 'professional' ? (result.value.adjustedEndurance ?? el) : el
    const pointY = chartSa <= seLimit ? seLimit : chartSa
    const pointX =
      chartSa <= seLimit
        ? currentMaterial.value.cycleLimit ?? 1e6
        : calcLifeFromStress(material.value, chartSa, { enduranceLimit: seLimit })
    if (chartSa > seLimit || pointX !== Infinity) {
      traces.push({
        x: [pointX === Infinity ? currentMaterial.value.cycleLimit ?? 1e6 : pointX],
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
    applyPlotlyTheme(
      {
        title: ch('snTitle'),
        xaxis: { title: ch('snCycles'), type: 'log' },
        yaxis: { title: ch('snStress'), type: 'log' },
        margin: { t: 40, l: 60, r: 24, b: 48 },
        height: 360,
        legend: { font: { color: isDark.value ? '#e5e7eb' : '#374151' } },
      },
      isDark.value,
    ),
    { responsive: true, displayModeBar: false },
  )
}

async function exportPdf() {
  const r = result.value
  if (!r || calcMode.value === 'simple') return
  await exportToolReportPdf({
    title: pt('title'),
    subtitle: `${r.materialLabel} · Sa=${stressAmplitude.value} MPa`,
    sections: [{ heading: pt('title'), text: buildFatigueReportText(r, locale.value) }],
    element: resultRef.value,
    filename: exportFilename('fatiguePdf', { material: material.value, ts: Date.now() }),
    meta: {
      locale: locale.value,
      trace: {
        toolLabel: pt('title'),
        calcMode: calcMode.value,
        status: overallStatus.value,
        units: 'MPa, cycles',
        assumptions: r.assumptions,
      },
    },
  })
}

function applyFatigueReplay(input) {
  if (!input || typeof input !== 'object') return
  if (input.calcMode) calcMode.value = input.calcMode
  if (input.material) material.value = input.material
  if (Number.isFinite(Number(input.stressAmplitude))) stressAmplitude.value = Number(input.stressAmplitude)
  if (Number.isFinite(Number(input.targetLife))) targetLife.value = Number(input.targetLife)
  if (Number.isFinite(Number(input.meanStress))) meanStress.value = Number(input.meanStress)
  if (input.meanStressMethod) meanStressMethod.value = input.meanStressMethod
  if (Number.isFinite(Number(input.surfaceFactor))) surfaceFactor.value = Number(input.surfaceFactor)
  if (Number.isFinite(Number(input.sizeFactor))) sizeFactor.value = Number(input.sizeFactor)
  if (typeof input.loadText === 'string') loadText.value = input.loadText
}

useHistoryReplay('fatigue', null, { applyFn: applyFatigueReplay })

watch([result, material, stressAmplitude, diagramLife, locale, calcMode, meanStressMethod, isDark], renderChart)

watch(material, (key) => {
  stressAmplitude.value = getStressAmplitudeBounds(key).suggest
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
