<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <div class="grid gap-6 xl:grid-cols-5">
      <!-- 左侧：输入 + 选用附表 -->
      <div class="space-y-6 xl:col-span-3">
        <section class="card-panel">
          <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
          <el-form label-width="100px">
            <CalcFormItem :label="pf('nominalSize')">
              <el-input-number v-model="nominal" :min="1" :max="500" :precision="2" />
              <span class="ml-2 text-sm text-gray-500">mm</span>
            </CalcFormItem>
            <CalcFormItem :label="pf('holeCode')">
              <el-input v-model="holeCode" placeholder="H7" class="w-32" />
            </CalcFormItem>
            <CalcFormItem :label="pf('shaftCode')">
              <el-input v-model="shaftCode" placeholder="g6" class="w-32" />
            </CalcFormItem>
            <CalcFormItem :label="pf('assemblyDeltaT')">
              <el-input-number v-model="deltaT" :min="-200" :max="400" :step="10" />
              <span class="ml-2 text-xs text-gray-500">°C</span>
            </CalcFormItem>
          </el-form>
        </section>

        <section class="card-panel">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <el-radio-group v-model="basisTab" size="small">
              <el-radio-button value="hole">{{ prc('tabHoleBasis') }}</el-radio-button>
              <el-radio-button value="shaft">{{ prc('tabShaftBasis') }}</el-radio-button>
            </el-radio-group>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ prc('subtitle') }}</p>
          </div>

          <FitRecommendationTable
            v-if="basisTab === 'hole'"
            :reference-label="prc('referenceHole')"
            :legend="prc('legend')"
            :rows="HOLE_BASIS_ROWS"
            :selected-hole="holeCode"
            :selected-shaft="shaftCode"
            :nominal="nominal"
            :category-labels="categoryLabels"
            @select="applyFitSelection"
          />
          <FitRecommendationTable
            v-else
            :reference-label="prc('referenceShaft')"
            :legend="prc('legend')"
            :rows="SHAFT_BASIS_ROWS"
            :selected-hole="holeCode"
            :selected-shaft="shaftCode"
            :nominal="nominal"
            :category-labels="categoryLabels"
            @select="applyFitSelection"
          />
        </section>
      </div>

      <!-- 右侧：结果 sticky -->
      <div class="xl:col-span-2">
        <section ref="resultRef" class="card-panel xl:sticky xl:top-4">
          <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
          <el-alert v-if="result?.errorKey" :title="resultError(result)" type="warning" show-icon />
          <template v-else-if="result">
            <div class="mb-4 flex flex-wrap items-center gap-2">
              <el-tag size="small" type="info" class="font-mono">{{ holeCode }}/{{ shaftCode }}</el-tag>
              <el-tag :type="overallStatusType">{{ fc('check') }}: {{ overallStatusLabel }}</el-tag>
              <el-tag :type="fitTagType">{{ fitTypeLabel }}</el-tag>
            </div>
            <p v-if="statusHint" class="mb-3 text-xs" :class="overallStatus === 'fail' ? 'text-error' : 'text-warning'">
              {{ statusHint }}
            </p>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('maxClearance')" />
                <dd class="font-mono">{{ (result.maxClearance * 1000).toFixed(1) }} μm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('minClearance')" />
                <dd class="font-mono">{{ (result.minClearance * 1000).toFixed(1) }} μm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>{{ pr('holeLimits') }} {{ result.hole.designation }}</dt>
                <dd class="font-mono">{{ result.hole.minSize.toFixed(4) }} ~ {{ result.hole.maxSize.toFixed(4) }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>{{ pr('shaftLimits') }} {{ result.shaft.designation }}</dt>
                <dd class="font-mono">{{ result.shaft.minSize.toFixed(4) }} ~ {{ result.shaft.maxSize.toFixed(4) }}</dd>
              </div>
              <div v-if="result.meanClearance != null" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <ResultLabel :text="pr('meanClearance')" />
                <dd class="font-mono">{{ (result.meanClearance * 1000).toFixed(1) }} μm</dd>
              </div>
              <div v-if="result.fitQuality != null" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <ResultLabel :text="pr('fitQuality')" />
                <dd class="font-mono">{{ result.fitQuality }}</dd>
              </div>
              <div v-if="result.thermalShift != null && deltaT !== 0" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <ResultLabel :text="pr('thermalShift')" />
                <dd class="font-mono">{{ (result.thermalShift * 1000).toFixed(1) }} μm</dd>
              </div>
              <div v-if="thermalRiskLabel" class="rounded bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-900/20">
                {{ thermalRiskLabel }}
              </div>
            </dl>
            <FitDiagram :fit="result" class="mx-auto mt-4 max-w-full" />
            <FitToleranceBand v-if="bandData && !bandData.errorKey" :band="bandData" class="mx-auto mt-4 max-w-full" />
          </template>
        </section>
      </div>
    </div>

    <section class="card-panel mt-6">
      <h2 class="mb-2 text-sm font-semibold">{{ pf('supportedCodes') }}</h2>
      <p class="mb-2 text-xs text-gray-500">{{ pf('holeLetters') }}: {{ holeLetters.join(', ') }}</p>
      <p class="text-xs text-gray-500">{{ pf('shaftLetters') }}: {{ shaftLetters.join(', ') }}</p>
    </section>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <el-button type="primary" plain @click="exportPdf">{{ fc('exportPdfReport') }}</el-button>
      <SaveHistoryButton
        tool="fit"
        :title="historyTitle"
        :status="saveStatus"
        :summary="historySummary"
        :input="{ nominal: nominal, holeCode, shaftCode, calcMode: CALC_MODE, deltaT }"
        :result="snapshot"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { analyzeFit, generateToleranceBandData, SUPPORTED_HOLE_LETTERS, SUPPORTED_SHAFT_LETTERS } from '@/utils/iso-286-calc'
import { HOLE_BASIS_ROWS, SHAFT_BASIS_ROWS } from '@/constants/fit-recommendations'
import FitRecommendationTable from '@/components/fit/FitRecommendationTable.vue'
import FitDiagram from '@/components/fit/FitDiagram.vue'
import FitToleranceBand from '@/components/fit/FitToleranceBand.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import { exportToolReportPdf } from '@/utils/export'
import { buildEnhancedReport } from '@/utils/enhanced-report'
import { adaptFit } from '@/utils/calc-adapters'
import { getCalcReviewStatus } from '@/utils/calc-result'
import { useCalcPage } from '@/composables/useCalcPage'
import { useResultI18n } from '@/composables/useResultI18n'
import { useContentI18n } from '@/composables/useContentI18n'
import { getToolReplayRecord } from '@/utils/calc-history'

const { pt, ct, pf, pr, fc, t, locale } = useCalcPage('fit')
const { exportFilename } = useContentI18n()
const { rm, resultError } = useResultI18n()

function prc(key) {
  const path = `calc.pages.fit.recommendations.${key}`
  const val = t(path)
  return val !== path ? val : key
}

const categoryLabels = computed(() => ({
  clearance: prc('clearance'),
  transition: prc('transition'),
  interference: prc('interference'),
  preferred: prc('preferred'),
  unsupported: prc('unsupported'),
}))

const CALC_MODE = 'professional'

const nominal = ref(25)
const holeCode = ref('H7')
const shaftCode = ref('g6')
const deltaT = ref(0)
const basisTab = ref('hole')
const resultRef = ref(null)
const route = useRoute()
const router = useRouter()
const holeLetters = SUPPORTED_HOLE_LETTERS
const shaftLetters = SUPPORTED_SHAFT_LETTERS

const fitTypeLabel = computed(() => {
  locale.value
  const ft = result.value?.fitType
  return ft ? rm('fit', `type_${ft}`) : ''
})

const result = computed(() =>
  analyzeFit(nominal.value, holeCode.value, shaftCode.value, {
    calcMode: CALC_MODE,
    deltaT: deltaT.value,
  }),
)
const snapshot = computed(() =>
  adaptFit({
    nominal: nominal.value,
    holeCode: holeCode.value,
    shaftCode: shaftCode.value,
    calcMode: CALC_MODE,
    deltaT: deltaT.value,
  }),
)
const bandData = computed(() => generateToleranceBandData(nominal.value, holeCode.value, shaftCode.value))
const overallStatus = computed(() => getCalcReviewStatus(snapshot.value))
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
const thermalRiskLabel = computed(() => {
  const key = result.value?.thermalRiskKey
  return key ? rm('fit', key) : ''
})
const statusHint = computed(() => snapshot.value?.warnings?.[0]?.message ?? snapshot.value?.assumptions?.[0] ?? '')

const historySummary = computed(() => {
  const r = result.value
  if (!r || r.errorKey) return []
  return [
    { label: pf('fitType'), value: fitTypeLabel.value },
    { label: pr('maxClearance'), value: (r.maxClearance * 1000).toFixed(1) },
  ]
})

const historyTitle = computed(() => {
  const key = locale.value === 'en' ? 'fitHistoryTitleEn' : 'fitHistoryTitle'
  return exportFilename(key, { hole: holeCode.value, shaft: shaftCode.value, nominal: nominal.value })
})

const fitTagType = computed(() => {
  if (!result.value || result.value.errorKey) return 'info'
  return { clearance: 'success', interference: 'info', transition: 'warning' }[result.value.fitType]
})

function applyFitSelection({ hole, shaft }) {
  holeCode.value = hole
  shaftCode.value = shaft
}

async function exportPdf() {
  const r = result.value
  const snap = snapshot.value
  if (!r || r.errorKey || !snap) return
  const report = buildEnhancedReport({ snapshot: snap })
  await exportToolReportPdf({
    title: report.title,
    subtitle: report.subtitle,
    sections: report.sections,
    element: resultRef.value,
    filename: exportFilename('fitPdf', { nominal: r.nominal, ts: Date.now() }),
  })
}

function applyReplayInput(input) {
  if (!input || typeof input !== 'object') return
  if (Number.isFinite(Number(input.nominal))) nominal.value = Number(input.nominal)
  if (typeof input.holeCode === 'string') holeCode.value = input.holeCode
  if (typeof input.shaftCode === 'string') shaftCode.value = input.shaftCode
  if (Number.isFinite(Number(input.deltaT))) deltaT.value = Number(input.deltaT)
}

function consumeHistoryReplay() {
  const historyId = route.query.historyId
  if (!historyId) return
  const record = getToolReplayRecord(historyId, 'fit')
  if (!record) return
  applyReplayInput(record.data?.input)
  const nextQuery = { ...route.query }
  delete nextQuery.historyId
  delete nextQuery.replay
  router.replace({ query: nextQuery })
}

onMounted(() => consumeHistoryReplay())
watch(() => route.query.historyId, () => consumeHistoryReplay())
</script>
